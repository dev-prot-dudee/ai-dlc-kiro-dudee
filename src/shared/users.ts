import { STORAGE_KEYS, readScalar, writeScalar } from "./storage";
import type { Role, User } from "./types";

/**
 * รายชื่อผู้ใช้ที่กำหนดไว้ล่วงหน้า (assumption A1)
 *
 * รอบนี้ไม่มีระบบยืนยันตัวตน (constraint C3) จึงไม่มีหน้าจัดการผู้ใช้
 * รายชื่อนี้แทนทีม 12 คนใน 3 กลุ่ม ตามที่ requirements ระบุ:
 * ทีมละ Dev Fullstack 2, Tester 1, SA 1
 *
 * ข้อควรระวัง: การเลือกจากรายชื่อนี้ไม่ใช่การยืนยันตัวตน ใครก็เลือกเป็นใครได้
 * ดูความเสี่ยง R1 ใน requirements — ห้ามนำข้อมูลจากรอบนี้ไปคำนวณ KPI รายคน
 */
export const USERS: readonly User[] = [
  // ทีม A — Requirement Management
  { id: "u1", name: "สมชาย (SA)", role: "SA" },
  { id: "u2", name: "ปิยะ (Dev)", role: "Dev" },
  { id: "u3", name: "วรรณา (Dev)", role: "Dev" },
  { id: "u4", name: "ธนา (Tester)", role: "Tester" },
  // ทีม B — Task Management
  { id: "u5", name: "อรุณ (SA)", role: "SA" },
  { id: "u6", name: "กิตติ (Dev)", role: "Dev" },
  { id: "u7", name: "นภา (Dev)", role: "Dev" },
  { id: "u8", name: "ศิริ (Tester)", role: "Tester" },
  // ทีม C — Defect Tracking
  { id: "u9", name: "ประวิทย์ (SA)", role: "SA" },
  { id: "u10", name: "จันทรา (Dev)", role: "Dev" },
  { id: "u11", name: "เอกชัย (Dev)", role: "Dev" },
  { id: "u12", name: "มาลี (Tester)", role: "Tester" },
] as const;

const FALLBACK_USER = USERS[0] as User;

export function findUser(id: string): User | null {
  return USERS.find((user) => user.id === id) ?? null;
}

export function userName(id: string): string {
  return findUser(id)?.name ?? "ไม่ทราบ";
}

/**
 * FR5.3 — อ่านผู้ใช้ปัจจุบันที่จำไว้ ข้าม session
 *
 * ถ้าค่าที่จำไว้ชี้ไปยังผู้ใช้ที่ไม่มีอยู่ (เช่นรายชื่อถูกแก้) จะถอยไปใช้คนแรก
 * แทนการล้มเหลว
 */
export function readCurrentUserId(): string {
  const stored = readScalar(STORAGE_KEYS.currentUser);
  if (stored !== null && findUser(stored) !== null) return stored;
  return FALLBACK_USER.id;
}

/** FR5.3 — จำผู้ใช้ปัจจุบันไว้ข้าม session */
export function writeCurrentUserId(id: string): void {
  writeScalar(STORAGE_KEYS.currentUser, id);
}

/** ผู้ใช้ที่กรองตามตำแหน่ง ใช้ในฟอร์มมอบหมายงาน */
export function usersByRole(role: Role): User[] {
  return USERS.filter((user) => user.role === role);
}
