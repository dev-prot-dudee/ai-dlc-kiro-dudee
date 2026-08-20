export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** สถานะยังไม่มีข้อมูล — บอกสิ่งที่ทำได้ต่อ ไม่ใช่แค่บอกว่าว่าง */
export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      className="border border-dashed border-neutral-100 rounded py-12 px-8 text-center text-neutral-300 text-body"
      data-testid="empty-state"
    >
      <p>{message}</p>
      {actionLabel !== undefined && onAction !== undefined && (
        <button type="button" className="btn-primary mt-4" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
