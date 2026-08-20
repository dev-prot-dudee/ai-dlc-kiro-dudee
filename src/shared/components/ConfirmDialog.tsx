import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  title: string;
  /** ข้อความอธิบายผลของการยืนยัน เช่น จำนวนที่จะกำพร้า (FR4.4, FR4.5) */
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * กล่องยืนยันก่อนลบ (FR1.6, FR2.5, FR3.6)
 *
 * ปิดด้วย Escape ได้ และย้าย focus เข้ากล่องเมื่อเปิด เพื่อให้ผู้ใช้ keyboard
 * ไม่หลุดไปอยู่หลังกล่อง (NFR5)
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2 className="dialog__title" id="confirm-title">
          {title}
        </h2>
        <p id="confirm-message">{message}</p>
        <div className="dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            data-testid="confirm-cancel"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            data-testid="confirm-ok"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
