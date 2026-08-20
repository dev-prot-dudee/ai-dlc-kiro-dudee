# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: requirements.spec.ts >> FR1.1 — สร้าง Requirement ใหม่ >> กรอกข้อมูลครบแล้วกดบันทึก → ปรากฏบน board
- Location: e2e/requirements.spec.ts:17:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="form-submit"]')

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - navigation "เมนูหลัก" [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]: ▣
      - generic [ref=f1e7]: PM Tool
    - generic [ref=f1e8]:
      - generic [ref=f1e9]: Modules
      - generic "Modules" [ref=f1e10]:
        - link "Requirements 0" [ref=f1e11] [cursor=pointer]:
          - /url: /requirements
          - generic [ref=f1e12]: ◎
          - generic [ref=f1e13]: Requirements
          - generic [ref=f1e14]: "0"
        - link "Tasks 0" [ref=f1e15] [cursor=pointer]:
          - /url: /tasks
          - generic [ref=f1e16]: ✓
          - generic [ref=f1e17]: Tasks
          - generic [ref=f1e18]: "0"
        - link "Defects 0" [ref=f1e19] [cursor=pointer]:
          - /url: /defects
          - generic [ref=f1e20]: ◆
          - generic [ref=f1e21]: Defects
          - generic [ref=f1e22]: "0"
    - generic [ref=f1e23]:
      - generic [ref=f1e24]: ผู้ใช้ปัจจุบัน
      - generic [ref=f1e25]:
        - generic [ref=f1e26]: ผู้ใช้ปัจจุบัน
        - combobox "ผู้ใช้ปัจจุบัน" [ref=f1e27]:
          - option "สมชาย (SA)" [selected]
          - option "ปิยะ (Dev)"
          - option "วรรณา (Dev)"
          - option "ธนา (Tester)"
          - option "อรุณ (SA)"
          - option "กิตติ (Dev)"
          - option "นภา (Dev)"
          - option "ศิริ (Tester)"
          - option "ประวิทย์ (SA)"
          - option "จันทรา (Dev)"
          - option "เอกชัย (Dev)"
          - option "มาลี (Tester)"
        - generic [ref=f1e28]: ไม่ใช่การยืนยันตัวตน — ใช้ระบุผู้รายงานและผู้รับผิดชอบเท่านั้น
  - main [ref=f1e29]:
    - generic [ref=f1e30]:
      - generic [ref=f1e31]:
        - generic [ref=f1e32]: ◎
        - generic [ref=f1e33]:
          - heading "Requirements" [level=1] [ref=f1e34]
          - paragraph [ref=f1e35]: รับและจัดการ Requirement ทั้ง Functional และ NFR
      - heading "สร้าง Requirement" [level=2] [ref=f1e36]
      - generic [ref=f1e37]:
        - generic [ref=f1e38]:
          - generic [ref=f1e39]:
            - text: หัวข้อ *
            - generic [ref=f1e40]: (จำเป็น)
          - textbox "หัวข้อ (จำเป็น)" [ref=f1e41]: ผู้ใช้ต้องเข้าสู่ระบบได้
        - generic [ref=f1e42]:
          - generic [ref=f1e43]: รายละเอียด
          - textbox "รายละเอียด" [active] [ref=f1e44]: รองรับ email และ password
        - generic [ref=f1e45]:
          - generic [ref=f1e46]:
            - text: ประเภท *
            - generic [ref=f1e47]: (จำเป็น)
          - combobox "ประเภท (จำเป็น)" [ref=f1e48]:
            - option "— เลือกประเภท —"
            - option "Functional" [selected]
            - option "Non-Functional"
          - generic [ref=f1e49]: Functional คือสิ่งที่ระบบต้องทำได้ Non-Functional คือคุณภาพที่ระบบต้องมี
        - generic [ref=f1e50]:
          - generic [ref=f1e51]:
            - text: ระดับความสำคัญ (MoSCoW) *
            - generic [ref=f1e52]: (จำเป็น)
          - combobox "ระดับความสำคัญ (MoSCoW) (จำเป็น)" [ref=f1e53]:
            - option "Must" [selected]
            - option "Should"
            - option "Could"
            - option "Won't"
          - generic [ref=f1e54]: ค่าเริ่มต้นคือ Should
        - generic [ref=f1e55]:
          - generic [ref=f1e56]:
            - text: ผู้รับผิดชอบ *
            - generic [ref=f1e57]: (จำเป็น)
          - combobox "ผู้รับผิดชอบ (จำเป็น)" [ref=f1e58]:
            - option "สมชาย (SA)" [selected]
            - option "ปิยะ (Dev)"
            - option "วรรณา (Dev)"
            - option "ธนา (Tester)"
            - option "อรุณ (SA)"
            - option "กิตติ (Dev)"
            - option "นภา (Dev)"
            - option "ศิริ (Tester)"
            - option "ประวิทย์ (SA)"
            - option "จันทรา (Dev)"
            - option "เอกชัย (Dev)"
            - option "มาลี (Tester)"
        - generic [ref=f1e59]:
          - button "สร้าง Requirement" [ref=f1e60] [cursor=pointer]
          - button "ยกเลิก" [ref=f1e61] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * E2E Test — FR1: Requirement Management
  5   |  *
  6   |  * ทดสอบ flow จริงบนเบราว์เซอร์: สร้าง → แก้ → กรอง → ลบ Requirement
  7   |  */
  8   | 
  9   | test.beforeEach(async ({ page }) => {
  10  |   await page.goto("/");
  11  |   // ล้าง localStorage ก่อนทุก test
  12  |   await page.evaluate(() => localStorage.clear());
  13  |   await page.reload();
  14  | });
  15  | 
  16  | test.describe("FR1.1 — สร้าง Requirement ใหม่", () => {
  17  |   test("กรอกข้อมูลครบแล้วกดบันทึก → ปรากฏบน board", async ({ page }) => {
  18  |     // ไปหน้า Requirements
  19  |     await page.click("text=Requirements");
  20  | 
  21  |     // กดสร้างใหม่
  22  |     await page.click('[data-testid="toolbar-new"]');
  23  | 
  24  |     // กรอกฟอร์ม
  25  |     await page.fill('[data-testid="req-title"]', "ผู้ใช้ต้องเข้าสู่ระบบได้");
  26  |     await page.fill('[data-testid="req-description"]', "รองรับ email และ password");
  27  |     await page.selectOption('[data-testid="req-category"]', "Functional");
  28  |     await page.selectOption('[data-testid="req-priority"]', "Must");
  29  | 
  30  |     // บันทึก
> 31  |     await page.click('[data-testid="form-submit"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  32  | 
  33  |     // ต้องเห็นบน board
  34  |     await expect(page.locator("text=ผู้ใช้ต้องเข้าสู่ระบบได้")).toBeVisible();
  35  |   });
  36  | 
  37  |   test("ค่าเริ่มต้น priority ต้องเป็น Should", async ({ page }) => {
  38  |     await page.click("text=Requirements");
  39  |     await page.click('[data-testid="toolbar-new"]');
  40  | 
  41  |     const prioritySelect = page.locator('[data-testid="req-priority"]');
  42  |     await expect(prioritySelect).toHaveValue("Should");
  43  |   });
  44  | });
  45  | 
  46  | test.describe("FR1.2 — บังคับระบุประเภท", () => {
  47  |   test("ไม่เลือกประเภท → แสดง error ไม่บันทึก", async ({ page }) => {
  48  |     await page.click("text=Requirements");
  49  |     await page.click('[data-testid="toolbar-new"]');
  50  | 
  51  |     await page.fill('[data-testid="req-title"]', "ทดสอบไม่เลือกประเภท");
  52  |     // ไม่เลือก category — ปล่อยว่าง
  53  |     await page.selectOption('[data-testid="req-category"]', "");
  54  | 
  55  |     await page.click('[data-testid="form-submit"]');
  56  | 
  57  |     // ต้องเห็น error message
  58  |     await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  59  |     // ต้องไม่ปรากฏบน board
  60  |     await expect(page.locator("text=ทดสอบไม่เลือกประเภท")).not.toBeVisible();
  61  |   });
  62  | });
  63  | 
  64  | test.describe("FR1.4 — กรองและค้นหา", () => {
  65  |   test("ค้นหาด้วยคำ → เห็นเฉพาะรายการที่ตรง", async ({ page }) => {
  66  |     await page.click("text=Requirements");
  67  | 
  68  |     // สร้าง 2 รายการ
  69  |     await createRequirement(page, "Login Feature", "Functional", "Must");
  70  |     await createRequirement(page, "Performance NFR", "Non-Functional", "Should");
  71  | 
  72  |     // ค้นหา "Login"
  73  |     await page.fill('[data-testid="toolbar-search"]', "Login");
  74  | 
  75  |     await expect(page.locator("text=Login Feature")).toBeVisible();
  76  |     await expect(page.locator("text=Performance NFR")).not.toBeVisible();
  77  |   });
  78  | 
  79  |   test("เปลี่ยนเป็น List view แล้วกรองตามประเภท", async ({ page }) => {
  80  |     await page.click("text=Requirements");
  81  | 
  82  |     await createRequirement(page, "FR ข้อหนึ่ง", "Functional", "Must");
  83  |     await createRequirement(page, "NFR ข้อหนึ่ง", "Non-Functional", "Could");
  84  | 
  85  |     // สลับเป็น List view
  86  |     await page.click('role=tab[name=/list/i]');
  87  | 
  88  |     // กรองเฉพาะ Functional
  89  |     await page.selectOption('[data-testid="filter-category"]', "Functional");
  90  | 
  91  |     await expect(page.locator("text=FR ข้อหนึ่ง")).toBeVisible();
  92  |     await expect(page.locator("text=NFR ข้อหนึ่ง")).not.toBeVisible();
  93  |   });
  94  | });
  95  | 
  96  | test.describe("FR1.5 — แก้ไข Requirement", () => {
  97  |   test("แก้หัวข้อแล้วกลับมาดู ต้องเห็นค่าใหม่", async ({ page }) => {
  98  |     await page.click("text=Requirements");
  99  |     await createRequirement(page, "ก่อนแก้", "Functional", "Should");
  100 | 
  101 |     // เปิดรายละเอียด
  102 |     await page.click("text=ก่อนแก้");
  103 | 
  104 |     // กดแก้ไข
  105 |     await page.click('[data-testid="detail-edit"]');
  106 | 
  107 |     // แก้หัวข้อ
  108 |     await page.fill('[data-testid="req-title"]', "หลังแก้แล้ว");
  109 |     await page.click('[data-testid="form-submit"]');
  110 | 
  111 |     // ต้องเห็นค่าใหม่
  112 |     await expect(page.locator("text=หลังแก้แล้ว")).toBeVisible();
  113 |     await expect(page.locator("text=ก่อนแก้")).not.toBeVisible();
  114 |   });
  115 | });
  116 | 
  117 | test.describe("FR1.6 — ลบ Requirement", () => {
  118 |   test("กดลบ → ยืนยัน → หายจากรายการ", async ({ page }) => {
  119 |     await page.click("text=Requirements");
  120 |     await createRequirement(page, "จะลบทิ้ง", "Functional", "Won't");
  121 | 
  122 |     // เปิดรายละเอียด
  123 |     await page.click("text=จะลบทิ้ง");
  124 |     await page.click('[data-testid="detail-delete"]');
  125 | 
  126 |     // ยืนยันในกล่อง dialog
  127 |     await page.click('[data-testid="confirm-ok"]');
  128 | 
  129 |     // หายจาก board
  130 |     await expect(page.locator("text=จะลบทิ้ง")).not.toBeVisible();
  131 |   });
```