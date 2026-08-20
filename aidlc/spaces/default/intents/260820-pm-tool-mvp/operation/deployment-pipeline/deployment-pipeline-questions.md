# Deployment Pipeline — คำถามเพื่อความชัดเจน

## บริบทก่อนตอบคำถาม

ขั้นนี้ออกแบบได้เฉพาะบนหลักฐานที่มีอยู่จริง ห้ามสมมติ infrastructure ที่ไม่มี สิ่งที่ตรวจพบในโปรเจกต์:

**สิ่งที่มี**
- ของที่ deploy ได้จริง — `dist/` เป็น static SPA ขนาด 67 KB gzip จาก `npm run build`
- `git remote` ชี้ไปที่ GitHub: `dev-prot-dudee/ai-dlc-kiro-dudee`
- คำสั่งตรวจคุณภาพ 4 ตัวที่ผ่านแล้วทั้งหมด (test 66, typecheck, lint, build)

**สิ่งที่ไม่มี**
- `ci-config` และ `quality-gates` — ปกติมาจากขั้น ci-pipeline ซึ่ง scope `express` **ข้ามโดยการออกแบบ** ไม่ใช่ความผิดพลาด
- `infrastructure-specification` และ `cicd-pipeline` — ปกติมาจากขั้น infrastructure-design ซึ่ง `express` ข้ามเช่นกัน
- ไม่มี Dockerfile ไม่มี IaC ไม่มี Kubernetes manifest ไม่มีไฟล์ CI ใดๆ ในโปรเจกต์

เพราะไม่มีหลักฐานเรื่องปลายทาง ผมจึงตอบเองไม่ได้ว่าจะ deploy ที่ไหน — ต้องถาม

**สองเรื่องที่มีผลต่อคำตอบ**

1. ระบบนี้เก็บข้อมูลใน `localStorage` ของเบราว์เซอร์แต่ละคน การ deploy ขึ้นเว็บสาธารณะจึง**ไม่ได้ทำให้ข้อมูลใครรั่วไปหาใคร** เพราะแต่ละคนเห็นแต่ข้อมูลตัวเอง แต่**ตัวเว็บจะเปิดให้ใครก็เข้าได้** เพราะไม่มีระบบยืนยันตัวตน (ความเสี่ยง R1)
2. ระบบใช้ `BrowserRouter` ซึ่งทำให้ URL ตรงอย่าง `/tasks` **จะขึ้น 404 บน static host** ถ้าไม่ตั้งกฎ rewrite ให้ทุก path ตกไปที่ `index.html` เรื่องนี้ต้องแก้ที่ config ของปลายทาง ไม่ใช่ที่โค้ด

---

## Q1: จะ deploy ไปที่ไหน

**A. GitHub Pages** — remote เป็น GitHub อยู่แล้ว ฟรี ตั้งค่าเร็วที่สุด เหมาะกับ demo · ต้องตั้ง `base` ใน `vite.config.ts` และแก้เรื่อง 404 ด้วยการ copy `index.html` เป็น `404.html`

**B. AWS S3 + CloudFront** — คุมได้ละเอียด ใส่ domain เองได้ รองรับ rewrite ที่ CloudFront · ต้องมี AWS account และตั้งค่ามากกว่า

**C. Netlify หรือ Vercel** — ตั้งค่าน้อยที่สุด จัดการ rewrite ให้เอง มี preview ต่อ PR · ต้องสมัครบริการภายนอก

**D. ยังไม่ deploy — เอกสารพร้อมไว้ก่อน** ผมเขียน CD config, กลยุทธ์ และ runbook ให้ครบ แต่ยังไม่ต่อกับปลายทางจริง เอาไว้ตัดสินใจภายหลัง

**X. Other (please specify)**

[Answer]: B — AWS S3 + CloudFront โดยใช้ AWS CLI

---

## Q2: ให้ deploy อัตโนมัติเมื่อไร

**A. อัตโนมัติเมื่อ merge เข้า `main`** — ตรงกับ trunk-based development และ "deploy on merge" ที่ org กำหนดไว้ · ต้องให้ 4 ด่านคุณภาพผ่านก่อนทุกครั้ง

**B. กดสั่งเองเมื่อพร้อม** — คุมจังหวะได้ เหมาะเมื่อยังไม่มั่นใจ

**X. Other (please specify)**

[Answer]:

---

## Q3: จะย้อนกลับอย่างไรเมื่อ deploy แล้วมีปัญหา

**A. ย้อนไป build ก่อนหน้า** — เก็บ artifact ของแต่ละ build ไว้แล้วสลับกลับ เร็วที่สุด

**B. revert commit แล้ว build ใหม่** — ประวัติตรงกับสิ่งที่อยู่บน production เสมอ แต่ช้ากว่าเพราะต้องรอ build

**X. Other (please specify)**

[Answer]:
