import type { ReactNode } from "react";

export interface BoardCardProps {
  title: string;
  meta?: ReactNode;
  warning?: string;
  onOpen: () => void;
  testId?: string;
}

/**
 * การ์ดบน board — พื้นขาว ขอบเทาอ่อน มุมโค้ง
 *
 * ใช้ <button> ไม่ใช่ <div onClick> เพื่อให้เข้าถึงด้วย keyboard ได้เอง (NFR5)
 */
export function BoardCard({ title, meta, warning, onOpen, testId }: BoardCardProps) {
  return (
    <button
      type="button"
      className="bg-white border border-neutral-100 rounded shadow-none p-4 text-left w-full block text-neutral-600 transition-all duration-fast hover:shadow-raised hover:border-transparent"
      onClick={onOpen}
      data-testid={testId}
    >
      <span className="text-small font-semibold leading-[18px] break-words text-neutral-600">
        {title}
      </span>
      {warning !== undefined && (
        <span className="block text-danger text-caption mt-2">{warning}</span>
      )}
      {meta !== undefined && (
        <span className="flex flex-wrap gap-2 mt-3 text-neutral-300 text-caption">{meta}</span>
      )}
    </button>
  );
}
