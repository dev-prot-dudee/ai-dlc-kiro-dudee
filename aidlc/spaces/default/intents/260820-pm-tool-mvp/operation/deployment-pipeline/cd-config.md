# CD Configuration — PM Tool MVP บน AWS

## หลักฐานที่ใช้ออกแบบ และสิ่งที่ไม่มี

ขั้นนี้ออกแบบได้เฉพาะบนหลักฐานที่มีจริง ห้ามสมมติ infrastructure ที่ไม่มีอยู่

**สิ่งที่ขั้นนี้ควรได้รับแต่ไม่มี** — ทั้งสี่รายการนี้หายไปเพราะ scope `express` **ข้ามขั้นที่ผลิตมันโดยการออกแบบ** ไม่ใช่ความผิดพลาดหรือของที่ตกหล่น:

| artifact ที่ consume | ปกติมาจากขั้น | สถานะ |
|---------------------|--------------|-------|
| `ci-config` | ci-pipeline | ไม่มี — `express` ข้ามขั้นนี้ |
| `quality-gates` | ci-pipeline | ไม่มี — `express` ข้ามขั้นนี้ |
| `infrastructure-specification` | infrastructure-design | ไม่มี — `express` ข้ามขั้นนี้ |
| `cicd-pipeline` | infrastructure-design | ไม่มี — `express` ข้ามขั้นนี้ |

ผลคือเอกสารนี้**ไม่ได้สืบทอดการออกแบบ infrastructure จากขั้นก่อน** แต่สร้างขึ้นใหม่จากสิ่งที่ตรวจพบในโปรเจกต์จริง

**สิ่งที่มีจริงและใช้เป็นฐาน**
- ของที่ deploy ได้ — `dist/` เป็น static SPA ขนาด 67.09 KB gzip
- เกณฑ์คุณภาพที่รันได้จริง 4 ด่าน จาก `build-and-test/build-test-results.md` — แทนบทบาทของ `quality-gates` ที่ไม่มี
- ขั้นตอน build ที่ยืนยันแล้วจาก `build-and-test/build-instructions.md`
- `git remote` ชี้ GitHub `dev-prot-dudee/ai-dlc-kiro-dudee`

## สถาปัตยกรรมที่เลือก

```
ผู้ใช้ → CloudFront (HTTPS, cache, fallback 403/404 → /index.html)
              ↓ Origin Access Control (SigV4)
         S3 bucket (private, versioning, เข้ารหัส AES256)
```

**ไม่ใช้ S3 static website hosting** เพราะต้องเปิด bucket เป็น public ซึ่งไม่มี HTTPS และเป็น anti-pattern ด้านความปลอดภัย · ใช้ CloudFront + OAC ทำให้ bucket ปิดสนิทและมีแค่ CloudFront ตัวที่ระบุไว้เท่านั้นที่อ่านได้

## ไฟล์ที่ใช้ deploy

| ไฟล์ | หน้าที่ | รันเมื่อไร |
|------|--------|-----------|
| `deploy/aws/bootstrap.sh` | สร้าง S3 + OAC + CloudFront + bucket policy | **ครั้งเดียว** |
| `deploy/aws/deploy.sh` | ตรวจคุณภาพ → build → อัปโหลด → invalidate | ทุกครั้งที่ปล่อยของใหม่ |
| `deploy/aws/cloudfront-distribution.json` | template ของ distribution | ถูกเรียกโดย bootstrap |

## ขั้นตอนใช้งาน

### ครั้งแรก

```bash
# 1. ติดตั้ง AWS CLI (ยังไม่มีในเครื่อง)
brew install awscli

# 2. ตั้ง credentials — ขั้นนี้ต้องทำเอง ห้ามให้ใครทำแทน
aws configure

# 3. สร้าง infrastructure (ชื่อ bucket ต้องไม่ซ้ำใครทั้ง AWS)
BUCKET=pm-tool-mvp-<ชื่อที่ไม่ซ้ำ> REGION=ap-southeast-1 ./deploy/aws/bootstrap.sh
```

`bootstrap.sh` จะพิมพ์แผนออกมาแล้ว**หยุดรอให้พิมพ์ `yes`** ก่อนสร้างอะไร และจบด้วยการบอกค่า `BUCKET` กับ `DISTRIBUTION_ID` ที่ต้องเก็บไว้

### ทุกครั้งที่ปล่อยของใหม่

```bash
BUCKET=<ชื่อ bucket> DISTRIBUTION_ID=<id> ./deploy/aws/deploy.sh
```

## ด่านคุณภาพก่อน deploy

`deploy.sh` รันสามคำสั่งนี้ก่อน ถ้าตัวใดล้ม script หยุดทันทีด้วย `set -e` และไม่มีอะไรขึ้น production

| ด่าน | คำสั่ง | ต้องได้ |
|-----|-------|--------|
| Test | `npm test` | 105 ผ่าน (56 unit + 49 e2e) |
| Type | `npm run typecheck` | ไม่มี error |
| Lint | `npm run lint` | ไม่มี error |
| Build | `npm run build` | สำเร็จ + มี `dist/index.html` |

**การวัด NFR (`npm run test:perf`) ไม่อยู่ในด่านนี้โดยเจตนา** เพราะการวัดเวลาแปรผันตามเครื่อง ถ้าเอามาเป็นด่านบังคับจะทำให้ deploy ล้มเป็นครั้งคราวโดยที่โค้ดไม่ได้ผิด

มีทางออกฉุกเฉิน `SKIP_CHECKS=1` สำหรับกรณีต้องแก้ production ด่วน — เป็นการยอมรับความเสี่ยงอย่างรู้ตัว ไม่ใช่ค่าเริ่มต้น

## การตั้ง cache — จุดที่พลาดง่ายที่สุด

| ไฟล์ | Cache-Control | เหตุผล |
|------|--------------|--------|
| `assets/*` | `public, max-age=31536000, immutable` | ชื่อไฟล์มี hash ทุก build เปลี่ยนโค้ดคือเปลี่ยนชื่อไฟล์ จึง cache ตลอดกาลได้อย่างปลอดภัย |
| `index.html` | `no-cache, must-revalidate` | เป็นตัวชี้ว่าเวอร์ชันไหนคือปัจจุบัน ถ้า cache ผู้ใช้จะติดหน้าเก่าที่ชี้ไปยังไฟล์ที่ถูกลบแล้ว = จอขาว |

**ลำดับการอัปโหลดสำคัญ** — `deploy.sh` ส่ง assets ขึ้นก่อน แล้วจึง `index.html` ถ้าสลับลำดับ จะมีช่วงที่ผู้ใช้ได้ `index.html` ใหม่แต่ไฟล์ที่มันชี้ไปยังไม่ขึ้น

## Invalidation

invalidate เฉพาะ `/index.html` และ `/` ไม่ใช่ `/*`

เพราะ assets ใช้ชื่อไฟล์ใหม่ทุก build อยู่แล้วจึงไม่มีอะไรค้างให้ล้าง การ invalidate `/*` ทุกครั้งเสียเงินเปล่าและไม่ได้ประโยชน์เพิ่ม (AWS ให้ฟรี 1,000 path ต่อเดือน หลังจากนั้นคิดเงินต่อ path)

## สิ่งที่ยังไม่ได้ทำ และเหตุผล

| สิ่งที่ไม่ได้ทำ | เหตุผล |
|---------------|--------|
| IAM role สำหรับ CI (OIDC) | ยังไม่ได้ตัดสินใจว่าจะ deploy อัตโนมัติหรือกดเอง · ถ้าจะทำอัตโนมัติ ต้องสร้าง role ที่ไว้ใจ GitHub OIDC และจำกัด trust policy เฉพาะ repo กับ branch นี้ **ห้ามใช้ access key ค้างใน GitHub secrets** |
| Custom domain + ACM | ยังไม่รู้ชื่อ domain · certificate ต้องออกที่ **us-east-1** เท่านั้น CloudFront ไม่รับจาก region อื่น |
| การจำกัดผู้เข้าถึง | ดู `deployment-strategy.md` หัวข้อ "การจำกัดผู้เข้าถึง" — เป็นเรื่องที่ควรตัดสินใจก่อนให้คนนอกทีมเห็น URL |
| environment แยก staging/production | รุ่นนี้มี environment เดียว · ถ้าจะแยกให้ทำ bucket + distribution อีกชุดแล้วส่งค่าตัวแปรต่างกัน ไม่ต้องแก้ script |

## ความปลอดภัยที่ต้องรู้ก่อน deploy

URL ที่ได้จะ**เปิดให้ใครก็เข้าได้** เพราะแอปไม่มีระบบยืนยันตัวตน (ความเสี่ยง R1 จาก `requirements.md`)

ข้อมูลไม่รั่วข้ามคนเพราะแยกตาม `localStorage` ของแต่ละเบราว์เซอร์ แต่ตัวแอปเป็นสาธารณะ และใครที่เข้าถึงได้ก็แก้ลบข้อมูลของตัวเองได้ทั้งหมดรวมถึงกรอกชื่อคนอื่นเป็นผู้รับผิดชอบ — **ห้ามนำข้อมูลไปคำนวณ KPI รายคน**

script ไม่มี credential ฝังอยู่เลย ทุกค่าที่อ่อนไหวมาจาก `aws configure` ของแต่ละคนหรือจาก environment variable
