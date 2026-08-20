import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataProvider } from "../DataContext";
import { RequirementBoard } from "../../modules/requirements/RequirementBoard";
import { TaskBoard } from "../../modules/tasks/TaskBoard";
import { requirementsRepo } from "../../modules/requirements/requirements.repo";
import { tasksRepo } from "../../modules/tasks/tasks.repo";
import { defectsRepo } from "../../modules/defects/defects.repo";
import { writeCurrentUserId } from "../users";

/**
 * Component UI Interaction Tests
 *
 * ทดสอบ interaction ระดับ UI ที่ unit test ของ repo ไม่ครอบ:
 * - FilterBar: กรองแล้วเห็นเฉพาะรายการที่ตรง
 * - Toolbar: ค้นหาแล้วรายการที่ไม่ตรงหายไป
 * - Board/List view switching
 */

function seedData() {
  writeCurrentUserId("u1");

  const reqA = requirementsRepo.create({
    title: "Login ต้องรองรับ 2FA",
    description: "ความปลอดภัยระดับสูง",
    category: "Functional",
    priority: "Must",
    ownerId: "u1",
  });
  const reqB = requirementsRepo.create({
    title: "NFR: Response Time ≤ 200ms",
    description: "ประสิทธิภาพ",
    category: "Non-Functional",
    priority: "Should",
    ownerId: "u5",
  });

  const taskA = tasksRepo.create({
    title: "สร้างหน้า Login",
    description: "",
    requirementId: reqA.id,
    assigneeId: "u2",
    role: "Dev",
  });
  const taskB = tasksRepo.create({
    title: "เขียน test login",
    description: "",
    requirementId: reqA.id,
    assigneeId: "u4",
    role: "Tester",
  });

  defectsRepo.create({
    title: "ปุ่ม Login ไม่ตอบสนอง",
    description: "",
    taskId: taskA.id,
    type: "Code Bug",
    severity: "High",
    reporterId: "u4",
  });
  defectsRepo.create({
    title: "สเปคไม่ระบุกรณี session timeout",
    description: "",
    taskId: taskB.id,
    type: "SA Gap",
    severity: "Medium",
    reporterId: "u8",
  });

  return { reqA, reqB, taskA, taskB };
}

describe("FilterBar — การกรองรายการบน UI", () => {
  describe("Requirements filter (FR1.4)", () => {
    it("เมื่อกรองตามประเภท Functional ต้องเห็นเฉพาะ Functional", async () => {
      seedData();
      render(
        <DataProvider>
          <RequirementBoard />
        </DataProvider>,
      );

      // เปลี่ยนเป็น list view เพื่อเห็น filter bar
      await userEvent.click(screen.getByRole("tab", { name: /list/i }));

      const categoryFilter = screen.getByTestId("filter-category");
      await userEvent.selectOptions(categoryFilter, "Functional");

      // ต้องเห็นเฉพาะ Functional
      expect(screen.getByText("Login ต้องรองรับ 2FA")).toBeVisible();
      expect(screen.queryByText("NFR: Response Time ≤ 200ms")).not.toBeInTheDocument();
    });

    it("เมื่อกรองตาม priority Must ต้องเห็นเฉพาะ Must", async () => {
      seedData();
      render(
        <DataProvider>
          <RequirementBoard />
        </DataProvider>,
      );

      await userEvent.click(screen.getByRole("tab", { name: /list/i }));

      const priorityFilter = screen.getByTestId("filter-priority");
      await userEvent.selectOptions(priorityFilter, "Must");

      expect(screen.getByText("Login ต้องรองรับ 2FA")).toBeVisible();
      expect(screen.queryByText("NFR: Response Time ≤ 200ms")).not.toBeInTheDocument();
    });

    it("เมื่อเลือก ทั้งหมด กลับต้องเห็นทุกรายการ", async () => {
      seedData();
      render(
        <DataProvider>
          <RequirementBoard />
        </DataProvider>,
      );

      await userEvent.click(screen.getByRole("tab", { name: /list/i }));

      const categoryFilter = screen.getByTestId("filter-category");
      await userEvent.selectOptions(categoryFilter, "Functional");
      await userEvent.selectOptions(categoryFilter, "");

      expect(screen.getByText("Login ต้องรองรับ 2FA")).toBeVisible();
      expect(screen.getByText("NFR: Response Time ≤ 200ms")).toBeVisible();
    });
  });

  describe("Tasks filter (FR2.4)", () => {
    it("เมื่อกรองตามตำแหน่ง Tester ต้องเห็นเฉพาะ Task ของ Tester", async () => {
      seedData();
      render(
        <DataProvider>
          <TaskBoard />
        </DataProvider>,
      );

      await userEvent.click(screen.getByRole("tab", { name: /list/i }));

      const roleFilter = screen.getByTestId("filter-role");
      await userEvent.selectOptions(roleFilter, "Tester");

      expect(screen.getByText("เขียน test login")).toBeVisible();
      expect(screen.queryByText("สร้างหน้า Login")).not.toBeInTheDocument();
    });
  });
});

describe("Toolbar — การค้นหา", () => {
  it("พิมพ์ค้นหาแล้วต้องเห็นเฉพาะรายการที่ตรงกับคำค้น", async () => {
    seedData();
    render(
      <DataProvider>
        <RequirementBoard />
      </DataProvider>,
    );

    const searchInput = screen.getByTestId("toolbar-search");
    await userEvent.type(searchInput, "2FA");

    // ค้นด้วย "2FA" ต้องเห็นเฉพาะรายการที่มีคำว่า 2FA
    expect(screen.getByText("Login ต้องรองรับ 2FA")).toBeVisible();
    expect(screen.queryByText("NFR: Response Time ≤ 200ms")).not.toBeInTheDocument();
  });

  it("ลบคำค้นทั้งหมดแล้วต้องเห็นทุกรายการอีกครั้ง", async () => {
    seedData();
    render(
      <DataProvider>
        <RequirementBoard />
      </DataProvider>,
    );

    const searchInput = screen.getByTestId("toolbar-search");
    await userEvent.type(searchInput, "2FA");
    await userEvent.clear(searchInput);

    expect(screen.getByText("Login ต้องรองรับ 2FA")).toBeVisible();
    expect(screen.getByText("NFR: Response Time ≤ 200ms")).toBeVisible();
  });

  it("คำค้นที่ไม่ตรงกับอะไรเลย ต้องไม่แสดงรายการใดๆ", async () => {
    seedData();
    render(
      <DataProvider>
        <RequirementBoard />
      </DataProvider>,
    );

    const searchInput = screen.getByTestId("toolbar-search");
    await userEvent.type(searchInput, "xxxxxxxxx");

    expect(screen.queryByText("Login ต้องรองรับ 2FA")).not.toBeInTheDocument();
    expect(screen.queryByText("NFR: Response Time ≤ 200ms")).not.toBeInTheDocument();
  });
});

describe("View switching — สลับระหว่าง Board กับ List", () => {
  it("เปลี่ยนเป็น List view ต้องเห็นตารางแทน board", async () => {
    seedData();
    render(
      <DataProvider>
        <RequirementBoard />
      </DataProvider>,
    );

    // เริ่มต้นเป็น board
    expect(screen.getByTestId("board")).toBeInTheDocument();
    expect(screen.queryByTestId("list")).not.toBeInTheDocument();

    // สลับเป็น list
    await userEvent.click(screen.getByRole("tab", { name: /list/i }));
    expect(screen.getByTestId("list")).toBeInTheDocument();
    expect(screen.queryByTestId("board")).not.toBeInTheDocument();
  });

  it("สลับกลับเป็น Board view ต้องเห็น column จัดกลุ่มตามเดิม", async () => {
    seedData();
    render(
      <DataProvider>
        <RequirementBoard />
      </DataProvider>,
    );

    await userEvent.click(screen.getByRole("tab", { name: /list/i }));
    await userEvent.click(screen.getByRole("tab", { name: /board/i }));
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });
});

describe("Toolbar — Export ทำงาน (FR6.2 UI)", () => {
  it("กดปุ่ม export ต้องไม่ error", async () => {
    seedData();
    // Mock URL.createObjectURL / URL.revokeObjectURL เพราะ jsdom ไม่มี
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(globalThis, "URL", {
      value: { createObjectURL, revokeObjectURL },
      writable: true,
    });

    render(
      <DataProvider>
        <RequirementBoard />
      </DataProvider>,
    );

    const exportBtn = screen.getByTestId("toolbar-export");
    // ไม่ควร throw — ถ้า throw จะจับได้จาก error boundary
    await expect(userEvent.click(exportBtn)).resolves.not.toThrow();
  });
});
