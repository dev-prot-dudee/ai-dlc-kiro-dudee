export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** สถานะยังไม่มีข้อมูล — บอกสิ่งที่ทำได้ต่อ ไม่ใช่แค่บอกว่าว่าง */
export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state" data-testid="empty-state">
      <p>{message}</p>
      {actionLabel !== undefined && onAction !== undefined && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
