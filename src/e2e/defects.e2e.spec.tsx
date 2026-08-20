import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  cardTitle,
  cardsInColumn,
  columnCount,
  createDefect,
  createRequirement,
  createTask,
  fillDefectForm,
  goto,
  listTitles,
  navCount,
  openCard,
  queryCardTitle,
  renderApp,
  switchToList,
  type Ui,
} from "./harness";
import { DEFECT_TYPES } from "../shared/types";

/** ตั้งต้นด้วยสาย Requirement → Task เพราะ Defect ต้องผูกกับ Task (FR3.4) */
async function seedChain(user: Ui, taskTitle: string): Promise<void> {
  await goto(user, "requirements");
  await createRequirement(user, { title: "ผู้ใช้ต้องเข้าสู่ระบบได้" });
  await goto(user, "tasks");
  await createTask(user, {
    title: taskTitle,
    requirementText: "ผู้ใช้ต้องเข้าสู่ระบบได้",
    role: "Dev",
  });
  await goto(user, "defects");
}

describe("E2E: Defects", () => {
  describe("ต้องมี Task ก่อนจึงบันทึก Defect ได้ (FR3.4)", () => {
    it("ยังไม่มี Task เลย กด New ต้องได้คำอธิบาย ไม่ใช่ฟอร์มที่บันทึกไม่ได้", async () => {
      const { user } = renderApp("/defects");

      await user.click(screen.getByTestId("toolbar-new"));

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("ยังสร้าง Defect ไม่ได้");
      expect(screen.queryByTestId("defect-submit")).toBeNull();
    });

    it("เลือก Task แล้วบันทึก ต้องได้การ์ดที่ผูกกับ Task นั้น", async () => {
      const { user } = renderApp();
      await seedChain(user, "สร้างหน้าเข้าสู่ระบบ");

      await createDefect(user, {
        title: "กดปุ่มแล้วไม่มีอะไรเกิดขึ้น",
        taskText: "สร้างหน้าเข้าสู่ระบบ",
        type: "Code Bug",
        severity: "High",
      });

      expect(cardsInColumn("Code Bug")).toEqual(["กดปุ่มแล้วไม่มีอะไรเกิดขึ้น"]);
      expect(screen.getByText("High")).toBeVisible();
      expect(screen.getByText(/✓ สร้างหน้าเข้าสู่ระบบ/)).toBeVisible();
      expect(navCount("defects")).toBe(1);
    });
  });

  describe("บังคับระบุประเภทและความรุนแรง (FR3.2, FR3.3)", () => {
    it("ไม่เลือกประเภทต้องถูกปฏิเสธพร้อมบอกค่าที่เลือกได้ทั้ง 5", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");

      await user.click(screen.getByTestId("toolbar-new"));
      await fillDefectForm(user, {
        title: "ไม่ระบุประเภท",
        taskText: "งานต้นทาง",
        type: "",
        severity: "Medium",
      });

      expect(screen.getByTestId("defect-type")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("alert")).toHaveTextContent(
        /Code Bug, SA Gap, Design Gap, Test Escape หรือ NFR Violation/,
      );
      expect(queryCardTitle("ไม่ระบุประเภท")).toBeNull();
    });

    it("ไม่เลือกความรุนแรงต้องถูกปฏิเสธที่ช่องความรุนแรง", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");

      await user.click(screen.getByTestId("toolbar-new"));
      await fillDefectForm(user, {
        title: "ไม่ระบุความรุนแรง",
        taskText: "งานต้นทาง",
        type: "Code Bug",
        severity: "",
      });

      expect(screen.getByTestId("defect-severity")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("คำอธิบายใต้ช่องประเภทต้องเปลี่ยนตามประเภทที่เลือก เพื่อช่วยเลือกให้ถูก", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");

      await user.click(screen.getByTestId("toolbar-new"));
      expect(screen.getByText(/ประเภทระบุว่าต้นน้ำของปัญหาอยู่ที่ใด/)).toBeVisible();

      await user.selectOptions(screen.getByTestId("defect-type"), "SA Gap");
      expect(screen.getByText(/สเปคไม่ครบ ไม่ชัด หรือขัดแย้งกันเอง/)).toBeVisible();

      await user.selectOptions(screen.getByTestId("defect-type"), "NFR Violation");
      expect(screen.getByText(/ทำงานถูกแต่ไม่ผ่านเกณฑ์ที่วัดได้/)).toBeVisible();
    });
  });

  describe("นับแยกตามประเภททั้ง 5 (FR3.7)", () => {
    it("board ต้องมี column ครบทั้ง 5 และประเภทที่ยังไม่มีต้องแสดง 0 ไม่ใช่หายไป", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");

      await createDefect(user, {
        title: "บั๊กที่ 1",
        taskText: "งานต้นทาง",
        type: "Code Bug",
      });
      await createDefect(user, {
        title: "บั๊กที่ 2",
        taskText: "งานต้นทาง",
        type: "Code Bug",
      });
      await createDefect(user, {
        title: "สเปคไม่ครบ",
        taskText: "งานต้นทาง",
        type: "SA Gap",
      });

      for (const type of DEFECT_TYPES) {
        expect(screen.getByTestId(`board-${type}-label`)).toHaveTextContent(type);
      }
      expect(columnCount("Code Bug")).toBe(2);
      expect(columnCount("SA Gap")).toBe(1);
      expect(columnCount("Design Gap")).toBe(0);
      expect(columnCount("Test Escape")).toBe(0);
      expect(columnCount("NFR Violation")).toBe(0);
    });
  });

  describe("สายย้อนกลับถึงต้นทาง (FR4.2)", () => {
    it("รายละเอียด Defect ต้องไล่ขึ้นถึง Task และ Requirement ต้นทาง", async () => {
      const { user } = renderApp();
      await seedChain(user, "สร้างหน้าเข้าสู่ระบบ");
      await createDefect(user, {
        title: "ล็อกอินไม่ผ่าน",
        taskText: "สร้างหน้าเข้าสู่ระบบ",
        type: "Code Bug",
        severity: "Critical",
      });

      await openCard(user, "ล็อกอินไม่ผ่าน");

      const trace = screen
        .getByRole("heading", { name: "สายย้อนกลับถึงต้นทาง" })
        .closest("section");
      expect(trace).not.toBeNull();
      const traceView = within(trace as HTMLElement);
      expect(traceView.getByText(/สร้างหน้าเข้าสู่ระบบ · Dev/)).toBeVisible();
      expect(traceView.getByText(/ผู้ใช้ต้องเข้าสู่ระบบได้ · Should/)).toBeVisible();
    });
  });

  describe("แก้ไขและลบ (FR3.6)", () => {
    it("เปลี่ยนประเภทแล้วการ์ดต้องย้าย column", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");
      await createDefect(user, {
        title: "จัดประเภทผิด",
        taskText: "งานต้นทาง",
        type: "Code Bug",
      });

      await openCard(user, "จัดประเภทผิด");
      await user.click(screen.getByTestId("detail-edit"));
      await fillDefectForm(user, {
        title: "จัดประเภทผิด",
        taskText: "งานต้นทาง",
        type: "Test Escape",
        severity: "Low",
      });

      expect(cardsInColumn("Test Escape")).toEqual(["จัดประเภทผิด"]);
      expect(columnCount("Code Bug")).toBe(0);
    });

    it("ลบ Defect ต้องหายจาก board และเมนูนับลดลง", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");
      await createDefect(user, { title: "ลบได้เลย", taskText: "งานต้นทาง" });

      await openCard(user, "ลบได้เลย");
      await user.click(screen.getByTestId("detail-delete"));
      await user.click(screen.getByTestId("confirm-ok"));

      expect(queryCardTitle("ลบได้เลย")).toBeNull();
      expect(navCount("defects")).toBe(0);
    });
  });

  describe("ค้นหาและกรอง (FR3.5)", () => {
    it("ต้องกรองตามประเภทและตามความรุนแรงในมุมมองตารางได้", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");
      await createDefect(user, {
        title: "ปัญหาร้ายแรง",
        taskText: "งานต้นทาง",
        type: "SA Gap",
        severity: "Critical",
      });
      await createDefect(user, {
        title: "ปัญหาเล็กน้อย",
        taskText: "งานต้นทาง",
        type: "Code Bug",
        severity: "Low",
      });

      await switchToList(user);
      expect(listTitles()).toHaveLength(2);

      await user.selectOptions(screen.getByTestId("filter-severity"), "Critical");
      expect(listTitles()).toEqual(["ปัญหาร้ายแรง"]);

      await user.selectOptions(screen.getByTestId("filter-severity"), "");
      await user.selectOptions(screen.getByTestId("filter-type"), "Code Bug");
      expect(listTitles()).toEqual(["ปัญหาเล็กน้อย"]);
    });

    it("ค้นหาต้องเหลือเฉพาะรายการที่ตรงคำค้น", async () => {
      const { user } = renderApp();
      await seedChain(user, "งานต้นทาง");
      await createDefect(user, {
        title: "ปุ่มบันทึกไม่ทำงาน",
        taskText: "งานต้นทาง",
        type: "Code Bug",
      });
      await createDefect(user, {
        title: "หน้าโหลดช้า",
        taskText: "งานต้นทาง",
        type: "NFR Violation",
      });

      await user.type(screen.getByTestId("toolbar-search"), "โหลดช้า");

      expect(cardTitle("หน้าโหลดช้า")).toBeVisible();
      expect(queryCardTitle("ปุ่มบันทึกไม่ทำงาน")).toBeNull();
    });
  });

  describe("ข้อมูลคงอยู่ข้าม session (FR6.1)", () => {
    it("ปิดแล้วเปิดใหม่ที่หน้า Defects ต้องยังเห็นรายการเดิม", async () => {
      const { user, reopen } = renderApp();
      await seedChain(user, "งานต้นทาง");
      await createDefect(user, {
        title: "ต้องอยู่รอดข้าม session",
        taskText: "งานต้นทาง",
        type: "Design Gap",
      });

      reopen("/defects");

      expect(cardsInColumn("Design Gap")).toEqual(["ต้องอยู่รอดข้าม session"]);
    });
  });
});
