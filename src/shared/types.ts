/**
 * Type ของทั้ง 3 entity และค่า enum ทั้งหมด
 *
 * ค่าใน enum ทุกตัวคงเป็นภาษาอังกฤษตามที่ requirements กำหนดไว้ เพราะเป็นศัพท์
 * ที่ทีมใช้ทับศัพท์อยู่แล้ว และเป็นค่าที่ requirements ระบุว่าต้องบังคับให้เลือก
 * จากชุดนี้เท่านั้น (FR1.3, FR2.3, FR3.2, FR3.3)
 */

/** FR1.2 — ประเภทของ Requirement */
export const REQUIREMENT_CATEGORIES = ["Functional", "Non-Functional"] as const;
export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

/** FR1.3 — ระดับความสำคัญแบบ MoSCoW */
export const PRIORITIES = ["Must", "Should", "Could", "Won't"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** FR1.3 — ค่าเริ่มต้นของระดับความสำคัญเมื่อผู้ใช้ไม่เลือก */
export const DEFAULT_PRIORITY: Priority = "Should";

/** FR2.3 — ตำแหน่งของผู้รับผิดชอบ Task */
export const ROLES = ["SA", "UX", "Dev", "Tester"] as const;
export type Role = (typeof ROLES)[number];

/**
 * M02 — ช่วงงานของ Task
 *
 * แยก Development (งานสร้างของใหม่ จบเป็นรอบ) ออกจาก Maintenance (งานแก้ของเดิม
 * เข้าเรื่อยๆ) เพราะสองแบบนี้บริหารและวัดผลต่างกัน
 */
export const TASK_PHASES = ["Development", "Maintenance"] as const;
export type TaskPhase = (typeof TASK_PHASES)[number];

/**
 * M02 — รูปแบบการทำงานของ Task
 *
 * Sequential = ต้องรอคิว, Parallel = ทำคู่ขนานกับงานอื่นได้, Independent = ไม่พึ่งใคร
 */
export const WORK_PATTERNS = ["Sequential", "Parallel", "Independent"] as const;
export type WorkPattern = (typeof WORK_PATTERNS)[number];

/**
 * M02 — ที่มาของกำหนดส่ง
 *
 * Committed = ทีมตกลงเอง, Imposed = ถูกกำหนดมาจากข้างบนโดยไม่ได้ตกลงด้วย
 * การแยกสองค่านี้คือการแยกความรับผิดชอบของความล่าช้า
 */
export const DEADLINE_TYPES = ["Committed", "Imposed"] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

/**
 * M02 — สาเหตุของความล่าช้า
 *
 * ใช้ระบุว่าความล่าช้าควรเป็นความรับผิดชอบของใคร: ตัวเอง (Self), คนที่บล็อคอยู่
 * (Blocked), requirement เปลี่ยน (Req Change) หรือปัจจัยนอกทีม (External)
 */
export const DELAY_CAUSES = ["Self", "Blocked", "Req Change", "External"] as const;
export type DelayCause = (typeof DELAY_CAUSES)[number];

/** M02 — สถานะการอนุมัติเอกสารส่งมอบของ SA */
export const APPROVAL_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** FR3.2 — ประเภทของ Defect ทั้ง 5 ค่า ใช้ระบุต้นน้ำของปัญหา */
export const DEFECT_TYPES = [
  "Code Bug",
  "SA Gap",
  "Design Gap",
  "Test Escape",
  "NFR Violation",
] as const;
export type DefectType = (typeof DEFECT_TYPES)[number];

/** FR3.3 — ระดับความรุนแรงของ Defect */
export const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  priority: Priority;
  ownerId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  /** FR2.2 — Task ทุกตัวต้องผูกกับ Requirement ห้ามลอย */
  requirementId: string;
  assigneeId: string;
  /** FR2.3 — ตำแหน่งของผู้รับผิดชอบ และเป็นตัวกำหนดว่าต้องกรอก field ใดเพิ่ม */
  role: Role;
  createdAt: string;

  // ---------- M02 — field ที่ทุก Task ต้องมี ----------

  /** M02 — Development หรือ Maintenance */
  phase: TaskPhase;
  /** M02 — Sequential / Parallel / Independent */
  workPattern: WorkPattern;
  /** M02 — กำหนดส่งนี้ทีมตกลงเองหรือถูกสั่งมา */
  deadlineType: DeadlineType;
  /** M02 — id ของ Task ที่บล็อคงานนี้อยู่ (dependency) ห้ามวนกลับ */
  blockedByIds: string[];

  // ---------- M02 — field ที่ระบุเมื่อมีข้อมูล ----------

  /** M02 — กำหนดส่งในรูปแบบ YYYY-MM-DD */
  dueDate?: string;
  /** M02 — วันที่ทำเสร็จในรูปแบบ YYYY-MM-DD ยังไม่เสร็จคือไม่มีค่า */
  completedAt?: string;
  /** M02 — บังคับระบุเมื่อส่งช้ากว่ากำหนด */
  delayCause?: DelayCause;
  /** M02 — ประมาณการเริ่มต้นเป็นชั่วโมง ใช้คู่กับ actualHours เพื่อหา variance */
  initialEstimateHours?: number;
  /** M02 — เวลาที่ใช้จริงเป็นชั่วโมง */
  actualHours?: number;

  // ---------- M02 — conditional fields ตามตำแหน่ง ----------

  /** SA เท่านั้น — ส่งมอบอะไร (spec doc, flow diagram, data dictionary) */
  deliverable?: string;
  /** SA เท่านั้น — เอกสารที่ยังไม่ approve ถือว่างานยังไม่จบ */
  approvalStatus?: ApprovalStatus;
  /** UX เท่านั้น — ลิงก์งานออกแบบ เป็นหลักฐานการส่งมอบ */
  figmaLink?: string;
  /** UX เท่านั้น — จำนวนรอบที่แก้แบบ */
  revisionCount?: number;
  /** Tester เท่านั้น — จำนวน test case ที่ผ่าน */
  passCount?: number;
  /** Tester เท่านั้น — จำนวน test case ที่ไม่ผ่าน */
  failCount?: number;
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  /** FR3.4 — Defect ทุกตัวต้องผูกกับ Task */
  taskId: string;
  type: DefectType;
  severity: Severity;
  reporterId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

/** รูปแบบของข้อมูลทั้งหมดเมื่อ export ออกเป็นไฟล์ (FR6.2) */
export interface ExportBundle {
  version: 1;
  exportedAt: string;
  requirements: Requirement[];
  tasks: Task[];
  defects: Defect[];
}

/** ข้อผิดพลาดที่เกิดจากการตรวจความถูกต้องของข้อมูลก่อนบันทึก */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/** localStorage อ่านไม่ได้หรือข้อมูลเสียหาย (FR6.3) */
export class StorageCorruptError extends Error {
  constructor(
    message: string,
    public readonly key: string,
  ) {
    super(message);
    this.name = "StorageCorruptError";
  }
}

/** localStorage เต็มโควตา (FR6.4) */
export class StorageFullError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageFullError";
  }
}
