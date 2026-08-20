import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  cardTitle,
  cardsInColumn,
  createDefect,
  createRequirement,
  createTask,
  goto,
  navCount,
  openCard,
  renderApp,
} from "./harness";
import { STORAGE_KEYS } from "../shared/storage";
import { USERS } from "../shared/users";

/**
 * E2E ข้าม module — เส้นทางที่ไม่มี module ใดเป็นเจ้าของคนเดียว
 *
 * FR4 (สายเชื่อมโยง), FR5 (ผู้ใช้ปัจจุบัน) และ FR6 (ที่เก็บข้อมูล) กินข้าม
 * ทั้งสาม module จึงแยกมาไว้ที่นี่แทนการซ้ำในไฟล์ของแต่ละ module
 */
describe("E2E: เส้นทางข้าม module", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("สายเต็ม Requirement → Task → Defect (FR4.1, FR4.2)", () => {
    it("เดินสายจากต้นน้ำถึงปลายน้ำแล้วย้อนกลับได้ครบทั้งสองทิศ", async () => {
      const { user } = renderApp();

      // ต้นน้ำ
      await createRequirement(user, {
        title: "ผู้ใช้ต้องออกรายงานยอดขายได้",
        category: "Functional",
        priority: "Must",
      });
      expect(navCount("requirements")).toBe(1);

      // กลางน้ำ
      await goto(user, "tasks");
      await createTask(user, {
        title: "ทำหน้าเลือกช่วงวันที่",
        requirementText: "ผู้ใช้ต้องออกรายงานยอดขายได้",
        role: "Dev",
      });
      expect(navCount("tasks")).toBe(1);

      // ปลายน้ำ
      await goto(user, "defects");
      await createDefect(user, {
        title: "เลือกวันที่ย้อนหลังแล้วรายงานว่าง",
        taskText: "ทำหน้าเลือกช่วงวันที่",
        type: "SA Gap",
        severity: "High",
      });
      expect(navCount("defects")).toBe(1);

      // ทิศลง: จาก Requirement เห็นทั้ง Task และ Defect ที่อยู่ใต้มัน
      await goto(user, "requirements");
      await openCard(user, "ผู้ใช้ต้องออกรายงานยอดขายได้");
      expect(
        screen.getByRole("heading", { name: /Tasks ที่แตกจาก Requirement นี้ \(1\)/ }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", { name: /Defects ที่พบใต้ Requirement นี้ \(1\)/ }),
      ).toBeVisible();
      expect(
        screen.getByText(/เลือกวันที่ย้อนหลังแล้วรายงานว่าง · SA Gap · High/),
      ).toBeVisible();

      // ทิศขึ้น: จาก Defect ย้อนถึง Requirement
      await goto(user, "defects");
      await openCard(user, "เลือกวันที่ย้อนหลังแล้วรายงานว่าง");
      const trace = screen
        .getByRole("heading", { name: "สายย้อนกลับถึงต้นทาง" })
        .closest("section");
      expect(trace).not.toBeNull();
      const traceView = within(trace as HTMLElement);
      expect(traceView.getByText(/ทำหน้าเลือกช่วงวันที่ · Dev/)).toBeVisible();
      expect(
        traceView.getByText(/ผู้ใช้ต้องออกรายงานยอดขายได้ · Must/),
      ).toBeVisible();
    });

    it("ลบต้นน้ำแบบยืนยัน ต้องล้างทั้งสายไม่ให้เหลือข้อมูลกำพร้า (FR4.4)", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "ต้นน้ำที่จะถูกลบ" });
      await goto(user, "tasks");
      await createTask(user, {
        title: "งานใต้ต้นน้ำ",
        requirementText: "ต้นน้ำที่จะถูกลบ",
        role: "Dev",
      });
      await goto(user, "defects");
      await createDefect(user, { title: "ปัญหาใต้งาน", taskText: "งานใต้ต้นน้ำ" });

      await goto(user, "requirements");
      await openCard(user, "ต้นน้ำที่จะถูกลบ");
      await user.click(screen.getByTestId("detail-delete"));
      expect(
        within(screen.getByRole("dialog")).getByText(/1 Tasks และ 1 Defects/),
      ).toBeVisible();
      await user.click(screen.getByTestId("confirm-ok"));

      expect(navCount("requirements")).toBe(0);
      expect(navCount("tasks")).toBe(0);
      expect(navCount("defects")).toBe(0);
    });
  });

  describe("ผู้ใช้ปัจจุบัน (FR5.1, FR5.3)", () => {
    it("เปลี่ยนผู้ใช้แล้วรายการที่สร้างต่อจากนั้นต้องเป็นของคนใหม่ และจำได้ข้าม session", async () => {
      const { user, reopen } = renderApp();
      const target = USERS[5];
      expect(target).toBeDefined();
      const chosen = target as (typeof USERS)[number];

      await user.selectOptions(screen.getByTestId("user-picker"), chosen.id);
      await createRequirement(user, { title: "งานของคนที่เลือกไว้" });

      const card = cardTitle("งานของคนที่เลือกไว้").closest(".board-card");
      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(chosen.name)).toBeVisible();

      reopen();
      expect(screen.getByTestId("user-picker")).toHaveValue(chosen.id);
    });
  });

  describe("นำเข้าและส่งออกข้อมูล (FR6.2)", () => {
    function bundle(): string {
      return JSON.stringify({
        version: 1,
        exportedAt: "2026-01-01T00:00:00.000Z",
        requirements: [
          {
            id: "r1",
            title: "Requirement ที่นำเข้า",
            description: "",
            category: "Functional",
            priority: "Must",
            ownerId: "u1",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        tasks: [
          {
            id: "t1",
            title: "Task ที่นำเข้า",
            description: "",
            requirementId: "r1",
            assigneeId: "u2",
            role: "Dev",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        defects: [
          {
            id: "d1",
            title: "Defect ที่นำเข้า",
            description: "",
            taskId: "t1",
            type: "Code Bug",
            severity: "Low",
            reporterId: "u4",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      });
    }

    function fileInput(): HTMLInputElement {
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input === null) throw new Error("ไม่พบช่องเลือกไฟล์บนแถบเครื่องมือ");
      return input;
    }

    it("นำเข้าไฟล์ที่ถูกต้อง ต้องเห็นข้อมูลทั้งสามชนิดพร้อมสายที่ต่อกันติด", async () => {
      const { user } = renderApp();

      await user.upload(
        fileInput(),
        new File([bundle()], "export.json", { type: "application/json" }),
      );

      expect(await screen.findByText("Requirement ที่นำเข้า")).toBeVisible();
      expect(navCount("requirements")).toBe(1);
      expect(navCount("tasks")).toBe(1);
      expect(navCount("defects")).toBe(1);

      // สายต้องต่อกันติด ไม่ใช่เข้ามาเป็นข้อมูลกำพร้า
      await goto(user, "tasks");
      expect(screen.getByText(/◎ Requirement ที่นำเข้า/)).toBeVisible();
      await goto(user, "defects");
      expect(screen.getByText(/✓ Task ที่นำเข้า/)).toBeVisible();
    });

    it("นำเข้าไฟล์ที่อ่านไม่ได้ ต้องแจ้งเหตุผลและข้อมูลเดิมต้องไม่หาย", async () => {
      const { user } = renderApp();
      await createRequirement(user, { title: "ข้อมูลเดิมที่ต้องไม่หาย" });

      await user.upload(
        fileInput(),
        new File(["ไม่ใช่ json"], "พัง.json", { type: "application/json" }),
      );

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(/นำเข้าข้อมูลไม่สำเร็จ/);
      expect(cardTitle("ข้อมูลเดิมที่ต้องไม่หาย")).toBeVisible();
      expect(navCount("requirements")).toBe(1);
    });

    it("นำเข้าไฟล์รุ่นที่ระบบยังอ่านไม่ได้ ต้องบอกว่าเป็นรุ่นอะไร", async () => {
      const { user } = renderApp();

      await user.upload(
        fileInput(),
        new File(
          [JSON.stringify({ version: 99, requirements: [], tasks: [], defects: [] })],
          "อนาคต.json",
          { type: "application/json" },
        ),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(/รุ่น 99/);
    });

    it("ส่งออกแล้วนำเข้ากลับ ต้องได้ข้อมูลเดิมครบทั้งสามชนิด", async () => {
      // jsdom ไม่มี createObjectURL จึงต้องดักไว้เพื่อคว้าไฟล์ที่กำลังจะดาวน์โหลด
      const captured: Blob[] = [];
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: (blob: Blob) => {
          captured.push(blob);
          return "blob:mock";
        },
        revokeObjectURL: () => undefined,
      });

      const { user } = renderApp();
      await createRequirement(user, {
        title: "รายการที่จะถูกส่งออก",
        priority: "Must",
      });
      await goto(user, "tasks");
      await createTask(user, {
        title: "งานที่จะถูกส่งออก",
        requirementText: "รายการที่จะถูกส่งออก",
        role: "Dev",
      });

      await user.click(screen.getByTestId("toolbar-export"));

      const exported = captured[0];
      expect(exported).toBeDefined();
      const json = await (exported as Blob).text();
      expect(json).toContain("รายการที่จะถูกส่งออก");
      expect(json).toContain("งานที่จะถูกส่งออก");

      // นำไฟล์ที่ได้กลับเข้าระบบ ต้องได้จำนวนเท่าเดิม ไม่ซ้ำและไม่หาย
      await user.upload(
        fileInput(),
        new File([json], "export.json", { type: "application/json" }),
      );

      expect(navCount("requirements")).toBe(1);
      expect(navCount("tasks")).toBe(1);
      expect(screen.getByText(/◎ รายการที่จะถูกส่งออก/)).toBeVisible();
    });
  });

  describe("ข้อมูลในเบราว์เซอร์เสียหาย (FR6.3)", () => {
    it("เปิดแอปแล้วเจอข้อมูลที่อ่านไม่ได้ ต้องเห็นคำอธิบายและทางออก ไม่ใช่จอขาว", () => {
      // เขียนข้อมูลเสียลงไปตรง ๆ เพราะไม่มีทางทำให้เสียผ่านหน้าจอ
      localStorage.setItem(STORAGE_KEYS.requirements, "{ ไม่ใช่ array }");

      renderApp();

      expect(screen.getByTestId("error-boundary")).toBeVisible();
      expect(screen.getByText(/เปิดหน้าจอนี้ไม่ได้/)).toBeVisible();
      expect(screen.getByTestId("reset-data")).toBeVisible();
    });

    it("ข้อมูลที่ไม่ใช่รายการ ต้องถูกจับได้เหมือนกัน", () => {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify({ ไม่ใช่: "array" }));

      renderApp("/tasks");

      expect(screen.getByTestId("error-boundary")).toBeVisible();
    });
  });

  describe("การนำทางระหว่าง module", () => {
    it("เมนูซ้ายต้องพาไปทั้งสามหน้า และตัวเลขต้องตรงกับจำนวนจริง", async () => {
      const user = userEvent.setup();
      renderApp();

      await createRequirement(user, { title: "หนึ่ง" });
      await createRequirement(user, { title: "สอง", priority: "Must" });

      await goto(user, "tasks");
      expect(screen.getByRole("heading", { name: "Tasks" })).toBeVisible();
      await createTask(user, { title: "งานหนึ่ง", requirementText: "หนึ่ง", role: "SA" });

      await goto(user, "defects");
      expect(screen.getByRole("heading", { name: "Defects" })).toBeVisible();

      await goto(user, "requirements");
      expect(screen.getByRole("heading", { name: "Requirements" })).toBeVisible();
      expect(navCount("requirements")).toBe(2);
      expect(navCount("tasks")).toBe(1);
      expect(navCount("defects")).toBe(0);
      expect(cardsInColumn("Must")).toEqual(["สอง"]);
    });
  });
});
