import { describe, it, expect } from "vitest";
import { requirementsRepo } from "../modules/requirements/requirements.repo";
import { tasksRepo } from "../modules/tasks/tasks.repo";
import { defectsRepo } from "../modules/defects/defects.repo";
import { ValidationError } from "./types";
import { readCollection, writeCollection, importAll, STORAGE_KEYS } from "./storage";
import type { Requirement } from "./types";

/**
 * Negative / Fail Test Cases
 *
 * ทดสอบกรณีที่ต้อง "ล้มเหลวอย่างถูกต้อง" — ระบบต้องปฏิเสธ input ผิด,
 * แจ้ง error ที่เข้าใจได้, และไม่ทำให้ข้อมูลเดิมเสียหาย
 */

describe("Fail Cases — Requirement: ข้อมูลที่ต้องถูกปฏิเสธ", () => {
  it("FAIL: สร้างโดยไม่กรอก title → ต้อง throw ValidationError ไม่ใช่สร้างสำเร็จ", () => {
    expect(() =>
      requirementsRepo.create({
        title: "",
        description: "",
        category: "Functional",
        priority: "Should",
        ownerId: "u1",
      }),
    ).toThrow(ValidationError);

    // ต้องไม่มีรายการถูกสร้างขึ้น
    expect(requirementsRepo.list()).toHaveLength(0);
  });

  it("FAIL: สร้างด้วย category ที่ไม่มีในระบบ → ต้อง throw", () => {
    expect(() =>
      requirementsRepo.create({
        title: "ดูเหมือนถูก",
        description: "",
        category: "ไม่มีประเภทนี้" as "Functional",
        priority: "Must",
        ownerId: "u1",
      }),
    ).toThrow(ValidationError);
  });

  it("FAIL: สร้างด้วย priority ที่ไม่อยู่ใน MoSCoW → ต้อง throw", () => {
    expect(() =>
      requirementsRepo.create({
        title: "ดูเหมือนถูก",
        description: "",
        category: "Functional",
        priority: "ด่วนมาก" as "Must",
        ownerId: "u1",
      }),
    ).toThrow(ValidationError);
  });

  it("FAIL: แก้ไข title ให้เป็นค่าว่าง → ต้อง throw และค่าเดิมยังอยู่", () => {
    const created = requirementsRepo.create({
      title: "ค่าเดิม",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });

    expect(() => requirementsRepo.update(created.id, { title: "" })).toThrow(
      ValidationError,
    );
    expect(requirementsRepo.find(created.id)?.title).toBe("ค่าเดิม");
  });

  it("FAIL: แก้ไข category ให้เป็นค่าผิด → ต้อง throw และ category เดิมยังอยู่", () => {
    const created = requirementsRepo.create({
      title: "ทดสอบ",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });

    expect(() =>
      requirementsRepo.update(created.id, { category: "อื่นๆ" as "Functional" }),
    ).toThrow(ValidationError);
    expect(requirementsRepo.find(created.id)?.category).toBe("Functional");
  });
});

describe("Fail Cases — Task: ข้อมูลที่ต้องถูกปฏิเสธ", () => {
  it("FAIL: สร้าง Task โดยไม่ผูก Requirement → ต้อง throw", () => {
    expect(() =>
      tasksRepo.create({
        title: "Task ลอย",
        description: "",
        requirementId: "",
        assigneeId: "u1",
        role: "Dev",
      }),
    ).toThrow(ValidationError);
    expect(tasksRepo.list()).toHaveLength(0);
  });

  it("FAIL: สร้าง Task ด้วย role ที่ไม่มีในระบบ → ต้อง throw", () => {
    expect(() =>
      tasksRepo.create({
        title: "งาน",
        description: "",
        requirementId: "req-1",
        assigneeId: "u1",
        role: "PM" as "Dev",
      }),
    ).toThrow(ValidationError);
  });

  it("FAIL: สร้าง Task โดยไม่กรอก title → ต้อง throw", () => {
    expect(() =>
      tasksRepo.create({
        title: "",
        description: "",
        requirementId: "req-1",
        assigneeId: "u1",
        role: "Dev",
      }),
    ).toThrow(ValidationError);
  });

  it("FAIL: แก้ role ให้เป็นค่าที่ไม่มี → ต้อง throw และค่าเดิมยังอยู่", () => {
    const req = requirementsRepo.create({
      title: "Req",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    const task = tasksRepo.create({
      title: "งาน",
      description: "",
      requirementId: req.id,
      assigneeId: "u1",
      role: "Dev",
    });

    expect(() => tasksRepo.update(task.id, { role: "Manager" as "Dev" })).toThrow(
      ValidationError,
    );
    expect(tasksRepo.find(task.id)?.role).toBe("Dev");
  });
});

describe("Fail Cases — Defect: ข้อมูลที่ต้องถูกปฏิเสธ", () => {
  function makeTaskForDefect() {
    const req = requirementsRepo.create({
      title: "Req",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    return tasksRepo.create({
      title: "Task",
      description: "",
      requirementId: req.id,
      assigneeId: "u1",
      role: "Dev",
    });
  }

  it("FAIL: สร้าง Defect โดยไม่ผูก Task → ต้อง throw", () => {
    expect(() =>
      defectsRepo.create({
        title: "ปัญหา",
        description: "",
        taskId: "",
        type: "Code Bug",
        severity: "High",
        reporterId: "u1",
      }),
    ).toThrow(ValidationError);
    expect(defectsRepo.list()).toHaveLength(0);
  });

  it("FAIL: สร้าง Defect ด้วย type ที่ไม่อยู่ใน 5 ค่า → ต้อง throw", () => {
    const task = makeTaskForDefect();
    expect(() =>
      defectsRepo.create({
        title: "ปัญหา",
        description: "",
        taskId: task.id,
        type: "UI Bug" as "Code Bug",
        severity: "High",
        reporterId: "u1",
      }),
    ).toThrow(ValidationError);
  });

  it("FAIL: สร้าง Defect ด้วย severity ที่ไม่อยู่ในชุดที่กำหนด → ต้อง throw", () => {
    const task = makeTaskForDefect();
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

  it("FAIL: สร้าง Defect โดยไม่กรอก title → ต้อง throw", () => {
    const task = makeTaskForDefect();
    expect(() =>
      defectsRepo.create({
        title: "",
        description: "",
        taskId: task.id,
        type: "Code Bug",
        severity: "Medium",
        reporterId: "u1",
      }),
    ).toThrow(ValidationError);
  });

  it("FAIL: แก้ type เป็นค่าผิด → ต้อง throw และค่าเดิมยังอยู่", () => {
    const task = makeTaskForDefect();
    const defect = defectsRepo.create({
      title: "ปัญหา",
      description: "",
      taskId: task.id,
      type: "Code Bug",
      severity: "Medium",
      reporterId: "u1",
    });

    expect(() =>
      defectsRepo.update(defect.id, { type: "Unknown" as "Code Bug" }),
    ).toThrow(ValidationError);
    expect(defectsRepo.find(defect.id)?.type).toBe("Code Bug");
  });
});

describe("Fail Cases — Storage: การจัดการข้อมูลที่ผิดปกติ", () => {
  it("FAIL: อ่านข้อมูลที่ไม่ใช่ JSON → ต้อง throw StorageCorruptError", () => {
    localStorage.setItem(STORAGE_KEYS.requirements, "ไม่ใช่ JSON เลย!!!");
    expect(() => readCollection<Requirement>(STORAGE_KEYS.requirements)).toThrow();
  });

  it("FAIL: อ่านข้อมูลที่เป็น JSON แต่ไม่ใช่ array → ต้อง throw", () => {
    localStorage.setItem(STORAGE_KEYS.requirements, JSON.stringify({ a: 1 }));
    expect(() => readCollection<Requirement>(STORAGE_KEYS.requirements)).toThrow();
  });

  it("FAIL: import ข้อมูลที่เป็น null → ต้อง throw และข้อมูลเดิมไม่หาย", () => {
    writeCollection(STORAGE_KEYS.requirements, [
      {
        id: "r1",
        title: "เดิม",
        description: "",
        category: "Functional" as const,
        priority: "Should" as const,
        ownerId: "u1",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);

    expect(() => importAll("null")).toThrow();
    expect(readCollection<Requirement>(STORAGE_KEYS.requirements)).toHaveLength(1);
  });

  it("FAIL: import ข้อมูลที่เป็น array เปล่า (ไม่ใช่ bundle format) → ต้อง throw", () => {
    expect(() => importAll("[]")).toThrow();
  });

  it("FAIL: import ข้อมูล version ที่ไม่รู้จัก → ต้อง throw", () => {
    const badBundle = JSON.stringify({
      version: 99,
      exportedAt: "2026-01-01T00:00:00Z",
      requirements: [],
      tasks: [],
      defects: [],
    });
    expect(() => importAll(badBundle)).toThrow();
  });

  it("FAIL: import string ว่าง → ต้อง throw", () => {
    expect(() => importAll("")).toThrow();
  });
});

describe("Fail Cases — ข้อมูลไม่สอดคล้อง (Integrity)", () => {
  it("FAIL: update รายการที่ถูกลบไปแล้ว → ต้อง throw", () => {
    const created = requirementsRepo.create({
      title: "จะลบ",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    requirementsRepo.remove(created.id);

    expect(() =>
      requirementsRepo.update(created.id, { title: "พยายามแก้" }),
    ).toThrow(ValidationError);
  });

  it("FAIL: update Task ที่ถูกลบไปแล้ว → ต้อง throw", () => {
    const req = requirementsRepo.create({
      title: "Req",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    const task = tasksRepo.create({
      title: "งาน",
      description: "",
      requirementId: req.id,
      assigneeId: "u1",
      role: "Dev",
    });
    tasksRepo.remove(task.id);

    expect(() => tasksRepo.update(task.id, { title: "พยายามแก้" })).toThrow(
      ValidationError,
    );
  });

  it("FAIL: update Defect ที่ถูกลบไปแล้ว → ต้อง throw", () => {
    const req = requirementsRepo.create({
      title: "Req",
      description: "",
      category: "Functional",
      priority: "Should",
      ownerId: "u1",
    });
    const task = tasksRepo.create({
      title: "Task",
      description: "",
      requirementId: req.id,
      assigneeId: "u1",
      role: "Dev",
    });
    const defect = defectsRepo.create({
      title: "ปัญหา",
      description: "",
      taskId: task.id,
      type: "Code Bug",
      severity: "Medium",
      reporterId: "u1",
    });
    defectsRepo.remove(defect.id);

    expect(() => defectsRepo.update(defect.id, { title: "พยายามแก้" })).toThrow(
      ValidationError,
    );
  });
});
