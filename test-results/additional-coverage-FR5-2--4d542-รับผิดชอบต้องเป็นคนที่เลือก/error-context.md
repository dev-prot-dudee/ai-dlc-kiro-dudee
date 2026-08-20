# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: additional-coverage.spec.ts >> FR5.2 — เปลี่ยนผู้ใช้แล้วรายการใหม่เป็นของคนนั้น >> เลือกผู้ใช้คนใหม่ → สร้าง Requirement → ผู้รับผิดชอบต้องเป็นคนที่เลือก
- Location: e2e/additional-coverage.spec.ts:105:3

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
          - option "สมชาย (SA)"
          - option "ปิยะ (Dev)"
          - option "วรรณา (Dev)"
          - option "ธนา (Tester)" [selected]
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
          - textbox "หัวข้อ (จำเป็น)" [active] [ref=f1e41]: ทดสอบผู้รับผิดชอบ
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
            - option "Must"
            - option "Should" [selected]
            - option "Could"
            - option "Won't"
          - generic [ref=f1e54]: ค่าเริ่มต้นคือ Should
        - generic [ref=f1e55]:
          - generic [ref=f1e56]:
            - text: ผู้รับผิดชอบ *
            - generic [ref=f1e57]: (จำเป็น)
          - combobox "ผู้รับผิดชอบ (จำเป็น)" [ref=f1e58]:
            - option "สมชาย (SA)"
            - option "ปิยะ (Dev)"
            - option "วรรณา (Dev)"
            - option "ธนา (Tester)" [selected]
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
  20  | 
  21  | test.describe("FR6.3 — ข้อมูลเสียหาย (Error Boundary)", () => {
  22  |   test("localStorage มีข้อมูลที่ parse ไม่ได้ → แสดง error boundary ไม่ใช่จอขาว", async ({
  23  |     page,
  24  |   }) => {
  25  |     // เขียนข้อมูลเสียลง localStorage โดยตรง
  26  |     await page.evaluate(() => {
  27  |       localStorage.setItem("pm-tool.requirements", "{ ไม่ใช่ array }");
  28  |     });
  29  |     await page.reload();
  30  | 
  31  |     // ต้องเห็น error boundary ไม่ใช่จอขาว
  32  |     await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
  33  |     await expect(page.locator("text=เปิดหน้าจอนี้ไม่ได้")).toBeVisible();
  34  |   });
  35  | 
  36  |   test("localStorage มีข้อมูลที่เป็น object ไม่ใช่ array → แสดง error boundary", async ({
  37  |     page,
  38  |   }) => {
  39  |     await page.evaluate(() => {
  40  |       localStorage.setItem("pm-tool.tasks", JSON.stringify({ ไม่ใช่: "array" }));
  41  |     });
  42  |     await page.reload();
  43  |     await page.click("text=Tasks");
  44  | 
  45  |     await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
  46  |   });
  47  | });
  48  | 
  49  | test.describe("FR2.2 — ไม่มี Requirement เลย กดสร้าง Task", () => {
  50  |   test("ยังไม่มี Requirement → กด New Task ต้องเห็น alert ไม่ใช่ฟอร์ม", async ({
  51  |     page,
  52  |   }) => {
  53  |     await page.click("text=Tasks");
  54  |     await page.click('[data-testid="toolbar-new"]');
  55  | 
  56  |     // ต้องเห็น alert บอกว่าสร้างไม่ได้
  57  |     await expect(page.locator('role=alert >> text=ยังสร้าง Task ไม่ได้')).toBeVisible();
  58  |     // ต้องไม่มีปุ่ม submit
  59  |     await expect(page.locator('[data-testid="task-submit"]')).not.toBeVisible();
  60  |   });
  61  | });
  62  | 
  63  | test.describe("FR3.4 — ไม่มี Task เลย กดสร้าง Defect", () => {
  64  |   test("ยังไม่มี Task → กด New Defect ต้องเห็น alert ไม่ใช่ฟอร์ม", async ({
  65  |     page,
  66  |   }) => {
  67  |     await page.click("text=Defects");
  68  |     await page.click('[data-testid="toolbar-new"]');
  69  | 
  70  |     await expect(page.locator('role=alert >> text=ยังสร้าง Defect ไม่ได้')).toBeVisible();
  71  |     await expect(page.locator('[data-testid="defect-submit"]')).not.toBeVisible();
  72  |   });
  73  | });
  74  | 
  75  | test.describe("FR6.2 — Import ไฟล์ผิดรุ่น", () => {
  76  |   test("import ไฟล์ version 99 → บอกว่าเป็นรุ่นที่อ่านไม่ได้", async ({ page }) => {
  77  |     await page.click("text=Requirements");
  78  | 
  79  |     const badBundle = JSON.stringify({
  80  |       version: 99,
  81  |       requirements: [],
  82  |       tasks: [],
  83  |       defects: [],
  84  |     });
  85  | 
  86  |     // Inject file via file input
  87  |     const fileChooserPromise = page.waitForEvent("filechooser");
  88  |     await page.click('[data-testid="toolbar-import"]');
  89  |     const fileChooser = await fileChooserPromise;
  90  | 
  91  |     // Create a temp file with bad version
  92  |     await fileChooser.setFiles({
  93  |       name: "bad-version.json",
  94  |       mimeType: "application/json",
  95  |       buffer: Buffer.from(badBundle),
  96  |     });
  97  | 
  98  |     // ต้องเห็น error ที่ระบุรุ่น
  99  |     await expect(page.locator("role=alert")).toBeVisible();
  100 |     await expect(page.locator("text=/รุ่น 99|version 99/i")).toBeVisible();
  101 |   });
  102 | });
  103 | 
  104 | test.describe("FR5.2 — เปลี่ยนผู้ใช้แล้วรายการใหม่เป็นของคนนั้น", () => {
  105 |   test("เลือกผู้ใช้คนใหม่ → สร้าง Requirement → ผู้รับผิดชอบต้องเป็นคนที่เลือก", async ({
  106 |     page,
  107 |   }) => {
  108 |     // เลือกผู้ใช้คนที่ 4 (index 3)
  109 |     const userPicker = page.locator('[data-testid="user-picker"]');
  110 |     await userPicker.selectOption({ index: 3 });
  111 |     const selectedName = await userPicker
  112 |       .locator("option:checked")
  113 |       .textContent();
  114 | 
  115 |     // สร้าง Requirement
  116 |     await page.click("text=Requirements");
  117 |     await page.click('[data-testid="toolbar-new"]');
  118 |     await page.fill('[data-testid="req-title"]', "ทดสอบผู้รับผิดชอบ");
  119 |     await page.selectOption('[data-testid="req-category"]', "Functional");
> 120 |     await page.click('[data-testid="form-submit"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  121 | 
  122 |     // เปิดรายละเอียด ดู owner
  123 |     await page.click("text=ทดสอบผู้รับผิดชอบ");
  124 |     await expect(page.locator(`text=${selectedName}`)).toBeVisible();
  125 |   });
  126 | });
  127 | 
  128 | test.describe("Navigation — เมนูซ้าย", () => {
  129 |   test("เมนูซ้ายพาไปทั้ง 3 หน้าได้", async ({ page }) => {
  130 |     // Requirements (หน้าแรก)
  131 |     await expect(page.locator('role=heading[name="Requirements"]')).toBeVisible();
  132 | 
  133 |     // Tasks
  134 |     await page.click("text=Tasks");
  135 |     await expect(page.locator('role=heading[name="Tasks"]')).toBeVisible();
  136 | 
  137 |     // Defects
  138 |     await page.click("text=Defects");
  139 |     await expect(page.locator('role=heading[name="Defects"]')).toBeVisible();
  140 | 
  141 |     // กลับ Requirements
  142 |     await page.click("text=Requirements");
  143 |     await expect(page.locator('role=heading[name="Requirements"]')).toBeVisible();
  144 |   });
  145 | 
  146 |   test("ตัวเลขนับในเมนูต้องตรงกับจำนวนจริง", async ({ page }) => {
  147 |     await page.click("text=Requirements");
  148 |     await page.click('[data-testid="toolbar-new"]');
  149 |     await page.fill('[data-testid="req-title"]', "Req 1");
  150 |     await page.selectOption('[data-testid="req-category"]', "Functional");
  151 |     await page.click('[data-testid="form-submit"]');
  152 | 
  153 |     await page.click('[data-testid="toolbar-new"]');
  154 |     await page.fill('[data-testid="req-title"]', "Req 2");
  155 |     await page.selectOption('[data-testid="req-category"]', "Functional");
  156 |     await page.click('[data-testid="form-submit"]');
  157 | 
  158 |     // ตัวเลขในเมนูต้องเป็น 2
  159 |     await expect(page.locator('[data-testid="nav-requirements-count"]')).toHaveText("2");
  160 |   });
  161 | });
  162 | 
```