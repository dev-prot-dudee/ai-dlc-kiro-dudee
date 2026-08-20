import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

export interface DndBoardCardProps {
  id: string;
  title: string;
  meta?: ReactNode;
  warning?: string;
  onOpen: () => void;
  testId?: string;
}

/**
 * การ์ดที่ลากได้ — ใช้ useSortable จาก @dnd-kit
 * รองรับ mouse, touch, keyboard (Space/Enter เริ่มลาก, Arrow keys เลื่อน)
 */
export function DndBoardCard({ id, title, meta, warning, onOpen, testId }: DndBoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-neutral-100 rounded p-4 w-full text-neutral-600 transition-all duration-fast ${
        isDragging ? "shadow-floating z-10" : "shadow-none hover:shadow-raised hover:border-transparent"
      }`}
      data-testid={testId}
    >
      {/* Drag handle area */}
      <div
        className="flex items-start gap-2 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <span className="text-neutral-200 text-caption mt-0.5 select-none" aria-hidden="true">
          ⠿
        </span>
        <button
          type="button"
          className="flex-1 text-left bg-transparent border-none p-0 cursor-pointer"
          onClick={onOpen}
          tabIndex={0}
        >
          <span className="text-small font-semibold leading-[18px] break-words text-neutral-600 block">
            {title}
          </span>
          {warning !== undefined && (
            <span className="block text-danger text-caption mt-2">{warning}</span>
          )}
          {meta !== undefined && (
            <span className="flex flex-wrap gap-2 mt-3 text-neutral-300 text-caption">{meta}</span>
          )}
        </button>
      </div>
    </div>
  );
}
