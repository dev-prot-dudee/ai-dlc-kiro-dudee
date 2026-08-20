import type { Defect, Requirement, Task } from "./types";

/**
 * Factory สร้างข้อมูลทดสอบ
 *
 * กฎการใช้: แต่ละ test ระบุเฉพาะ field ที่เกี่ยวกับสิ่งที่ตัวเองทดสอบผ่าน
 * overrides ที่เหลือให้ factory เติม เพื่อให้อ่าน test แล้วเห็นทันทีว่าอะไร
 * คือตัวแปรของ test นั้น
 */

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function makeRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: nextId("req"),
    title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
    description: "",
    category: "Functional",
    priority: "Should",
    ownerId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: nextId("task"),
    title: "สร้างหน้าเข้าสู่ระบบ",
    description: "",
    requirementId: "req-1",
    assigneeId: "user-1",
    role: "Dev",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeDefect(overrides: Partial<Defect> = {}): Defect {
  return {
    id: nextId("defect"),
    title: "กดปุ่มเข้าสู่ระบบแล้วไม่มีอะไรเกิดขึ้น",
    description: "",
    taskId: "task-1",
    type: "Code Bug",
    severity: "Medium",
    reporterId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
