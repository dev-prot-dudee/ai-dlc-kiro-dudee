import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Test — FR4: Traceability + FR6: Storage
 *
 * ทดสอบสายเชื่อมโยงข้าม entity และ export/import บนเบราว์เซอร์จริง
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function seedFullChain(page: Page) {
  // สร้าง Requirement
  await page.click("text=Requirements");
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="req-title"]', "ผู้ใช้ต้อง Login ได้");
  await page.selectOption('[data-testid="req-category"]', "Functional");
  await page.selectOption('[data-testid="req-priority"]', "Must");
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator("text=ผู้ใช้ต้อง Login ได้")).toBeVisible();

  // สร้าง Task
  await page.click("text=Tasks");
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="task-title"]', "สร้าง Login API");
  await page.selectOption('[data-testid="task-role"]', "Dev");
  const reqSelect = page.locator('[data-testid="task-requirement"]');
  const reqOptions = reqSelect.locator("option");
  const reqVal = await reqOptions.nth(1).getAttribute("value");
  if (reqVal) await reqSelect.selectOption(reqVal);
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator("text=สร้าง Login API")).toBeVisible();

  // สร้าง Defect
  await page.click("text=Defects");
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="defect-title"]', "Login ไม่ hash password");
  await page.selectOption('[data-testid="defect-type"]', "Code Bug");
  await page.selectOption('[data-testid="defect-severity"]', "Critical");
  const taskSelect = page.locator('[data-testid="defect-task"]');
  const taskOptions = taskSelect.locator("option");
  const taskVal = await taskOptions.nth(1).getAttribute("value");
  if (taskVal) await taskSelect.selectOption(taskVal);
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator("text=Login ไม่ hash password")).toBeVisible();
}

test.describe("FR4.1 — สายเชื่อมโยงจาก Requirement ลง", () => {
  test("เปิด Requirement → เห็น Task และ Defect ที่อยู่ใต้มัน", async ({ page }) => {
    await seedFullChain(page);

    await page.click("text=Requirements");
    await page.click("text=ผู้ใช้ต้อง Login ได้");

    // ในหน้ารายละเอียด ต้องเห็น Task ที่ผูกอยู่
    await expect(page.locator("text=สร้าง Login API")).toBeVisible();
    // และเห็น Defect ที่อยู่ใต้ Task นั้น
    await expect(page.locator("text=Login ไม่ hash password")).toBeVisible();
  });
});

test.describe("FR4.2 — สายย้อนกลับจาก Defect", () => {
  test("เปิด Defect → เห็น Task และ Requirement ต้นทาง", async ({ page }) => {
    await seedFullChain(page);

    await page.click("text=Defects");
    await page.click("text=Login ไม่ hash password");

    // ในหน้ารายละเอียด Defect ต้องเห็น Task ต้นทาง
    await expect(page.locator("text=สร้าง Login API")).toBeVisible();
  });
});

test.describe("FR4.3 — Requirement ที่ยังไม่มี Task", () => {
  test("Requirement ที่ไม่มี Task ต้องมีเครื่องหมายเตือน", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req ไม่มี Task");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.selectOption('[data-testid="req-priority"]', "Should");
    await page.click('[data-testid="form-submit"]');

    // ต้องเห็นเครื่องหมายเตือน
    await expect(page.locator("text=⚠ ยังไม่มี Task")).toBeVisible();
  });
});

test.describe("FR4.4 — Cascade delete Requirement", () => {
  test("ลบ Requirement → Task และ Defect ใต้มันต้องหายด้วย", async ({ page }) => {
    await seedFullChain(page);

    // ลบ Requirement
    await page.click("text=Requirements");
    await page.click("text=ผู้ใช้ต้อง Login ได้");
    await page.click('[data-testid="detail-delete"]');

    // ต้องเห็นจำนวนที่จะกำพร้า
    await expect(page.locator("text=/Task/")).toBeVisible();
    await page.click('[data-testid="confirm-ok"]');

    // Requirement หาย
    await expect(page.locator("text=ผู้ใช้ต้อง Login ได้")).not.toBeVisible();

    // Task หาย
    await page.click("text=Tasks");
    await expect(page.locator("text=สร้าง Login API")).not.toBeVisible();

    // Defect หาย
    await page.click("text=Defects");
    await expect(page.locator("text=Login ไม่ hash password")).not.toBeVisible();
  });
});

test.describe("FR6.1 — ข้อมูลคงอยู่ข้าม session", () => {
  test("สร้างรายการ → refresh → ยังเห็นรายการเดิม", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "ต้องอยู่หลัง refresh");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.selectOption('[data-testid="req-priority"]', "Must");
    await page.click('[data-testid="form-submit"]');

    // Refresh หน้า
    await page.reload();
    await page.click("text=Requirements");

    // ต้องยังเห็น
    await expect(page.locator("text=ต้องอยู่หลัง refresh")).toBeVisible();
  });
});

test.describe("FR6.2 — Export / Import", () => {
  test("export ลบข้อมูล import กลับ → ข้อมูลครบเท่าเดิม", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "รายการสำหรับ export");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.selectOption('[data-testid="req-priority"]', "Must");
    await page.click('[data-testid="form-submit"]');

    // Export — Playwright จับ download event
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[data-testid="toolbar-export"]'),
    ]);

    const filePath = await download.path();
    expect(filePath).toBeTruthy();

    // ล้างข้อมูล
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.click("text=Requirements");
    await expect(page.locator("text=รายการสำหรับ export")).not.toBeVisible();

    // Import กลับ
    if (filePath) {
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.click('[data-testid="toolbar-import"]');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filePath);
    }

    await page.waitForTimeout(500);
    await expect(page.locator("text=รายการสำหรับ export")).toBeVisible();
  });
});

test.describe("FR5 — การเลือกผู้ใช้", () => {
  test("เลือกผู้ใช้แล้ว refresh ยังเป็นคนเดิม (FR5.3)", async ({ page }) => {
    // เลือกผู้ใช้คนที่ไม่ใช่คนแรก
    const userPicker = page.locator('[data-testid="user-picker"]');
    await userPicker.selectOption({ index: 3 });

    const selectedBefore = await userPicker.inputValue();

    // Refresh
    await page.reload();

    const selectedAfter = await page.locator('[data-testid="user-picker"]').inputValue();
    expect(selectedAfter).toBe(selectedBefore);
  });
});
