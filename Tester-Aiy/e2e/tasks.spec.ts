import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Test — FR2: Task Management
 *
 * ทดสอบ flow จริง: สร้าง Task (ต้องมี Requirement ก่อน) → กรอง → แก้ → ลบ
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function createRequirement(page: Page, title: string) {
  await page.click("text=Requirements");
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="req-title"]', title);
  await page.selectOption('[data-testid="req-category"]', "Functional");
  await page.selectOption('[data-testid="req-priority"]', "Must");
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator(`text=${title}`)).toBeVisible();
}

async function createTask(
  page: Page,
  title: string,
  role: string,
) {
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="task-title"]', title);
  await page.selectOption('[data-testid="task-role"]', role);
  // เลือก Requirement แรกที่มี
  const reqSelect = page.locator('[data-testid="task-requirement"]');
  const options = reqSelect.locator("option");
  const count = await options.count();
  if (count > 1) {
    // เลือก option ที่ 2 (ข้ามตัว "เลือก...")
    const value = await options.nth(1).getAttribute("value");
    if (value) await reqSelect.selectOption(value);
  }
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator(`text=${title}`)).toBeVisible();
}

test.describe("FR2.1 — สร้าง Task ใหม่", () => {
  test("สร้าง Task พร้อมเลือก Requirement → ปรากฏบน board", async ({ page }) => {
    // ต้องมี Requirement ก่อน
    await createRequirement(page, "Req สำหรับ Task");

    // ไปหน้า Tasks
    await page.click("text=Tasks");
    await createTask(page, "เขียน unit test", "Tester");

    await expect(page.locator("text=เขียน unit test")).toBeVisible();
  });
});

test.describe("FR2.2 — บังคับผูกกับ Requirement", () => {
  test("ไม่เลือก Requirement → ปฏิเสธ", async ({ page }) => {
    await createRequirement(page, "มี Req แล้ว");
    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="task-title"]', "Task ลอย");
    await page.selectOption('[data-testid="task-role"]', "Dev");
    // ไม่เลือก Requirement

    await page.click('[data-testid="form-submit"]');

    // ต้องเห็น error
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
  });
});

test.describe("FR2.3 — บังคับระบุตำแหน่ง", () => {
  test("ไม่เลือกตำแหน่ง → ปฏิเสธ", async ({ page }) => {
    await createRequirement(page, "Req ต้นทาง");
    await page.click("text=Tasks");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="task-title"]', "Task ไม่มีตำแหน่ง");
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
});

test.describe("FR2.4 — กรองตามตำแหน่ง", () => {
  test("กรอง Dev → เห็นเฉพาะ Task ของ Dev", async ({ page }) => {
    await createRequirement(page, "Req A");
    await page.click("text=Tasks");

    await createTask(page, "งาน Dev", "Dev");
    await createTask(page, "งาน Tester", "Tester");

    // สลับเป็น List แล้วกรอง
    await page.click('role=tab[name=/list/i]');
    await page.selectOption('[data-testid="filter-role"]', "Dev");

    await expect(page.locator("text=งาน Dev")).toBeVisible();
    await expect(page.locator("text=งาน Tester")).not.toBeVisible();
  });
});

test.describe("FR2.5 — แก้ไขและลบ Task", () => {
  test("แก้หัวข้อ → เห็นค่าใหม่", async ({ page }) => {
    await createRequirement(page, "Req");
    await page.click("text=Tasks");
    await createTask(page, "ก่อนแก้ Task", "Dev");

    await page.click("text=ก่อนแก้ Task");
    await page.click('[data-testid="detail-edit"]');
    await page.fill('[data-testid="task-title"]', "หลังแก้ Task");
    await page.click('[data-testid="form-submit"]');

    await expect(page.locator("text=หลังแก้ Task")).toBeVisible();
  });

  test("ลบ Task → หายจากรายการ", async ({ page }) => {
    await createRequirement(page, "Req");
    await page.click("text=Tasks");
    await createTask(page, "จะลบ Task", "SA");

    await page.click("text=จะลบ Task");
    await page.click('[data-testid="detail-delete"]');
    await page.click('[data-testid="confirm-ok"]');

    await expect(page.locator("text=จะลบ Task")).not.toBeVisible();
  });
});
