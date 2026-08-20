#!/usr/bin/env bash
#
# Deploy PM Tool MVP ขึ้น S3 + CloudFront — รันได้ทุกครั้งที่จะปล่อยของใหม่
#
# วิธีใช้:
#   BUCKET=<ชื่อ bucket> DISTRIBUTION_ID=<id> ./deploy/aws/deploy.sh
#
# ลำดับสำคัญและตั้งใจให้เป็นแบบนี้:
#   1. ตรวจคุณภาพ 4 ด่านก่อน — ไม่ผ่านไม่ deploy
#   2. build
#   3. อัปโหลด assets ก่อน (cache ยาว) แล้วค่อย index.html (ห้าม cache)
#   4. invalidate CloudFront
#
# เหตุที่ต้องอัปโหลด assets ก่อน index.html:
# index.html ชี้ไปยังชื่อไฟล์ assets ที่มี hash ถ้าอัปโหลด index.html ก่อน
# จะมีช่วงที่ผู้ใช้ได้ index.html ใหม่แต่ไฟล์ที่มันชี้ไปยังไม่ขึ้น = จอขาว

set -euo pipefail

BUCKET="${BUCKET:-}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-}"
SKIP_CHECKS="${SKIP_CHECKS:-0}"

if [[ -z "$BUCKET" || -z "$DISTRIBUTION_ID" ]]; then
  echo "ต้องระบุ BUCKET และ DISTRIBUTION_ID" >&2
  echo "เช่น: BUCKET=pm-tool-mvp-acme DISTRIBUTION_ID=E123ABC $0" >&2
  exit 1
fi

command -v aws >/dev/null 2>&1 || {
  echo "ไม่พบคำสั่ง aws — ติดตั้งก่อนด้วย: brew install awscli" >&2
  exit 1
}

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# ---------- 1. ด่านคุณภาพ ----------
if [[ "$SKIP_CHECKS" == "1" ]]; then
  echo "ข้ามการตรวจคุณภาพเพราะตั้ง SKIP_CHECKS=1 — ใช้เฉพาะเวลาแก้ฉุกเฉิน"
else
  echo "[1/4] ตรวจคุณภาพ 4 ด่าน..."
  echo "  test..."
  npm test --silent
  echo "  typecheck..."
  npm run typecheck --silent
  echo "  lint..."
  npm run lint --silent
  echo "  ผ่านทั้งหมด"
fi

# ---------- 2. build ----------
echo
echo "[2/4] build..."
npm run build --silent
[[ -f dist/index.html ]] || { echo "build ไม่ได้ผลลัพธ์ที่ dist/index.html" >&2; exit 1; }

GZIP_KB="$(gzip -c dist/assets/*.js | wc -c | awk '{printf "%.1f", $1/1024}')"
echo "  ขนาด JS หลัง gzip: ${GZIP_KB} KB (งบตาม NFR7 คือ 300 KB)"

# ---------- 3. อัปโหลด ----------
echo
echo "[3/4] อัปโหลดขึ้น s3://$BUCKET ..."

# assets มี hash ในชื่อไฟล์ จึง cache ได้ตลอดกาลอย่างปลอดภัย
echo "  assets (cache 1 ปี)..."
aws s3 sync dist/ "s3://$BUCKET/" \
  --exclude "index.html" \
  --exclude "*.map" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

# index.html ห้าม cache เพราะเป็นตัวชี้ว่าเวอร์ชันไหนคือเวอร์ชันปัจจุบัน
echo "  index.html (ห้าม cache)..."
aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache, must-revalidate" \
  --content-type "text/html; charset=utf-8"

# ---------- 4. invalidate ----------
echo
echo "[4/4] invalidate CloudFront..."
# invalidate แค่ index.html พอ เพราะ assets ใช้ชื่อไฟล์ใหม่ทุก build อยู่แล้ว
# การ invalidate /* ทุกครั้งเสียเงินเปล่าและไม่ได้ประโยชน์เพิ่ม
INVALIDATION_ID="$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/index.html" "/" \
  --query 'Invalidation.Id' --output text)"
echo "  invalidation: $INVALIDATION_ID"

DOMAIN="$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" \
  --query 'Distribution.DomainName' --output text)"

cat <<DONE

Deploy เสร็จแล้ว: https://$DOMAIN

invalidation ใช้เวลาราว 1-3 นาที ตรวจสถานะได้ด้วย
  aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID \\
    --id $INVALIDATION_ID --query 'Invalidation.Status' --output text

ตรวจหลัง deploy (สำคัญ อย่าข้าม):
  1. เปิด https://$DOMAIN แล้วต้องเห็นหน้า Requirements
  2. เปิด https://$DOMAIN/tasks ตรง ๆ แล้วกด refresh — ต้องไม่ขึ้น 404
     (ถ้าขึ้น 404 แปลว่า custom error response ของ CloudFront หลุด)
  3. สร้าง Requirement 1 ตัวแล้ว refresh — ข้อมูลต้องยังอยู่
DONE
