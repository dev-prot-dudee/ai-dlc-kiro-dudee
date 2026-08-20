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
 */
export function BoardView<T>({ groups, renderCard, onAdd, testId }: BoardViewProps<T>) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:overflow-x-auto pb-5" data-testid={testId}>
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
