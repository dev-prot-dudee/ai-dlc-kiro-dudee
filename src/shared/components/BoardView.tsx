import type { ReactNode } from "react";
import { BoardColumn } from "./BoardColumn";
import type { StatusColor } from "../status-colors";

export interface BoardGroup<T> {
  key: string;
  label: string;
  color: StatusColor;
  items: T[];
}

export interface BoardViewProps<T> {
  groups: BoardGroup<T>[];
  renderCard: (item: T) => ReactNode;
  onAdd?: (groupKey: string) => void;
  testId?: string;
}

/**
 * Board ที่จัดกลุ่มรายการเป็น column เรียงแนวนอน เลื่อนได้เมื่อเกินความกว้างจอ
 *
 * รอบนี้ไม่มี status workflow จึงจัดกลุ่มด้วย field ที่มีอยู่ต่างกันในแต่ละ module:
 * Requirements ใช้ MoSCoW, Tasks ใช้ตำแหน่ง, Defects ใช้ประเภท
 *
 * ไม่รองรับการลากการ์ดข้าม column โดยเจตนา — column แทนค่าของ field จริง
 * การลากข้ามจึงเท่ากับแก้ข้อมูลที่มีนัยสำคัญ (เช่นเปลี่ยนประเภท defect
 * ซึ่งเปลี่ยนว่าใครรับผิด) การแก้ค่าทำผ่านฟอร์มแก้ไขเท่านั้น
 */
export function BoardView<T>({ groups, renderCard, onAdd, testId }: BoardViewProps<T>) {
  return (
    <div className="board" data-testid={testId}>
      {groups.map((group) => (
        <BoardColumn
          key={group.key}
          label={group.label}
          color={group.color}
          count={group.items.length}
          onAdd={onAdd ? () => onAdd(group.key) : undefined}
          testId={testId ? `${testId}-${group.key}` : undefined}
        >
          {group.items.map((item) => renderCard(item))}
        </BoardColumn>
      ))}
    </div>
  );
}
