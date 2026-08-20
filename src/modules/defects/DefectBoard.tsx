import { ModulePage, type ModulePageConfig } from "../../shared/components/ModulePage";
import { DndBoardView } from "../../shared/components/DndBoardView";
import { DndBoardCard } from "../../shared/components/DndBoardCard";
import { DefectForm } from "./DefectForm";
import { defectsRepo } from "./defects.repo";
import { useData } from "../../shared/DataContext";
import { userName } from "../../shared/users";
import {
  DEFECT_TYPE_COLORS,
  SEVERITY_COLORS,
  columnStyle,
} from "../../shared/status-colors";
import {
  DEFECT_TYPES,
  SEVERITIES,
  type Defect,
  type DefectType,
} from "../../shared/types";
import { traceBackward } from "../../shared/traceability";

/**
 * หน้า Defect Tracking
 *
 * Board จัดกลุ่มด้วยประเภท defect ทั้ง 5 ค่า ซึ่งให้ผลพลอยได้: ตัวเลขนับบนหัว
 * column คือคำตอบของ FR3.7 โดยตรง และทำให้เห็นทันทีว่าปัญหากระจุกที่ต้นน้ำไหน
 * เช่นถ้า SA Gap สูง แปลว่าปัญหาอยู่ที่การเขียนสเปค ไม่ใช่ที่การเขียนโค้ด
 */
export function DefectBoard() {
  const { requirements, tasks, defects, currentUserId, refresh } = useData();

  const config: ModulePageConfig<Defect> = {
    icon: "◆",
    title: "Defects",
    subtitle: "บันทึก Defect พร้อมระบุประเภทเพื่อชี้ต้นน้ำของปัญหา",
    newLabel: "Defect",
    emptyMessage:
      "ยังไม่มี Defect ในระบบ Defect ทุกตัวต้องผูกกับ Task จึงต้องมี Task ก่อน",
    items: defects,
    searchText: (item) => `${item.title} ${item.description}`,

    filters: (state, set) => [
      {
        id: "filter-type",
        label: "ประเภท",
        value: state["filter-type"] ?? "",
        onChange: (value) => set("filter-type", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...DEFECT_TYPES.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-severity",
        label: "ความรุนแรง",
        value: state["filter-severity"] ?? "",
        onChange: (value) => set("filter-severity", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...SEVERITIES.map((value) => ({ value, label: value })),
        ],
      },
    ],

    applyFilters: (items, state) =>
      items.filter((item) => {
        const type = state["filter-type"] ?? "";
        const severity = state["filter-severity"] ?? "";
        if (type !== "" && item.type !== type) return false;
        if (severity !== "" && item.severity !== severity) return false;
        return true;
      }),

    // FR3.7 — ตัวเลขบนหัว column คือจำนวนแยกตามประเภท
    groups: (items) =>
      DEFECT_TYPES.map((type) => ({
        key: type,
        label: type,
        color: DEFECT_TYPE_COLORS[type] ?? "gray",
        items: items.filter((item) => item.type === type),
      })),

    card: (item) => {
      const trace = traceBackward(item, tasks, requirements);
      const severityColor = SEVERITY_COLORS[item.severity] ?? "gray";
      return {
        title: item.title,
        meta: (
          <>
            <span
              className="inline-flex items-center gap-1 px-3 py-0.5 rounded text-caption font-semibold"
              style={{ background: columnStyle(severityColor).bg }}
            >
              {item.severity}
            </span>
            <span>{userName(item.reporterId)}</span>
            <span>✓ {trace.task?.title ?? "(Task ถูกลบแล้ว)"}</span>
          </>
        ),
      };
    },

    listColumns: [
      { key: "title", header: "หัวข้อ", render: (item) => item.title },
      { key: "type", header: "ประเภท", render: (item) => item.type },
      { key: "severity", header: "ความรุนแรง", render: (item) => item.severity },
      {
        key: "task",
        header: "Task ต้นทาง",
        render: (item) =>
          traceBackward(item, tasks, requirements).task?.title ?? "(ถูกลบแล้ว)",
      },
      {
        key: "reporter",
        header: "ผู้รายงาน",
        render: (item) => userName(item.reporterId),
      },
    ],

    detail: (item) => [
      { label: "หัวข้อ", value: item.title },
      { label: "รายละเอียด", value: item.description === "" ? "—" : item.description },
      { label: "ประเภท", value: item.type },
      { label: "ความรุนแรง", value: item.severity },
      { label: "ผู้รายงาน", value: userName(item.reporterId) },
      { label: "รายงานเมื่อ", value: new Date(item.createdAt).toLocaleString("th-TH") },
    ],

    // FR4.2 — สายย้อนกลับขึ้นถึง Requirement
    traceSections: (item) => {
      const trace = traceBackward(item, tasks, requirements);
      return [
        {
          title: "สายย้อนกลับถึงต้นทาง",
          body: (
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              <li>
                <strong>Task:</strong>{" "}
                {trace.task
                  ? `${trace.task.title} · ${trace.task.role} · ${userName(trace.task.assigneeId)}`
                  : "(Task ถูกลบแล้ว — Defect นี้กำพร้า)"}
              </li>
              <li>
                <strong>Requirement:</strong>{" "}
                {trace.requirement
                  ? `${trace.requirement.title} · ${trace.requirement.priority}`
                  : "(ไม่พบ Requirement ต้นทาง)"}
              </li>
            </ul>
          ),
        },
      ];
    },

    renderBoard: ({ items, onOpenItem, onAdd }) => {
      const groups = DEFECT_TYPES.map((type) => ({
        key: type,
        label: type,
        color: DEFECT_TYPE_COLORS[type] ?? ("gray" as const),
        items: items.filter((item) => item.type === type),
      }));

      function handleMoveItem(itemId: string, _fromGroup: string, toGroup: string): void {
        const defect = defects.find((d) => d.id === itemId);
        if (!defect) return;
        const newType = toGroup as DefectType;
        if (!DEFECT_TYPES.includes(newType)) return;
        defectsRepo.update(defect.id, {
          title: defect.title,
          description: defect.description,
          taskId: defect.taskId,
          type: newType,
          severity: defect.severity,
          reporterId: defect.reporterId,
        });
        refresh();
      }

      return (
        <DndBoardView
          groups={groups}
          testId="board"
          onAdd={onAdd}
          onMoveItem={handleMoveItem}
          renderCard={(item) => {
            const trace = traceBackward(item, tasks, requirements);
            const severityColor = SEVERITY_COLORS[item.severity] ?? "gray";
            return (
              <DndBoardCard
                key={item.id}
                id={item.id}
                title={item.title}
                onOpen={() => onOpenItem(item)}
                testId={`card-${item.id}`}
                meta={
                  <>
                    <span
                      className="inline-flex items-center gap-1 px-3 py-0.5 rounded text-caption font-semibold"
                      style={{ background: columnStyle(severityColor).bg }}
                    >
                      {item.severity}
                    </span>
                    <span>{userName(item.reporterId)}</span>
                    <span>✓ {trace.task?.title ?? "(Task ถูกลบแล้ว)"}</span>
                  </>
                }
              />
            );
          }}
        />
      );
    },

    renderForm: ({ existing, groupKey, onDone, onCancel }) => (
      <DefectForm
        existing={existing}
        initialType={
          groupKey !== undefined && DEFECT_TYPES.includes(groupKey as DefectType)
            ? (groupKey as DefectType)
            : undefined
        }
        defaultReporterId={currentUserId}
        onDone={onDone}
        onCancel={onCancel}
      />
    ),

    deleteMessage: (item) => `ลบ "${item.title}" ใช่หรือไม่ การลบนี้กู้คืนไม่ได้`,

    onDelete: (item) => {
      defectsRepo.remove(item.id);
    },
  };

  return <ModulePage config={config} />;
}
