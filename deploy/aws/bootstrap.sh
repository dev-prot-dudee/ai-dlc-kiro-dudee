#!/usr/bin/env bash
#
# สร้าง infrastructure สำหรับ deploy PM Tool MVP บน AWS — รันครั้งเดียว
#
# สร้าง: S3 bucket (private) + CloudFront distribution + Origin Access Control
#        + bucket policy ที่ยอมให้เฉพาะ CloudFront ตัวนี้อ่านได้
#
# สิ่งที่ script นี้ตั้งใจไม่ทำ:
#   - ไม่สร้าง IAM role ให้ CI (ทำแยกเพราะเกี่ยวกับสิทธิ์ ต้องมีคนตรวจ)
#   - ไม่ตั้ง custom domain กับ ACM certificate (ทำเมื่อรู้ชื่อ domain แล้ว)
#   - ไม่ลบอะไรทั้งสิ้น
#
# วิธีใช้:
#   BUCKET=pm-tool-mvp-<ชื่อที่ไม่ซ้ำใครในโลก> REGION=ap-southeast-1 \
#     ./deploy/aws/bootstrap.sh
#
# ชื่อ bucket ต้องไม่ซ้ำกับใครทั้ง AWS ไม่ใช่แค่ใน account ของคุณ

set -euo pipefail

BUCKET="${BUCKET:-}"
REGION="${REGION:-ap-southeast-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "$BUCKET" ]]; then
  echo "ต้องระบุ BUCKET เช่น: BUCKET=pm-tool-mvp-acme REGION=ap-southeast-1 $0" >&2
  exit 1
fi

command -v aws >/dev/null 2>&1 || {
  echo "ไม่พบคำสั่ง aws — ติดตั้งก่อนด้วย: brew install awscli" >&2
  exit 1
}

echo "ตรวจ credentials..."
CALLER="$(aws sts get-caller-identity --query Arn --output text)"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
echo "  ใช้สิทธิ์: $CALLER"

cat <<PLAN

จะสร้างสิ่งเหล่านี้ใน region $REGION
  1. S3 bucket           : $BUCKET  (ปิด public access, เปิด versioning)
  2. Origin Access Control: pm-tool-mvp-oac
  3. CloudFront distro    : ต่อกับ bucket ข้างบน, fallback 403/404 -> /index.html
  4. Bucket policy        : ยอมให้เฉพาะ distribution ที่สร้างใหม่นี้อ่านได้

ทั้งหมดนี้เป็นทรัพยากรจริงและมีค่าใช้จ่ายตามการใช้งาน
CloudFront ใช้เวลา deploy ราว 5-15 นาที

PLAN

read -r -p "ยืนยันเพื่อสร้าง (พิมพ์ yes): " CONFIRM
[[ "$CONFIRM" == "yes" ]] || { echo "ยกเลิก ไม่มีการสร้างอะไร"; exit 0; }

# ---------- 1. S3 bucket ----------
echo
echo "[1/4] สร้าง S3 bucket..."
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "  bucket มีอยู่แล้ว ข้ามการสร้าง"
else
  if [[ "$REGION" == "us-east-1" ]]; then
    # us-east-1 เป็น region เดียวที่ห้ามส่ง LocationConstraint
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
      --create-bucket-configuration "LocationConstraint=$REGION"
  fi
  echo "  สร้างแล้ว"
fi

echo "  ปิด public access ทุกช่องทาง..."
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# versioning ทำให้ย้อนกลับได้ด้วยการ restore เวอร์ชันเก่าของไฟล์
echo "  เปิด versioning เพื่อให้ย้อนกลับได้..."
aws s3api put-bucket-versioning --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

echo "  เปิดการเข้ารหัสข้อมูลที่พัก..."
aws s3api put-bucket-encryption --bucket "$BUCKET" \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# ---------- 2. Origin Access Control ----------
echo
echo "[2/4] สร้าง Origin Access Control..."
OAC_ID="$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='pm-tool-mvp-oac'].Id | [0]" \
  --output text 2>/dev/null || echo "None")"

if [[ "$OAC_ID" == "None" || -z "$OAC_ID" ]]; then
  OAC_ID="$(aws cloudfront create-origin-access-control \
    --origin-access-control-config \
    "Name=pm-tool-mvp-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
    --query 'OriginAccessControl.Id' --output text)"
  echo "  สร้างแล้ว: $OAC_ID"
else
  echo "  มีอยู่แล้ว: $OAC_ID"
fi

# ---------- 3. CloudFront distribution ----------
echo
echo "[3/4] สร้าง CloudFront distribution..."
CONFIG_FILE="$(mktemp)"
trap 'rm -f "$CONFIG_FILE"' EXIT

sed -e "s|__BUCKET__|$BUCKET|g" \
    -e "s|__REGION__|$REGION|g" \
    -e "s|__OAC_ID__|$OAC_ID|g" \
    -e "s|__CALLER_REF__|pm-tool-mvp-$(date -u +%Y%m%d%H%M%S)|g" \
    "$SCRIPT_DIR/cloudfront-distribution.json" > "$CONFIG_FILE"

DIST_JSON="$(aws cloudfront create-distribution \
  --distribution-config "file://$CONFIG_FILE")"

DIST_ID="$(echo "$DIST_JSON" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["Id"])')"
DIST_DOMAIN="$(echo "$DIST_JSON" | python3 -c 'import json,sys;print(json.load(sys.stdin)["Distribution"]["DomainName"])')"
echo "  สร้างแล้ว: $DIST_ID"

# ---------- 4. Bucket policy ----------
echo
echo "[4/4] ตั้ง bucket policy ให้เฉพาะ distribution นี้อ่านได้..."
# เงื่อนไข AWS:SourceArn สำคัญมาก — ถ้าไม่ใส่ CloudFront distribution ใดก็อ่าน
# bucket นี้ได้ ไม่ใช่แค่ของเรา
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$(cat <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::$ACCOUNT:distribution/$DIST_ID"
        }
      }
    }
  ]
}
POLICY
)"

cat <<DONE

เสร็จแล้ว เก็บสองค่านี้ไว้ใช้กับ deploy.sh

  export BUCKET=$BUCKET
  export DISTRIBUTION_ID=$DIST_ID

URL ที่จะเข้าใช้ได้: https://$DIST_DOMAIN

CloudFront ยังอยู่ในสถานะ InProgress อีกราว 5-15 นาที ตรวจได้ด้วย
  aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status' --output text

ขั้นถัดไป: ./deploy/aws/deploy.sh

หมายเหตุด้านความปลอดภัย: URL นี้เปิดให้ใครก็เข้าได้ และแอปไม่มีระบบยืนยันตัวตน
ถ้าต้องการกันคนนอก ดูหัวข้อ "การจำกัดผู้เข้าถึง" ใน deployment-strategy.md
DONE
