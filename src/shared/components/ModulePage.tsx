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
  /** ข้อความเมื่อยังไม่มีข้อมูลเลย */
  emptyMessage: string;
  items: T[];
  /** ข้อความที่ค้นหาจะถูกเทียบกับค่านี้ */
  searchText: (item: T) => string;
  filters: (state: Record<string, string>, set: (id: string, v: string) => void) => FilterSpec[];
  /** กรองรายการตามค่าของตัวกรอง */
  applyFilters: (items: T[], state: Record<string, string>) => T[];
  groups: (items: T[]) => BoardGroup<T>[];
  card: (item: T) => CardContent;
  listColumns: ListColumn<T>[];
  detail: (item: T) => DetailRow[];
  /** ส่วนแสดงสายเชื่อมโยงในหน้ารายละเอียด */
  traceSections?: (item: T) => { title: string; body: ReactNode }[];
  renderForm: (args: {
    existing?: T;
    groupKey?: string;
    onDone: () => void;
    onCancel: () => void;
  }) => ReactNode;
  /** ข้อความยืนยันก่อนลบ รวมจำนวนลูกที่จะกำพร้า (FR4.4, FR4.5) */
  deleteMessage: (item: T) => string;
  onDelete: (item: T, cascade: boolean) => void;
  /** เมื่อมีลูก ให้เสนอทางเลือกลบตามด้วย */
  hasChildren?: (item: T) => boolean;
}

type Screen<T> =
  | { kind: "list" }
  | { kind: "create"; groupKey?: string }
  | { kind: "edit"; item: T }
  | { kind: "detail"; item: T };

/**
 * หน้าจอของ module หนึ่งตัว — ใช้ร่วมกันทั้ง Requirements, Tasks และ Defects
 *
 * ทั้งสาม module มีรูปแบบหน้าจอเหมือนกันทุกอย่าง (board/list, ฟอร์ม,
 * รายละเอียด, ยืนยันก่อนลบ) ต่างกันแค่ field และวิธีจัดกลุ่ม จึงรวมเป็นตัวเดียว
 * แล้วให้แต่ละ module ส่ง config เข้ามา
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

  if (screen.kind === "create" || screen.kind === "edit") {
    return (
      <div className="main__scroll">
        {header}
        <h2 className="detail__section-title">
          {screen.kind === "edit" ? "แก้ไขรายการ" : `สร้าง ${config.newLabel}`}
        </h2>
        {config.renderForm({
          existing: screen.kind === "edit" ? screen.item : undefined,
          groupKey: screen.kind === "create" ? screen.groupKey : undefined,
          onDone: () => {
            refresh();
            setScreen({ kind: "list" });
          },
          onCancel: () => setScreen({ kind: "list" }),
        })}
      </div>
    );
  }

  if (screen.kind === "detail") {
    const item = screen.item;
    return (
      <div className="main__scroll">
        {header}
        <div className="form__actions">
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

        <section className="detail__section">
          <dl className="detail__meta">
            {config.detail(item).map((row) => (
              <div key={row.label} style={{ display: "contents" }}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {config.traceSections?.(item).map((section) => (
          <section className="detail__section" key={section.title}>
            <h2 className="detail__section-title">{section.title}</h2>
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
      </div>
    );
  }

  return (
    <div className="main__scroll">
      {header}

      {error !== null && (
        <div className="alert" role="alert">
          <p className="alert__title">เกิดข้อผิดพลาด</p>
          <p>{error}</p>
        </div>
      )}

      <div className="view-bar">
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
    </div>
  );
}
