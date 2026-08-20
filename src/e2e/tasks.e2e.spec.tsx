import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  cardTitle,
  cardsInColumn,
  columnCount,
  createDefect,
  createRequirement,
  createTask,
  fillTaskForm,
  goto,
  listTitles,
  navCount,
  openCard,
  queryCardTitle,
  renderApp,
  switchToList,
  type Ui,
} from "./harness";

/** ตั้งต้นด้วย Requirement หนึ่งตัว เพราะ Task ทุกตัวต้องมีต้นทาง (FR2.2) */
async function seedRequirement(user: Ui, title: string): Promise<void> {
  await goto(user, "requirements");
  await createRequirement(user, { title, category: "Functional", priority: "Must" });
  await goto(user, "tasks");
}

describe("E2E: Tasks", () => {
  describe("ต้องมี Requirement ก่อนจึงสร้าง Task ได้ (FR2.2)", () => {
    it("ยังไม่มี Requirement เลย กด New ต้องได้คำอธิบายและทางออก ไม่ใช่ฟอร์มที่บันทึกไม่ได้", async () => {
      const { user } = renderApp("/tasks");

      await user.click(screen.getByTestId("toolbar-new"));

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("ยังสร้าง Task ไม่ได้");
      expect(alert).toHaveTextContent(/ต้องผูกกับ Requirement/);
      expect(screen.queryByTestId("task-submit")).toBeNull();

      // ปุ่มกลับต้องพาออกจากทางตัน
      await user.click(within(alert).getByRole("button", { name: "กลับ" }));
      expect(screen.getByTestId("toolbar-new")).toBeVisible();
    });

    it("เลือก Requirement แล้วบันทึก ต้องได้การ์ดที่ผูกกับ Requirement นั้นจริง", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "ผู้ใช้ต้องเข้าสู่ระบบได้");

      await createTask(user, {
        title: "สร้างหน้าเข้าสู่ระบบ",
        requirementText: "ผู้ใช้ต้องเข้าสู่ระบบได้",
        role: "Dev",
      });

      expect(cardsInColumn("Dev")).toEqual(["สร้างหน้าเข้าสู่ระบบ"]);
      expect(screen.getByText(/◎ ผู้ใช้ต้องเข้าสู่ระบบได้/)).toBeVisible();
      expect(navCount("tasks")).toBe(1);
    });

    it("ไม่เลือก Requirement ต้องถูกปฏิเสธพร้อมเหตุผล และไม่มีการ์ดถูกสร้าง", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "Requirement ที่มีอยู่");

      await user.click(screen.getByTestId("toolbar-new"));
      await fillTaskForm(user, { title: "งานลอย", role: "Dev" });

      expect(screen.getByTestId("task-requirement")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(screen.getByRole("alert")).toHaveTextContent(/ตามรอยงานไม่ได้/);
      expect(screen.getByTestId("task-submit")).toBeVisible();
    });
  });

  describe("บังคับระบุตำแหน่ง (FR2.3)", () => {
    it("ไม่เลือกตำแหน่งต้องถูกปฏิเสธที่ช่องตำแหน่ง", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "ต้นทาง");

      await user.click(screen.getByTestId("toolbar-new"));
      await fillTaskForm(user, {
        title: "งานไร้ตำแหน่ง",
        requirementText: "ต้นทาง",
        role: "",
      });

      expect(screen.getByTestId("task-role")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("alert")).toHaveTextContent(/SA, UX, Dev หรือ Tester/);
    });

    it("กดเพิ่มจากหัว column ต้องตั้งตำแหน่งไว้ตาม column นั้น", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "ต้นทาง");
      await createTask(user, { title: "งานแรก", requirementText: "ต้นทาง", role: "Dev" });

      await user.click(screen.getByTestId("board-Tester-add"));
      expect(screen.getByTestId("task-role")).toHaveValue("Tester");

      await fillTaskForm(user, { title: "งานทดสอบ", requirementText: "ต้นทาง" });
      expect(cardsInColumn("Tester")).toEqual(["งานทดสอบ"]);
      expect(columnCount("Dev")).toBe(1);
    });
  });

  describe("กรอง 3 เงื่อนไข (FR2.4)", () => {
    it("ต้องกรองตามตำแหน่ง ตามผู้รับผิดชอบ และตาม Requirement ต้นทางได้", async () => {
      const { user } = renderApp();

      await goto(user, "requirements");
      await createRequirement(user, { title: "Requirement A" });
      await createRequirement(user, { title: "Requirement B" });
      await goto(user, "tasks");

      await createTask(user, {
        title: "งานของ A",
        requirementText: "Requirement A",
        role: "Dev",
      });
      await createTask(user, {
        title: "งานของ B",
        requirementText: "Requirement B",
        role: "Tester",
      });

      await switchToList(user);
      expect(listTitles()).toHaveLength(2);

      await user.selectOptions(screen.getByTestId("filter-role"), "Tester");
      expect(listTitles()).toEqual(["งานของ B"]);

      await user.selectOptions(screen.getByTestId("filter-role"), "");
      await user.selectOptions(screen.getByTestId("filter-requirement"), "Requirement A");
      expect(listTitles()).toEqual(["งานของ A"]);

      await user.selectOptions(screen.getByTestId("filter-requirement"), "");
      // ผู้ใช้ปัจจุบันคือค่าเริ่มต้น จึงเป็นผู้รับผิดชอบของทั้งสองงาน
      const assigneeFilter = screen.getByTestId("filter-assignee");
      const firstUser = within(assigneeFilter).getAllByRole("option")[1];
      expect(firstUser).toBeDefined();
      await user.selectOptions(assigneeFilter, firstUser as HTMLOptionElement);
      expect(listTitles()).toHaveLength(2);
    });
  });

  describe("ย้อนกลับไป Requirement ต้นทาง (FR2.6)", () => {
    it("รายละเอียด Task ต้องบอก Requirement ต้นทาง", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "ผู้ใช้ต้องออกรายงานได้");
      await createTask(user, {
        title: "ทำหน้ารายงาน",
        requirementText: "ผู้ใช้ต้องออกรายงานได้",
        role: "Dev",
      });

      await openCard(user, "ทำหน้ารายงาน");

      expect(screen.getByText("Requirement ต้นทาง")).toBeVisible();
      expect(screen.getByText("ผู้ใช้ต้องออกรายงานได้")).toBeVisible();
    });
  });

  describe("แก้ไข (FR2.5)", () => {
    it("เปลี่ยนตำแหน่งแล้วการ์ดต้องย้าย column", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "ต้นทาง");
      await createTask(user, { title: "ย้ายฉัน", requirementText: "ต้นทาง", role: "Dev" });

      await openCard(user, "ย้ายฉัน");
      await user.click(screen.getByTestId("detail-edit"));
      await fillTaskForm(user, {
        title: "ย้ายฉัน",
        requirementText: "ต้นทาง",
        role: "SA",
      });

      expect(cardsInColumn("SA")).toEqual(["ย้ายฉัน"]);
      expect(columnCount("Dev")).toBe(0);
    });
  });

  describe("นับและลบ Defect ที่ผูกอยู่ (FR2.7, FR4.5)", () => {
    it("การ์ดต้องบอกจำนวน Defect และการลบต้องเตือนก่อนว่าจะลบตามไปด้วย", async () => {
      const { user } = renderApp();
      await seedRequirement(user, "ต้นทาง");
      await createTask(user, {
        title: "งานที่มีปัญหา",
        requirementText: "ต้นทาง",
        role: "Dev",
      });

      await goto(user, "defects");
      await createDefect(user, { title: "ปัญหาที่ 1", taskText: "งานที่มีปัญหา" });
      await createDefect(user, { title: "ปัญหาที่ 2", taskText: "งานที่มีปัญหา" });

      await goto(user, "tasks");
      expect(screen.getByText("2 Defects")).toBeVisible();

      await openCard(user, "งานที่มีปัญหา");
      expect(
        screen.getByRole("heading", { name: /Defects ที่พบใน Task นี้ \(2\)/ }),
      ).toBeVisible();

      await user.click(screen.getByTestId("detail-delete"));
      const dialog = screen.getByRole("dialog", { name: "ยืนยันการลบ" });
      expect(within(dialog).getByText(/2 Defects ผูกอยู่/)).toBeVisible();

      await user.click(screen.getByTestId("confirm-ok"));

      expect(queryCardTitle("งานที่มีปัญหา")).toBeNull();
      expect(navCount("tasks")).toBe(0);
      expect(navCount("defects")).toBe(0);
    });
  });

  describe("ข้อมูลคงอยู่ข้าม session (FR6.1)", () => {
    it("ปิดแล้วเปิดใหม่ที่หน้า Tasks ต้องยังเห็นงานเดิมพร้อมต้นทาง", async () => {
      const { user, reopen } = renderApp();
      await seedRequirement(user, "ต้นทางที่ต้องอยู่รอด");
      await createTask(user, {
        title: "งานที่ต้องอยู่รอด",
        requirementText: "ต้นทางที่ต้องอยู่รอด",
        role: "Dev",
      });

      reopen("/tasks");

      expect(cardTitle("งานที่ต้องอยู่รอด")).toBeVisible();
      expect(screen.getByText(/◎ ต้นทางที่ต้องอยู่รอด/)).toBeVisible();
    });
  });
});
