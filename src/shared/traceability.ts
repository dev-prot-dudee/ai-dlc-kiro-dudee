import {
  DEFECT_TYPES,
  type Defect,
  type DefectType,
  type Requirement,
  type Task,
} from "./types";

/**
 * ตรรกะสายเชื่อมโยง Requirement → Task → Defect
 *
 * นี่คือหัวใจของรอบนี้ (FR4) — ทิศทางของสายถูกกำหนดไว้ทางเดียวเท่านั้น
 * คือ Requirement → Task → Defect เพื่อไม่ให้เกิดการอ้างวนกลับ
 */

export interface ForwardTrace {
  tasks: Task[];
  defects: Defect[];
}

/**
 * FR4.1 — สายจากต้นน้ำลงปลายน้ำ
 *
 * คืน Task ทั้งหมดที่ผูกกับ Requirement นี้ และ Defect ทั้งหมดที่อยู่ใต้ Task เหล่านั้น
 */
export function traceForward(
  requirementId: string,
  allTasks: Task[],
  allDefects: Defect[],
): ForwardTrace {
  const tasks = allTasks.filter((task) => task.requirementId === requirementId);
  const taskIds = new Set(tasks.map((task) => task.id));
  const defects = allDefects.filter((defect) => taskIds.has(defect.taskId));
  return { tasks, defects };
}

export interface BackwardTrace {
  task: Task | null;
  requirement: Requirement | null;
}

/**
 * FR4.2 — สายย้อนกลับจากปลายน้ำขึ้นต้นน้ำ
 *
 * คืนค่า null แทนการโยน error เมื่อหาต้นทางไม่เจอ เพราะข้อมูลกำพร้าเกิดขึ้นได้
 * (เช่นผู้ใช้ลบ Task ทิ้งโดยเลือกไม่ลบ Defect ตาม) และหน้าจอต้องยังแสดงได้
 */
export function traceBackward(
  defect: Defect,
  allTasks: Task[],
  allRequirements: Requirement[],
): BackwardTrace {
  const task = allTasks.find((candidate) => candidate.id === defect.taskId) ?? null;
  const requirement = task
    ? (allRequirements.find((candidate) => candidate.id === task.requirementId) ?? null)
    : null;
  return { task, requirement };
}

/**
 * FR4.3 — Requirement ที่ยังไม่มี Task ผูกอยู่เลย
 *
 * ใช้แสดงเครื่องหมายเตือนในรายการ เพื่อให้เห็นว่างานไหนยังไม่ถูกแตกเป็น Task
 */
export function findRequirementsWithoutTasks(
  requirements: Requirement[],
  tasks: Task[],
): Requirement[] {
  const covered = new Set(tasks.map((task) => task.requirementId));
  return requirements.filter((requirement) => !covered.has(requirement.id));
}

/**
 * FR4.4 — จำนวนที่จะกำพร้าเมื่อลบ Requirement
 *
 * ใช้บอกผู้ใช้ก่อนยืนยันการลบ ว่าจะกระทบอะไรบ้าง
 */
export function countOrphansOnRequirementDelete(
  requirementId: string,
  allTasks: Task[],
  allDefects: Defect[],
): { tasks: number; defects: number } {
  const trace = traceForward(requirementId, allTasks, allDefects);
  return { tasks: trace.tasks.length, defects: trace.defects.length };
}

/** FR4.5 — จำนวน Defect ที่จะกำพร้าเมื่อลบ Task */
export function countOrphansOnTaskDelete(
  taskId: string,
  allDefects: Defect[],
): { defects: number } {
  return {
    defects: allDefects.filter((defect) => defect.taskId === taskId).length,
  };
}

/**
 * FR3.7 — นับ Defect แยกตามประเภททั้ง 5
 *
 * เริ่มจาก 0 ทุกประเภทก่อน เพื่อให้ประเภทที่ไม่มี defect ยังปรากฏเป็น 0
 * ไม่ใช่หายไปจากผล ซึ่งจำเป็นเพราะ board ต้องแสดง column ครบทั้ง 5 เสมอ
 */
export function countDefectsByType(defects: Defect[]): Record<DefectType, number> {
  const counts = Object.fromEntries(DEFECT_TYPES.map((type) => [type, 0])) as Record<
    DefectType,
    number
  >;
  for (const defect of defects) {
    if (defect.type in counts) counts[defect.type] += 1;
  }
  return counts;
}

/** จำนวน Task ที่ผูกกับ Requirement หนึ่ง (FR1.7) */
export function countTasksForRequirement(requirementId: string, tasks: Task[]): number {
  return tasks.filter((task) => task.requirementId === requirementId).length;
}

/** จำนวน Defect ที่ผูกกับ Task หนึ่ง (FR2.7) */
export function countDefectsForTask(taskId: string, defects: Defect[]): number {
  return defects.filter((defect) => defect.taskId === taskId).length;
}
