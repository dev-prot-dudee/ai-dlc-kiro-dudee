# Rollback Runbook — PM Tool MVP

เอกสารนี้ใช้ตอนที่ deploy แล้วมีปัญหา อ่านตั้งแต่หัวข้อ "ตัดสินใจก่อน" ไม่ต้องอ่านทั้งไฟล์

ที่มา: `cd-config.md` (ทรัพยากรและ script), `deployment-strategy.md` (กลยุทธ์และความเสี่ยง), `build-and-test/build-test-results.md` (เกณฑ์ที่ต้องกลับมาผ่าน), `build-and-test/build-instructions.md` (คำสั่ง build) · รายการ upstream ที่ไม่มี (`ci-config`, `quality-gates`, `infrastructure-specification`, `cicd-pipeline`) อธิบายไว้ใน `cd-config.md`

---

## ข้อดีที่ต้องรู้ก่อน: การย้อนกลับที่นี่ไม่ทำให้ข้อมูลใครหาย

ระบบเก็บข้อมูลใน `localStorage` ของเบราว์เซอร์แต่ละคน **ไม่มีฐานข้อมูลฝั่ง server** ผลคือ:

- ย้อนโค้ดกลับได้อย่างอิสระ ไม่ต้องกังวลเรื่อง schema migration ที่ย้อนไม่ได้
- ข้อมูลของผู้ใช้อยู่ที่เครื่องเขา ไม่ถูกกระทบจากการย้อนเวอร์ชัน
- **ข้อยกเว้นเดียว** — ถ้าเวอร์ชันที่มีปัญหาเขียนข้อมูลผิดรูปแบบลง `localStorage` ของผู้ใช้ไปแล้ว การย้อนโค้ดไม่ล้างข้อมูลนั้นให้ ดูหัวข้อ "กรณีข้อมูลผู้ใช้เสียหาย" ท้ายไฟล์

---

## ตัดสินใจก่อน: เลือกทางไหน

| อาการ | ทำอะไร | ใช้เวลา |
|------|--------|--------|
| เพิ่ง deploy แล้วเว็บพัง ต้องกลับด่วน | **ทาง A** — ย้อนไฟล์บน S3 ด้วย versioning | 1–3 นาที |
| รู้ว่า commit ไหนทำพัง และแก้ที่ต้นทางได้ | **ทาง B** — revert commit แล้ว deploy ใหม่ | 5–10 นาที |
| เว็บขึ้น 404 เมื่อเปิด URL ตรง | **ไม่ต้องย้อน** — ดูหัวข้อ "แก้ 404" | 2 นาที |
| ผู้ใช้เห็นเวอร์ชันเก่าค้าง | **ไม่ต้องย้อน** — ดูหัวข้อ "แก้ cache ค้าง" | 2 นาที |

**ถ้าไม่แน่ใจ ใช้ทาง A ก่อน** เพราะเร็วที่สุดและกลับมาสู่สภาพที่เคยใช้งานได้ แล้วค่อยหาสาเหตุอย่างไม่รีบ

---

## ทาง A — ย้อนไฟล์บน S3 (เร็วที่สุด)

ใช้ได้เพราะ `bootstrap.sh` เปิด versioning ไว้ ทุกไฟล์ที่ถูกเขียนทับยังเก็บเวอร์ชันเก่าไว้

```bash
export BUCKET=<ชื่อ bucket>
export DISTRIBUTION_ID=<id>

# 1. ดูว่า index.html มีเวอร์ชันอะไรบ้าง เรียงใหม่สุดก่อน
aws s3api list-object-versions --bucket "$BUCKET" --prefix index.html \
  --query 'Versions[].{VersionId:VersionId,Modified:LastModified,Latest:IsLatest}' \
  --output table

# 2. คัดลอกเวอร์ชันก่อนหน้าขึ้นมาเป็นเวอร์ชันปัจจุบัน
#    ใส่ VersionId ของตัวที่ต้องการจากตารางข้างบน
aws s3api copy-object \
  --bucket "$BUCKET" \
  --key index.html \
  --copy-source "$BUCKET/index.html?versionId=<VERSION_ID_เก่า>" \
  --cache-control "no-cache, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --metadata-directive REPLACE

# 3. invalidate ให้ผู้ใช้ได้ของใหม่ทันที
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" \
  --paths "/index.html" "/"
```

**ทำไมย้อนแค่ `index.html` ก็พอ** — assets ใช้ชื่อไฟล์ที่มี hash และ `index.html` เก่าชี้ไปยังชื่อไฟล์ชุดเก่า ซึ่งยังอยู่บน S3 (`--delete` ลบเฉพาะไฟล์ที่ไม่มีใน build ใหม่ แต่ versioning เก็บของที่ถูกลบไว้เป็น delete marker)

**ถ้า assets เก่าหายไปด้วย** ให้ใช้ทาง B แทน จะเร็วกว่าการไปกู้ไฟล์ทีละตัว

### ยืนยันว่าย้อนสำเร็จ

```bash
# ต้องเห็นเนื้อหาของเวอร์ชันเก่า
curl -s "https://$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" \
  --query 'Distribution.DomainName' --output text)/" | head -20
```

แล้วเปิดเบราว์เซอร์แบบ hard refresh (Cmd+Shift+R) ตรวจ 3 ข้อจาก `deployment-strategy.md`

---

## ทาง B — revert commit แล้ว deploy ใหม่

ใช้เมื่อรู้สาเหตุและต้องการให้ประวัติใน git ตรงกับสิ่งที่อยู่บน production

```bash
# 1. หา commit ที่ทำพัง
git log --oneline -10

# 2. revert (สร้าง commit ใหม่ที่กลับการเปลี่ยนแปลง ไม่ลบประวัติ)
git revert <commit-hash>

# 3. ยืนยันว่ากลับมาผ่านทุกด่าน
npm test && npm run typecheck && npm run lint

# 4. deploy
BUCKET=<ชื่อ bucket> DISTRIBUTION_ID=<id> ./deploy/aws/deploy.sh
```

**ใช้ `git revert` ไม่ใช่ `git reset --hard`** — `revert` สร้าง commit ใหม่ที่ย้อนการเปลี่ยนแปลง ประวัติยังอยู่ครบและคนอื่นที่ pull ไปแล้วไม่เจอปัญหา ส่วน `reset --hard` ลบ commit ทิ้งและถ้า push แล้วจะทำให้ประวัติของคนอื่นแตก

---

## แก้ 404 เมื่อเปิด URL ตรง เช่น `/tasks`

**ไม่ใช่ปัญหาที่ต้องย้อนโค้ด** เป็นการตั้งค่า CloudFront

```bash
# ตรวจว่ามี custom error response ครบทั้ง 403 และ 404
aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID" \
  --query 'DistributionConfig.CustomErrorResponses' --output json
```

ต้องเห็นทั้ง `403` และ `404` ที่ชี้ไป `/index.html` พร้อม `ResponseCode: "200"`

**ต้องมีทั้งสองรหัส** เพราะ S3 ที่ใช้ OAC ตอบ **403 ไม่ใช่ 404** เมื่อไม่เจอไฟล์ คนส่วนใหญ่ตั้งแค่ 404 แล้วงงว่าทำไมยังพัง

ถ้าขาด ให้แก้ผ่าน console หรือ `update-distribution` แล้วรอ distribution กลับเป็น `Deployed`

---

## แก้ cache ค้าง เมื่อผู้ใช้ยังเห็นเวอร์ชันเก่า

```bash
# 1. ตรวจว่า index.html ตั้ง cache ถูกไหม
aws s3api head-object --bucket "$BUCKET" --key index.html \
  --query 'CacheControl' --output text
# ต้องได้: no-cache, must-revalidate

# 2. ถ้าผิด ตั้งใหม่
aws s3api copy-object --bucket "$BUCKET" --key index.html \
  --copy-source "$BUCKET/index.html" \
  --cache-control "no-cache, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --metadata-directive REPLACE

# 3. invalidate
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" \
  --paths "/index.html" "/"
```

ถ้า `index.html` เคยถูกตั้ง cache ยาวไว้ ผู้ใช้ที่ cache ไปแล้วจะยังติดของเก่าจนหมดอายุ — **CloudFront invalidation ไม่ล้าง cache ในเบราว์เซอร์ของผู้ใช้** ต้องบอกให้ hard refresh

---

## กรณีข้อมูลผู้ใช้เสียหาย

ถ้าเวอร์ชันที่มีปัญหาเขียนข้อมูลผิดรูปแบบลง `localStorage` การย้อนโค้ดไม่ล้างข้อมูลนั้น

ข่าวดีคือแอปมีทางออกอยู่แล้ว — `ErrorBoundary` (FR6.3) จับข้อมูลที่อ่านไม่ได้แล้วแสดงคำอธิบายพร้อมปุ่มล้างข้อมูล ไม่ใช่จอขาว มี e2e scenario ครอบกรณีนี้ไว้ใน `src/e2e/journey.e2e.spec.tsx`

**สิ่งที่ต้องบอกผู้ใช้:**

1. ถ้าเห็นหน้าแจ้งข้อผิดพลาด ให้กด **Export** ก่อนถ้ายังกดได้ เพื่อเก็บข้อมูลไว้
2. กดปุ่มล้างข้อมูลที่หน้านั้น
3. **Import** ไฟล์ที่เก็บไว้กลับเข้ามา

ถ้ากด Export ไม่ได้เลย ข้อมูลของคนนั้นกู้ไม่ได้ — เป็นข้อจำกัดที่ระบุไว้ตั้งแต่ต้นใน `README.md` และเป็นเหตุผลที่ควรบอกทีมให้ Export เก็บไว้เป็นระยะ

---

## หลังย้อนเสร็จทุกครั้ง

1. บันทึกว่าเกิดอะไร เวลาไหน ย้อนด้วยวิธีไหน และสาเหตุคืออะไร
2. เพิ่ม test ที่จับปัญหานั้นได้ **ก่อน** แก้โค้ด — ถ้าปัญหาหลุด 105 test ไปได้ แปลว่ามีช่องที่ test ยังไม่ครอบ
3. ถ้าเป็นปัญหาการตั้งค่า ไม่ใช่โค้ด ให้เพิ่มขั้นตอนตรวจเข้าไปในรายการ 3 ข้อของ `deployment-strategy.md`
