import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * กล่องยืนยันก่อนลบ (FR1.6, FR2.5, FR3.6)
 *
 * ปิดด้วย Escape ได้ และย้าย focus เข้ากล่องเมื่อเปิด (NFR5)
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
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-5 z-modal backdrop-blur-[4px]"
      role="presentation"
    >
      <div
        className="bg-white rounded-t-[16px] sm:rounded shadow-modal p-6 sm:p-8 w-full sm:max-w-[440px] flex flex-col gap-4 sm:gap-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2
          className="m-0 font-display text-h3 font-semibold leading-[32px] text-neutral-600"
          id="confirm-title"
        >
          {title}
        </h2>
        <p className="text-body text-neutral-400" id="confirm-message">
          {message}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
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
