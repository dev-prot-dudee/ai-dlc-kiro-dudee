import { test, expect } from "@playwright/test";

/**
 * E2E Test — กรณีที่ test เดิมของเรายังไม่ครอบ
 * (เปรียบเทียบจาก src/e2e/ ที่ pull มาจาก main)
 *
 * - FR6.3: ข้อมูลเสียหาย → error boundary ไม่ใช่จอขาว
 * - FR2.2: ไม่มี Requirement → กดสร้าง Task ได้ alert
 * - FR3.4: ไม่มี Task → กดสร้าง Defect ได้ alert
 * - FR6.2: Import ไฟล์ผิดรุ่น → บอกรุ่น
 * - FR5.2: เปลี่ยนผู้ใช้ → รายการใหม่เป็นของคนนั้น
 * - Navigation: เมนูซ้ายพาไปทั้ง 3 หน้า + ตัวเลขนับ
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe("FR6.3 — ข้อมูลเสียหาย (Error Boundary)", () => {
  test("localStorage มีข้อมูลที่ parse ไม่ได้ → แสดง error boundary ไม่ใช่จอขาว", async ({
    page,
  }) => {
    // เขียนข้อมูลเสียลง localStorage โดยตรง
    await page.evaluate(() => {
      localStorage.setItem("pm-tool.requirements", "{ ไม่ใช่ array }");
    });
    await page.reload();

    // ต้องเห็น error boundary ไม่ใช่จอขาว
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    await expect(page.locator("text=เปิดหน้าจอนี้ไม่ได้")).toBeVisible();
  });

  test("localStorage มีข้อมูลที่เป็น object ไม่ใช่ array → แสดง error boundary", async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem("pm-tool.tasks", JSON.stringify({ ไม่ใช่: "array" }));
    });
    await page.reload();
    await page.click("text=Tasks");

    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
  });
});

test.describe("FR2.2 — ไม่มี Requirement เลย กดสร้าง Task", () => {
  test("ยังไม่มี Requirement → กด New Task ต้องเห็น alert ไม่ใช่ฟอร์ม", async ({
    page,
  }) => {
    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');

    // ต้องเห็น alert บอกว่าสร้างไม่ได้
    await expect(page.locator('role=alert >> text=ยังสร้าง Task ไม่ได้')).toBeVisible();
    // ต้องไม่มีปุ่ม submit
    await expect(page.locator('[data-testid="task-submit"]')).not.toBeVisible();
  });
});

test.describe("FR3.4 — ไม่มี Task เลย กดสร้าง Defect", () => {
  test("ยังไม่มี Task → กด New Defect ต้องเห็น alert ไม่ใช่ฟอร์ม", async ({
    page,
  }) => {
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await expect(page.locator('role=alert >> text=ยังสร้าง Defect ไม่ได้')).toBeVisible();
    await expect(page.locator('[data-testid="defect-submit"]')).not.toBeVisible();
  });
});

test.describe("FR6.2 — Import ไฟล์ผิดรุ่น", () => {
  test("import ไฟล์ version 99 → บอกว่าเป็นรุ่นที่อ่านไม่ได้", async ({ page }) => {
    await page.click("text=Requirements");

    const badBundle = JSON.stringify({
      version: 99,
      requirements: [],
      tasks: [],
      defects: [],
    });

    // Inject file via file input
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('[data-testid="toolbar-import"]');
    const fileChooser = await fileChooserPromise;

    // Create a temp file with bad version
    await fileChooser.setFiles({
      name: "bad-version.json",
      mimeType: "application/json",
      buffer: Buffer.from(badBundle),
    });

    // ต้องเห็น error ที่ระบุรุ่น
    await expect(page.locator("role=alert")).toBeVisible();
    await expect(page.locator("text=/รุ่น 99|version 99/i")).toBeVisible();
  });
});

test.describe("FR5.2 — เปลี่ยนผู้ใช้แล้วรายการใหม่เป็นของคนนั้น", () => {
  test("เลือกผู้ใช้คนใหม่ → สร้าง Requirement → ผู้รับผิดชอบต้องเป็นคนที่เลือก", async ({
    page,
  }) => {
    // เลือกผู้ใช้คนที่ 4 (index 3)
    const userPicker = page.locator('[data-testid="user-picker"]');
    await userPicker.selectOption({ index: 3 });
    const selectedName = await userPicker
      .locator("option:checked")
      .textContent();

    // สร้าง Requirement
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "ทดสอบผู้รับผิดชอบ");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    // เปิดรายละเอียด ดู owner
    await page.click("text=ทดสอบผู้รับผิดชอบ");
    await expect(page.locator(`text=${selectedName}`)).toBeVisible();
  });
});

test.describe("Navigation — เมนูซ้าย", () => {
  test("เมนูซ้ายพาไปทั้ง 3 หน้าได้", async ({ page }) => {
    // Requirements (หน้าแรก)
    await expect(page.locator('role=heading[name="Requirements"]')).toBeVisible();

    // Tasks
    await page.click("text=Tasks");
    await expect(page.locator('role=heading[name="Tasks"]')).toBeVisible();

    // Defects
    await page.click("text=Defects");
    await expect(page.locator('role=heading[name="Defects"]')).toBeVisible();

    // กลับ Requirements
    await page.click("text=Requirements");
    await expect(page.locator('role=heading[name="Requirements"]')).toBeVisible();
  });

  test("ตัวเลขนับในเมนูต้องตรงกับจำนวนจริง", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req 1");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    await page.click('[data-testid="toolbar-new"]');
    await page.fill('[data-testid="req-title"]', "Req 2");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.click('[data-testid="form-submit"]');

    // ตัวเลขในเมนูต้องเป็น 2
    await expect(page.locator('[data-testid="nav-requirements-count"]')).toHaveText("2");
  });
});
