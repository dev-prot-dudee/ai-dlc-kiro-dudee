import { useMemo, useState, type ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { ViewTabs, type ViewMode } from "./ViewTabs";
import { Toolbar } from "./Toolbar";
import { FilterBar, type FilterSpec } from "./FilterBar";
import { BoardView, type BoardGroup } from "./BoardView";
import { BoardCard } from "./BoardCard";
import { ListView, type ListColumn } from "./ListView";
import { EmptyState } from "./EmptyState";
import { ConfirmDialog } from "./ConfirmDialog";
import { Drawer } from "./Drawer";
import { downloadExport, importAll } from "../storage";
import { useData } from "../DataContext";
import type { Entity } from "../repository";

export interface CardContent {
  title: string;
  meta: ReactNode;
  warning?: string;
}

export interface DetailRow {
  label: string;
  value: ReactNode;
}

export interface ModulePageConfig<T extends Entity> {
  icon: string;
  title: string;
  subtitle: string;
  newLabel: string;
  emptyMessage: string;
  items: T[];
  searchText: (item: T) => string;
  filters: (state: Record<string, string>, set: (id: string, v: string) => void) => FilterSpec[];
  applyFilters: (items: T[], state: Record<string, string>) => T[];
  groups: (items: T[]) => BoardGroup<T>[];
  card: (item: T) => CardContent;
  listColumns: ListColumn<T>[];
  detail: (item: T) => DetailRow[];
  traceSections?: (item: T) => { title: string; body: ReactNode }[];
  renderForm: (args: {
    existing?: T;
    groupKey?: string;
    onDone: () => void;
    onCancel: () => void;
  }) => ReactNode;
  /** Optional custom board renderer (e.g. DnD board for Tasks) */
  renderBoard?: (args: {
    items: T[];
    onOpenItem: (item: T) => void;
    onAdd: (groupKey: string) => void;
  }) => ReactNode;
  deleteMessage: (item: T) => string;
  onDelete: (item: T, cascade: boolean) => void;
  hasChildren?: (item: T) => boolean;
}

type Screen<T> =
  | { kind: "list" }
  | { kind: "create"; groupKey?: string }
  | { kind: "edit"; item: T }
  | { kind: "detail"; item: T };

/**
 * หน้าจอของ module หนึ่งตัว — ใช้ร่วมกันทั้ง Requirements, Tasks และ Defects
 */
export function ModulePage<T extends Entity>({ config }: { config: ModulePageConfig<T> }) {
  const { refresh, error, setError } = useData();
  const [screen, setScreen] = useState<Screen<T>>({ kind: "list" });
  const [view, setView] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  function setFilter(id: string, value: string): void {
    setFilterState((current) => ({ ...current, [id]: value }));
  }

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = config.applyFilters(config.items, filterState);
    if (term === "") return filtered;
    return filtered.filter((item) => config.searchText(item).toLowerCase().includes(term));
  }, [config, filterState, search]);

  function handleImport(json: string): void {
    try {
      importAll(json);
      setError(null);
      refresh();
    } catch (importError) {
      setError(`นำเข้าข้อมูลไม่สำเร็จ: ${(importError as Error).message}`);
    }
  }

  function confirmDelete(cascade: boolean): void {
    if (pendingDelete === null) return;
    try {
      config.onDelete(pendingDelete, cascade);
      setError(null);
      refresh();
      setScreen({ kind: "list" });
    } catch (deleteError) {
      setError(`ลบไม่สำเร็จ: ${(deleteError as Error).message}`);
    } finally {
      setPendingDelete(null);
    }
  }

  const header = (
    <PageHeader icon={config.icon} title={config.title} subtitle={config.subtitle} />
  );

  // Drawer สำหรับ create/edit — แสดงทับ board/list/detail โดยไม่เปลี่ยนหน้า
  const drawerOpen = screen.kind === "create" || screen.kind === "edit";
  const drawerTitle =
    screen.kind === "edit" ? "แก้ไขรายการ" : `สร้าง ${config.newLabel}`;

  const drawer = (
    <Drawer
      isOpen={drawerOpen}
      onClose={() => setScreen(screen.kind === "create" || screen.kind === "edit" ? { kind: "list" } : screen)}
      title={drawerTitle}
    >
      {drawerOpen &&
        config.renderForm({
          existing: screen.kind === "edit" ? screen.item : undefined,
          groupKey: screen.kind === "create" ? screen.groupKey : undefined,
          onDone: () => {
            refresh();
            setScreen({ kind: "list" });
          },
          onCancel: () => setScreen({ kind: "list" }),
        })}
    </Drawer>
  );

  if (screen.kind === "detail") {
    const item = screen.item;
    return (
      <div className="flex-1 overflow-auto px-4 sm:px-8 md:px-12 pb-8 md:pb-12">
        {header}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setScreen({ kind: "list" })}
          >
            ← กลับ
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setScreen({ kind: "edit", item })}
            data-testid="detail-edit"
          >
            แก้ไข
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => setPendingDelete(item)}
            data-testid="detail-delete"
          >
            ลบ
          </button>
        </div>

        <section className="mt-6 sm:mt-8">
          <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-5 gap-y-2 sm:gap-y-3 m-0">
            {config.detail(item).map((row) => (
              <div key={row.label} style={{ display: "contents" }}>
                <dt className="text-neutral-300 text-small">{row.label}</dt>
                <dd className="m-0 text-small">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {config.traceSections?.(item).map((section) => (
          <section className="mt-6 sm:mt-8" key={section.title}>
            <h2 className="font-display text-body sm:text-h3 font-semibold leading-[25px] sm:leading-[32px] m-0 mb-3 sm:mb-4 text-neutral-600">
              {section.title}
            </h2>
            {section.body}
          </section>
        ))}

        {pendingDelete !== null && (
          <ConfirmDialog
            title="ยืนยันการลบ"
            message={config.deleteMessage(pendingDelete)}
            confirmLabel={
              config.hasChildren?.(pendingDelete) === true ? "ลบทั้งหมด" : "ลบ"
            }
            onConfirm={() => confirmDelete(config.hasChildren?.(pendingDelete) === true)}
            onCancel={() => setPendingDelete(null)}
          />
        )}

        {drawer}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 sm:px-8 md:px-12 pb-8 md:pb-12">
      {header}

      {error !== null && (
        <div
          className="border border-danger bg-danger-light rounded px-5 py-4 my-5"
          role="alert"
        >
          <p className="font-semibold m-0 mb-2">เกิดข้อผิดพลาด</p>
          <p className="m-0">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-neutral-100 pb-3 mb-4 sm:mb-5">
        <ViewTabs value={view} onChange={setView} />
        <Toolbar
          search={search}
          onSearch={setSearch}
          onNew={() => setScreen({ kind: "create" })}
          newLabel={config.newLabel}
          onExport={downloadExport}
          onImport={handleImport}
        />
      </div>

      {view === "list" && <FilterBar filters={config.filters(filterState, setFilter)} />}

      {config.items.length === 0 ? (
        <EmptyState
          message={config.emptyMessage}
          actionLabel={`สร้าง ${config.newLabel}`}
          onAction={() => setScreen({ kind: "create" })}
        />
      ) : view === "board" ? (
        config.renderBoard ? (
          config.renderBoard({
            items: visible,
            onOpenItem: (item) => setScreen({ kind: "detail", item }),
            onAdd: (groupKey) => setScreen({ kind: "create", groupKey }),
          })
        ) : (
          <BoardView
            groups={config.groups(visible)}
            testId="board"
            onAdd={(groupKey) => setScreen({ kind: "create", groupKey })}
            renderCard={(item) => {
              const content = config.card(item);
              return (
                <BoardCard
                  key={item.id}
                  title={content.title}
                  meta={content.meta}
                  warning={content.warning}
                  onOpen={() => setScreen({ kind: "detail", item })}
                  testId={`card-${item.id}`}
                />
              );
            }}
          />
        )
      ) : (
        <ListView
          columns={config.listColumns}
          items={visible}
          rowKey={(item) => item.id}
          onOpen={(item) => setScreen({ kind: "detail", item })}
          caption={`รายการ ${config.title}`}
          testId="list"
        />
      )}

      {pendingDelete !== null && (
        <ConfirmDialog
          title="ยืนยันการลบ"
          message={config.deleteMessage(pendingDelete)}
          confirmLabel={config.hasChildren?.(pendingDelete) === true ? "ลบทั้งหมด" : "ลบ"}
          onConfirm={() => confirmDelete(config.hasChildren?.(pendingDelete) === true)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {drawer}
    </div>
  );
}
