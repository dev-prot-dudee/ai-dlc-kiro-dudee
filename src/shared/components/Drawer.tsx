import { useEffect, useRef, type ReactNode } from "react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Drawer — slide-in panel จากขวา
 *
 * - Backdrop คลิกปิดได้
 * - ปุ่ม ✕ มุมขวาบน
 * - กด Escape ปิดได้
 * - Focus trap เบื้องต้น (focus ไปที่ปุ่มปิดเมื่อเปิด)
 * - Mobile: เต็มจอ, Desktop: 480px max-width
 */
export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus ปุ่มปิดเมื่อเปิด
    closeRef.current?.focus();

    // ป้องกัน scroll ของ body
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className="fixed top-0 right-0 h-full z-50 w-full sm:w-[480px] bg-white shadow-supreme
          flex flex-col
          animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <h2
            id="drawer-title"
            className="font-display text-body sm:text-subheading font-semibold text-neutral-600 m-0"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded text-neutral-300 hover:text-neutral-600 hover:bg-black/5 transition-colors duration-fast"
            onClick={onClose}
            aria-label="ปิด"
          >
            ✕
          </button>
        </header>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
          {children}
        </div>
      </aside>
    </>
  );
}
