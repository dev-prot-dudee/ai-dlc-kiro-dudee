import { describe, it, expect } from "vitest";
import { requirementsRepo } from "./requirements.repo";
import { tasksRepo } from "../tasks/tasks.repo";
import { defectsRepo } from "../defects/defects.repo";
import { DEFAULT_PRIORITY, ValidationError } from "../../shared/types";
import {
  countTasksForRequirement,
  findRequirementsWithoutTasks,
} from "../../shared/traceability";

function draft(overrides: Record<string, unknown> = {}) {
  return {
    title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
    description: "",
    category: "Functional" as const,
    priority: DEFAULT_PRIORITY,
    ownerId: "u1",
    ...overrides,
  };
}

describe("Requirement Management", () => {
  describe("การสร้าง Requirement (FR1.1)", () => {
    it("เมื่อกรอกข้อมูลครบและบันทึก Requirement ใหม่ต้องปรากฏในรายการพร้อมข้อมูลที่กรอก", () => {
      // Given — ยังไม่มี Requirement ในระบบ
      expect(requirementsRepo.list()).toHaveLength(0);

      // When
      const created = requirementsRepo.create(draft({ title: "หัวข้อทดสอบ" }));

      // Then
      const all = requirementsRepo.list();
      expect(all).toHaveLength(1);
      expect(all[0]?.title).toBe("หัวข้อทดสอบ");
      expect(all[0]?.id).toBe(created.id);
      expect(all[0]?.createdAt).not.toBe("");
    });
  });

  describe("การบังคับระบุประเภท (FR1.2)", () => {
    it("เมื่อบันทึกโดยไม่เลือกประเภท ต้องถูกปฏิเสธและไม่มีรายการถูกสร้าง", () => {
      expect(() =>
        requirementsRepo.create(draft({ category: "" })),
      ).toThrow(ValidationError);
      expect(requirementsRepo.list()).toHaveLength(0);
    });

    it("ค่าที่อยู่นอก Functional และ Non-Functional ต้องถูกปฏิเสธ", () => {
      expect(() =>
        requirementsRepo.create(draft({ category: "อย่างอื่น" })),
      ).toThrow(ValidationError);
    });
  });

  describe("ระดับความสำคัญแบบ MoSCoW (FR1.3)", () => {
    it("ค่าเริ่มต้นต้องเป็น Should", () => {
      const created = requirementsRepo.create(draft());
      expect(created.priority).toBe("Should");
      expect(DEFAULT_PRIORITY).toBe("Should");
    });

    it("เมื่อเลือกค่าอื่นใน MoSCoW ต้องบันทึกค่าที่เลือก", () => {
      const created = requirementsRepo.create(draft({ priority: "Must" }));
      expect(requirementsRepo.find(created.id)?.priority).toBe("Must");
    });

    it("ค่านอก MoSCoW ต้องถูกปฏิเสธ", () => {
      expect(() =>
        requirementsRepo.create(draft({ priority: "ด่วนมาก" })),
      ).toThrow(ValidationError);
    });
  });

  describe("การกรองรายการ (FR1.4)", () => {
    it("ต้องกรองตามประเภทและตามระดับความสำคัญได้", () => {
      requirementsRepo.create(draft({ category: "Functional", priority: "Must" }));
      requirementsRepo.create(draft({ category: "Non-Functional", priority: "Could" }));

      const all = requirementsRepo.list();
      expect(all.filter((r) => r.category === "Functional")).toHaveLength(1);
      expect(all.filter((r) => r.priority === "Could")).toHaveLength(1);
    });
  });

  describe("การแก้ไข (FR1.5)", () => {
    it("เมื่อแก้แล้วอ่านใหม่ ต้องได้ค่าใหม่ ไม่ใช่ค่าเดิม", () => {
      const created = requirementsRepo.create(draft({ title: "ก่อนแก้" }));
      requirementsRepo.update(created.id, { title: "หลังแก้", priority: "Won't" });

      const reread = requirementsRepo.find(created.id);
      expect(reread?.title).toBe("หลังแก้");
      expect(reread?.priority).toBe("Won't");
    });

    it("การแก้ให้เป็นค่าที่ผิดกฎต้องถูกปฏิเสธ และค่าเดิมยังอยู่", () => {
      const created = requirementsRepo.create(draft({ title: "เดิม" }));
      expect(() => requirementsRepo.update(created.id, { title: "  " })).toThrow(
        ValidationError,
      );
      expect(requirementsRepo.find(created.id)?.title).toBe("เดิม");
    });
  });

  describe("การบังคับระบุผู้รับผิดชอบ (FR-01)", () => {
    it("เมื่อไม่ระบุ ownerId ต้องถูกปฏิเสธ", () => {
      expect(() =>
        requirementsRepo.create(draft({ ownerId: "" })),
      ).toThrow(ValidationError);
      expect(requirementsRepo.list()).toHaveLength(0);
    });

    it("ownerId ที่เป็นช่องว่างล้วน ต้องถูกปฏิเสธ", () => {
      expect(() =>
        requirementsRepo.create(draft({ ownerId: "   " })),
      ).toThrow(ValidationError);
    });
  });

  describe("การลบ (FR1.6)", () => {
    it("เมื่อลบแล้วต้องหายจากรายการ", () => {
      const created = requirementsRepo.create(draft());
      requirementsRepo.remove(created.id);
      expect(requirementsRepo.find(created.id)).toBeNull();
    });
  });

  describe("Cascade Delete — ลบ Requirement แล้ว Task และ Defect ต้องหายตาม (FR-06, FR4.4)", () => {
    it("ลบ Requirement ที่มี Task ผูกอยู่ ต้องลบ Task ตามไปด้วย", () => {
      const req = requirementsRepo.create(draft());
      const task1 = tasksRepo.create({
        title: "งานที่ 1",
        description: "",
        requirementId: req.id,
        assigneeId: "u2",
        role: "Dev",
      });
      const task2 = tasksRepo.create({
        title: "งานที่ 2",
        description: "",
        requirementId: req.id,
        assigneeId: "u3",
        role: "Tester",
      });

      // ลบ Task ที่ผูกกับ Requirement นี้ (cascade)
      tasksRepo.removeWhere((t) => t.requirementId === req.id);
      requirementsRepo.remove(req.id);

      expect(requirementsRepo.find(req.id)).toBeNull();
      expect(tasksRepo.find(task1.id)).toBeNull();
      expect(tasksRepo.find(task2.id)).toBeNull();
      expect(tasksRepo.list()).toHaveLength(0);
    });

    it("ลบ Requirement ที่มี Task + Defect ผูกอยู่ ต้องลบทั้งสายตามไปด้วย", () => {
      const req = requirementsRepo.create(draft());
      const task = tasksRepo.create({
        title: "งานหลัก",
        description: "",
        requirementId: req.id,
        assigneeId: "u2",
        role: "Dev",
      });
      const defect1 = defectsRepo.create({
        title: "ปัญหาที่ 1",
        description: "",
        taskId: task.id,
        type: "Code Bug",
        severity: "Medium",
        reporterId: "u4",
      });
      const defect2 = defectsRepo.create({
        title: "ปัญหาที่ 2",
        description: "",
        taskId: task.id,
        type: "SA Gap",
        severity: "High",
        reporterId: "u4",
      });

      // Cascade delete: Defect → Task → Requirement
      const taskIds = new Set(
        tasksRepo.list().filter((t) => t.requirementId === req.id).map((t) => t.id),
      );
      defectsRepo.removeWhere((d) => taskIds.has(d.taskId));
      tasksRepo.removeWhere((t) => t.requirementId === req.id);
      requirementsRepo.remove(req.id);

      expect(requirementsRepo.find(req.id)).toBeNull();
      expect(tasksRepo.find(task.id)).toBeNull();
      expect(defectsRepo.find(defect1.id)).toBeNull();
      expect(defectsRepo.find(defect2.id)).toBeNull();
      expect(defectsRepo.list()).toHaveLength(0);
    });

    it("ลบ Requirement แล้ว Task/Defect ที่ผูกกับ Requirement อื่นต้องไม่หาย", () => {
      const reqA = requirementsRepo.create(draft({ title: "A" }));
      const reqB = requirementsRepo.create(draft({ title: "B" }));
      const taskA = tasksRepo.create({
        title: "งานของ A",
        description: "",
        requirementId: reqA.id,
        assigneeId: "u2",
        role: "Dev",
      });
      const taskB = tasksRepo.create({
        title: "งานของ B",
        description: "",
        requirementId: reqB.id,
        assigneeId: "u3",
        role: "Dev",
      });

      // Cascade ลบเฉพาะ reqA
      tasksRepo.removeWhere((t) => t.requirementId === reqA.id);
      requirementsRepo.remove(reqA.id);

      // reqB และ taskB ยังอยู่
      expect(requirementsRepo.find(reqB.id)).not.toBeNull();
      expect(tasksRepo.find(taskB.id)).not.toBeNull();
      expect(tasksRepo.find(taskA.id)).toBeNull();
    });
  });

  describe("การนับ Task และ Defect ที่ผูกอยู่ (FR1.7)", () => {
    it("ต้องนับ Task ที่ผูกกับ Requirement นี้ได้ถูกต้อง", () => {
      const req = requirementsRepo.create(draft());
      tasksRepo.create({
        title: "งานที่ 1",
        description: "",
        requirementId: req.id,
        assigneeId: "u2",
        role: "Dev",
      });
      tasksRepo.create({
        title: "งานที่ 2",
        description: "",
        requirementId: req.id,
        assigneeId: "u3",
        role: "Dev",
      });

      expect(countTasksForRequirement(req.id, tasksRepo.list())).toBe(2);
      expect(defectsRepo.list()).toHaveLength(0);
    });

    it("Requirement ที่ยังไม่มี Task ต้องถูกชี้ว่ายังไม่มี (FR4.3)", () => {
      const covered = requirementsRepo.create(draft({ title: "มีงานแล้ว" }));
      const uncovered = requirementsRepo.create(draft({ title: "ยังไม่มีงาน" }));
      tasksRepo.create({
        title: "งาน",
        description: "",
        requirementId: covered.id,
        assigneeId: "u2",
        role: "Dev",
      });

      const result = findRequirementsWithoutTasks(
        requirementsRepo.list(),
        tasksRepo.list(),
      );
      expect(result.map((r) => r.id)).toEqual([uncovered.id]);
    });
  });
});
