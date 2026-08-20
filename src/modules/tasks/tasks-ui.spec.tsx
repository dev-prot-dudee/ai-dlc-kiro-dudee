import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataProvider } from "../../shared/DataContext";
import { requirementsRepo } from "../requirements/requirements.repo";
import { tasksRepo } from "./tasks.repo";
import { TaskForm } from "./TaskForm";
import { TaskBoard } from "./TaskBoard";

function seedRequirement() {
  return requirementsRepo.create({
    title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
    description: "",
    category: "Functional",
    priority: "Must",
    ownerId: "u1",
  });
}

function renderForm() {
  return render(
    <DataProvider>
      <TaskForm defaultAssigneeId="u2" onDone={vi.fn()} onCancel={vi.fn()} />
    </DataProvider>,
  );
}

describe("หน้าจอ Task Management (M02)", () => {
  describe("Conditional fields ต้องเปลี่ยนตามตำแหน่งที่เลือก", () => {
    it("เลือก UX ต้องเห็นช่อง Figma และ Revision แต่ไม่เห็นช่องของ SA หรือ Tester", async () => {
      seedRequirement();
      renderForm();

      await userEvent.selectOptions(screen.getByTestId("task-role"), "UX");

      expect(screen.getByTestId("task-figma-link")).toBeInTheDocument();
      expect(screen.getByTestId("task-revision-count")).toBeInTheDocument();
      expect(screen.queryByTestId("task-deliverable")).not.toBeInTheDocument();
      expect(screen.queryByTestId("task-pass-count")).not.toBeInTheDocument();
    });

    it("เลือก SA ต้องเห็น Deliverable และสถานะการอนุมัติ", async () => {
      seedRequirement();
      renderForm();

      await userEvent.selectOptions(screen.getByTestId("task-role"), "SA");

      expect(screen.getByTestId("task-deliverable")).toBeInTheDocument();
      expect(screen.getByTestId("task-approval-status")).toBeInTheDocument();
      expect(screen.queryByTestId("task-figma-link")).not.toBeInTheDocument();
    });

    it("เลือก Dev ต้องไม่มีช่องเฉพาะตำแหน่งเพิ่มขึ้นมาเลย", async () => {
      seedRequirement();
      renderForm();

      await userEvent.selectOptions(screen.getByTestId("task-role"), "Dev");

      expect(screen.queryByTestId("task-role-fields-sa")).not.toBeInTheDocument();
      expect(screen.queryByTestId("task-role-fields-ux")).not.toBeInTheDocument();
      expect(screen.queryByTestId("task-role-fields-tester")).not.toBeInTheDocument();
    });
  });

  describe("ฟอร์มต้องเตือนความล่าช้าให้เห็นระหว่างกรอก ไม่ใช่รอตอนกดบันทึก", () => {
    it("ใส่กำหนดส่งที่ผ่านมาแล้วโดยยังไม่ปิดงาน ต้องขึ้นคำเตือนพร้อมจำนวนวัน", async () => {
      seedRequirement();
      renderForm();

      await userEvent.type(screen.getByTestId("task-due-date"), "2020-01-01");

      const warning = screen.getByTestId("task-late-preview");
      expect(warning).toHaveTextContent("ช้ากว่ากำหนด");
      expect(warning).toHaveTextContent("นับถึงวันนี้");
    });
  });

  describe("PM alert view", () => {
    it("งานที่ติดบล็อคต้องขึ้นบนสุดของหน้า พร้อมบอกว่ารอใคร", () => {
      const req = seedRequirement();
      const blocker = tasksRepo.create({
        title: "ออกแบบหน้าเข้าสู่ระบบ",
        description: "",
        requirementId: req.id,
        assigneeId: "u1",
        role: "UX",
      });
      const blocked = tasksRepo.create({
        title: "ทำหน้าเข้าสู่ระบบ",
        description: "",
        requirementId: req.id,
        assigneeId: "u2",
        role: "Dev",
        blockedByIds: [blocker.id],
      });

      render(
        <DataProvider>
          <TaskBoard />
        </DataProvider>,
      );

      const alert = screen.getByTestId("pm-alert");
      expect(alert).toHaveTextContent("งานที่ติดบล็อคอยู่ (1)");
      expect(screen.getByTestId(`pm-alert-blocked-${blocked.id}`)).toHaveTextContent(
        "ออกแบบหน้าเข้าสู่ระบบ",
      );
    });

    it("ไม่มีงานติดบล็อคและไม่มีงานเลยกำหนด ต้องไม่มีแถบแจ้งเตือนมารบกวน", () => {
      const req = seedRequirement();
      tasksRepo.create({
        title: "งานปกติ",
        description: "",
        requirementId: req.id,
        assigneeId: "u2",
        role: "Dev",
      });

      render(
        <DataProvider>
          <TaskBoard />
        </DataProvider>,
      );

      expect(screen.queryByTestId("pm-alert")).not.toBeInTheDocument();
    });

    it("งานที่เลยกำหนดและยังไม่ปิดต้องขึ้นในแถบแจ้งเตือน", () => {
      const req = seedRequirement();
      const overdue = tasksRepo.create({
        title: "งานที่เลยกำหนด",
        description: "",
        requirementId: req.id,
        assigneeId: "u2",
        role: "Dev",
        dueDate: "2020-01-01",
      });

      render(
        <DataProvider>
          <TaskBoard />
        </DataProvider>,
      );

      expect(screen.getByTestId("pm-alert")).toHaveTextContent(
        "งานที่เลยกำหนดและยังไม่ปิด (1)",
      );
      expect(screen.getByTestId(`pm-alert-overdue-${overdue.id}`)).toHaveTextContent(
        "Committed",
      );
    });
  });
});
