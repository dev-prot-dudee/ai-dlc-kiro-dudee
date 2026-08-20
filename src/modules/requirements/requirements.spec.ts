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

  describe("การลบ (FR1.6)", () => {
    it("เมื่อลบแล้วต้องหายจากรายการ", () => {
      const created = requirementsRepo.create(draft());
      requirementsRepo.remove(created.id);
      expect(requirementsRepo.find(created.id)).toBeNull();
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
