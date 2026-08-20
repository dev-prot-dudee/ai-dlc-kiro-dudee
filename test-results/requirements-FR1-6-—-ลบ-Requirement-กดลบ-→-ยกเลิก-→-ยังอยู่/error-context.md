# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: requirements.spec.ts >> FR1.6 — ลบ Requirement >> กดลบ → ยกเลิก → ยังอยู่
- Location: e2e/requirements.spec.ts:133:3

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
          - textbox "หัวข้อ (จำเป็น)" [active] [ref=f1e41]: ไม่ลบนะ
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
  132 | 
  133 |   test("กดลบ → ยกเลิก → ยังอยู่", async ({ page }) => {
  134 |     await page.click("text=Requirements");
  135 |     await createRequirement(page, "ไม่ลบนะ", "Functional", "Must");
  136 | 
  137 |     await page.click("text=ไม่ลบนะ");
  138 |     await page.click('[data-testid="detail-delete"]');
  139 |     await page.click('[data-testid="confirm-cancel"]');
  140 | 
  141 |     // กลับไปหน้ารายการ ยังอยู่
  142 |     await page.click("text=← กลับ");
  143 |     await expect(page.locator("text=ไม่ลบนะ")).toBeVisible();
  144 |   });
  145 | });
  146 | 
  147 | // Helper function
  148 | async function createRequirement(
  149 |   page: Page,
  150 |   title: string,
  151 |   category: string,
  152 |   priority: string,
  153 | ) {
  154 |   await page.click('[data-testid="toolbar-new"]');
  155 |   await page.fill('[data-testid="req-title"]', title);
  156 |   await page.selectOption('[data-testid="req-category"]', category);
  157 |   await page.selectOption('[data-testid="req-priority"]', priority);
> 158 |   await page.click('[data-testid="form-submit"]');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  159 |   await expect(page.locator(`text=${title}`)).toBeVisible();
  160 | }
  161 | 
```