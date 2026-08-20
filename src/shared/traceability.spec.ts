import { describe, it, expect } from "vitest";
import {
  traceForward,
  traceBackward,
  findRequirementsWithoutTasks,
  countOrphansOnRequirementDelete,
  countOrphansOnTaskDelete,
  countDefectsByType,
  countTasksForRequirement,
  countDefectsForTask,
} from "./traceability";
import { makeRequirement, makeTask, makeDefect } from "./test-factories";
import { DEFECT_TYPES } from "./types";

describe("สายเชื่อมโยง Requirement → Task → Defect", () => {
  describe("สายเชื่อมโยงจากต้นน้ำลงปลายน้ำ (FR4.1)", () => {
    it("เมื่อเปิด Requirement ที่มี 2 Task และแต่ละ Task มี 1 Defect ต้องเห็นทั้ง 2 Task และทั้ง 2 Defect", () => {
      // Given
      const req = makeRequirement({ id: "r1" });
      const tasks = [
        makeTask({ id: "t1", requirementId: "r1" }),
        makeTask({ id: "t2", requirementId: "r1" }),
        makeTask({ id: "t9", requirementId: "อื่น" }),
      ];
      const defects = [
        makeDefect({ id: "d1", taskId: "t1" }),
        makeDefect({ id: "d2", taskId: "t2" }),
        makeDefect({ id: "d9", taskId: "t9" }),
      ];

      // When
      const trace = traceForward(req.id, tasks, defects);

      // Then — เห็นเฉพาะของ Requirement นี้ ไม่ปนของ Requirement อื่น
      expect(trace.tasks.map((t) => t.id)).toEqual(["t1", "t2"]);
      expect(trace.defects.map((d) => d.id)).toEqual(["d1", "d2"]);
    });

    it("เมื่อ Requirement ยังไม่มี Task ต้องได้รายการว่างทั้งสองระดับ", () => {
      const trace = traceForward("ไม่มีใครอ้าง", [], []);
      expect(trace.tasks).toEqual([]);
      expect(trace.defects).toEqual([]);
    });
  });

  describe("สายย้อนกลับจากปลายน้ำขึ้นต้นน้ำ (FR4.2)", () => {
    it("เมื่อเปิด Defect ต้องเห็นทั้ง Task และ Requirement ต้นทาง", () => {
      // Given
      const req = makeRequirement({ id: "r1", title: "ต้นทาง" });
      const task = makeTask({ id: "t1", requirementId: "r1", title: "งานกลาง" });
      const defect = makeDefect({ id: "d1", taskId: "t1" });

      // When
      const trace = traceBackward(defect, [task], [req]);

      // Then
      expect(trace.task?.title).toBe("งานกลาง");
      expect(trace.requirement?.title).toBe("ต้นทาง");
    });

    it("เมื่อ Task ต้นทางถูกลบไปแล้ว ต้องคืนค่าว่างทั้งสองระดับ ไม่ใช่ล้ม", () => {
      const trace = traceBackward(makeDefect({ taskId: "หายไปแล้ว" }), [], []);
      expect(trace.task).toBeNull();
      expect(trace.requirement).toBeNull();
    });
  });

  describe("การชี้ Requirement ที่ยังไม่มี Task (FR4.3)", () => {
    it("ต้องคืนเฉพาะ Requirement ที่ไม่มี Task ผูกอยู่เลย", () => {
      // Given — r1 มี task, r2 ไม่มี
      const requirements = [makeRequirement({ id: "r1" }), makeRequirement({ id: "r2" })];
      const tasks = [makeTask({ requirementId: "r1" })];

      // When / Then
      const uncovered = findRequirementsWithoutTasks(requirements, tasks);
      expect(uncovered.map((r) => r.id)).toEqual(["r2"]);
    });
  });

  describe("การเตือนก่อนลบสิ่งที่มีลูก (FR4.4, FR4.5)", () => {
    it("เมื่อจะลบ Requirement ที่มี 2 Task และ 2 Defect ต้องบอกจำนวนที่จะกำพร้าได้ถูกต้อง", () => {
      const tasks = [
        makeTask({ id: "t1", requirementId: "r1" }),
        makeTask({ id: "t2", requirementId: "r1" }),
      ];
      const defects = [
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t2" }),
      ];

      const counts = countOrphansOnRequirementDelete("r1", tasks, defects);
      expect(counts).toEqual({ tasks: 2, defects: 2 });
    });

    it("เมื่อจะลบ Task ที่มี 3 Defect ต้องบอกว่ามี 3 Defect ที่จะกำพร้า", () => {
      const defects = [
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t2" }),
      ];
      expect(countOrphansOnTaskDelete("t1", defects)).toEqual({ defects: 3 });
    });
  });

  describe("การนับ Defect แยกตามประเภท (FR3.7)", () => {
    it("ต้องนับครบทั้ง 5 ประเภท โดยประเภทที่ไม่มีต้องเป็น 0 ไม่ใช่หายไปจากผล", () => {
      const defects = [
        makeDefect({ type: "Code Bug" }),
        makeDefect({ type: "Code Bug" }),
        makeDefect({ type: "SA Gap" }),
      ];

      const counts = countDefectsByType(defects);

      expect(counts["Code Bug"]).toBe(2);
      expect(counts["SA Gap"]).toBe(1);
      expect(counts["Design Gap"]).toBe(0);
      expect(counts["Test Escape"]).toBe(0);
      expect(counts["NFR Violation"]).toBe(0);
      expect(Object.keys(counts)).toHaveLength(DEFECT_TYPES.length);
    });
  });

  describe("การนับ Task ที่ผูกกับ Requirement (countTasksForRequirement)", () => {
    it("ต้องนับเฉพาะ Task ที่ผูกกับ Requirement ที่ระบุ", () => {
      const tasks = [
        makeTask({ requirementId: "r1" }),
        makeTask({ requirementId: "r1" }),
        makeTask({ requirementId: "r2" }),
      ];
      expect(countTasksForRequirement("r1", tasks)).toBe(2);
      expect(countTasksForRequirement("r2", tasks)).toBe(1);
    });

    it("เมื่อไม่มี Task ผูกอยู่เลย ต้องคืน 0", () => {
      const tasks = [makeTask({ requirementId: "r1" })];
      expect(countTasksForRequirement("ไม่มีใครผูก", tasks)).toBe(0);
    });
  });

  describe("การนับ Defect ที่ผูกกับ Task (countDefectsForTask)", () => {
    it("ต้องนับเฉพาะ Defect ที่ผูกกับ Task ที่ระบุ", () => {
      const defects = [
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t1" }),
        makeDefect({ taskId: "t2" }),
      ];
      expect(countDefectsForTask("t1", defects)).toBe(3);
      expect(countDefectsForTask("t2", defects)).toBe(1);
    });

    it("เมื่อไม่มี Defect ผูกอยู่เลย ต้องคืน 0", () => {
      const defects = [makeDefect({ taskId: "t1" })];
      expect(countDefectsForTask("ไม่มี", defects)).toBe(0);
    });
  });
});
