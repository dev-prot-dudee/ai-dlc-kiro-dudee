# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: traceability-and-storage.spec.ts >> FR4.1 — สายเชื่อมโยงจาก Requirement ลง >> เปิด Requirement → เห็น Task และ Defect ที่อยู่ใต้มัน
- Location: e2e/traceability-and-storage.spec.ts:52:3

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
          - textbox "หัวข้อ (จำเป็น)" [active] [ref=f1e41]: ผู้ใช้ต้อง Login ได้
        - generic [ref=f1e42]:
          - generic [ref=f1e43]: รายละเอียด
          - textbox "รายละเอียด" [ref=f1e44]
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
  4   |  * E2E Test — FR4: Traceability + FR6: Storage
  5   |  *
  6   |  * ทดสอบสายเชื่อมโยงข้าม entity และ export/import บนเบราว์เซอร์จริง
  7   |  */
  8   | 
  9   | test.beforeEach(async ({ page }) => {
  10  |   await page.goto("/");
  11  |   await page.evaluate(() => localStorage.clear());
  12  |   await page.reload();
  13  | });
  14  | 
  15  | async function seedFullChain(page: Page) {
  16  |   // สร้าง Requirement
  17  |   await page.click("text=Requirements");
  18  |   await page.click('[data-testid="toolbar-new"]');
  19  |   await page.fill('[data-testid="req-title"]', "ผู้ใช้ต้อง Login ได้");
  20  |   await page.selectOption('[data-testid="req-category"]', "Functional");
  21  |   await page.selectOption('[data-testid="req-priority"]', "Must");
> 22  |   await page.click('[data-testid="form-submit"]');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  23  |   await expect(page.locator("text=ผู้ใช้ต้อง Login ได้")).toBeVisible();
  24  | 
  25  |   // สร้าง Task
  26  |   await page.click("text=Tasks");
  27  |   await page.click('[data-testid="toolbar-new"]');
  28  |   await page.fill('[data-testid="task-title"]', "สร้าง Login API");
  29  |   await page.selectOption('[data-testid="task-role"]', "Dev");
  30  |   const reqSelect = page.locator('[data-testid="task-requirement"]');
  31  |   const reqOptions = reqSelect.locator("option");
  32  |   const reqVal = await reqOptions.nth(1).getAttribute("value");
  33  |   if (reqVal) await reqSelect.selectOption(reqVal);
  34  |   await page.click('[data-testid="form-submit"]');
  35  |   await expect(page.locator("text=สร้าง Login API")).toBeVisible();
  36  | 
  37  |   // สร้าง Defect
  38  |   await page.click("text=Defects");
  39  |   await page.click('[data-testid="toolbar-new"]');
  40  |   await page.fill('[data-testid="defect-title"]', "Login ไม่ hash password");
  41  |   await page.selectOption('[data-testid="defect-type"]', "Code Bug");
  42  |   await page.selectOption('[data-testid="defect-severity"]', "Critical");
  43  |   const taskSelect = page.locator('[data-testid="defect-task"]');
  44  |   const taskOptions = taskSelect.locator("option");
  45  |   const taskVal = await taskOptions.nth(1).getAttribute("value");
  46  |   if (taskVal) await taskSelect.selectOption(taskVal);
  47  |   await page.click('[data-testid="form-submit"]');
  48  |   await expect(page.locator("text=Login ไม่ hash password")).toBeVisible();
  49  | }
  50  | 
  51  | test.describe("FR4.1 — สายเชื่อมโยงจาก Requirement ลง", () => {
  52  |   test("เปิด Requirement → เห็น Task และ Defect ที่อยู่ใต้มัน", async ({ page }) => {
  53  |     await seedFullChain(page);
  54  | 
  55  |     await page.click("text=Requirements");
  56  |     await page.click("text=ผู้ใช้ต้อง Login ได้");
  57  | 
  58  |     // ในหน้ารายละเอียด ต้องเห็น Task ที่ผูกอยู่
  59  |     await expect(page.locator("text=สร้าง Login API")).toBeVisible();
  60  |     // และเห็น Defect ที่อยู่ใต้ Task นั้น
  61  |     await expect(page.locator("text=Login ไม่ hash password")).toBeVisible();
  62  |   });
  63  | });
  64  | 
  65  | test.describe("FR4.2 — สายย้อนกลับจาก Defect", () => {
  66  |   test("เปิด Defect → เห็น Task และ Requirement ต้นทาง", async ({ page }) => {
  67  |     await seedFullChain(page);
  68  | 
  69  |     await page.click("text=Defects");
  70  |     await page.click("text=Login ไม่ hash password");
  71  | 
  72  |     // ในหน้ารายละเอียด Defect ต้องเห็น Task ต้นทาง
  73  |     await expect(page.locator("text=สร้าง Login API")).toBeVisible();
  74  |   });
  75  | });
  76  | 
  77  | test.describe("FR4.3 — Requirement ที่ยังไม่มี Task", () => {
  78  |   test("Requirement ที่ไม่มี Task ต้องมีเครื่องหมายเตือน", async ({ page }) => {
  79  |     await page.click("text=Requirements");
  80  |     await page.click('[data-testid="toolbar-new"]');
  81  |     await page.fill('[data-testid="req-title"]', "Req ไม่มี Task");
  82  |     await page.selectOption('[data-testid="req-category"]', "Functional");
  83  |     await page.selectOption('[data-testid="req-priority"]', "Should");
  84  |     await page.click('[data-testid="form-submit"]');
  85  | 
  86  |     // ต้องเห็นเครื่องหมายเตือน
  87  |     await expect(page.locator("text=⚠ ยังไม่มี Task")).toBeVisible();
  88  |   });
  89  | });
  90  | 
  91  | test.describe("FR4.4 — Cascade delete Requirement", () => {
  92  |   test("ลบ Requirement → Task และ Defect ใต้มันต้องหายด้วย", async ({ page }) => {
  93  |     await seedFullChain(page);
  94  | 
  95  |     // ลบ Requirement
  96  |     await page.click("text=Requirements");
  97  |     await page.click("text=ผู้ใช้ต้อง Login ได้");
  98  |     await page.click('[data-testid="detail-delete"]');
  99  | 
  100 |     // ต้องเห็นจำนวนที่จะกำพร้า
  101 |     await expect(page.locator("text=/Task/")).toBeVisible();
  102 |     await page.click('[data-testid="confirm-ok"]');
  103 | 
  104 |     // Requirement หาย
  105 |     await expect(page.locator("text=ผู้ใช้ต้อง Login ได้")).not.toBeVisible();
  106 | 
  107 |     // Task หาย
  108 |     await page.click("text=Tasks");
  109 |     await expect(page.locator("text=สร้าง Login API")).not.toBeVisible();
  110 | 
  111 |     // Defect หาย
  112 |     await page.click("text=Defects");
  113 |     await expect(page.locator("text=Login ไม่ hash password")).not.toBeVisible();
  114 |   });
  115 | });
  116 | 
  117 | test.describe("FR6.1 — ข้อมูลคงอยู่ข้าม session", () => {
  118 |   test("สร้างรายการ → refresh → ยังเห็นรายการเดิม", async ({ page }) => {
  119 |     await page.click("text=Requirements");
  120 |     await page.click('[data-testid="toolbar-new"]');
  121 |     await page.fill('[data-testid="req-title"]', "ต้องอยู่หลัง refresh");
  122 |     await page.selectOption('[data-testid="req-category"]', "Functional");
```