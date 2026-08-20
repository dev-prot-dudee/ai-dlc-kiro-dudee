import { useRef } from "react";

export interface ToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  onNew: () => void;
  newLabel: string;
  onExport: () => void;
  onImport: (json: string) => void;
}

/**
 * แถบเครื่องมือขวา — ปุ่มไอคอนเรียงแล้วปิดท้ายด้วยปุ่ม New สีน้ำเงิน
 * ตามภาพต้นแบบ
 *
 * ปุ่ม export/import อยู่ที่นี่เพราะเป็นการกระทำระดับหน้า ไม่ใช่ระดับรายการ
 */
export function Toolbar({
  search,
  onSearch,
  onNew,
  newLabel,
  onExport,
  onImport,
}: ToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File): Promise<void> {
    try {
      onImport(await file.text());
    } catch (error) {
      // ความล้มเหลวของการอ่านไฟล์ต้องถึงผู้ใช้ ไม่ใช่เงียบหายไป
      window.alert(`อ่านไฟล์ไม่สำเร็จ: ${String(error)}`);
    }
  }

  return (
    <div className="toolbar">
      <label className="visually-hidden" htmlFor="toolbar-search">
        ค้นหา
      </label>
      <input
        id="toolbar-search"
        type="text"
        placeholder="ค้นหา"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        style={{ width: 180 }}
        data-testid="toolbar-search"
      />
      <button
        type="button"
        className="toolbar__icon-btn"
        onClick={onExport}
        data-testid="toolbar-export"
      >
        Export
      </button>
      <button
        type="button"
        className="toolbar__icon-btn"
        onClick={() => fileInput.current?.click()}
        data-testid="toolbar-import"
      >
        Import
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        className="visually-hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className="btn-primary"
        onClick={onNew}
        data-testid="toolbar-new"
      >
        + {newLabel}
      </button>
    </div>
  );
}
