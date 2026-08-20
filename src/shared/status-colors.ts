/**
 * การจับคู่ค่าสถานะกับสี ตามตาราง "สีของสถานะแต่ละ column" ในแผน
 *
 * สำคัญ (NFR5): สีเป็นเพียงตัวช่วยอ่าน ไม่ใช่ตัวสื่อความหมาย ทุก column
 * แสดงชื่อสถานะเป็นตัวอักษรกำกับเสมอ ผู้ใช้ที่แยกสีไม่ได้จึงยังใช้งานได้
 */

export type StatusColor = "gray" | "orange" | "blue" | "green" | "red";

export interface ColumnStyle {
  dot: string;
  bg: string;
}

const PALETTE: Record<StatusColor, ColumnStyle> = {
  gray: { dot: "var(--status-gray-dot)", bg: "var(--status-gray-bg)" },
  orange: { dot: "var(--status-orange-dot)", bg: "var(--status-orange-bg)" },
  blue: { dot: "var(--status-blue-dot)", bg: "var(--status-blue-bg)" },
  green: { dot: "var(--status-green-dot)", bg: "var(--status-green-bg)" },
  red: { dot: "var(--status-red-dot)", bg: "var(--status-red-bg)" },
};

export function columnStyle(color: StatusColor): ColumnStyle {
  return PALETTE[color];
}

/** สีของ MoSCoW priority — Must เป็นเขียวเพราะสำคัญสุดและต้องเด่น */
export const PRIORITY_COLORS: Record<string, StatusColor> = {
  Must: "green",
  Should: "orange",
  Could: "blue",
  "Won't": "gray",
};

/** สีของตำแหน่งผู้รับผิดชอบ */
export const ROLE_COLORS: Record<string, StatusColor> = {
  SA: "gray",
  UX: "blue",
  Dev: "orange",
  Tester: "green",
};

/** สีของประเภท defect */
export const DEFECT_TYPE_COLORS: Record<string, StatusColor> = {
  "Code Bug": "gray",
  "SA Gap": "green",
  "Design Gap": "orange",
  "Test Escape": "blue",
  "NFR Violation": "red",
};

/** สีของระดับความรุนแรง ใช้กับ badge บนการ์ด */
export const SEVERITY_COLORS: Record<string, StatusColor> = {
  Critical: "red",
  High: "orange",
  Medium: "blue",
  Low: "gray",
};
