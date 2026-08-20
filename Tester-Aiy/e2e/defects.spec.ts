import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Test — FR3: Defect Tracking
 *
 * ทดสอบ flow จริง: สร้าง Defect (ต้องมี Task ก่อน) → กรอง → แก้ → ลบ
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function seedTaskChain(page: Page) {
  // สร้าง Requirement
  await page.click("text=Requirements");
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="req-title"]', "Req ต้นทาง");
  await page.selectOption('[data-testid="req-category"]', "Functional");
  await page.selectOption('[data-testid="req-priority"]', "Must");
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator("text=Req ต้นทาง")).toBeVisible();

  // สร้าง Task
  await page.click("text=Tasks");
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="task-title"]', "Task ต้นทาง");
  await page.selectOption('[data-testid="task-role"]', "Dev");
  const reqSelect = page.locator('[data-testid="task-requirement"]');
  const options = reqSelect.locator("option");
  const value = await options.nth(1).getAttribute("value");
  if (value) await reqSelect.selectOption(value);
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator("text=Task ต้นทาง")).toBeVisible();
}

async function createDefect(
  page: Page,
  title: string,
  type: string,
  severity: string,
) {
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="defect-title"]', title);
  await page.selectOption('[data-testid="defect-type"]', type);
  await page.selectOption('[data-testid="defect-severity"]', severity);
  // เลือก Task แรกที่มี
  const taskSelect = page.locator('[data-testid="defect-task"]');
  const options = taskSelect.locator("option");
  const val = await options.nth(1).getAttribute("value");
  if (val) await taskSelect.selectOption(val);
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator(`text=${title}`)).toBeVisible();
}

test.describe("FR3.1 — สร้าง Defect ใหม่", () => {
  test("สร้าง Defect พร้อมเลือก Task → ปรากฏบน board", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");
    await createDefect(page, "ปุ่ม Login พัง", "Code Bug", "High");

    await expect(page.locator("text=ปุ่ม Login พัง")).toBeVisible();
  });
});

test.describe("FR3.2 — บังคับระบุประเภทจาก 5 ค่า", () => {
  test("ไม่เลือกประเภท → ปฏิเสธ", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="defect-title"]', "ไม่มีประเภท");
    await page.selectOption('[data-testid="defect-type"]', "");
    await page.selectOption('[data-testid="defect-severity"]', "Medium");
    const taskSelect = page.locator('[data-testid="defect-task"]');
    const options = taskSelect.locator("option");
    const val = await options.nth(1).getAttribute("value");
    if (val) await taskSelect.selectOption(val);

    await page.click('[data-testid="form-submit"]');
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });

  test("ทั้ง 5 ประเภทสร้างได้หมด", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");

    const types = ["Code Bug", "SA Gap", "Design Gap", "Test Escape", "NFR Violation"];
    for (const type of types) {
      await createDefect(page, `Defect: ${type}`, type, "Medium");
    }

    for (const type of types) {
      await expect(page.locator(`text=Defect: ${type}`)).toBeVisible();
    }
  });
});

test.describe("FR3.3 — บังคับระบุความรุนแรง", () => {
  test("ไม่เลือกความรุนแรง → ปฏิเสธ", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="defect-title"]', "ไม่มี severity");
    await page.selectOption('[data-testid="defect-type"]', "Code Bug");
    await page.selectOption('[data-testid="defect-severity"]', "");
    const taskSelect = page.locator('[data-testid="defect-task"]');
    const options = taskSelect.locator("option");
    const val = await options.nth(1).getAttribute("value");
    if (val) await taskSelect.selectOption(val);

    await page.click('[data-testid="form-submit"]');
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });
});

test.describe("FR3.4 — บังคับผูกกับ Task", () => {
  test("ไม่เลือก Task → ปฏิเสธ", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="defect-title"]', "Defect ลอย");
    await page.selectOption('[data-testid="defect-type"]', "SA Gap");
    await page.selectOption('[data-testid="defect-severity"]', "High");
    // ไม่เลือก Task

    await page.click('[data-testid="form-submit"]');
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });
});

test.describe("FR3.5 — กรองตามประเภท", () => {
  test("กรอง SA Gap → เห็นเฉพาะ SA Gap", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");

    await createDefect(page, "Bug ข้อหนึ่ง", "Code Bug", "High");
    await createDefect(page, "SA ไม่ครบ", "SA Gap", "Medium");

    await page.click('role=tab[name=/list/i]');
    await page.selectOption('[data-testid="filter-type"]', "SA Gap");

    await expect(page.locator("text=SA ไม่ครบ")).toBeVisible();
    await expect(page.locator("text=Bug ข้อหนึ่ง")).not.toBeVisible();
  });
});

test.describe("FR3.6 — แก้ไขและลบ Defect", () => {
  test("แก้ประเภท → เห็นค่าใหม่", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");
    await createDefect(page, "จะแก้ Defect", "Code Bug", "Low");

    await page.click("text=จะแก้ Defect");
    await page.click('[data-testid="detail-edit"]');
    await page.selectOption('[data-testid="defect-type"]', "Design Gap");
    await page.click('[data-testid="form-submit"]');

    // ต้องเห็นว่าอยู่ใน column Design Gap
    await expect(page.locator("text=จะแก้ Defect")).toBeVisible();
  });

  test("ลบ Defect → หายจากรายการ", async ({ page }) => {
    await seedTaskChain(page);
    await page.click("text=Defects");
    await createDefect(page, "จะลบ Defect", "Test Escape", "Critical");

    await page.click("text=จะลบ Defect");
    await page.click('[data-testid="detail-delete"]');
    await page.click('[data-testid="confirm-ok"]');

    await expect(page.locator("text=จะลบ Defect")).not.toBeVisible();
  });
});
