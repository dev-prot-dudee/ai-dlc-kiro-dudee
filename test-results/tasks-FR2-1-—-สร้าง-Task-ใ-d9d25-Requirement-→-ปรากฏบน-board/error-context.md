# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> FR2.1 — สร้าง Task ใหม่ >> สร้าง Task พร้อมเลือก Requirement → ปรากฏบน board
- Location: e2e/tasks.spec.ts:47:3

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
          - textbox "หัวข้อ (จำเป็น)" [active] [ref=f1e41]: Req สำหรับ Task
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
  4   |  * E2E Test — FR2: Task Management
  5   |  *
  6   |  * ทดสอบ flow จริง: สร้าง Task (ต้องมี Requirement ก่อน) → กรอง → แก้ → ลบ
  7   |  */
  8   | 
  9   | test.beforeEach(async ({ page }) => {
  10  |   await page.goto("/");
  11  |   await page.evaluate(() => localStorage.clear());
  12  |   await page.reload();
  13  | });
  14  | 
  15  | async function createRequirement(page: Page, title: string) {
  16  |   await page.click("text=Requirements");
  17  |   await page.click('[data-testid="toolbar-new"]');
  18  |   await page.fill('[data-testid="req-title"]', title);
  19  |   await page.selectOption('[data-testid="req-category"]', "Functional");
  20  |   await page.selectOption('[data-testid="req-priority"]', "Must");
> 21  |   await page.click('[data-testid="form-submit"]');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  22  |   await expect(page.locator(`text=${title}`)).toBeVisible();
  23  | }
  24  | 
  25  | async function createTask(
  26  |   page: Page,
  27  |   title: string,
  28  |   role: string,
  29  | ) {
  30  |   await page.click('[data-testid="toolbar-new"]');
  31  |   await page.fill('[data-testid="task-title"]', title);
  32  |   await page.selectOption('[data-testid="task-role"]', role);
  33  |   // เลือก Requirement แรกที่มี
  34  |   const reqSelect = page.locator('[data-testid="task-requirement"]');
  35  |   const options = reqSelect.locator("option");
  36  |   const count = await options.count();
  37  |   if (count > 1) {
  38  |     // เลือก option ที่ 2 (ข้ามตัว "เลือก...")
  39  |     const value = await options.nth(1).getAttribute("value");
  40  |     if (value) await reqSelect.selectOption(value);
  41  |   }
  42  |   await page.click('[data-testid="form-submit"]');
  43  |   await expect(page.locator(`text=${title}`)).toBeVisible();
  44  | }
  45  | 
  46  | test.describe("FR2.1 — สร้าง Task ใหม่", () => {
  47  |   test("สร้าง Task พร้อมเลือก Requirement → ปรากฏบน board", async ({ page }) => {
  48  |     // ต้องมี Requirement ก่อน
  49  |     await createRequirement(page, "Req สำหรับ Task");
  50  | 
  51  |     // ไปหน้า Tasks
  52  |     await page.click("text=Tasks");
  53  |     await createTask(page, "เขียน unit test", "Tester");
  54  | 
  55  |     await expect(page.locator("text=เขียน unit test")).toBeVisible();
  56  |   });
  57  | });
  58  | 
  59  | test.describe("FR2.2 — บังคับผูกกับ Requirement", () => {
  60  |   test("ไม่เลือก Requirement → ปฏิเสธ", async ({ page }) => {
  61  |     await createRequirement(page, "มี Req แล้ว");
  62  |     await page.click("text=Tasks");
  63  |     await page.click('[data-testid="toolbar-new"]');
  64  | 
  65  |     await page.fill('[data-testid="task-title"]', "Task ลอย");
  66  |     await page.selectOption('[data-testid="task-role"]', "Dev");
  67  |     // ไม่เลือก Requirement
  68  | 
  69  |     await page.click('[data-testid="form-submit"]');
  70  | 
  71  |     // ต้องเห็น error
  72  |     await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  73  |   });
  74  | });
  75  | 
  76  | test.describe("FR2.3 — บังคับระบุตำแหน่ง", () => {
  77  |   test("ไม่เลือกตำแหน่ง → ปฏิเสธ", async ({ page }) => {
  78  |     await createRequirement(page, "Req ต้นทาง");
  79  |     await page.click("text=Tasks");
  80  |     await page.click('[data-testid="toolbar-new"]');
  81  | 
  82  |     await page.fill('[data-testid="task-title"]', "Task ไม่มีตำแหน่ง");
  83  |     // เลือก Requirement
  84  |     const reqSelect = page.locator('[data-testid="task-requirement"]');
  85  |     const options = reqSelect.locator("option");
  86  |     const value = await options.nth(1).getAttribute("value");
  87  |     if (value) await reqSelect.selectOption(value);
  88  |     // ไม่เลือก role
  89  |     await page.selectOption('[data-testid="task-role"]', "");
  90  | 
  91  |     await page.click('[data-testid="form-submit"]');
  92  |     await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  93  |   });
  94  | });
  95  | 
  96  | test.describe("FR2.4 — กรองตามตำแหน่ง", () => {
  97  |   test("กรอง Dev → เห็นเฉพาะ Task ของ Dev", async ({ page }) => {
  98  |     await createRequirement(page, "Req A");
  99  |     await page.click("text=Tasks");
  100 | 
  101 |     await createTask(page, "งาน Dev", "Dev");
  102 |     await createTask(page, "งาน Tester", "Tester");
  103 | 
  104 |     // สลับเป็น List แล้วกรอง
  105 |     await page.click('role=tab[name=/list/i]');
  106 |     await page.selectOption('[data-testid="filter-role"]', "Dev");
  107 | 
  108 |     await expect(page.locator("text=งาน Dev")).toBeVisible();
  109 |     await expect(page.locator("text=งาน Tester")).not.toBeVisible();
  110 |   });
  111 | });
  112 | 
  113 | test.describe("FR2.5 — แก้ไขและลบ Task", () => {
  114 |   test("แก้หัวข้อ → เห็นค่าใหม่", async ({ page }) => {
  115 |     await createRequirement(page, "Req");
  116 |     await page.click("text=Tasks");
  117 |     await createTask(page, "ก่อนแก้ Task", "Dev");
  118 | 
  119 |     await page.click("text=ก่อนแก้ Task");
  120 |     await page.click('[data-testid="detail-edit"]');
  121 |     await page.fill('[data-testid="task-title"]', "หลังแก้ Task");
```