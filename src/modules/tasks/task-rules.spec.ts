import { describe, it, expect } from "vitest";
import { makeTask } from "../../shared/test-factories";
import {
  activeBlockers,
  blockerCandidates,
  daysLate,
  diffDays,
  estimateVariance,
  formatVariance,
  isBlocked,
  isOverdueOpen,
  isValidDate,
  roleFieldRows,
  stripForeignRoleFields,
  validateBlockerIds,
  withTaskDefaults,
  wouldCreateCycle,
} from "./task-rules";
import type { Task } from "../../shared/types";

const TODAY = "2026-03-10";

describe("ตรรกะของ Task Management (M02)", () => {
  describe("การเติมค่าเริ่มต้นให้ข้อมูลที่บันทึกไว้ก่อนมี field ใหม่", () => {
    it("record เก่าที่ไม่มี phase, workPattern, deadlineType, blockedByIds ต้องได้ค่าเริ่มต้นที่ปลอดภัย", () => {
      // ข้อมูลจาก localStorage รุ่นก่อน M02 — ขาด field ใหม่ทั้งหมด
      const legacy = {
        id: "task-legacy",
        title: "งานเก่า",
        description: "",
        requirementId: "req-1",
        assigneeId: "u2",
        role: "Dev",
        createdAt: "2026-01-01T00:00:00.000Z",
      } as unknown as Task;

      const normalized = withTaskDefaults(legacy);

      expect(normalized.phase).toBe("Development");
      expect(normalized.workPattern).toBe("Independent");
      expect(normalized.deadlineType).toBe("Committed");
      expect(normalized.blockedByIds).toEqual([]);
    });

    it("ค่าที่มีอยู่แล้วและถูกต้องต้องไม่ถูกทับ", () => {
      const task = makeTask({
        phase: "Maintenance",
        workPattern: "Sequential",
        deadlineType: "Imposed",
        blockedByIds: ["task-1"],
      });

      expect(withTaskDefaults(task)).toEqual(task);
    });

    it("ค่าที่เพี้ยนนอกชุดที่กำหนดต้องถูกแทนด้วยค่าเริ่มต้น ไม่ใช่ปล่อยผ่าน", () => {
      const broken = makeTask({ phase: "Production" as never });
      expect(withTaskDefaults(broken).phase).toBe("Development");
    });
  });

  describe("Days Late", () => {
    it("ส่งก่อนหรือตรงกำหนดต้องได้ 0 วัน", () => {
      const onTime = makeTask({ dueDate: "2026-03-05", completedAt: "2026-03-05" });
      const early = makeTask({ dueDate: "2026-03-05", completedAt: "2026-03-01" });

      expect(daysLate(onTime, TODAY)).toBe(0);
      expect(daysLate(early, TODAY)).toBe(0);
    });

    it("ส่งช้าต้องนับจำนวนวันจากกำหนดส่งถึงวันที่ทำเสร็จ", () => {
      const late = makeTask({ dueDate: "2026-03-05", completedAt: "2026-03-08" });
      expect(daysLate(late, TODAY)).toBe(3);
    });

    it("งานที่ยังไม่เสร็จและเลยกำหนดต้องนับถึงวันนี้ และถือเป็นงานเลยกำหนดที่ยังค้าง", () => {
      const overdue = makeTask({ dueDate: "2026-03-05" });

      expect(daysLate(overdue, TODAY)).toBe(5);
      expect(isOverdueOpen(overdue, TODAY)).toBe(true);
    });

    it("งานที่ยังไม่ถึงกำหนดต้องไม่ถูกนับว่าช้า", () => {
      const future = makeTask({ dueDate: "2026-03-20" });

      expect(daysLate(future, TODAY)).toBe(0);
      expect(isOverdueOpen(future, TODAY)).toBe(false);
    });

    it("ไม่ระบุกำหนดส่ง = ไม่มีความล่าช้าให้วัด", () => {
      expect(daysLate(makeTask(), TODAY)).toBe(0);
      expect(isOverdueOpen(makeTask(), TODAY)).toBe(false);
    });

    it("งานที่ส่งช้าแต่ปิดแล้ว ต้องไม่ค้างอยู่ในรายการเลยกำหนด", () => {
      const closedLate = makeTask({
        dueDate: "2026-03-01",
        completedAt: "2026-03-04",
        delayCause: "Blocked",
      });

      expect(daysLate(closedLate, TODAY)).toBe(3);
      expect(isOverdueOpen(closedLate, TODAY)).toBe(false);
    });
  });

  describe("Estimate Variance", () => {
    it("ขาดข้อมูลด้านใดด้านหนึ่งต้องคืน null ไม่ใช่เดาว่าตรงเป๊ะ", () => {
      expect(estimateVariance(makeTask({ initialEstimateHours: 8 }))).toBeNull();
      expect(estimateVariance(makeTask({ actualHours: 8 }))).toBeNull();
      expect(formatVariance(null)).toBe("—");
    });

    it("ใช้เวลาเกินประมาณการต้องได้ทั้งชั่วโมงและเปอร์เซ็นต์", () => {
      const task = makeTask({ initialEstimateHours: 8, actualHours: 12 });
      expect(estimateVariance(task)).toEqual({ hours: 4, percent: 50 });
      expect(formatVariance(estimateVariance(task))).toBe("+4 ชม. (+50%)");
    });

    it("ใช้เวลาน้อยกว่าประมาณการต้องได้ค่าลบ", () => {
      const task = makeTask({ initialEstimateHours: 10, actualHours: 7.5 });
      expect(estimateVariance(task)).toEqual({ hours: -2.5, percent: -25 });
    });

    it("ประมาณการเริ่มต้นเป็น 0 ต้องคืนเปอร์เซ็นต์เป็น null เพราะหารไม่ได้", () => {
      const task = makeTask({ initialEstimateHours: 0, actualHours: 5 });
      expect(estimateVariance(task)).toEqual({ hours: 5, percent: null });
      expect(formatVariance(estimateVariance(task))).toBe("+5 ชม.");
    });
  });

  describe("Blocked By และ PM alert", () => {
    it("blocker ที่ยังไม่เสร็จต้องนับเป็นการบล็อคจริง", () => {
      const blocker = makeTask({ title: "ออกแบบหน้าจอ" });
      const blocked = makeTask({ blockedByIds: [blocker.id] });
      const all = [blocker, blocked];

      expect(activeBlockers(blocked, all)).toHaveLength(1);
      expect(isBlocked(blocked, all)).toBe(true);
    });

    it("blocker ที่ทำเสร็จแล้วต้องไม่บล็อคใครอีก", () => {
      const blocker = makeTask({ completedAt: "2026-03-02" });
      const blocked = makeTask({ blockedByIds: [blocker.id] });

      expect(isBlocked(blocked, [blocker, blocked])).toBe(false);
    });

    it("blocker ที่ถูกลบไปแล้วต้องไม่ทำให้งานค้างในสถานะบล็อคตลอดไป", () => {
      const blocked = makeTask({ blockedByIds: ["task-ที่ถูกลบแล้ว"] });
      expect(activeBlockers(blocked, [blocked])).toEqual([]);
      expect(isBlocked(blocked, [blocked])).toBe(false);
    });
  });

  describe("การกันการบล็อควนกลับ", () => {
    it("บล็อคตัวเองต้องถูกมองเป็นวงวน", () => {
      const task = makeTask();
      expect(wouldCreateCycle(task.id, task.id, [task])).toBe(true);
    });

    it("A รอ B แล้วให้ B รอ A ต้องถูกมองเป็นวงวน", () => {
      const a = makeTask({ title: "A" });
      const b = makeTask({ title: "B", blockedByIds: [a.id] });

      expect(wouldCreateCycle(a.id, b.id, [a, b])).toBe(true);
    });

    it("วงวนข้ามหลายชั้น (A→B→C แล้วให้ C รอ A) ต้องถูกจับได้", () => {
      const a = makeTask({ title: "A" });
      const b = makeTask({ title: "B", blockedByIds: [a.id] });
      const c = makeTask({ title: "C", blockedByIds: [b.id] });

      expect(wouldCreateCycle(a.id, c.id, [a, b, c])).toBe(true);
    });

    it("สายที่ไม่ย้อนกลับต้องผูกได้ตามปกติ", () => {
      const a = makeTask({ title: "A" });
      const b = makeTask({ title: "B" });

      expect(wouldCreateCycle(a.id, b.id, [a, b])).toBe(false);
    });

    it("ตัวเลือกในฟอร์มต้องตัดตัวเองและตัวที่จะทำให้วนกลับออกไปก่อน", () => {
      const a = makeTask({ title: "A" });
      const b = makeTask({ title: "B", blockedByIds: [a.id] });
      const c = makeTask({ title: "C" });

      const candidates = blockerCandidates(a.id, [a, b, c]).map((task) => task.id);

      expect(candidates).toEqual([c.id]);
    });

    it("ตอนสร้างใหม่ยังไม่มีใครชี้มาได้ ทุกตัวจึงเลือกเป็น blocker ได้", () => {
      const a = makeTask();
      expect(blockerCandidates(null, [a])).toHaveLength(1);
    });
  });

  describe("การตรวจรายการ blocker ทั้งชุด", () => {
    it("รายการว่างต้องผ่าน", () => {
      expect(validateBlockerIds(null, [], [])).toBeNull();
    });

    it("id ที่ไม่มีอยู่จริงต้องถูกปฏิเสธพร้อมบอกว่า id ใด", () => {
      const message = validateBlockerIds(null, ["ไม่มีจริง"], []);
      expect(message).toContain("ไม่พบ Task");
    });

    it("id ซ้ำในรายการต้องถูกปฏิเสธ", () => {
      const a = makeTask();
      expect(validateBlockerIds(null, [a.id, a.id], [a])).toContain("ซ้ำ");
    });

    it("การผูกที่ทำให้วนกลับต้องถูกปฏิเสธพร้อมอธิบายผลที่ตามมา", () => {
      const a = makeTask();
      const b = makeTask({ blockedByIds: [a.id] });

      const message = validateBlockerIds(a.id, [b.id], [a, b]);

      expect(message).toContain("วนกลับ");
      expect(message).toContain("ไม่มีงานไหนเริ่มได้");
    });
  });

  describe("conditional fields ตามตำแหน่ง", () => {
    it("เปลี่ยนตำแหน่งแล้ว field ของตำแหน่งเดิมต้องถูกล้าง ไม่ค้างเป็นข้อมูลกำพร้า", () => {
      const asUx = {
        role: "Dev" as const,
        figmaLink: "https://figma.com/file/abc",
        revisionCount: 3,
        passCount: 10,
        deliverable: "spec.pdf",
      };

      const stripped = stripForeignRoleFields(asUx);

      expect(stripped.figmaLink).toBeUndefined();
      expect(stripped.revisionCount).toBeUndefined();
      expect(stripped.passCount).toBeUndefined();
      expect(stripped.deliverable).toBeUndefined();
      expect(stripped.role).toBe("Dev");
    });

    it("field ของตำแหน่งตัวเองต้องอยู่ครบ", () => {
      const stripped = stripForeignRoleFields({
        role: "UX" as const,
        figmaLink: "https://figma.com/file/abc",
        revisionCount: 2,
        deliverable: "ไม่ควรอยู่",
      });

      expect(stripped.figmaLink).toBe("https://figma.com/file/abc");
      expect(stripped.revisionCount).toBe(2);
      expect(stripped.deliverable).toBeUndefined();
    });

    it("แต่ละตำแหน่งต้องแสดงข้อมูลของตัวเองในหน้ารายละเอียด และ Dev ไม่มี field เพิ่ม", () => {
      expect(roleFieldRows(makeTask({ role: "SA", deliverable: "spec.pdf" }))).toEqual([
        { label: "Deliverable", value: "spec.pdf" },
        { label: "Approval", value: "—" },
      ]);
      expect(roleFieldRows(makeTask({ role: "Tester", passCount: 12, failCount: 1 }))).toEqual(
        [
          { label: "Pass Count", value: "12" },
          { label: "Fail Count", value: "1" },
        ],
      );
      expect(roleFieldRows(makeTask({ role: "Dev" }))).toEqual([]);
    });
  });

  describe("ตัวช่วยเรื่องวันที่", () => {
    it("วันที่ที่ไม่มีอยู่จริงในปฏิทินต้องถูกปฏิเสธ", () => {
      expect(isValidDate("2026-02-31")).toBe(false);
      expect(isValidDate("2026-13-01")).toBe(false);
      expect(isValidDate("10/03/2026")).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate("2026-02-28")).toBe(true);
    });

    it("นับจำนวนวันข้ามเดือนได้ถูกต้อง", () => {
      expect(diffDays("2026-02-26", "2026-03-02")).toBe(4);
      expect(diffDays("2026-03-02", "2026-02-26")).toBe(-4);
    });
  });
});
