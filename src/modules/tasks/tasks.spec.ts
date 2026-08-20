import { describe, it, expect } from "vitest";
import { tasksRepo } from "./tasks.repo";
import { requirementsRepo } from "../requirements/requirements.repo";
import { defectsRepo } from "../defects/defects.repo";
import { ValidationError } from "../../shared/types";
import {
  countDefectsForTask,
  countOrphansOnTaskDelete,
  traceBackward,
} from "../../shared/traceability";

function makeReq() {
  return requirementsRepo.create({
    title: "Requirement ต้นทาง",
    description: "",
    category: "Functional",
    priority: "Should",
    ownerId: "u1",
  });
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    title: "สร้างหน้าเข้าสู่ระบบ",
    description: "",
    requirementId: "req-x",
    assigneeId: "u2",
    role: "Dev" as const,
    ...overrides,
  };
}

describe("Task Management", () => {
  describe("การสร้าง Task (FR2.1)", () => {
    it("เมื่อสร้างพร้อมเลือก Requirement ต้องปรากฏในรายการและผูกกับ Requirement นั้นจริง", () => {
      const req = makeReq();
      const created = tasksRepo.create(draft({ requirementId: req.id }));

      expect(tasksRepo.list()).toHaveLength(1);
      expect(tasksRepo.find(created.id)?.requirementId).toBe(req.id);
    });
  });

  describe("การบังคับผูกกับ Requirement (FR2.2)", () => {
    it("เมื่อบันทึกโดยไม่เลือก Requirement ต้องถูกปฏิเสธและไม่มี Task ถูกสร้าง", () => {
      expect(() => tasksRepo.create(draft({ requirementId: "" }))).toThrow(
        ValidationError,
      );
      expect(tasksRepo.list()).toHaveLength(0);
    });

    it("ข้อความที่ปฏิเสธต้องอธิบายเหตุผล ไม่ใช่แค่บอกว่าผิด", () => {
      try {
        tasksRepo.create(draft({ requirementId: "" }));
        expect.unreachable("ควรถูกปฏิเสธก่อนถึงบรรทัดนี้");
      } catch (error) {
        expect((error as ValidationError).field).toBe("requirementId");
        expect((error as ValidationError).message).toContain("Requirement");
      }
    });
  });

  describe("การบังคับระบุตำแหน่ง (FR2.3)", () => {
    it("เมื่อไม่เลือกตำแหน่ง ต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, role: "" })),
      ).toThrow(ValidationError);
    });

    it("ตำแหน่งนอก SA/UX/Dev/Tester ต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, role: "PM" })),
      ).toThrow(ValidationError);
    });
  });

  describe("การกรองรายการ (FR2.4)", () => {
    it("ต้องกรองตามผู้รับผิดชอบ ตามตำแหน่ง และตาม Requirement ต้นทางได้", () => {
      const reqA = makeReq();
      const reqB = makeReq();
      tasksRepo.create(draft({ requirementId: reqA.id, assigneeId: "u2", role: "Dev" }));
      tasksRepo.create(
        draft({ requirementId: reqB.id, assigneeId: "u4", role: "Tester" }),
      );

      const all = tasksRepo.list();
      expect(all.filter((t) => t.role === "Dev")).toHaveLength(1);
      expect(all.filter((t) => t.assigneeId === "u4")).toHaveLength(1);
      expect(all.filter((t) => t.requirementId === reqA.id)).toHaveLength(1);
    });
  });

  describe("การแก้ไขและลบ (FR2.5)", () => {
    it("แก้แล้วต้องได้ค่าใหม่ และลบแล้วต้องหายจากรายการ", () => {
      const req = makeReq();
      const created = tasksRepo.create(draft({ requirementId: req.id }));

      tasksRepo.update(created.id, { title: "แก้แล้ว", role: "Tester" });
      expect(tasksRepo.find(created.id)?.title).toBe("แก้แล้ว");
      expect(tasksRepo.find(created.id)?.role).toBe("Tester");

      tasksRepo.remove(created.id);
      expect(tasksRepo.find(created.id)).toBeNull();
    });
  });

  describe("การย้อนกลับไป Requirement ต้นทาง (FR2.6)", () => {
    it("จาก Task ต้องหา Requirement ต้นทางได้", () => {
      const req = makeReq();
      const task = tasksRepo.create(draft({ requirementId: req.id }));
      const found = requirementsRepo.find(task.requirementId);
      expect(found?.id).toBe(req.id);
    });
  });

  describe("การนับ Defect ที่ผูกอยู่ (FR2.7)", () => {
    it("ต้องนับ Defect ใต้ Task ได้ถูกต้อง และบอกจำนวนที่จะกำพร้าเมื่อลบ (FR4.5)", () => {
      const req = makeReq();
      const task = tasksRepo.create(draft({ requirementId: req.id }));
      for (let i = 0; i < 3; i += 1) {
        defectsRepo.create({
          title: `ปัญหาที่ ${i + 1}`,
          description: "",
          taskId: task.id,
          type: "Code Bug",
          severity: "Medium",
          reporterId: "u4",
        });
      }

      expect(countDefectsForTask(task.id, defectsRepo.list())).toBe(3);
      expect(countOrphansOnTaskDelete(task.id, defectsRepo.list())).toEqual({
        defects: 3,
      });

      // และสายย้อนกลับจาก defect ขึ้นถึง requirement ต้องครบ (FR4.2)
      const defect = defectsRepo.list()[0];
      expect(defect).toBeDefined();
      const trace = traceBackward(
        defect as NonNullable<typeof defect>,
        tasksRepo.list(),
        requirementsRepo.list(),
      );
      expect(trace.task?.id).toBe(task.id);
      expect(trace.requirement?.id).toBe(req.id);
    });
  });
});
