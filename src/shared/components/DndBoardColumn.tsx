import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import { columnStyle, type StatusColor } from "../status-colors";

export interface DndBoardColumnProps {
  id: string;
  label: string;
  color: StatusColor;
  count: number;
  itemIds: string[];
  onAdd?: () => void;
  children: ReactNode;
  testId?: string;
}

/**
 * Column ที่รับการลาก — ใช้ useDroppable + SortableContext
 */
export function DndBoardColumn({
  id,
  label,
  color,
  count,
  itemIds,
  onAdd,
  children,
  testId,
}: DndBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const style = columnStyle(color);

  return (
    <section
      className="w-full sm:w-column sm:flex-shrink-0 flex flex-col gap-3"
      aria-label={`${label} (${count} รายการ)`}
    >
      <header
        className="flex items-center gap-3 px-4 py-3 rounded text-small font-semibold text-neutral-600"
        style={{ background: style.bg }}
      >
        <span
          className="w-[10px] h-[10px] rounded-full flex-shrink-0"
          style={{ background: style.dot }}
          aria-hidden="true"
        />
        <span data-testid={testId ? `${testId}-label` : undefined}>{label}</span>
        <span
          className="text-neutral-300 font-normal text-caption ml-1"
          data-testid={testId ? `${testId}-count` : undefined}
        >
          {count}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-[60px] rounded p-1 transition-colors duration-fast ${
          isOver ? "bg-primary/[.05] ring-2 ring-primary/20" : ""
        }`}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>

      {onAdd !== undefined && (
        <button
          type="button"
          className="border border-dashed border-neutral-100 bg-transparent rounded px-4 py-3 text-neutral-300 text-small text-left min-h-touch transition-all duration-fast hover:bg-black/[.03] hover:border-primary hover:text-primary"
          onClick={onAdd}
          data-testid={testId ? `${testId}-add` : undefined}
        >
          + เพิ่มรายการ
        </button>
      )}
    </section>
  );
}
