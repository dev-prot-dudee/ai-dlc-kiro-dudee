import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Test — FR1: Requirement Management
 *
 * ทดสอบ flow จริงบนเบราว์เซอร์: สร้าง → แก้ → กรอง → ลบ Requirement
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // ล้าง localStorage ก่อนทุก test
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe("FR1.1 — สร้าง Requirement ใหม่", () => {
  test("กรอกข้อมูลครบแล้วกดบันทึก → ปรากฏบน board", async ({ page }) => {
    // ไปหน้า Requirements
    await page.click("text=Requirements");

    // กดสร้างใหม่
    await page.click('[data-testid="toolbar-new"]');

    // กรอกฟอร์ม
    await page.fill('[data-testid="req-title"]', "ผู้ใช้ต้องเข้าสู่ระบบได้");
    await page.fill('[data-testid="req-description"]', "รองรับ email และ password");
    await page.selectOption('[data-testid="req-category"]', "Functional");
    await page.selectOption('[data-testid="req-priority"]', "Must");

    // บันทึก
    await page.click('[data-testid="form-submit"]');

    // ต้องเห็นบน board
    await expect(page.locator("text=ผู้ใช้ต้องเข้าสู่ระบบได้")).toBeVisible();
  });

  test("ค่าเริ่มต้น priority ต้องเป็น Should", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');

    const prioritySelect = page.locator('[data-testid="req-priority"]');
    await expect(prioritySelect).toHaveValue("Should");
  });
});

test.describe("FR1.2 — บังคับระบุประเภท", () => {
  test("ไม่เลือกประเภท → แสดง error ไม่บันทึก", async ({ page }) => {
    await page.click("text=Requirements");
    await page.click('[data-testid="toolbar-new"]');

    await page.fill('[data-testid="req-title"]', "ทดสอบไม่เลือกประเภท");
    // ไม่เลือก category — ปล่อยว่าง
    await page.selectOption('[data-testid="req-category"]', "");

    await page.click('[data-testid="form-submit"]');

    // ต้องเห็น error message
    await expect(page.locator('[data-testid="field-error"]').first()).toBeVisible();
    // ต้องไม่ปรากฏบน board
    await expect(page.locator("text=ทดสอบไม่เลือกประเภท")).not.toBeVisible();
  });
});

test.describe("FR1.4 — กรองและค้นหา", () => {
  test("ค้นหาด้วยคำ → เห็นเฉพาะรายการที่ตรง", async ({ page }) => {
    await page.click("text=Requirements");

    // สร้าง 2 รายการ
    await createRequirement(page, "Login Feature", "Functional", "Must");
    await createRequirement(page, "Performance NFR", "Non-Functional", "Should");

    // ค้นหา "Login"
    await page.fill('[data-testid="toolbar-search"]', "Login");

    await expect(page.locator("text=Login Feature")).toBeVisible();
    await expect(page.locator("text=Performance NFR")).not.toBeVisible();
  });

  test("เปลี่ยนเป็น List view แล้วกรองตามประเภท", async ({ page }) => {
    await page.click("text=Requirements");

    await createRequirement(page, "FR ข้อหนึ่ง", "Functional", "Must");
    await createRequirement(page, "NFR ข้อหนึ่ง", "Non-Functional", "Could");

    // สลับเป็น List view
    await page.click('role=tab[name=/list/i]');

    // กรองเฉพาะ Functional
    await page.selectOption('[data-testid="filter-category"]', "Functional");

    await expect(page.locator("text=FR ข้อหนึ่ง")).toBeVisible();
    await expect(page.locator("text=NFR ข้อหนึ่ง")).not.toBeVisible();
  });
});

test.describe("FR1.5 — แก้ไข Requirement", () => {
  test("แก้หัวข้อแล้วกลับมาดู ต้องเห็นค่าใหม่", async ({ page }) => {
    await page.click("text=Requirements");
    await createRequirement(page, "ก่อนแก้", "Functional", "Should");

    // เปิดรายละเอียด
    await page.click("text=ก่อนแก้");

    // กดแก้ไข
    await page.click('[data-testid="detail-edit"]');

    // แก้หัวข้อ
    await page.fill('[data-testid="req-title"]', "หลังแก้แล้ว");
    await page.click('[data-testid="form-submit"]');

    // ต้องเห็นค่าใหม่
    await expect(page.locator("text=หลังแก้แล้ว")).toBeVisible();
    await expect(page.locator("text=ก่อนแก้")).not.toBeVisible();
  });
});

test.describe("FR1.6 — ลบ Requirement", () => {
  test("กดลบ → ยืนยัน → หายจากรายการ", async ({ page }) => {
    await page.click("text=Requirements");
    await createRequirement(page, "จะลบทิ้ง", "Functional", "Won't");

    // เปิดรายละเอียด
    await page.click("text=จะลบทิ้ง");
    await page.click('[data-testid="detail-delete"]');

    // ยืนยันในกล่อง dialog
    await page.click('[data-testid="confirm-ok"]');

    // หายจาก board
    await expect(page.locator("text=จะลบทิ้ง")).not.toBeVisible();
  });

  test("กดลบ → ยกเลิก → ยังอยู่", async ({ page }) => {
    await page.click("text=Requirements");
    await createRequirement(page, "ไม่ลบนะ", "Functional", "Must");

    await page.click("text=ไม่ลบนะ");
    await page.click('[data-testid="detail-delete"]');
    await page.click('[data-testid="confirm-cancel"]');

    // กลับไปหน้ารายการ ยังอยู่
    await page.click("text=← กลับ");
    await expect(page.locator("text=ไม่ลบนะ")).toBeVisible();
  });
});

// Helper function
async function createRequirement(
  page: Page,
  title: string,
  category: string,
  priority: string,
) {
  await page.click('[data-testid="toolbar-new"]');
  await page.fill('[data-testid="req-title"]', title);
  await page.selectOption('[data-testid="req-category"]', category);
  await page.selectOption('[data-testid="req-priority"]', priority);
  await page.click('[data-testid="form-submit"]');
  await expect(page.locator(`text=${title}`)).toBeVisible();
}
