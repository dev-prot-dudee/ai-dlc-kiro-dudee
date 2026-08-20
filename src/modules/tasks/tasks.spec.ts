import { describe, it, expect } from "vitest";
import { tasksRepo } from "./tasks.repo";
import { requirementsRepo } from "../requirements/requirements.repo";
import { defectsRepo } from "../defects/defects.repo";
import { ValidationError } from "../../shared/types";
import { STORAGE_KEYS, writeCollection } from "../../shared/storage";
import {
  activeBlockers,
  daysLate,
  estimateVariance,
  isBlocked,
} from "./task-rules";
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

  // ------------------------------------------------------------------
  // Module 02 — ส่วนที่ยกระดับจาก MVP ให้ครบตามสไลด์
  // ------------------------------------------------------------------

  describe("ค่าเริ่มต้นของ field บังคับใน M02", () => {
    it("สร้าง Task โดยไม่ระบุ phase, workPattern, deadlineType ต้องได้ค่าเริ่มต้นครบ", () => {
      const req = makeReq();
      const created = tasksRepo.create(draft({ requirementId: req.id }));

      expect(created.phase).toBe("Development");
      expect(created.workPattern).toBe("Independent");
      expect(created.deadlineType).toBe("Committed");
      expect(created.blockedByIds).toEqual([]);
    });

    it("ค่านอกชุดที่กำหนดต้องถูกปฏิเสธพร้อมบอกชุดค่าที่รับได้", () => {
      const req = makeReq();

      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, phase: "Production" })),
      ).toThrow(ValidationError);
      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, workPattern: "Blocked" })),
      ).toThrow(ValidationError);
      try {
        tasksRepo.create(draft({ requirementId: req.id, deadlineType: "Guessed" }));
        expect.unreachable("ควรถูกปฏิเสธก่อนถึงบรรทัดนี้");
      } catch (error) {
        expect((error as ValidationError).field).toBe("deadlineType");
        expect((error as ValidationError).message).toContain("Committed");
      }
    });
  });

  describe("Conditional fields ตามตำแหน่ง (M02)", () => {
    it("งานของ SA สร้างได้โดยยังไม่มี Deliverable แต่ปิดงานไม่ได้ถ้ายังไม่ระบุ", () => {
      const req = makeReq();
      const created = tasksRepo.create(draft({ requirementId: req.id, role: "SA" }));

      // ตอนแตกงานยังไม่รู้ว่าจะส่งมอบอะไร จึงต้องสร้างได้ก่อน
      expect(created.approvalStatus).toBe("Pending");

      try {
        tasksRepo.update(created.id, { completedAt: "2026-03-05" });
        expect.unreachable("ปิดงานโดยไม่มี Deliverable ต้องถูกปฏิเสธ");
      } catch (error) {
        expect((error as ValidationError).field).toBe("deliverable");
      }
    });

    it("งานของ SA ที่ Deliverable ยังไม่ถูกอนุมัติ ต้องปิดไม่ได้", () => {
      const req = makeReq();
      const created = tasksRepo.create(
        draft({
          requirementId: req.id,
          role: "SA",
          deliverable: "spec ของหน้าเข้าสู่ระบบ",
        }),
      );

      try {
        tasksRepo.update(created.id, { completedAt: "2026-03-05" });
        expect.unreachable("เอกสารที่ยังไม่ approve ถือว่างานยังไม่จบ");
      } catch (error) {
        expect((error as ValidationError).field).toBe("approvalStatus");
      }

      const closed = tasksRepo.update(created.id, {
        approvalStatus: "Approved",
        completedAt: "2026-03-05",
      });
      expect(closed.completedAt).toBe("2026-03-05");
    });

    it("งานของ UX ปิดไม่ได้ถ้าไม่มีลิงก์งานออกแบบ และลิงก์ที่ไม่ใช่ URL ต้องถูกปฏิเสธทุกจังหวะ", () => {
      const req = makeReq();

      try {
        tasksRepo.create(
          draft({ requirementId: req.id, role: "UX", figmaLink: "figma.com/abc" }),
        );
        expect.unreachable("ลิงก์ที่ไม่มี scheme ต้องถูกปฏิเสธ");
      } catch (error) {
        expect((error as ValidationError).field).toBe("figmaLink");
      }

      const created = tasksRepo.create(draft({ requirementId: req.id, role: "UX" }));
      expect(created.revisionCount).toBe(0);

      expect(() => tasksRepo.update(created.id, { completedAt: "2026-03-05" })).toThrow(
        ValidationError,
      );

      const closed = tasksRepo.update(created.id, {
        figmaLink: "https://figma.com/file/abc",
        revisionCount: 2,
        completedAt: "2026-03-05",
      });
      expect(closed.revisionCount).toBe(2);
    });

    it("งานของ Tester ได้ตัวนับเริ่มต้นเป็น 0 และค่าติดลบต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      const created = tasksRepo.create(draft({ requirementId: req.id, role: "Tester" }));

      expect(created.passCount).toBe(0);
      expect(created.failCount).toBe(0);

      expect(() => tasksRepo.update(created.id, { passCount: 5, failCount: -1 })).toThrow(
        ValidationError,
      );

      const updated = tasksRepo.update(created.id, { passCount: 12, failCount: 1 });
      expect(updated.passCount).toBe(12);
    });

    it("งานของ Dev ไม่มี field เพิ่มให้กรอกเลย", () => {
      const req = makeReq();
      const created = tasksRepo.create(draft({ requirementId: req.id, role: "Dev" }));

      expect(created.deliverable).toBeUndefined();
      expect(created.figmaLink).toBeUndefined();
      expect(created.passCount).toBeUndefined();
    });

    it("เปลี่ยนตำแหน่งแล้ว field ของตำแหน่งเดิมต้องไม่ค้างอยู่ในข้อมูลที่บันทึก", () => {
      const req = makeReq();
      const created = tasksRepo.create(
        draft({
          requirementId: req.id,
          role: "UX",
          figmaLink: "https://figma.com/file/abc",
          revisionCount: 1,
        }),
      );

      const updated = tasksRepo.update(created.id, { role: "Dev" });

      expect(updated.figmaLink).toBeUndefined();
      expect(updated.revisionCount).toBeUndefined();
      // และต้องหายจากที่เก็บจริง ไม่ใช่หายแค่ค่าที่คืนกลับมา
      expect(tasksRepo.find(created.id)?.figmaLink).toBeUndefined();
    });
  });

  describe("Days Late และ Delay Cause (M02)", () => {
    it("ส่งช้ากว่ากำหนดแล้วไม่ระบุสาเหตุต้องถูกปฏิเสธ", () => {
      const req = makeReq();

      try {
        tasksRepo.create(
          draft({
            requirementId: req.id,
            dueDate: "2026-03-01",
            completedAt: "2026-03-05",
          }),
        );
        expect.unreachable("ควรถูกปฏิเสธเพราะยังไม่ระบุสาเหตุความล่าช้า");
      } catch (error) {
        expect((error as ValidationError).field).toBe("delayCause");
        expect((error as ValidationError).message).toContain("Blocked");
      }
    });

    it("ระบุสาเหตุแล้วต้องบันทึกได้", () => {
      const req = makeReq();
      const created = tasksRepo.create(
        draft({
          requirementId: req.id,
          dueDate: "2026-03-01",
          completedAt: "2026-03-05",
          delayCause: "Blocked",
        }),
      );

      expect(created.delayCause).toBe("Blocked");
      expect(daysLate(created, "2026-03-10")).toBe(4);
    });

    it("ส่งตรงกำหนดไม่ต้องระบุสาเหตุ", () => {
      const req = makeReq();
      expect(() =>
        tasksRepo.create(
          draft({
            requirementId: req.id,
            dueDate: "2026-03-01",
            completedAt: "2026-03-01",
          }),
        ),
      ).not.toThrow();
    });

    it("วันที่ที่ไม่มีอยู่จริงต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, dueDate: "2026-02-31" })),
      ).toThrow(ValidationError);
    });
  });

  describe("Estimate Variance (M02)", () => {
    it("ประมาณการติดลบต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, initialEstimateHours: -1 })),
      ).toThrow(ValidationError);
    });

    it("มีทั้งประมาณการและเวลาที่ใช้จริงต้องคำนวณ variance ได้เอง", () => {
      const req = makeReq();
      const created = tasksRepo.create(
        draft({ requirementId: req.id, initialEstimateHours: 8, actualHours: 10 }),
      );

      expect(estimateVariance(created)).toEqual({ hours: 2, percent: 25 });
    });
  });

  describe("Blocked By และ PM alert view (M02)", () => {
    it("ผูกกับ Task ที่ไม่มีอยู่จริงต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      expect(() =>
        tasksRepo.create(draft({ requirementId: req.id, blockedByIds: ["ไม่มีจริง"] })),
      ).toThrow(ValidationError);
    });

    it("ผูก blocker ที่มีอยู่จริงได้ และ PM ต้องเห็นว่างานนี้ติดบล็อค", () => {
      const req = makeReq();
      const blocker = tasksRepo.create(
        draft({ requirementId: req.id, title: "ออกแบบหน้าจอ" }),
      );
      const blocked = tasksRepo.create(
        draft({ requirementId: req.id, title: "ทำหน้าจอ", blockedByIds: [blocker.id] }),
      );

      const all = tasksRepo.list();
      expect(isBlocked(blocked, all)).toBe(true);
      expect(activeBlockers(blocked, all)[0]?.title).toBe("ออกแบบหน้าจอ");
    });

    it("blocker ที่ทำเสร็จแล้วต้องหลุดออกจาก PM alert เอง", () => {
      const req = makeReq();
      const blocker = tasksRepo.create(draft({ requirementId: req.id }));
      const blocked = tasksRepo.create(
        draft({ requirementId: req.id, blockedByIds: [blocker.id] }),
      );

      tasksRepo.update(blocker.id, { completedAt: "2026-03-04" });

      expect(isBlocked(blocked, tasksRepo.list())).toBe(false);
    });

    it("บล็อคตัวเองต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      const task = tasksRepo.create(draft({ requirementId: req.id }));

      expect(() => tasksRepo.update(task.id, { blockedByIds: [task.id] })).toThrow(
        ValidationError,
      );
    });

    it("การผูกที่ทำให้บล็อควนกลับต้องถูกปฏิเสธ", () => {
      const req = makeReq();
      const a = tasksRepo.create(draft({ requirementId: req.id, title: "A" }));
      const b = tasksRepo.create(
        draft({ requirementId: req.id, title: "B", blockedByIds: [a.id] }),
      );

      try {
        tasksRepo.update(a.id, { blockedByIds: [b.id] });
        expect.unreachable("ควรถูกปฏิเสธเพราะจะเกิดวงวน");
      } catch (error) {
        expect((error as ValidationError).field).toBe("blockedByIds");
        expect((error as ValidationError).message).toContain("วนกลับ");
      }
    });
  });

  describe("ข้อมูลที่บันทึกไว้ก่อนมี M02 (ความเข้ากันได้ย้อนหลัง)", () => {
    it("อ่าน Task รุ่นเก่าที่ไม่มี field ใหม่ต้องได้ค่าเริ่มต้น ไม่ใช่ค่าว่าง", () => {
      // เขียนตรงเข้าที่เก็บด้วยรูปแบบของรุ่นก่อน M02
      writeCollection(STORAGE_KEYS.tasks, [
        {
          id: "task-legacy",
          title: "งานเก่า",
          description: "",
          requirementId: "req-legacy",
          assigneeId: "u2",
          role: "Dev",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]);

      const loaded = tasksRepo.find("task-legacy");

      expect(loaded?.phase).toBe("Development");
      expect(loaded?.workPattern).toBe("Independent");
      expect(loaded?.deadlineType).toBe("Committed");
      expect(loaded?.blockedByIds).toEqual([]);
    });

    it("แก้ Task รุ่นเก่าต้องผ่าน validation ได้โดยไม่ต้องกรอก field ใหม่ทั้งหมด", () => {
      writeCollection(STORAGE_KEYS.tasks, [
        {
          id: "task-legacy",
          title: "งานเก่า",
          description: "",
          requirementId: "req-legacy",
          assigneeId: "u2",
          role: "Dev",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]);

      const updated = tasksRepo.update("task-legacy", { title: "งานเก่าที่แก้แล้ว" });

      expect(updated.title).toBe("งานเก่าที่แก้แล้ว");
      expect(updated.phase).toBe("Development");
    });
  });
});
