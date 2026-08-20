import {
  StorageCorruptError,
  StorageFullError,
  type Defect,
  type ExportBundle,
  type Requirement,
  type Task,
} from "./types";

/** key ที่ใช้เก็บแต่ละชุดข้อมูลใน localStorage */
export const STORAGE_KEYS = {
  requirements: "pm-tool.requirements",
  tasks: "pm-tool.tasks",
  defects: "pm-tool.defects",
  currentUser: "pm-tool.currentUser",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * ตรวจว่า error ที่ได้มาคือโควตาเต็มหรือไม่
 *
 * เบราว์เซอร์แต่ละตัวรายงานโควตาเต็มไม่เหมือนกัน: มาตรฐานใช้ชื่อ
 * QuotaExceededError, Firefox รุ่นเก่าใช้ NS_ERROR_DOM_QUOTA_REACHED,
 * และบางตัวใช้ code 22 จึงต้องตรวจทั้งสามทาง
 */
function isQuotaExceeded(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22
  );
}

/**
 * อ่านชุดข้อมูลหนึ่งชุดจาก localStorage
 *
 * FR6.1 — ข้อมูลต้องคงอยู่ข้าม session
 * FR6.3 — ข้อมูลเสียหายต้องได้ error ที่ระบุได้ว่าเสียที่ไหน ไม่ใช่ error ดิบ
 *
 * @throws {StorageCorruptError} เมื่อข้อมูลอ่านไม่ได้หรือไม่ใช่ array
 */
export function readCollection<T>(key: StorageKey): T[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch (error) {
    // การอ่านเองล้มเหลวได้เมื่อเบราว์เซอร์ปิด storage ไว้ (โหมดส่วนตัวบางตัว)
    throw new StorageCorruptError(
      `อ่านข้อมูลจากที่เก็บไม่ได้: ${String(error)}`,
      key,
    );
  }

  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new StorageCorruptError(
      `ข้อมูลที่เก็บไว้เสียหาย อ่านเป็น JSON ไม่ได้ (${key})`,
      key,
    );
  }

  if (!Array.isArray(parsed)) {
    throw new StorageCorruptError(
      `ข้อมูลที่เก็บไว้ผิดรูปแบบ คาดว่าเป็นรายการแต่ได้ ${typeof parsed} (${key})`,
      key,
    );
  }

  return parsed as T[];
}

/**
 * เขียนชุดข้อมูลหนึ่งชุดลง localStorage
 *
 * FR6.4 — เมื่อโควตาเต็ม ต้องแจ้งเตือนและข้อมูลเดิมไม่หาย
 *
 * @throws {StorageFullError} เมื่อโควตาเต็ม — การเขียนล้มเหลวทั้งก้อน
 *   ข้อมูลเดิมจึงยังอยู่ครบเพราะ setItem เป็น atomic ต่อ key
 */
export function writeCollection<T>(key: StorageKey, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    if (isQuotaExceeded(error)) {
      throw new StorageFullError(
        "ที่เก็บข้อมูลของเบราว์เซอร์เต็ม กรุณา export ข้อมูลออกไปเก็บไว้ก่อนแล้วลบรายการที่ไม่ใช้",
      );
    }
    throw error;
  }
}

/** อ่านค่าเดี่ยว (ใช้กับผู้ใช้ปัจจุบัน) — ค่าที่อ่านไม่ได้ถือว่าไม่มี */
export function readScalar(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** เขียนค่าเดี่ยว — ความล้มเหลวไม่ควรทำให้ทั้งแอปหยุด จึงกลืน error ไว้ */
export function writeScalar(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // การจำผู้ใช้ปัจจุบันไม่ใช่ข้อมูลที่เสียไม่ได้ ถ้าเขียนไม่ได้ก็ปล่อยผ่าน
  }
}

/**
 * รวมข้อมูลทั้งหมดเป็นก้อนเดียวเพื่อ export (FR6.2)
 */
export function exportAll(): ExportBundle {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    requirements: readCollection<Requirement>(STORAGE_KEYS.requirements),
    tasks: readCollection<Task>(STORAGE_KEYS.tasks),
    defects: readCollection<Defect>(STORAGE_KEYS.defects),
  };
}

/**
 * นำข้อมูลจากไฟล์กลับเข้าระบบ (FR6.2)
 *
 * ตรวจรูปแบบให้ครบก่อนเขียนทับ เพื่อไม่ให้ไฟล์ที่ผิดรูปแบบทำลายข้อมูลเดิม
 *
 * @throws {Error} เมื่อไฟล์ไม่ใช่ bundle ที่รองรับ — ยังไม่มีการเขียนทับเกิดขึ้น
 */
export function importAll(json: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("ไฟล์ที่เลือกไม่ใช่ JSON ที่อ่านได้");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("ไฟล์ที่เลือกไม่ใช่ไฟล์ข้อมูลของระบบนี้");
  }

  const bundle = parsed as Partial<ExportBundle>;

  if (bundle.version !== 1) {
    throw new Error(
      `ไฟล์นี้เป็นรุ่น ${String(bundle.version)} ซึ่งระบบยังอ่านไม่ได้ (รองรับรุ่น 1)`,
    );
  }

  if (
    !Array.isArray(bundle.requirements) ||
    !Array.isArray(bundle.tasks) ||
    !Array.isArray(bundle.defects)
  ) {
    throw new Error(
      "ไฟล์นี้ขาดข้อมูลบางส่วน ต้องมีทั้ง requirements, tasks และ defects",
    );
  }

  // ตรวจครบแล้วจึงเขียน — ถึงตรงนี้ข้อมูลเดิมยังไม่ถูกแตะต้อง
  writeCollection(STORAGE_KEYS.requirements, bundle.requirements);
  writeCollection(STORAGE_KEYS.tasks, bundle.tasks);
  writeCollection(STORAGE_KEYS.defects, bundle.defects);
}

/** ดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ (FR6.2) */
export function downloadExport(): void {
  const bundle = exportAll();
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pm-tool-export-${bundle.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
