import { describe, it, expect } from "vitest";
import { requirementsRepo } from "../modules/requirements/requirements.repo";
import { tasksRepo } from "../modules/tasks/tasks.repo";
import { defectsRepo } from "../modules/defects/defects.repo";
import { ValidationError } from "./types";

/**
 * Edge case tests — ครอบกรณีขอบที่ unit test ระดับ scenario ยังไม่ได้ทดสอบ
 * เพื่อยืนยันว่า repository layer ทนทานต่อ input ที่ผิดปกติ
 */

function makeDraft() {
  return {
    title: "ปกติ",
    description: "",
    category: "Functional" as const,
    priority: "Should" as const,
    ownerId: "u1",
  };
}

describe("Edge Cases — Repository Layer", () => {
  describe("Input ขอบเขต: string ว่างและ whitespace", () => {
    it("title ที่เป็นช่องว่างล้วนต้องถูกปฏิเสธเหมือน string ว่าง", () => {
      expect(() => requirementsRepo.create(makeDraft())).not.toThrow();
      expect(() =>
        requirementsRepo.create({ ...makeDraft(), title: "   " }),
      ).toThrow(ValidationError);
      expect(() =>
        requirementsRepo.create({ ...makeDraft(), title: "\t\n" }),
      ).toThrow(ValidationError);
    });

    it("title ที่มีช่องว่างนำหน้า/ตามหลังแต่มีเนื้อหาจริง ต้องบันทึกได้", () => {
      const created = requirementsRepo.create({
        ...makeDraft(),
        title: "  หัวข้อจริง  ",
      });
      expect(created.title).toContain("หัวข้อจริง");
    });

    it("description ว่างต้องอนุญาตเพราะไม่ใช่ field บังคับ", () => {
      const created = requirementsRepo.create({ ...makeDraft(), description: "" });
      expect(created.description).toBe("");
    });
  });

  describe("Input ขอบเขต: Unicode และอักขระพิเศษ", () => {
    it("title ที่มี emoji ต้องบันทึกและอ่านกลับได้ครบ", () => {
      const created = requirementsRepo.create({
        ...makeDraft(),
        title: "🚀 ปรับปรุงหน้า Login 🔒",
      });
      const read = requirementsRepo.find(created.id);
      expect(read?.title).toBe("🚀 ปรับปรุงหน้า Login 🔒");
    });

    it("title ที่มี HTML-like content ต้องบันทึกเป็น plain text ไม่ถูก sanitize ออก", () => {
      const created = requirementsRepo.create({
        ...makeDraft(),
        title: '<script>alert("xss")</script>',
      });
      expect(requirementsRepo.find(created.id)?.title).toBe(
        '<script>alert("xss")</script>',
      );
    });

    it("title ที่ยาวมาก (1000 ตัวอักษร) ต้องบันทึกได้ — ไม่มีเกณฑ์ตัดในรอบนี้", () => {
      const longTitle = "ก".repeat(1000);
      const created = requirementsRepo.create({
        ...makeDraft(),
        title: longTitle,
      });
      expect(requirementsRepo.find(created.id)?.title).toHaveLength(1000);
    });
  });

  describe("Input ขอบเขต: การ update ด้วยค่าบางส่วน", () => {
    it("update เฉพาะ field เดียวต้องไม่กระทบ field อื่น", () => {
      const created = requirementsRepo.create({
        ...makeDraft(),
        title: "เดิม",
        category: "Functional",
        priority: "Must",
      });
      requirementsRepo.update(created.id, { title: "ใหม่" });

      const updated = requirementsRepo.find(created.id);
      expect(updated?.title).toBe("ใหม่");
      expect(updated?.category).toBe("Functional");
      expect(updated?.priority).toBe("Must");
    });

    it("update ด้วย id ที่ไม่มีอยู่ต้องโยน error", () => {
      expect(() =>
        requirementsRepo.update("ไม่มี-id-นี้", { title: "จะแก้" }),
      ).toThrow(ValidationError);
    });
  });

  describe("Input ขอบเขต: Task repo edge cases", () => {
    it("Task ที่ requirementId ชี้ไป id ที่ไม่มีจริง ยังสร้างได้ (ไม่มี FK check ใน MVP)", () => {
      // MVP ไม่มี FK enforcement — เป็น known limitation
      const created = tasksRepo.create({
        title: "งาน",
        description: "",
        requirementId: "ไม่มีจริง",
        assigneeId: "u1",
        role: "Dev",
      });
      expect(created.requirementId).toBe("ไม่มีจริง");
    });

    it("Task ที่ role เป็น empty string ต้องถูกปฏิเสธ", () => {
      expect(() =>
        tasksRepo.create({
          title: "งาน",
          description: "",
          requirementId: "req-1",
          assigneeId: "u1",
          role: "" as "Dev",
        }),
      ).toThrow(ValidationError);
    });
  });

  describe("Input ขอบเขต: Defect repo edge cases", () => {
    it("Defect ที่ severity เป็น string นอกชุดที่กำหนดต้องถูกปฏิเสธ", () => {
      const req = requirementsRepo.create(makeDraft());
      const task = tasksRepo.create({
        title: "งาน",
        description: "",
        requirementId: req.id,
        assigneeId: "u1",
        role: "Dev",
      });
      expect(() =>
        defectsRepo.create({
          title: "ปัญหา",
          description: "",
          taskId: task.id,
          type: "Code Bug",
          severity: "Extreme" as "Critical",
          reporterId: "u1",
        }),
      ).toThrow(ValidationError);
    });

    it("Defect ที่ title เป็น whitespace ล้วนต้องถูกปฏิเสธ", () => {
      const req = requirementsRepo.create(makeDraft());
      const task = tasksRepo.create({
        title: "งาน",
        description: "",
        requirementId: req.id,
        assigneeId: "u1",
        role: "Dev",
      });
      expect(() =>
        defectsRepo.create({
          title: "   ",
          description: "",
          taskId: task.id,
          type: "Code Bug",
          severity: "Medium",
          reporterId: "u1",
        }),
      ).toThrow(ValidationError);
    });
  });

  describe("การลบรายการที่ไม่มีอยู่", () => {
    it("remove id ที่ไม่มีต้องไม่ error (idempotent delete)", () => {
      const countBefore = requirementsRepo.list().length;
      expect(() => requirementsRepo.remove("ไม่เคยมี")).not.toThrow();
      expect(requirementsRepo.list().length).toBe(countBefore);
    });

    it("find id ที่ไม่มีต้องคืน null ไม่ใช่ throw", () => {
      expect(requirementsRepo.find("ไม่เคยมี")).toBeNull();
    });
  });
});
