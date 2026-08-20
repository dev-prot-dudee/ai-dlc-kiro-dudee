import { createRepository, type Draft, type Repository } from "../../shared/repository";
import { STORAGE_KEYS } from "../../shared/storage";
import { ROLES, ValidationError, type Task } from "../../shared/types";
import {
  TASK_DEFAULTS,
  TASK_ENUMS,
  isDone,
  isValidDate,
  stripForeignRoleFields,
  validateBlockerIds,
  withTaskDefaults,
} from "./task-rules";

/**
 * กฎบังคับของ Task
 *
 * FR2.2 — Task ทุกตัวต้องผูกกับ Requirement อย่างน้อย 1 ตัว ห้ามมี Task ลอย
 * FR2.3 — ต้องระบุตำแหน่งของผู้รับผิดชอบเป็นค่าใน SA/UX/Dev/Tester
 *
 * M02 — กฎที่เพิ่มเข้ามา:
 * - phase / workPattern / deadlineType ต้องเป็นค่าในชุดที่กำหนด
 * - conditional field ต้องครบตามตำแหน่ง (SA/UX/Tester) — Dev ไม่มี field เพิ่ม
 * - ส่งช้ากว่ากำหนดต้องระบุสาเหตุความล่าช้า ไม่ให้ปล่อยว่าง
 * - blockedByIds ต้องชี้ไป Task ที่มีอยู่จริง ห้ามซ้ำ ห้ามชี้ตัวเอง ห้ามวนกลับ
 */

/**
 * ข้อมูลที่ผู้เรียกส่งเข้ามาได้ — field บังคับของ M02 เป็น optional ที่นี่
 * เพราะ repository เติมค่าเริ่มต้นให้เอง ผู้เรียกที่ไม่สนใจ phase หรือ
 * workPattern (เช่น test ของ module อื่นที่แค่ต้องการ Task หนึ่งตัว)
 * จึงไม่ต้องรู้จัก field เหล่านี้
 */
type DefaultedFields = "phase" | "workPattern" | "deadlineType" | "blockedByIds";
export type TaskInput = Omit<Draft<Task>, DefaultedFields> &
  Partial<Pick<Task, DefaultedFields>>;

function requireNonNegativeNumber(
  value: number | undefined,
  field: string,
  label: string,
): void {
  if (value === undefined) return;
  if (!Number.isFinite(value)) {
    throw new ValidationError(`${label} ต้องเป็นตัวเลข`, field);
  }
  if (value < 0) {
    throw new ValidationError(`${label} ต้องไม่ติดลบ`, field);
  }
}

function requireEnum(
  values: readonly string[],
  value: string | undefined,
  field: string,
  label: string,
): void {
  if (value === undefined || !values.includes(value)) {
    throw new ValidationError(`${label} ต้องเป็นค่าใน ${values.join(" / ")}`, field);
  }
}

/**
 * conditional fields ตามตำแหน่ง — หัวใจของ M02
 *
 * จังหวะที่บังคับคือ "ตอนปิดงาน" ไม่ใช่ "ตอนสร้าง" เพราะหลักฐานส่งมอบยังไม่มี
 * ตอนแตก task (UX ยังไม่มีลิงก์ Figma ตอนเพิ่งรับงาน, Tester ยังไม่มีผลทดสอบ)
 * ถ้าบังคับตอนสร้าง ทีมจะกรอกค่าปลอมไปก่อน ซึ่งทำให้ข้อมูลเสียตั้งแต่ต้นทาง
 * ค่าที่ผิดรูปแบบยังถูกปฏิเสธทุกจังหวะ เช่นลิงก์ที่ไม่ใช่ URL หรือจำนวนติดลบ
 */
function validateRoleFields(draft: Draft<Task>): void {
  const done = isDone(draft as Task);

  if (draft.role === "SA") {
    requireEnum(
      TASK_ENUMS.approvalStatus,
      draft.approvalStatus,
      "approvalStatus",
      "สถานะการอนุมัติ",
    );
    if (done && (draft.deliverable ?? "").trim() === "") {
      throw new ValidationError(
        "งานของ SA ที่ปิดแล้วต้องระบุ Deliverable ว่าส่งมอบอะไร (spec doc, flow diagram, data dictionary)",
        "deliverable",
      );
    }
    // เอกสารที่ยังไม่ approve ถือว่างานยังไม่จบ
    if (done && draft.approvalStatus !== "Approved") {
      throw new ValidationError(
        "งานของ SA ปิดได้เมื่อ Deliverable ถูกอนุมัติแล้วเท่านั้น (สถานะปัจจุบัน: " +
          `${draft.approvalStatus ?? "—"})`,
        "approvalStatus",
      );
    }
  }

  if (draft.role === "UX") {
    const link = (draft.figmaLink ?? "").trim();
    if (link !== "" && !/^https?:\/\/\S+$/.test(link)) {
      throw new ValidationError(
        "ลิงก์งานออกแบบต้องเริ่มด้วย http:// หรือ https://",
        "figmaLink",
      );
    }
    if (done && link === "") {
      throw new ValidationError(
        "งานของ UX ที่ปิดแล้วต้องแนบลิงก์งานออกแบบเป็นหลักฐานการส่งมอบ",
        "figmaLink",
      );
    }
    requireNonNegativeNumber(draft.revisionCount, "revisionCount", "จำนวนรอบที่แก้แบบ");
  }

  if (draft.role === "Tester") {
    requireNonNegativeNumber(draft.passCount, "passCount", "จำนวน test case ที่ผ่าน");
    requireNonNegativeNumber(draft.failCount, "failCount", "จำนวน test case ที่ไม่ผ่าน");
  }
}

/** กำหนดส่ง วันที่ทำเสร็จ และสาเหตุความล่าช้า */
function validateSchedule(draft: Draft<Task>): void {
  if (draft.dueDate !== undefined && draft.dueDate !== "" && !isValidDate(draft.dueDate)) {
    throw new ValidationError("กำหนดส่งต้องเป็นวันที่ที่มีอยู่จริง", "dueDate");
  }
  if (
    draft.completedAt !== undefined &&
    draft.completedAt !== "" &&
    !isValidDate(draft.completedAt)
  ) {
    throw new ValidationError("วันที่ทำเสร็จต้องเป็นวันที่ที่มีอยู่จริง", "completedAt");
  }
  if (draft.delayCause !== undefined) {
    requireEnum(TASK_ENUMS.delayCause, draft.delayCause, "delayCause", "สาเหตุความล่าช้า");
  }

  // ส่งช้าแล้วต้องบอกสาเหตุ ไม่งั้น M05 จะย้าย penalty ไปคนที่ควรรับไม่ได้
  const late =
    isValidDate(draft.dueDate) &&
    isValidDate(draft.completedAt) &&
    draft.completedAt > draft.dueDate;
  if (late && draft.delayCause === undefined) {
    throw new ValidationError(
      "งานนี้ส่งช้ากว่ากำหนด ต้องระบุสาเหตุความล่าช้า (Self / Blocked / Req Change / External)",
      "delayCause",
    );
  }
}

function validate(draft: Draft<Task>): void {
  if (draft.title.trim() === "") {
    throw new ValidationError("ต้องระบุหัวข้อของ Task", "title");
  }
  if (draft.requirementId.trim() === "") {
    throw new ValidationError(
      "ต้องเลือก Requirement ต้นทาง — Task ที่ไม่ผูกกับ Requirement ทำให้ตามรอยงานไม่ได้",
      "requirementId",
    );
  }
  if (!ROLES.includes(draft.role)) {
    throw new ValidationError("ต้องเลือกตำแหน่งเป็น SA, UX, Dev หรือ Tester", "role");
  }
  if (draft.assigneeId.trim() === "") {
    throw new ValidationError("ต้องระบุผู้รับผิดชอบ", "assigneeId");
  }

  requireEnum(TASK_ENUMS.phase, draft.phase, "phase", "ช่วงงาน");
  requireEnum(TASK_ENUMS.workPattern, draft.workPattern, "workPattern", "รูปแบบการทำงาน");
  requireEnum(
    TASK_ENUMS.deadlineType,
    draft.deadlineType,
    "deadlineType",
    "ประเภทกำหนดส่ง",
  );

  if (!Array.isArray(draft.blockedByIds)) {
    throw new ValidationError("รายการงานที่บล็อคต้องเป็นรายการ", "blockedByIds");
  }

  requireNonNegativeNumber(
    draft.initialEstimateHours,
    "initialEstimateHours",
    "ประมาณการเริ่มต้น",
  );
  requireNonNegativeNumber(draft.actualHours, "actualHours", "เวลาที่ใช้จริง");

  validateSchedule(draft);
  validateRoleFields(draft);
}

const base = createRepository<Task>(STORAGE_KEYS.tasks, validate);

/**
 * เติมค่าเริ่มต้นของ M02 และล้าง field ของตำแหน่งอื่นออกก่อนบันทึก
 *
 * conditional field ที่เป็นตัวนับได้ค่าเริ่มต้นเป็น 0 และสถานะอนุมัติของ SA
 * เริ่มที่ Pending เพื่อให้ "ยังไม่กรอก" ต่างจาก "กรอกแล้วว่าไม่มี" อย่างชัดเจน
 */
function toDraft(input: TaskInput): Draft<Task> {
  const filled: Draft<Task> = {
    ...input,
    phase: input.phase ?? TASK_DEFAULTS.phase,
    workPattern: input.workPattern ?? TASK_DEFAULTS.workPattern,
    deadlineType: input.deadlineType ?? TASK_DEFAULTS.deadlineType,
    blockedByIds: input.blockedByIds ?? [],
  };
  const scoped = stripForeignRoleFields(filled);
  if (scoped.role === "SA") {
    scoped.approvalStatus = scoped.approvalStatus ?? "Pending";
  }
  if (scoped.role === "UX") {
    scoped.revisionCount = scoped.revisionCount ?? 0;
  }
  if (scoped.role === "Tester") {
    scoped.passCount = scoped.passCount ?? 0;
    scoped.failCount = scoped.failCount ?? 0;
  }
  return scoped;
}

function list(): Task[] {
  return base.list().map(withTaskDefaults);
}

function find(id: string): Task | null {
  const found = base.find(id);
  return found === null ? null : withTaskDefaults(found);
}

/**
 * Repository ของ Task
 *
 * ห่อ repository กลางไว้อีกชั้นเพราะ M02 ต้องการสองอย่างที่ repository กลาง
 * ทำให้ไม่ได้: เติมค่าเริ่มต้นให้ข้อมูลที่บันทึกไว้ก่อนมี field ใหม่ (ตอนอ่าน)
 * และตรวจ dependency ที่ต้องเห็น Task ตัวอื่นทั้งหมด (ตอนเขียน)
 */
export interface TasksRepository extends Repository<Task> {
  create(input: TaskInput): Task;
  update(id: string, changes: Partial<TaskInput>): Task;
}

export const tasksRepo: TasksRepository = {
  list,
  find,

  create(input: TaskInput): Task {
    const draft = toDraft(input);
    const blockerError = validateBlockerIds(null, draft.blockedByIds, list());
    if (blockerError !== null) {
      throw new ValidationError(blockerError, "blockedByIds");
    }
    return base.create(draft);
  },

  update(id: string, changes: Partial<TaskInput>): Task {
    const current = find(id);
    if (current === null) {
      throw new ValidationError(`ไม่พบ Task ที่ต้องการแก้ไข (${id})`);
    }
    const merged = { ...current, ...changes };
    const { id: _id, createdAt: _createdAt, ...rest } = merged;
    const draft = toDraft(rest);
    const blockerError = validateBlockerIds(id, draft.blockedByIds, list());
    if (blockerError !== null) {
      throw new ValidationError(blockerError, "blockedByIds");
    }
    return base.update(id, draft);
  },

  remove(id: string): void {
    base.remove(id);
  },

  removeWhere(predicate: (item: Task) => boolean): void {
    base.removeWhere(predicate);
  },
};
