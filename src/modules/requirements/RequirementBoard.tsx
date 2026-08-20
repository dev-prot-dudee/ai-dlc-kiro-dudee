import { ModulePage, type ModulePageConfig } from "../../shared/components/ModulePage";
import { DndBoardView } from "../../shared/components/DndBoardView";
import { DndBoardCard } from "../../shared/components/DndBoardCard";
import { RequirementForm } from "./RequirementForm";
import { requirementsRepo } from "./requirements.repo";
import { tasksRepo } from "../tasks/tasks.repo";
import { defectsRepo } from "../defects/defects.repo";
import { useData } from "../../shared/DataContext";
import { userName } from "../../shared/users";
import { PRIORITY_COLORS } from "../../shared/status-colors";
import {
  PRIORITIES,
  REQUIREMENT_CATEGORIES,
  type Priority,
  type Requirement,
} from "../../shared/types";
import {
  countOrphansOnRequirementDelete,
  countTasksForRequirement,
  traceForward,
} from "../../shared/traceability";

/**
 * หน้า Requirement Management
 *
 * Board จัดกลุ่มด้วย MoSCoW priority เพราะรอบนี้ไม่มี status workflow
 * (ตัดออกตาม Out of Scope) จึงใช้ field ที่มีอยู่จริงจัดกลุ่มแทน
 */
export function RequirementBoard() {
  const { requirements, tasks, defects, currentUserId, refresh } = useData();

  const config: ModulePageConfig<Requirement> = {
    icon: "◎",
    title: "Requirements",
    subtitle: "รับและจัดการ Requirement ทั้ง Functional และ NFR",
    newLabel: "Requirement",
    emptyMessage:
      "ยังไม่มี Requirement ในระบบ เริ่มจากสร้างรายการแรกเพื่อให้ Task และ Defect มีต้นทางอ้างอิงได้",
    items: requirements,
    searchText: (item) => `${item.title} ${item.description}`,

    filters: (state, set) => [
      {
        id: "filter-category",
        label: "ประเภท",
        value: state["filter-category"] ?? "",
        onChange: (value) => set("filter-category", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...REQUIREMENT_CATEGORIES.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-priority",
        label: "ระดับความสำคัญ",
        value: state["filter-priority"] ?? "",
        onChange: (value) => set("filter-priority", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...PRIORITIES.map((value) => ({ value, label: value })),
        ],
      },
    ],

    applyFilters: (items, state) =>
      items.filter((item) => {
        const category = state["filter-category"] ?? "";
        const priority = state["filter-priority"] ?? "";
        if (category !== "" && item.category !== category) return false;
        if (priority !== "" && item.priority !== priority) return false;
        return true;
      }),

    // FR1.4 + FR4.3 — จัดกลุ่มตาม MoSCoW และชี้รายการที่ยังไม่มี Task
    groups: (items) =>
      PRIORITIES.map((priority) => ({
        key: priority,
        label: priority,
        color: PRIORITY_COLORS[priority] ?? "gray",
        items: items.filter((item) => item.priority === priority),
      })),

    card: (item) => {
      const taskCount = countTasksForRequirement(item.id, tasks);
      const trace = traceForward(item.id, tasks, defects);
      return {
        title: item.title,
        // FR4.3 — Requirement ที่ยังไม่มี Task ต้องเห็นชัด
        warning: taskCount === 0 ? "⚠ ยังไม่มี Task" : undefined,
        meta: (
          <>
            <span>{item.category}</span>
            <span>{userName(item.ownerId)}</span>
            {/* FR1.7 */}
            <span>
              {taskCount} Tasks · {trace.defects.length} Defects
            </span>
          </>
        ),
      };
    },

    listColumns: [
      { key: "title", header: "หัวข้อ", render: (item) => item.title },
      { key: "category", header: "ประเภท", render: (item) => item.category },
      { key: "priority", header: "ความสำคัญ", render: (item) => item.priority },
      { key: "owner", header: "ผู้รับผิดชอบ", render: (item) => userName(item.ownerId) },
      {
        key: "tasks",
        header: "Tasks",
        render: (item) => countTasksForRequirement(item.id, tasks),
      },
    ],

    detail: (item) => [
      { label: "หัวข้อ", value: item.title },
      { label: "รายละเอียด", value: item.description === "" ? "—" : item.description },
      { label: "ประเภท", value: item.category },
      { label: "ระดับความสำคัญ", value: item.priority },
      { label: "ผู้รับผิดชอบ", value: userName(item.ownerId) },
      { label: "สร้างเมื่อ", value: new Date(item.createdAt).toLocaleString("th-TH") },
    ],

    // FR4.1 — สายเชื่อมโยงลงไป Task และ Defect
    traceSections: (item) => {
      const trace = traceForward(item.id, tasks, defects);
      return [
        {
          title: `Tasks ที่แตกจาก Requirement นี้ (${trace.tasks.length})`,
          body:
            trace.tasks.length === 0 ? (
              <p>ยังไม่มี Task — Requirement นี้ยังไม่ถูกแตกเป็นงาน</p>
            ) : (
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {trace.tasks.map((task) => (
                  <li key={task.id}>
                    {task.title} · {task.role} · {userName(task.assigneeId)}
                  </li>
                ))}
              </ul>
            ),
        },
        {
          title: `Defects ที่พบใต้ Requirement นี้ (${trace.defects.length})`,
          body:
            trace.defects.length === 0 ? (
              <p>ยังไม่พบ Defect</p>
            ) : (
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {trace.defects.map((defect) => (
                  <li key={defect.id}>
                    {defect.title} · {defect.type} · {defect.severity}
                  </li>
                ))}
              </ul>
            ),
        },
      ];
    },

    renderBoard: ({ items, onOpenItem, onAdd }) => {
      const groups = PRIORITIES.map((priority) => ({
        key: priority,
        label: priority,
        color: PRIORITY_COLORS[priority] ?? ("gray" as const),
        items: items.filter((item) => item.priority === priority),
      }));

      function handleMoveItem(itemId: string, _fromGroup: string, toGroup: string): void {
        const req = requirements.find((r) => r.id === itemId);
        if (!req) return;
        const newPriority = toGroup as Priority;
        if (!PRIORITIES.includes(newPriority)) return;
        requirementsRepo.update(req.id, {
          title: req.title,
          description: req.description,
          category: req.category,
          priority: newPriority,
          ownerId: req.ownerId,
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
            const taskCount = countTasksForRequirement(item.id, tasks);
            const trace = traceForward(item.id, tasks, defects);
            return (
              <DndBoardCard
                key={item.id}
                id={item.id}
                title={item.title}
                warning={taskCount === 0 ? "⚠ ยังไม่มี Task" : undefined}
                onOpen={() => onOpenItem(item)}
                testId={`card-${item.id}`}
                meta={
                  <>
                    <span>{item.category}</span>
                    <span>{userName(item.ownerId)}</span>
                    <span>{taskCount} Tasks · {trace.defects.length} Defects</span>
                  </>
                }
              />
            );
          }}
        />
      );
    },

    renderForm: ({ existing, groupKey, onDone, onCancel }) => (
      <RequirementForm
        existing={existing}
        initialPriority={
          groupKey !== undefined && PRIORITIES.includes(groupKey as Priority)
            ? (groupKey as Priority)
            : undefined
        }
        defaultOwnerId={currentUserId}
        onDone={onDone}
        onCancel={onCancel}
      />
    ),

    // FR4.4 — บอกจำนวนที่จะกำพร้าก่อนยืนยันลบ
    deleteMessage: (item) => {
      const counts = countOrphansOnRequirementDelete(item.id, tasks, defects);
      if (counts.tasks === 0) {
        return `ลบ "${item.title}" ใช่หรือไม่ การลบนี้กู้คืนไม่ได้`;
      }
      return `"${item.title}" มี ${counts.tasks} Tasks และ ${counts.defects} Defects ผูกอยู่ การลบจะลบทั้งหมดตามไปด้วย และกู้คืนไม่ได้`;
    },

    hasChildren: (item) =>
      countOrphansOnRequirementDelete(item.id, tasks, defects).tasks > 0,

    onDelete: (item, cascade) => {
      if (cascade) {
        const trace = traceForward(item.id, tasks, defects);
        const taskIds = new Set(trace.tasks.map((task) => task.id));
        defectsRepo.removeWhere((defect) => taskIds.has(defect.taskId));
        tasksRepo.removeWhere((task) => task.requirementId === item.id);
      }
      requirementsRepo.remove(item.id);
    },
  };

  return <ModulePage config={config} />;
}
