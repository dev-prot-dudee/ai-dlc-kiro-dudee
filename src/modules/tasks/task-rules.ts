/**
 * ตรรกะทั้งหมดของ Module 02 Task Management ที่คำนวณได้จากข้อมูลล้วนๆ
 *
 * ทุกฟังก์ชันในไฟล์นี้เป็น pure — ไม่อ่านที่เก็บข้อมูล ไม่อ่านเวลาปัจจุบันเอง
 * (วันที่อ้างอิงส่งเข้ามาเป็นพารามิเตอร์) เพื่อให้ test ตรึงผลได้และเพื่อให้
 * สูตรเหล่านี้ย้ายไปใช้ฝั่ง server ได้ทั้งก้อนเมื่อระบบมี backend
 */

import {
  APPROVAL_STATUSES,
  DEADLINE_TYPES,
  DELAY_CAUSES,
  TASK_PHASES,
  WORK_PATTERNS,
  type Role,
  type Task,
} from "../../shared/types";

/**
 * ค่าเริ่มต้นของ field บังคับที่เพิ่มเข้ามาใน M02
 *
 * ข้อมูลที่สร้างไว้ก่อน M02 ไม่มี field เหล่านี้ ค่าเริ่มต้นจึงต้องเป็นค่าที่
 * ปลอดภัยที่สุดเมื่อไม่รู้ความจริง: งานพัฒนา ไม่พึ่งใคร และถือว่าทีมตกลงเอง
 */
export const TASK_DEFAULTS = {
  phase: "Development",
  workPattern: "Independent",
  deadlineType: "Committed",
} as const;

function isOneOf(values: readonly string[], candidate: unknown): boolean {
  return typeof candidate === "string" && values.includes(candidate);
}

/**
 * เติมค่าเริ่มต้นให้ record ที่อ่านมาจากที่เก็บ
 *
 * จำเป็นเพราะ localStorage เก็บ JSON ดิบ ข้อมูลที่บันทึกไว้ก่อน M02 จะขาด field
 * ใหม่ทั้งหมด ถ้าไม่เติมค่า หน้าจอจะแสดงช่องว่างและตัวกรองจะคัดข้อมูลเก่าออกหมด
 */
export function withTaskDefaults(task: Task): Task {
  return {
    ...task,
    phase: isOneOf(TASK_PHASES, task.phase) ? task.phase : TASK_DEFAULTS.phase,
    workPattern: isOneOf(WORK_PATTERNS, task.workPattern)
      ? task.workPattern
      : TASK_DEFAULTS.workPattern,
    deadlineType: isOneOf(DEADLINE_TYPES, task.deadlineType)
      ? task.deadlineType
      : TASK_DEFAULTS.deadlineType,
    blockedByIds: Array.isArray(task.blockedByIds) ? task.blockedByIds : [],
  };
}

// ---------------------------------------------------------------- วันที่

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** ตรวจว่าเป็นวันที่รูปแบบ YYYY-MM-DD ที่มีอยู่จริงในปฏิทิน */
export function isValidDate(value: string | undefined): value is string {
  if (value === undefined || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  // ตรวจย้อนกลับเพื่อคัด 2026-02-31 ที่ Date เลื่อนให้เองเป็นเดือนถัดไป
  return parsed.toISOString().slice(0, 10) === value;
}

/** วันที่ของวันนี้ตามเขตเวลาเครื่องผู้ใช้ ในรูปแบบ YYYY-MM-DD */
export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** จำนวนวันจาก from ถึง to (ค่าลบคือ to มาก่อน from) */
export function diffDays(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Task ที่ระบุวันที่ทำเสร็จแล้วถือว่าจบ — รอบนี้ยังไม่มี status flow เต็มรูป */
export function isDone(task: Task): boolean {
  return isValidDate(task.completedAt);
}

/**
 * M02 — Days Late
 *
 * คิดจากกำหนดส่งเทียบกับวันที่ทำเสร็จ ถ้ายังไม่เสร็จให้เทียบกับวันอ้างอิง
 * (วันนี้) เพื่อให้งานที่ค้างอยู่และเลยกำหนดแล้วนับวันเพิ่มขึ้นเรื่อยๆ
 * ไม่ระบุกำหนดส่ง = ไม่มีความล่าช้าให้วัด คืน 0
 */
export function daysLate(task: Task, today: string): number {
  if (!isValidDate(task.dueDate)) return 0;
  const end = isValidDate(task.completedAt) ? task.completedAt : today;
  const late = diffDays(task.dueDate, end);
  return late > 0 ? late : 0;
}

/** งานที่ยังไม่เสร็จและเลยกำหนดส่งมาแล้ว — เป็นสัญญาณที่ PM ต้องเห็นก่อนใคร */
export function isOverdueOpen(task: Task, today: string): boolean {
  return !isDone(task) && daysLate(task, today) > 0;
}

// ---------------------------------------------------------------- ประมาณการ

export interface EstimateVariance {
  /** ชั่วโมงที่เกิน (ค่าลบคือใช้เวลาน้อยกว่าที่ประมาณ) */
  hours: number;
  /** เปอร์เซ็นต์ที่เกิน — null เมื่อประมาณการเริ่มต้นเป็น 0 จึงหารไม่ได้ */
  percent: number | null;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * M02 — Estimate Variance auto-calculate
 *
 * คืน null เมื่อยังไม่มีข้อมูลครบทั้งสองด้าน เพราะ variance ที่คำนวณจากค่าที่
 * ขาดไปจะอ่านผิดว่า "ตรงเป๊ะ" ซึ่งอันตรายกว่าการไม่แสดงอะไรเลย
 */
export function estimateVariance(task: Task): EstimateVariance | null {
  const initial = task.initialEstimateHours;
  const actual = task.actualHours;
  if (initial === undefined || actual === undefined) return null;
  if (!Number.isFinite(initial) || !Number.isFinite(actual)) return null;
  return {
    hours: round1(actual - initial),
    percent: initial === 0 ? null : round1(((actual - initial) / initial) * 100),
  };
}

/** ข้อความสั้นของ variance สำหรับแสดงบนการ์ดและในตาราง */
export function formatVariance(variance: EstimateVariance | null): string {
  if (variance === null) return "—";
  const sign = variance.hours > 0 ? "+" : "";
  const hours = `${sign}${variance.hours} ชม.`;
  if (variance.percent === null) return hours;
  return `${hours} (${sign}${variance.percent}%)`;
}

// ---------------------------------------------------------------- Blocked By

/**
 * Task ที่บล็อคงานนี้อยู่ "จริง" ในตอนนี้
 *
 * blocker ที่ทำเสร็จแล้วไม่บล็อคใครอีก และ blocker ที่ถูกลบไปแล้วก็ไม่นับ
 * (id ค้างได้เพราะการลบ Task ไม่ได้ตามไปแก้คนอื่น) จึงกรองทั้งสองกรณีออก
 */
export function activeBlockers(task: Task, all: Task[]): Task[] {
  return task.blockedByIds
    .map((id) => all.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Task => candidate !== undefined && !isDone(candidate));
}

/** งานนี้ติดบล็อคอยู่หรือไม่ — ใช้ทั้งใน PM alert และตัวกรอง */
export function isBlocked(task: Task, all: Task[]): boolean {
  return activeBlockers(task, all).length > 0;
}

/**
 * การผูกให้ taskId ถูกบล็อคด้วย blockerId จะทำให้เกิดวงวนหรือไม่
 *
 * เดินขึ้นจาก blockerId ตามสาย blockedByIds ถ้าเดินไปเจอ taskId แปลว่าปลายทาง
 * ย้อนกลับมาที่ต้นทาง = ไม่มีงานไหนเริ่มได้เลย
 */
export function wouldCreateCycle(taskId: string, blockerId: string, all: Task[]): boolean {
  if (taskId === blockerId) return true;
  const seen = new Set<string>();
  const pending = [blockerId];
  while (pending.length > 0) {
    const current = pending.pop() as string;
    if (current === taskId) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    const found = all.find((candidate) => candidate.id === current);
    if (found !== undefined) pending.push(...found.blockedByIds);
  }
  return false;
}

/**
 * Task ที่เลือกเป็น blocker ได้ โดยตัดตัวเองและตัวที่จะทำให้เกิดวงวนออกก่อน
 *
 * กันวงวนที่ตัวเลือกในฟอร์มด้วย ไม่รอให้ผู้ใช้กดบันทึกแล้วค่อยถูกปฏิเสธ
 */
export function blockerCandidates(taskId: string | null, all: Task[]): Task[] {
  if (taskId === null) return [...all];
  return all.filter((candidate) => !wouldCreateCycle(taskId, candidate.id, all));
}

/**
 * ตรวจรายการ blocker ทั้งชุด คืนข้อความอธิบายเหตุผลเมื่อไม่ผ่าน ไม่งั้นคืน null
 *
 * taskId เป็น null ตอนสร้างใหม่ เพราะยังไม่มี id และยังไม่มีใครชี้มาที่มันได้
 * จึงเกิดวงวนไม่ได้
 */
export function validateBlockerIds(
  taskId: string | null,
  ids: string[],
  all: Task[],
): string | null {
  const seen = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string" || id.trim() === "") {
      return "รายการงานที่บล็อคมีค่าว่างอยู่";
    }
    if (seen.has(id)) {
      return "มีงานที่บล็อคซ้ำกันในรายการ";
    }
    seen.add(id);
    if (taskId !== null && id === taskId) {
      return "Task บล็อคตัวเองไม่ได้";
    }
    if (!all.some((candidate) => candidate.id === id)) {
      return `ไม่พบ Task ที่อ้างถึงในรายการงานที่บล็อค (${id})`;
    }
    if (taskId !== null && wouldCreateCycle(taskId, id, all)) {
      return "การผูกนี้ทำให้เกิดการบล็อควนกลับ (A รอ B และ B รอ A) ซึ่งจะทำให้ไม่มีงานไหนเริ่มได้";
    }
  }
  return null;
}

// ---------------------------------------------------------------- Role fields

/** field ที่บังคับกรอกเพิ่มของแต่ละตำแหน่ง — Dev ไม่มี field เพิ่ม */
export const ROLE_FIELDS: Record<Role, readonly (keyof Task)[]> = {
  SA: ["deliverable", "approvalStatus"],
  UX: ["figmaLink", "revisionCount"],
  Dev: [],
  Tester: ["passCount", "failCount"],
};

/**
 * ล้าง conditional field ของตำแหน่งอื่นออกก่อนบันทึก
 *
 * ถ้าไม่ล้าง การเปลี่ยนตำแหน่งจาก UX เป็น Dev จะทิ้ง figmaLink ค้างไว้ กลายเป็น
 * ข้อมูลที่ไม่มีใครดูแลและทำให้ KPI ของ M05 นับผิดในอนาคต
 *
 * ตั้งค่าเป็น undefined แทนการ delete key เพราะการบันทึกใช้การ spread ทับ
 * record เดิม (`{...stored, ...changes}`) ซึ่ง key ที่หายไปจะไม่ลบค่าเดิม
 * มีแต่ค่า undefined ที่ทับได้จริง (และ JSON.stringify ตัดออกให้เองตอนเขียน)
 */
export function stripForeignRoleFields<T extends { role: Role } & Partial<Task>>(
  input: T,
): T {
  const next = { ...input };
  const keep = new Set<string>(ROLE_FIELDS[input.role] ?? []);
  const allRoleFields = new Set<string>(Object.values(ROLE_FIELDS).flat());
  for (const field of allRoleFields) {
    if (!keep.has(field)) {
      (next as Record<string, unknown>)[field] = undefined;
    }
  }
  return next;
}

/** ข้อมูลเฉพาะตำแหน่งในรูปแบบที่แสดงบนหน้าจอได้ทันที */
export function roleFieldRows(task: Task): { label: string; value: string }[] {
  switch (task.role) {
    case "SA":
      return [
        { label: "Deliverable", value: task.deliverable ?? "—" },
        { label: "Approval", value: task.approvalStatus ?? "—" },
      ];
    case "UX":
      return [
        { label: "Figma", value: task.figmaLink ?? "—" },
        { label: "Revision", value: `${task.revisionCount ?? 0} รอบ` },
      ];
    case "Tester":
      return [
        { label: "Pass Count", value: `${task.passCount ?? 0}` },
        { label: "Fail Count", value: `${task.failCount ?? 0}` },
      ];
    case "Dev":
      return [];
    default:
      return [];
  }
}

/** ค่าที่ยอมรับได้ของ enum แต่ละตัว รวมไว้ให้ validation เรียกใช้ที่เดียว */
export const TASK_ENUMS = {
  phase: TASK_PHASES,
  workPattern: WORK_PATTERNS,
  deadlineType: DEADLINE_TYPES,
  delayCause: DELAY_CAUSES,
  approvalStatus: APPROVAL_STATUSES,
} as const;
