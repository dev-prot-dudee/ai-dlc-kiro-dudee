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
  /** FR2.3 — ตำแหน่งของผู้รับผิดชอบ */
  role: Role;
  createdAt: string;
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
