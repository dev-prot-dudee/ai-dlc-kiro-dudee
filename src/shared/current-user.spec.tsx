import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataProvider } from "./DataContext";
import { USERS, writeCurrentUserId } from "./users";
import { RequirementBoard } from "../modules/requirements/RequirementBoard";
import { TaskBoard } from "../modules/tasks/TaskBoard";
import { DefectBoard } from "../modules/defects/DefectBoard";
import { requirementsRepo } from "../modules/requirements/requirements.repo";
import { tasksRepo } from "../modules/tasks/tasks.repo";

/**
 * FR5.2 — ผู้ใช้ที่เลือกไว้ต้องเป็นค่าตั้งต้นของ field ผู้รับผิดชอบ/ผู้รายงาน
 * เมื่อสร้างรายการใหม่
 *
 * ทดสอบผ่าน Board จริงไม่ใช่ส่ง prop เข้าฟอร์มตรงๆ เพราะสิ่งที่ต้องยืนยันคือ
 * สายส่งค่าจากที่จำไว้ → DataContext → ฟอร์ม ถ้าทดสอบที่ฟอร์มอย่างเดียว
 * สายที่ขาดกลางทางจะยังทำให้ test ผ่าน
 */
describe("ผู้ใช้ปัจจุบันเป็นค่าตั้งต้นของรายการใหม่ (FR5.2)", () => {
  // ไม่ใช่คนแรกในรายชื่อ เพื่อให้แยกออกจากค่า fallback ที่ถอยไปใช้ USERS[0]
  const actor = USERS[5]!;

  function seedRequirement() {
    return requirementsRepo.create({
      title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: USERS[0]!.id,
    });
  }

  async function openCreateForm(board: ReactNode): Promise<void> {
    // Given — ผู้ใช้ปัจจุบันถูกเลือกไว้ก่อนเปิดหน้าจอ
    writeCurrentUserId(actor.id);
    render(<DataProvider>{board}</DataProvider>);
    // When — กดปุ่มสร้างรายการใหม่
    await userEvent.click(screen.getByTestId("toolbar-new"));
  }

  it("เมื่อสร้าง Requirement ผู้รับผิดชอบตั้งต้นต้องเป็นผู้ใช้ปัจจุบัน", async () => {
    await openCreateForm(<RequirementBoard />);
    // Then — ช่องผู้รับผิดชอบถูกเลือกไว้เป็นผู้ใช้ปัจจุบัน ไม่ใช่คนแรกในรายชื่อ
    expect(screen.getByTestId("req-owner")).toHaveValue(actor.id);
    expect(screen.getByTestId("req-owner")).not.toHaveValue(USERS[0]!.id);
  });

  it("เมื่อสร้าง Task ผู้รับผิดชอบตั้งต้นต้องเป็นผู้ใช้ปัจจุบัน", async () => {
    // Task ต้องมี Requirement ต้นทางก่อนจึงเปิดฟอร์มได้ (FR2.2)
    seedRequirement();

    await openCreateForm(<TaskBoard />);
    expect(screen.getByTestId("task-assignee")).toHaveValue(actor.id);
  });

  it("เมื่อสร้าง Defect ผู้รายงานตั้งต้นต้องเป็นผู้ใช้ปัจจุบัน", async () => {
    // Defect ต้องมี Task ต้นทางก่อนจึงเปิดฟอร์มได้ (FR3.2)
    const requirement = seedRequirement();
    tasksRepo.create({
      title: "สร้างหน้าเข้าสู่ระบบ",
      description: "",
      requirementId: requirement.id,
      assigneeId: USERS[0]!.id,
      role: "Dev",
    });

    await openCreateForm(<DefectBoard />);
    expect(screen.getByTestId("defect-reporter")).toHaveValue(actor.id);
  });
});
