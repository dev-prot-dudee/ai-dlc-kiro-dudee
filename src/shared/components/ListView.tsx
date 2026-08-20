import type { ReactNode } from "react";

export interface ListColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

export interface ListViewProps<T> {
  columns: ListColumn<T>[];
  items: T[];
  rowKey: (item: T) => string;
  onOpen: (item: T) => void;
  caption: string;
  testId?: string;
}

/**
 * มุมมองตาราง
 *
 * มีไว้เพราะ board แสดง filter ได้ไม่ครบตามที่ requirements กำหนด — เช่น FR2.4
 * ต้องกรองตามผู้รับผิดชอบ ตำแหน่ง และ Requirement ต้นทางพร้อมกัน ซึ่ง board
 * ที่จัดกลุ่มด้วยตำแหน่งอยู่แล้วทำไม่ได้
 */
export function ListView<T>({
  columns,
  items,
  rowKey,
  onOpen,
  caption,
  testId,
}: ListViewProps<T>) {
  return (
    <table className="list-table" data-testid={testId}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
          <th scope="col">
            <span className="visually-hidden">การกระทำ</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={rowKey(item)}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(item)}</td>
            ))}
            <td>
              <button
                type="button"
                className="btn-link"
                onClick={() => onOpen(item)}
                data-testid={`open-${rowKey(item)}`}
              >
                เปิด
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
