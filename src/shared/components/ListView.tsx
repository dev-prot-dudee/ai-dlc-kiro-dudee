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
 * มุมมองตาราง — Desktop เป็นตาราง, Mobile เป็นการ์ด
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
    <div data-testid={testId}>
      {/* Desktop: table */}
      <table className="hidden sm:table w-full border-collapse text-small">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="text-left px-4 py-3 border-b border-neutral-100 text-neutral-300 font-semibold text-caption uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            <th
              scope="col"
              className="text-left px-4 py-3 border-b border-neutral-100"
            >
              <span className="visually-hidden">การกระทำ</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={rowKey(item)}
              className="transition-colors duration-fast hover:bg-neutral-100"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="text-left px-4 py-3 border-b border-neutral-100 align-top"
                >
                  {column.render(item)}
                </td>
              ))}
              <td className="text-left px-4 py-3 border-b border-neutral-100 align-top">
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

      {/* Mobile: card list */}
      <div className="sm:hidden flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={rowKey(item)}
            type="button"
            className="bg-white border border-neutral-100 rounded p-4 text-left w-full transition-all duration-fast hover:shadow-raised active:bg-neutral-50"
            onClick={() => onOpen(item)}
            data-testid={`open-${rowKey(item)}`}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex gap-2 items-baseline py-0.5">
                <span className="text-caption text-neutral-300 font-semibold min-w-[80px] flex-shrink-0">
                  {column.header}
                </span>
                <span className="text-small text-neutral-600 break-words">
                  {column.render(item)}
                </span>
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
