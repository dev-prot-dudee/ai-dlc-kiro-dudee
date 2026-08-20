# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: defects.spec.ts >> FR3.6 — แก้ไขและลบ Defect >> แก้ประเภท → เห็นค่าใหม่
- Location: e2e/defects.spec.ts:152:3

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
          - textbox "หัวข้อ (จำเป็น)" [active] [ref=f1e41]: Req ต้นทาง
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
  4   |  * E2E Test — FR3: Defect Tracking
  5   |  *
  6   |  * ทดสอบ flow จริง: สร้าง Defect (ต้องมี Task ก่อน) → กรอง → แก้ → ลบ
  7   |  */
  8   | 
  9   | test.beforeEach(async ({ page }) => {
  10  |   await page.goto("/");
  11  |   await page.evaluate(() => localStorage.clear());
  12  |   await page.reload();
  13  | });
  14  | 
  15  | async function seedTaskChain(page: Page) {
  16  |   // สร้าง Requirement
  17  |   await page.click("text=Requirements");
  18  |   await page.click('[data-testid="toolbar-new"]');
  19  |   await page.fill('[data-testid="req-title"]', "Req ต้นทาง");
  20  |   await page.selectOption('[data-testid="req-category"]', "Functional");
  21  |   await page.selectOption('[data-testid="req-priority"]', "Must");
> 22  |   await page.click('[data-testid="form-submit"]');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  23  |   await expect(page.locator("text=Req ต้นทาง")).toBeVisible();
  24  | 
  25  |   // สร้าง Task
  26  |   await page.click("text=Tasks");
  27  |   await page.click('[data-testid="toolbar-new"]');
  28  |   await page.fill('[data-testid="task-title"]', "Task ต้นทาง");
  29  |   await page.selectOption('[data-testid="task-role"]', "Dev");
  30  |   const reqSelect = page.locator('[data-testid="task-requirement"]');
  31  |   const options = reqSelect.locator("option");
  32  |   const value = await options.nth(1).getAttribute("value");
  33  |   if (value) await reqSelect.selectOption(value);
  34  |   await page.click('[data-testid="form-submit"]');
  35  |   await expect(page.locator("text=Task ต้นทาง")).toBeVisible();
  36  | }
  37  | 
  38  | async function createDefect(
  39  |   page: Page,
  40  |   title: string,
  41  |   type: string,
  42  |   severity: string,
  43  | ) {
  44  |   await page.click('[data-testid="toolbar-new"]');
  45  |   await page.fill('[data-testid="defect-title"]', title);
  46  |   await page.selectOption('[data-testid="defect-type"]', type);
  47  |   await page.selectOption('[data-testid="defect-severity"]', severity);
  48  |   // เลือก Task แรกที่มี
  49  |   const taskSelect = page.locator('[data-testid="defect-task"]');
  50  |   const options = taskSelect.locator("option");
  51  |   const val = await options.nth(1).getAttribute("value");
  52  |   if (val) await taskSelect.selectOption(val);
  53  |   await page.click('[data-testid="form-submit"]');
  54  |   await expect(page.locator(`text=${title}`)).toBeVisible();
  55  | }
  56  | 
  57  | test.describe("FR3.1 — สร้าง Defect ใหม่", () => {
  58  |   test("สร้าง Defect พร้อมเลือก Task → ปรากฏบน board", async ({ page }) => {
  59  |     await seedTaskChain(page);
  60  |     await page.click("text=Defects");
  61  |     await createDefect(page, "ปุ่ม Login พัง", "Code Bug", "High");
  62  | 
  63  |     await expect(page.locator("text=ปุ่ม Login พัง")).toBeVisible();
  64  |   });
  65  | });
  66  | 
  67  | test.describe("FR3.2 — บังคับระบุประเภทจาก 5 ค่า", () => {
  68  |   test("ไม่เลือกประเภท → ปฏิเสธ", async ({ page }) => {
  69  |     await seedTaskChain(page);
  70  |     await page.click("text=Defects");
  71  |     await page.click('[data-testid="toolbar-new"]');
  72  | 
  73  |     await page.fill('[data-testid="defect-title"]', "ไม่มีประเภท");
  74  |     await page.selectOption('[data-testid="defect-type"]', "");
  75  |     await page.selectOption('[data-testid="defect-severity"]', "Medium");
  76  |     const taskSelect = page.locator('[data-testid="defect-task"]');
  77  |     const options = taskSelect.locator("option");
  78  |     const val = await options.nth(1).getAttribute("value");
  79  |     if (val) await taskSelect.selectOption(val);
  80  | 
  81  |     await page.click('[data-testid="form-submit"]');
  82  |     await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  83  |   });
  84  | 
  85  |   test("ทั้ง 5 ประเภทสร้างได้หมด", async ({ page }) => {
  86  |     await seedTaskChain(page);
  87  |     await page.click("text=Defects");
  88  | 
  89  |     const types = ["Code Bug", "SA Gap", "Design Gap", "Test Escape", "NFR Violation"];
  90  |     for (const type of types) {
  91  |       await createDefect(page, `Defect: ${type}`, type, "Medium");
  92  |     }
  93  | 
  94  |     for (const type of types) {
  95  |       await expect(page.locator(`text=Defect: ${type}`)).toBeVisible();
  96  |     }
  97  |   });
  98  | });
  99  | 
  100 | test.describe("FR3.3 — บังคับระบุความรุนแรง", () => {
  101 |   test("ไม่เลือกความรุนแรง → ปฏิเสธ", async ({ page }) => {
  102 |     await seedTaskChain(page);
  103 |     await page.click("text=Defects");
  104 |     await page.click('[data-testid="toolbar-new"]');
  105 | 
  106 |     await page.fill('[data-testid="defect-title"]', "ไม่มี severity");
  107 |     await page.selectOption('[data-testid="defect-type"]', "Code Bug");
  108 |     await page.selectOption('[data-testid="defect-severity"]', "");
  109 |     const taskSelect = page.locator('[data-testid="defect-task"]');
  110 |     const options = taskSelect.locator("option");
  111 |     const val = await options.nth(1).getAttribute("value");
  112 |     if (val) await taskSelect.selectOption(val);
  113 | 
  114 |     await page.click('[data-testid="form-submit"]');
  115 |     await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  116 |   });
  117 | });
  118 | 
  119 | test.describe("FR3.4 — บังคับผูกกับ Task", () => {
  120 |   test("ไม่เลือก Task → ปฏิเสธ", async ({ page }) => {
  121 |     await seedTaskChain(page);
  122 |     await page.click("text=Defects");
```