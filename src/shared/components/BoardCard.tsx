import type { ReactNode } from "react";

export interface BoardCardProps {
  title: string;
  /** ข้อมูลประกอบใต้หัวข้อ เช่น ผู้รับผิดชอบ จำนวนลูก */
  meta?: ReactNode;
  /** ข้อความเตือน เช่น Requirement นี้ยังไม่มี Task (FR4.3) */
  warning?: string;
  onOpen: () => void;
  testId?: string;
}

/**
 * การ์ดบน board — พื้นขาว ขอบเทาอ่อน มุมโค้ง เงาบาง ตามภาพต้นแบบ
 *
 * ใช้ <button> ไม่ใช่ <div onClick> เพื่อให้เข้าถึงด้วย keyboard ได้เอง
 * โดยไม่ต้องเพิ่ม tabIndex หรือ handler ของ Enter/Space (NFR5)
 */
export function BoardCard({ title, meta, warning, onOpen, testId }: BoardCardProps) {
  return (
    <button type="button" className="board-card" onClick={onOpen} data-testid={testId}>
      <span className="board-card__title">{title}</span>
      {warning !== undefined && <span className="board-card__warning">{warning}</span>}
      {meta !== undefined && <span className="board-card__meta">{meta}</span>}
    </button>
  );
}
