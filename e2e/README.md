# E2E Test — PM Tool MVP

## วิธีติดตั้งและรัน

### 1. ติดตั้ง Playwright

```bash
# ที่ root ของโปรเจกต์
npm install -D @playwright/test
npx playwright install chromium
```

### 2. คัดลอก config

```bash
cp Tester-Aiy/playwright.config.ts playwright.config.ts
cp -r Tester-Aiy/e2e e2e
```

### 3. รัน E2E test

```bash
# รันทั้งหมด (เปิด dev server อัตโนมัติ)
npx playwright test

# รันเฉพาะไฟล์
npx playwright test e2e/requirements.spec.ts
npx playwright test e2e/tasks.spec.ts
npx playwright test e2e/defects.spec.ts
npx playwright test e2e/traceability-and-storage.spec.ts

# รันแบบเห็นเบราว์เซอร์
npx playwright test --headed

# ดู report
npx playwright show-report
```

---

## สรุป E2E Test Cases

| ไฟล์ | FR | จำนวน test | ทดสอบอะไร |
|------|-----|-----------|-----------|
| `requirements.spec.ts` | FR1 | 8 | สร้าง/แก้/ลบ/กรอง Requirement |
| `tasks.spec.ts` | FR2 | 7 | สร้าง/แก้/ลบ/กรอง Task |
| `defects.spec.ts` | FR3 | 8 | สร้าง/แก้/ลบ/กรอง Defect |
| `traceability-and-storage.spec.ts` | FR4+FR5+FR6 | 7 | สายเชื่อมโยง, cascade delete, export/import, session |
| **รวม** | | **30** | |

---

## รายละเอียดแยกตาม FR

### FR1 — Requirement Management

| # | Test | สิ่งที่ทำบนเบราว์เซอร์ | ผลที่คาดหวัง |
|---|------|----------------------|-------------|
| 1 | กรอกข้อมูลครบแล้วกดบันทึก | กรอกฟอร์ม → Submit | ปรากฏบน board |
| 2 | ค่าเริ่มต้น priority เป็น Should | เปิดฟอร์ม | dropdown = "Should" |
| 3 | ไม่เลือกประเภท → error | ปล่อย category ว่าง → Submit | เห็น error message |
| 4 | ค้นหาด้วยคำ | พิมพ์ค้น "Login" | เห็นเฉพาะรายการที่ตรง |
| 5 | กรองตามประเภทใน List view | เลือก filter Functional | ซ่อน Non-Functional |
| 6 | แก้หัวข้อ | เปิด detail → edit → save | เห็นค่าใหม่ |
| 7 | ลบ → ยืนยัน → หาย | detail → delete → confirm | หายจาก board |
| 8 | ลบ → ยกเลิก → ยังอยู่ | detail → delete → cancel | ยังอยู่ |

### FR2 — Task Management

| # | Test | สิ่งที่ทำบนเบราว์เซอร์ | ผลที่คาดหวัง |
|---|------|----------------------|-------------|
| 1 | สร้าง Task พร้อม Requirement | เลือก Req → submit | ปรากฏบน board |
| 2 | ไม่เลือก Requirement → error | ปล่อยว่าง → submit | เห็น error |
| 3 | ไม่เลือกตำแหน่ง → error | role ว่าง → submit | เห็น error |
| 4 | กรอง Dev | List view → filter Dev | เห็นเฉพาะ Dev |
| 5 | แก้หัวข้อ Task | edit → save | เห็นค่าใหม่ |
| 6 | ลบ Task | delete → confirm | หายจาก board |

### FR3 — Defect Tracking

| # | Test | สิ่งที่ทำบนเบราว์เซอร์ | ผลที่คาดหวัง |
|---|------|----------------------|-------------|
| 1 | สร้าง Defect พร้อม Task | เลือก Task → submit | ปรากฏบน board |
| 2 | ไม่เลือกประเภท → error | type ว่าง → submit | เห็น error |
| 3 | ทั้ง 5 ประเภทสร้างได้ | สร้างทีละประเภท | เห็นทั้ง 5 ตัว |
| 4 | ไม่เลือก severity → error | severity ว่าง → submit | เห็น error |
| 5 | ไม่เลือก Task → error | task ว่าง → submit | เห็น error |
| 6 | กรอง SA Gap | List → filter SA Gap | เห็นเฉพาะ SA Gap |
| 7 | แก้ประเภท | edit type → save | ค่าใหม่ |
| 8 | ลบ Defect | delete → confirm | หาย |

### FR4 — Traceability

| # | Test | สิ่งที่ทำบนเบราว์เซอร์ | ผลที่คาดหวัง |
|---|------|----------------------|-------------|
| 1 | Forward trace | เปิด Requirement detail | เห็น Task + Defect ใต้มัน |
| 2 | Backward trace | เปิด Defect detail | เห็น Task ต้นทาง |
| 3 | Req ไม่มี Task → เตือน | สร้าง Req ไม่สร้าง Task | เห็น "⚠ ยังไม่มี Task" |
| 4 | Cascade delete | ลบ Req ที่มี Task+Defect | ทั้ง 3 หายหมด |

### FR5 — การเลือกผู้ใช้

| # | Test | สิ่งที่ทำบนเบราว์เซอร์ | ผลที่คาดหวัง |
|---|------|----------------------|-------------|
| 1 | จำผู้ใช้ข้าม session | เลือก → refresh | ยังเป็นคนเดิม |

### FR6 — Storage

| # | Test | สิ่งที่ทำบนเบราว์เซอร์ | ผลที่คาดหวัง |
|---|------|----------------------|-------------|
| 1 | คงอยู่ข้าม refresh | สร้าง → refresh | ยังเห็น |
| 2 | Export → Import | export → ลบ → import | ข้อมูลครบเท่าเดิม |
