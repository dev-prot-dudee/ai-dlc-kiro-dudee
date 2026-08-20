import type { ReactNode } from "react";
import { columnStyle, type StatusColor } from "../status-colors";

export interface BoardColumnProps {
  /** ชื่อสถานะ — แสดงเป็นตัวอักษรเสมอ ไม่ใช่สื่อด้วยสีเพียงอย่างเดียว (NFR5) */
  label: string;
  color: StatusColor;
  /** จำนวนการ์ดใน column นี้ — สำหรับ Defect board นี่คือคำตอบของ FR3.7 */
  count: number;
  onAdd?: () => void;
  children: ReactNode;
  testId?: string;
}

export function BoardColumn({
  label,
  color,
  count,
  onAdd,
  children,
  testId,
}: BoardColumnProps) {
  const style = columnStyle(color);
  return (
    <section className="board-column" aria-label={`${label} (${count} รายการ)`}>
      <header className="board-column__header" style={{ background: style.bg }}>
        <span
          className="board-column__dot"
          style={{ background: style.dot }}
          aria-hidden="true"
        />
        <span data-testid={testId ? `${testId}-label` : undefined}>{label}</span>
        <span
          className="board-column__count"
          data-testid={testId ? `${testId}-count` : undefined}
        >
          {count}
        </span>
      </header>
      {children}
      {onAdd !== undefined && (
        <button
          type="button"
          className="board-column__add"
          onClick={onAdd}
          data-testid={testId ? `${testId}-add` : undefined}
        >
          + เพิ่มรายการ
        </button>
      )}
    </section>
  );
}
