import { test, expect } from "@playwright/test";

/**
 * E2E Fail Cases — ทดสอบกรณีที่ผู้ใช้ทำผิดบนหน้าจอจริง
 *
 * ทุกข้อทดสอบว่าระบบ "ล้มอย่างถูกต้อง":
 * - แสดง error ที่อ่านเข้าใจ
 * - ไม่สร้างข้อมูลผิดๆ เข้าระบบ
 * - ข้อมูลเดิมไม่เสียหาย
 * - ผู้ใช้มีทางออก (ไม่ติดอยู่ในหน้าจอ error)
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe("FAIL: Requirement — กรอกข้อมูลไม่ครบ", () => {
  test("ไม่กรอกหัวข้อ → ต้องเห็น error ที่ช่องหัวข้อ", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');

    // ไม่กรอก title — กรอกแค่ category
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    // ต้องเห็น error + ยังอยู่ในฟอร์ม
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="form-submit"]')).toBeVisible();
  });

  test("ไม่เลือก category → ต้องเห็น error", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="req-title"]', "มีหัวข้อแล้ว");
    await page.selectOption('[data-testid="req-category"]', "");
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });

  test("กรอกผิดแล้วกดยกเลิก → กลับหน้ารายการโดยไม่สร้างอะไร", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="req-title"]', "จะไม่สร้าง");
    await page.click('[data-testid="form-cancel"]');

    // ต้องไม่มีการ์ดถูกสร้าง
    await expect(page.locator("text=จะไม่สร้าง")).not.toBeVisible();
  });
});

test.describe("FAIL: Task — กรอกข้อมูลไม่ครบ", () => {
  test("ไม่เลือก Requirement → ต้องเห็น error ที่ช่อง Requirement", async ({
    page,
  }) => {
    // ต้องมี Requirement ก่อน
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req สำหรับ test");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    // ไปสร้าง Task โดยไม่เลือก Requirement
    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="task-title"]', "Task ลอย");
    await page.selectOption('[data-testid="task-role"]', "Dev");
    // ไม่เลือก Requirement
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });

  test("ไม่เลือกตำแหน่ง → ต้องเห็น error ที่ช่อง role", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="task-title"]', "Task ไม่มี role");
    // เลือก Requirement
    const reqSelect = page.locator('[data-testid="task-requirement"]');
    const options = reqSelect.locator("option");
    const value = await options.nth(1).getAttribute("value");
    if (value) await reqSelect.selectOption(value);
    // ไม่เลือก role
    await page.selectOption('[data-testid="task-role"]', "");
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });

  test("ไม่กรอก title → ต้องเห็น error", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');
    // ไม่กรอก title
    const reqSelect = page.locator('[data-testid="task-requirement"]');
    const options = reqSelect.locator("option");
    const val = await options.nth(1).getAttribute("value");
    if (val) await reqSelect.selectOption(val);
    await page.selectOption('[data-testid="task-role"]', "Dev");
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });
});

test.describe("FAIL: Defect — กรอกข้อมูลไม่ครบ", () => {
  async function seedTask(page: import("@playwright/test").Page) {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="task-title"]', "Task");
    await page.selectOption('[data-testid="task-role"]', "Dev");
    const reqSelect = page.locator('[data-testid="task-requirement"]');
    const opts = reqSelect.locator("option");
    const v = await opts.nth(1).getAttribute("value");
    if (v) await reqSelect.selectOption(v);
    await page.click('[data-testid="form-submit"]');
  }

  test("ไม่เลือกประเภท Defect → ต้องเห็น error", async ({ page }) => {
    await seedTask(page);
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="defect-title"]', "มีหัวข้อ");
    await page.selectOption('[data-testid="defect-severity"]', "High");
    const taskSelect = page.locator('[data-testid="defect-task"]');
    const opts = taskSelect.locator("option");
    const v = await opts.nth(1).getAttribute("value");
    if (v) await taskSelect.selectOption(v);
    // ไม่เลือก type
    await page.selectOption('[data-testid="defect-type"]', "");
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });

  test("ไม่เลือก severity → ต้องเห็น error", async ({ page }) => {
    await seedTask(page);
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="defect-title"]', "มีหัวข้อ");
    await page.selectOption('[data-testid="defect-type"]', "Code Bug");
    const taskSelect = page.locator('[data-testid="defect-task"]');
    const opts = taskSelect.locator("option");
    const v = await opts.nth(1).getAttribute("value");
    if (v) await taskSelect.selectOption(v);
    // ไม่เลือก severity
    await page.selectOption('[data-testid="defect-severity"]', "");
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });

  test("ไม่เลือก Task → ต้องเห็น error", async ({ page }) => {
    await seedTask(page);
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="defect-title"]', "มีหัวข้อ");
    await page.selectOption('[data-testid="defect-type"]', "SA Gap");
    await page.selectOption('[data-testid="defect-severity"]', "Medium");
    // ไม่เลือก Task
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });
});

test.describe("FAIL: Import ไฟล์ผิดรูปแบบ", () => {
  test("import ข้อความที่ไม่ใช่ JSON → ต้องแจ้ง error", async ({ page }) => {
    await page.click("text=Requirements");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('[data-testid="toolbar-import"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("ไม่ใช่ JSON เลย"),
    });

    await expect(page.locator("role=alert")).toBeVisible();
  });

  test("import array เปล่า (ไม่ใช่ bundle) → ต้องแจ้ง error + ข้อมูลเดิมไม่หาย", async ({
    page,
  }) => {
    await page.click("text=Requirements");

    // สร้างข้อมูลเดิมก่อน
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "ข้อมูลเดิม");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');
    await expect(page.locator("text=ข้อมูลเดิม")).toBeVisible();

    // import ไฟล์ผิด
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('[data-testid="toolbar-import"]');
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("[]"),
    });

    // ต้องเห็น error + ข้อมูลเดิมยังอยู่
    await expect(page.locator("role=alert")).toBeVisible();
    await expect(page.locator("text=ข้อมูลเดิม")).toBeVisible();
  });
});
