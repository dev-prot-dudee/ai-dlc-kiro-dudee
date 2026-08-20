import { describe, it, expect } from "vitest";
import { requirementsRepo } from "../modules/requirements/requirements.repo";
import { tasksRepo } from "../modules/tasks/tasks.repo";
import { defectsRepo } from "../modules/defects/defects.repo";
import {
  traceForward,
  traceBackward,
  countOrphansOnRequirementDelete,
  countOrphansOnTaskDelete,
  findRequirementsWithoutTasks,
} from "./traceability";

/**
 * Cross-Module Interaction Tests
 *
 * ทดสอบพฤติกรรมข้าม module ที่ test ของแต่ละ module ทดสอบแยกไม่ได้:
 * - Cascade delete: ลบ Requirement → Task + Defect ต้องหายจริง
 * - Traceability: สายเชื่อมโยงข้าม 3 module ต้องถูกต้องหลังการแก้/ลบ
 * - Orphan detection: เมื่อ parent ถูกลบ ลูกต้องถูกนับถูกต้อง
 */

function seedFullChain() {
  const req = requirementsRepo.create({
    title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
    description: "",
    category: "Functional",
    priority: "Must",
    ownerId: "u1",
  });
  const task1 = tasksRepo.create({
    title: "สร้าง API login",
    description: "",
    requirementId: req.id,
    assigneeId: "u2",
    role: "Dev",
  });
  const task2 = tasksRepo.create({
    title: "ออกแบบ UI login",
    description: "",
    requirementId: req.id,
    assigneeId: "u3",
    role: "Dev",
  });
  const defect1 = defectsRepo.create({
    title: "Login ไม่ hash password",
    description: "",
    taskId: task1.id,
    type: "Code Bug",
    severity: "Critical",
    reporterId: "u4",
  });
  const defect2 = defectsRepo.create({
    title: "UI ไม่แสดง error message",
    description: "",
    taskId: task2.id,
    type: "Design Gap",
    severity: "Medium",
    reporterId: "u4",
  });
  const defect3 = defectsRepo.create({
    title: "Session timeout ไม่ redirect",
    description: "",
    taskId: task1.id,
    type: "Code Bug",
    severity: "High",
    reporterId: "u8",
  });

  return { req, task1, task2, defect1, defect2, defect3 };
}

describe("Cross-Module: Cascade Delete (FR4.4)", () => {
  it("ลบ Requirement → Task ทั้งหมดใต้มันต้องถูกลบตาม", () => {
    const { req, task1, task2 } = seedFullChain();

    // ก่อนลบ: ต้องมี task 2 ตัวผูกกับ req นี้
    expect(tasksRepo.list().filter((t) => t.requirementId === req.id)).toHaveLength(2);

    // ลบ Task ที่ผูกกับ req ก่อน แล้วลบ req
    const trace = traceForward(req.id, tasksRepo.list(), defectsRepo.list());
    const taskIds = new Set(trace.tasks.map((t) => t.id));
    defectsRepo.removeWhere((d) => taskIds.has(d.taskId));
    tasksRepo.removeWhere((t) => t.requirementId === req.id);
    requirementsRepo.remove(req.id);

    // หลังลบ
    expect(requirementsRepo.find(req.id)).toBeNull();
    expect(tasksRepo.find(task1.id)).toBeNull();
    expect(tasksRepo.find(task2.id)).toBeNull();
  });

  it("ลบ Requirement → Defect ที่อยู่ใต้ Task ของ Requirement นั้นต้องหายด้วย", () => {
    const { req, defect1, defect2, defect3 } = seedFullChain();

    const trace = traceForward(req.id, tasksRepo.list(), defectsRepo.list());
    const taskIds = new Set(trace.tasks.map((t) => t.id));
    defectsRepo.removeWhere((d) => taskIds.has(d.taskId));
    tasksRepo.removeWhere((t) => t.requirementId === req.id);
    requirementsRepo.remove(req.id);

    expect(defectsRepo.find(defect1.id)).toBeNull();
    expect(defectsRepo.find(defect2.id)).toBeNull();
    expect(defectsRepo.find(defect3.id)).toBeNull();
  });

  it("ลบ Requirement ที่ไม่มีลูก ไม่ส่งผลกระทบต่อ Task/Defect ของ Requirement อื่น", () => {
    const { req } = seedFullChain();
    const loneReq = requirementsRepo.create({
      title: "ไม่มีลูก",
      description: "",
      category: "Non-Functional",
      priority: "Could",
      ownerId: "u5",
    });

    const taskCountBefore = tasksRepo.list().length;
    const defectCountBefore = defectsRepo.list().length;

    requirementsRepo.remove(loneReq.id);

    // Task/Defect ที่ผูกกับ req อื่นยังอยู่ครบ
    expect(tasksRepo.list()).toHaveLength(taskCountBefore);
    expect(defectsRepo.list()).toHaveLength(defectCountBefore);
    expect(requirementsRepo.find(req.id)).not.toBeNull();
  });
});

describe("Cross-Module: Cascade Delete Task (FR4.5)", () => {
  it("ลบ Task → Defect ทั้งหมดใต้ Task นั้นต้องถูกลบตาม", () => {
    const { task1, defect1, defect3, defect2 } = seedFullChain();

    // task1 มี defect 2 ตัว (defect1, defect3)
    defectsRepo.removeWhere((d) => d.taskId === task1.id);
    tasksRepo.remove(task1.id);

    expect(tasksRepo.find(task1.id)).toBeNull();
    expect(defectsRepo.find(defect1.id)).toBeNull();
    expect(defectsRepo.find(defect3.id)).toBeNull();
    // defect2 ของ task2 ยังอยู่
    expect(defectsRepo.find(defect2.id)).not.toBeNull();
  });

  it("ลบ Task ที่ไม่มี Defect ไม่ส่งผลต่อ Defect อื่น", () => {
    seedFullChain();
    const req2 = requirementsRepo.create({
      title: "อีกตัว",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    const loneTask = tasksRepo.create({
      title: "Task เปล่า",
      description: "",
      requirementId: req2.id,
      assigneeId: "u6",
      role: "Dev",
    });

    const defectCountBefore = defectsRepo.list().length;
    tasksRepo.remove(loneTask.id);
    expect(defectsRepo.list()).toHaveLength(defectCountBefore);
  });
});

describe("Cross-Module: Traceability หลังการแก้ไข", () => {
  it("เมื่อย้าย Task ไป Requirement อื่น สายเชื่อมโยงของ Requirement เดิมต้องลดลง", () => {
    const { req, task1 } = seedFullChain();
    const reqB = requirementsRepo.create({
      title: "Requirement B",
      description: "",
      category: "Functional",
      priority: "Could",
      ownerId: "u5",
    });

    // ก่อนย้าย: req มี 2 tasks
    expect(
      traceForward(req.id, tasksRepo.list(), defectsRepo.list()).tasks,
    ).toHaveLength(2);

    // ย้าย task1 ไป reqB
    tasksRepo.update(task1.id, { requirementId: reqB.id });

    // หลังย้าย: req เหลือ 1 task, reqB มี 1 task
    expect(
      traceForward(req.id, tasksRepo.list(), defectsRepo.list()).tasks,
    ).toHaveLength(1);
    expect(
      traceForward(reqB.id, tasksRepo.list(), defectsRepo.list()).tasks,
    ).toHaveLength(1);
    // defect ที่ผูกกับ task1 ย้ายตามไปด้วย (ยังผูกกับ task1.id)
    expect(
      traceForward(reqB.id, tasksRepo.list(), defectsRepo.list()).defects,
    ).toHaveLength(2); // defect1, defect3
  });

  it("traceBackward ยังถูกต้องหลังย้าย Task", () => {
    const { req, task1, defect1 } = seedFullChain();
    const reqB = requirementsRepo.create({
      title: "Requirement B",
      description: "",
      category: "Functional",
      priority: "Could",
      ownerId: "u5",
    });

    tasksRepo.update(task1.id, { requirementId: reqB.id });

    const trace = traceBackward(
      defectsRepo.find(defect1.id)!,
      tasksRepo.list(),
      requirementsRepo.list(),
    );
    expect(trace.task?.id).toBe(task1.id);
    expect(trace.requirement?.id).toBe(reqB.id);
    expect(trace.requirement?.id).not.toBe(req.id);
  });

  it("เมื่อลบ Task แล้ว traceBackward จาก Defect ที่เหลือต้องคืน null ไม่ล้ม", () => {
    const { task1, defect1 } = seedFullChain();

    // ลบ task แต่ไม่ลบ defect (จำลองกรณี orphan)
    tasksRepo.remove(task1.id);

    const defect = defectsRepo.find(defect1.id);
    expect(defect).not.toBeNull();

    const trace = traceBackward(defect!, tasksRepo.list(), requirementsRepo.list());
    expect(trace.task).toBeNull();
    expect(trace.requirement).toBeNull();
  });
});

describe("Cross-Module: Orphan Detection ในสถานการณ์ซับซ้อน", () => {
  it("countOrphansOnRequirementDelete ต้องนับเฉพาะ Defect ที่อยู่ใต้ Task ของ Requirement นั้น", () => {
    const { req } = seedFullChain();
    // เพิ่ม req อื่นที่มี task + defect ของตัวเอง
    const otherReq = requirementsRepo.create({
      title: "อีกตัว",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u5",
    });
    const otherTask = tasksRepo.create({
      title: "Task ของอีกตัว",
      description: "",
      requirementId: otherReq.id,
      assigneeId: "u6",
      role: "Dev",
    });
    defectsRepo.create({
      title: "Defect ของอีกตัว",
      description: "",
      taskId: otherTask.id,
      type: "SA Gap",
      severity: "Low",
      reporterId: "u12",
    });

    const counts = countOrphansOnRequirementDelete(
      req.id,
      tasksRepo.list(),
      defectsRepo.list(),
    );
    // req มี 2 tasks, 3 defects — ต้องไม่นับ defect ของ otherReq
    expect(counts.tasks).toBe(2);
    expect(counts.defects).toBe(3);
  });

  it("countOrphansOnTaskDelete ต้องนับเฉพาะ Defect ที่ผูกกับ Task ตัวนั้น", () => {
    const { task1, task2 } = seedFullChain();

    // task1 มี 2 defects, task2 มี 1 defect
    expect(countOrphansOnTaskDelete(task1.id, defectsRepo.list()).defects).toBe(2);
    expect(countOrphansOnTaskDelete(task2.id, defectsRepo.list()).defects).toBe(1);
  });

  it("findRequirementsWithoutTasks ต้องอัปเดตถูกต้องเมื่อ Task ถูกลบ", () => {
    const { req, task1, task2 } = seedFullChain();

    // ก่อนลบ: req มี task — ไม่อยู่ใน orphan list
    expect(
      findRequirementsWithoutTasks(requirementsRepo.list(), tasksRepo.list()).map(
        (r) => r.id,
      ),
    ).not.toContain(req.id);

    // ลบ task ทั้งหมดของ req
    tasksRepo.remove(task1.id);
    tasksRepo.remove(task2.id);

    // หลังลบ: req ไม่มี task แล้ว — ต้องอยู่ใน orphan list
    expect(
      findRequirementsWithoutTasks(requirementsRepo.list(), tasksRepo.list()).map(
        (r) => r.id,
      ),
    ).toContain(req.id);
  });

  it("Defect หลายตัวจาก Task เดียวกันต้องถูกนับแยกไม่ซ้ำกัน", () => {
    const { task1 } = seedFullChain();

    // เพิ่ม defect อีก 5 ตัวใน task1
    for (let i = 0; i < 5; i++) {
      defectsRepo.create({
        title: `Defect เพิ่ม ${i}`,
        description: "",
        taskId: task1.id,
        type: "Test Escape",
        severity: "Low",
        reporterId: "u12",
      });
    }

    // task1 ตอนนี้มี 2 (เดิม) + 5 (ใหม่) = 7 defects
    expect(countOrphansOnTaskDelete(task1.id, defectsRepo.list()).defects).toBe(7);
  });
});

describe("Cross-Module: ข้อมูลว่าง (zero-state)", () => {
  it("traceForward เมื่อไม่มีข้อมูลเลยต้องคืนรายการว่างทุกระดับ", () => {
    // ไม่เรียก seedFullChain — localStorage ว่างจาก beforeEach
    const trace = traceForward("ไม่มี", [], []);
    expect(trace.tasks).toEqual([]);
    expect(trace.defects).toEqual([]);
  });

  it("findRequirementsWithoutTasks เมื่อไม่มี Requirement เลย ต้องคืนรายการว่าง", () => {
    expect(findRequirementsWithoutTasks([], [])).toEqual([]);
  });

  it("countOrphansOnRequirementDelete เมื่อ Requirement ไม่มีลูก ต้องคืน 0 ทั้งคู่", () => {
    const req = requirementsRepo.create({
      title: "ไม่มีลูก",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    const counts = countOrphansOnRequirementDelete(
      req.id,
      tasksRepo.list(),
      defectsRepo.list(),
    );
    expect(counts).toEqual({ tasks: 0, defects: 0 });
  });
});
