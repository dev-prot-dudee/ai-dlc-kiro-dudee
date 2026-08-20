import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  cardTitle,
  cardsInColumn,
  columnCount,
  createRequirement,
  createTask,
  fillRequirementForm,
  goto,
  listTitles,
  navCount,
  openCard,
  queryCardTitle,
  renderApp,
  switchToList,
} from "./harness";

/**
 * E2E — Requirement Management
 *
 * ทุก test เริ่มจากแอปเปล่าเพราะ test-setup ล้าง localStorage ก่อนทุกรอบ
 * สิ่งที่ตรวจคือสิ่งที่ผู้ใช้เห็นบนจอ ไม่ใช่ค่าที่เก็บอยู่ข้างใน
 */
describe("E2E: Requirements", () => {
  describe("เปิดแอปครั้งแรก", () => {
    it("ต้องเห็นหน้า Requirements พร้อมบอกสิ่งที่ทำได้ต่อ ไม่ใช่จอว่าง", () => {
      renderApp();

      expect(screen.getByRole("heading", { name: "Requirements" })).toBeVisible();
      expect(screen.getByTestId("empty-state")).toBeVisible();
      expect(
        screen.getByRole("button", { name: "สร้าง Requirement" }),
      ).toBeVisible();
    });

    it("เข้า path ที่ไม่มีอยู่ต้องถูกพาไปหน้า Requirements ไม่ใช่จอขาว", () => {
      renderApp("/ไม่มีหน้านี้");
      expect(screen.getByRole("heading", { name: "Requirements" })).toBeVisible();
    });
  });

  describe("สร้าง Requirement (FR1.1, FR1.3)", () => {
    it("กรอกครบแล้วบันทึก ต้องเห็นการ์ดใน column ตามระดับความสำคัญที่เลือก", async () => {
      const { user } = renderApp();

      await createRequirement(user, {
        title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
        category: "Functional",
        priority: "Must",
        description: "รองรับ email และรหัสผ่าน",
      });

      expect(cardTitle("ผู้ใช้ต้องเข้าสู่ระบบได้")).toBeVisible();
      expect(cardsInColumn("Must")).toEqual(["ผู้ใช้ต้องเข้าสู่ระบบได้"]);
      expect(columnCount("Must")).toBe(1);
      expect(navCount("requirements")).toBe(1);
    });

    it("ไม่เลือกระดับความสำคัญ ต้องได้ Should เป็นค่าเริ่มต้น (FR1.3)", async () => {
      const { user } = renderApp();

      await createRequirement(user, {
        title: "ระบบต้องตอบสนองใน 2 วินาที",
        category: "Non-Functional",
      });

      expect(cardsInColumn("Should")).toEqual(["ระบบต้องตอบสนองใน 2 วินาที"]);
    });

    it("การ์ดที่ยังไม่มี Task ต้องขึ้นคำเตือนให้เห็น (FR4.3)", async () => {
      const { user } = renderApp();

      await createRequirement(user, { title: "ยังไม่ถูกแตกเป็นงาน" });

      expect(screen.getByText("⚠ ยังไม่มี Task")).toBeVisible();
    });

    it("กดเพิ่มจากหัว column ต้องได้ฟอร์มที่ตั้งความสำคัญไว้ตาม column นั้น", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "รายการแรก", priority: "Should" });

      await user.click(screen.getByTestId("board-Could-add"));

      // ฟอร์มเปิดขึ้นพร้อมค่า Could ที่มาจาก column
      expect(screen.getByTestId("req-priority")).toHaveValue("Could");

      await fillRequirementForm(user, {
        title: "รายการจาก column Could",
        category: "Functional",
      });
      expect(cardsInColumn("Could")).toEqual(["รายการจาก column Could"]);
    });
  });

  describe("บังคับระบุประเภท (FR1.2)", () => {
    it("บันทึกโดยไม่เลือกประเภท ต้องค้างอยู่ในฟอร์มพร้อมเหตุผล และไม่มีการ์ดถูกสร้าง", async () => {
      const { user } = renderApp();

      await user.click(screen.getByTestId("toolbar-new"));
      await fillRequirementForm(user, { title: "ยังไม่เลือกประเภท", category: "" });

      // ยังอยู่ในฟอร์ม — ปุ่มบันทึกยังอยู่
      expect(screen.getByTestId("req-submit")).toBeVisible();
      const error = screen.getByRole("alert");
      expect(error).toHaveTextContent(/Functional/);
      expect(screen.getByTestId("req-category")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(queryCardTitle("ยังไม่เลือกประเภท")).toBeNull();
    });

    it("ไม่กรอกหัวข้อ ต้องถูกปฏิเสธที่ช่องหัวข้อ", async () => {
      const { user } = renderApp();

      await user.click(screen.getByTestId("toolbar-new"));
      await fillRequirementForm(user, { title: "", category: "Functional" });

      expect(screen.getByTestId("req-title")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByTestId("req-submit")).toBeVisible();
    });

    it("แก้ที่ผิดแล้วบันทึกซ้ำ ต้องผ่านและได้การ์ด", async () => {
      const { user } = renderApp();

      await user.click(screen.getByTestId("toolbar-new"));
      await fillRequirementForm(user, { title: "แก้แล้วผ่าน", category: "" });
      await user.selectOptions(screen.getByTestId("req-category"), "Functional");
      await user.click(screen.getByTestId("req-submit"));

      expect(cardTitle("แก้แล้วผ่าน")).toBeVisible();
    });
  });

  describe("ค้นหาและกรอง (FR1.4)", () => {
    it("ค้นหาต้องเหลือเฉพาะรายการที่ตรงคำค้น", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "เข้าสู่ระบบ", priority: "Must" });
      await createRequirement(user, { title: "ออกรายงาน", priority: "Must" });

      await user.type(screen.getByTestId("toolbar-search"), "รายงาน");

      expect(cardsInColumn("Must")).toEqual(["ออกรายงาน"]);
      expect(queryCardTitle("เข้าสู่ระบบ")).toBeNull();
    });

    it("มุมมองตารางต้องกรองตามประเภทและตามความสำคัญได้", async () => {
      const { user } = renderApp();
      await createRequirement(user, {
        title: "งาน Functional สำคัญมาก",
        category: "Functional",
        priority: "Must",
      });
      await createRequirement(user, {
        title: "คุณภาพที่ต้องมี",
        category: "Non-Functional",
        priority: "Could",
      });

      await switchToList(user);
      expect(listTitles()).toHaveLength(2);

      await user.selectOptions(screen.getByTestId("filter-category"), "Non-Functional");
      expect(listTitles()).toEqual(["คุณภาพที่ต้องมี"]);

      await user.selectOptions(screen.getByTestId("filter-category"), "");
      await user.selectOptions(screen.getByTestId("filter-priority"), "Must");
      expect(listTitles()).toEqual(["งาน Functional สำคัญมาก"]);
    });
  });

  describe("ดูรายละเอียดและแก้ไข (FR1.5)", () => {
    it("เปิดการ์ดต้องเห็นรายละเอียดครบ แล้วแก้ไขจากที่นั่นได้", async () => {
      const { user } = renderApp();
      await createRequirement(user, {
        title: "ก่อนแก้",
        category: "Functional",
        priority: "Should",
      });

      await openCard(user, "ก่อนแก้");

      const detail = screen.getByRole("heading", { name: "Requirements" });
      expect(detail).toBeVisible();
      expect(screen.getByText("Functional")).toBeVisible();
      expect(screen.getByTestId("detail-edit")).toBeVisible();

      await user.click(screen.getByTestId("detail-edit"));
      await fillRequirementForm(user, {
        title: "หลังแก้",
        category: "Non-Functional",
        priority: "Won't",
      });

      // กลับมาที่ board พร้อมค่าใหม่ และย้าย column ตามความสำคัญใหม่
      expect(cardsInColumn("Won't")).toEqual(["หลังแก้"]);
      expect(queryCardTitle("ก่อนแก้")).toBeNull();
    });

    it("รายละเอียดต้องแสดงสายเชื่อมโยงลงไป Task และ Defect (FR4.1)", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "ต้นทางของงาน" });

      await goto(user, "tasks");
      await createTask(user, {
        title: "งานที่แตกออกมา",
        requirementText: "ต้นทางของงาน",
        role: "Dev",
      });

      await goto(user, "requirements");
      await openCard(user, "ต้นทางของงาน");

      expect(
        screen.getByRole("heading", { name: /Tasks ที่แตกจาก Requirement นี้ \(1\)/ }),
      ).toBeVisible();
      expect(screen.getByText(/งานที่แตกออกมา · Dev/)).toBeVisible();
      expect(
        screen.getByRole("heading", { name: /Defects ที่พบใต้ Requirement นี้ \(0\)/ }),
      ).toBeVisible();
    });
  });

  describe("ลบ (FR1.6, FR4.4)", () => {
    it("ยกเลิกในกล่องยืนยัน ต้องไม่ลบอะไรเลย", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "อย่าลบฉัน" });

      await openCard(user, "อย่าลบฉัน");
      await user.click(screen.getByTestId("detail-delete"));
      await user.click(screen.getByTestId("confirm-cancel"));

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.getByTestId("detail-delete")).toBeVisible();
    });

    it("ลบรายการที่ไม่มีลูก ต้องหายจาก board และเมนูนับลดลง", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "ลบได้เลย", priority: "Must" });

      await openCard(user, "ลบได้เลย");
      await user.click(screen.getByTestId("detail-delete"));
      expect(
        within(screen.getByRole("dialog")).getByText(/กู้คืนไม่ได้/),
      ).toBeVisible();
      await user.click(screen.getByTestId("confirm-ok"));

      expect(queryCardTitle("ลบได้เลย")).toBeNull();
      expect(navCount("requirements")).toBe(0);
    });

    it("ลบรายการที่มี Task ผูกอยู่ ต้องบอกจำนวนที่จะหายตามก่อนยืนยัน แล้วลบตามจริง", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "มีงานผูกอยู่" });

      await goto(user, "tasks");
      await createTask(user, {
        title: "งานลูกที่ 1",
        requirementText: "มีงานผูกอยู่",
        role: "Dev",
      });
      await createTask(user, {
        title: "งานลูกที่ 2",
        requirementText: "มีงานผูกอยู่",
        role: "Tester",
      });

      await goto(user, "requirements");
      await openCard(user, "มีงานผูกอยู่");
      await user.click(screen.getByTestId("detail-delete"));

      const dialog = screen.getByRole("dialog", { name: "ยืนยันการลบ" });
      expect(within(dialog).getByText(/2 Tasks และ 0 Defects/)).toBeVisible();
      expect(screen.getByTestId("confirm-ok")).toHaveTextContent("ลบทั้งหมด");

      await user.click(screen.getByTestId("confirm-ok"));

      expect(queryCardTitle("มีงานผูกอยู่")).toBeNull();
      expect(navCount("requirements")).toBe(0);
      // Task ที่ผูกอยู่ต้องหายตามไปด้วย ไม่ค้างเป็นข้อมูลกำพร้า
      expect(navCount("tasks")).toBe(0);
    });
  });

  describe("ข้อมูลคงอยู่ข้าม session (FR6.1)", () => {
    it("ปิดแอปแล้วเปิดใหม่ ต้องยังเห็นรายการเดิม", async () => {
      const { user, reopen } = renderApp();
      await createRequirement(user, { title: "ต้องอยู่รอดข้าม session", priority: "Must" });

      reopen();

      expect(cardTitle("ต้องอยู่รอดข้าม session")).toBeVisible();
      expect(navCount("requirements")).toBe(1);
    });
  });
});
