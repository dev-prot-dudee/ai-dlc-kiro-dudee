import { describe, it, expect } from "vitest";
import { defectsRepo } from "./defects.repo";
import { tasksRepo } from "../tasks/tasks.repo";
import { requirementsRepo } from "../requirements/requirements.repo";
import { DEFECT_TYPES, ValidationError } from "../../shared/types";
import { countDefectsByType } from "../../shared/traceability";

function makeTask() {
  const req = requirementsRepo.create({
    title: "Requirement ต้นทาง",
    description: "",
    category: "Functional",
    priority: "Should",
    ownerId: "u1",
  });
  return tasksRepo.create({
    title: "งานต้นทาง",
    description: "",
    requirementId: req.id,
    assigneeId: "u2",
    role: "Dev",
  });
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    title: "กดปุ่มแล้วไม่มีอะไรเกิดขึ้น",
    description: "",
    taskId: "task-x",
    type: "Code Bug" as const,
    severity: "Medium" as const,
    reporterId: "u4",
    ...overrides,
  };
}

describe("Defect Tracking", () => {
  describe("การสร้าง Defect (FR3.1)", () => {
    it("เมื่อสร้างพร้อมเลือก Task ต้องปรากฏในรายการและผูกกับ Task นั้นจริง", () => {
      const task = makeTask();
      const created = defectsRepo.create(draft({ taskId: task.id }));

      expect(defectsRepo.list()).toHaveLength(1);
      expect(defectsRepo.find(created.id)?.taskId).toBe(task.id);
    });
  });

  describe("การบังคับระบุประเภทจาก 5 ค่า (FR3.2)", () => {
    it("เมื่อไม่เลือกประเภท ต้องถูกปฏิเสธและไม่มี Defect ถูกสร้าง", () => {
      const task = makeTask();
      expect(() =>
        defectsRepo.create(draft({ taskId: task.id, type: "" })),
      ).toThrow(ValidationError);
      expect(defectsRepo.list()).toHaveLength(0);
    });

    it("ค่าที่อยู่นอก 5 ประเภทต้องถูกปฏิเสธ", () => {
      const task = makeTask();
      expect(() =>
        defectsRepo.create(draft({ taskId: task.id, type: "UI Bug" })),
      ).toThrow(ValidationError);
    });

    it("ทั้ง 5 ประเภทที่กำหนดไว้ต้องบันทึกได้ทุกค่า", () => {
      const task = makeTask();
      for (const type of DEFECT_TYPES) {
        defectsRepo.create(draft({ taskId: task.id, type }));
      }
      expect(defectsRepo.list()).toHaveLength(DEFECT_TYPES.length);
    });
  });

  describe("การบังคับระบุความรุนแรง (FR3.3)", () => {
    it("เมื่อไม่เลือกความรุนแรง ต้องถูกปฏิเสธ", () => {
      const task = makeTask();
      expect(() =>
        defectsRepo.create(draft({ taskId: task.id, severity: "" })),
      ).toThrow(ValidationError);
    });
  });

  describe("การบังคับผูกกับ Task (FR3.4)", () => {
    it("เมื่อไม่เลือก Task ต้องถูกปฏิเสธพร้อมข้อความที่อธิบายเหตุผล", () => {
      try {
        defectsRepo.create(draft({ taskId: "" }));
        expect.unreachable("ควรถูกปฏิเสธก่อนถึงบรรทัดนี้");
      } catch (error) {
        expect((error as ValidationError).field).toBe("taskId");
        expect((error as ValidationError).message).toContain("Task");
      }
      expect(defectsRepo.list()).toHaveLength(0);
    });
  });

  describe("การกรองรายการ (FR3.5)", () => {
    it("ต้องกรองตามประเภทและตามความรุนแรงได้", () => {
      const task = makeTask();
      defectsRepo.create(draft({ taskId: task.id, type: "SA Gap", severity: "Critical" }));
      defectsRepo.create(draft({ taskId: task.id, type: "Code Bug", severity: "Low" }));

      const all = defectsRepo.list();
      expect(all.filter((d) => d.type === "SA Gap")).toHaveLength(1);
      expect(all.filter((d) => d.severity === "Critical")).toHaveLength(1);
    });
  });

  describe("การแก้ไขและลบ (FR3.6)", () => {
    it("แก้ประเภทแล้วต้องได้ค่าใหม่ และลบแล้วต้องหายจากรายการ", () => {
      const task = makeTask();
      const created = defectsRepo.create(draft({ taskId: task.id }));

      defectsRepo.update(created.id, { type: "Test Escape", severity: "High" });
      expect(defectsRepo.find(created.id)?.type).toBe("Test Escape");
      expect(defectsRepo.find(created.id)?.severity).toBe("High");

      defectsRepo.remove(created.id);
      expect(defectsRepo.find(created.id)).toBeNull();
    });
  });

  describe("การนับแยกตามประเภททั้ง 5 (FR3.7)", () => {
    it("ต้องนับครบทุกประเภท โดยประเภทที่ไม่มีต้องเป็น 0 ไม่ใช่หายไป", () => {
      const task = makeTask();
      defectsRepo.create(draft({ taskId: task.id, type: "Code Bug" }));
      defectsRepo.create(draft({ taskId: task.id, type: "Code Bug" }));
      defectsRepo.create(draft({ taskId: task.id, type: "NFR Violation" }));

      const counts = countDefectsByType(defectsRepo.list());
      expect(counts["Code Bug"]).toBe(2);
      expect(counts["NFR Violation"]).toBe(1);
      expect(counts["SA Gap"]).toBe(0);
      expect(counts["Design Gap"]).toBe(0);
      expect(counts["Test Escape"]).toBe(0);
    });
  });
});
