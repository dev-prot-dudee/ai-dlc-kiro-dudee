import { ModulePage, type ModulePageConfig } from "../../shared/components/ModulePage";
import { DndBoardView } from "../../shared/components/DndBoardView";
import { DndBoardCard } from "../../shared/components/DndBoardCard";
import { TaskForm } from "./TaskForm";
import { tasksRepo } from "./tasks.repo";
import { defectsRepo } from "../defects/defects.repo";
import { useData } from "../../shared/DataContext";
import { USERS, userName } from "../../shared/users";
import { ROLE_COLORS } from "../../shared/status-colors";
import { ROLES, type Role, type Task } from "../../shared/types";
import {
  countDefectsForTask,
  countOrphansOnTaskDelete,
} from "../../shared/traceability";

/**
 * หน้า Task Management
 *
 * Board จัดกลุ่มด้วยตำแหน่งผู้รับผิดชอบ (SA/UX/Dev/Tester) ทำให้เห็นภาระงาน
 * ของแต่ละตำแหน่งได้ทันทีจากตัวเลขบนหัว column
 */
export function TaskBoard() {
  const { requirements, tasks, defects, currentUserId, refresh } = useData();

  function requirementTitle(id: string): string {
    return requirements.find((req) => req.id === id)?.title ?? "(Requirement ถูกลบแล้ว)";
  }

  const config: ModulePageConfig<Task> = {
    icon: "✓",
    title: "Tasks",
    subtitle: "แตก Task จาก Requirement พร้อมระบุตำแหน่งผู้รับผิดชอบ",
    newLabel: "Task",
    emptyMessage:
      "ยังไม่มี Task ในระบบ Task ทุกตัวต้องผูกกับ Requirement จึงต้องมี Requirement ก่อน",
    items: tasks,
    searchText: (item) => `${item.title} ${item.description}`,

    // FR2.4 — กรองได้ 3 เงื่อนไข ซึ่ง board จัดกลุ่มด้วยตำแหน่งอยู่แล้วทำไม่ครบ
    filters: (state, set) => [
      {
        id: "filter-role",
        label: "ตำแหน่ง",
        value: state["filter-role"] ?? "",
        onChange: (value) => set("filter-role", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...ROLES.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-assignee",
        label: "ผู้รับผิดชอบ",
        value: state["filter-assignee"] ?? "",
        onChange: (value) => set("filter-assignee", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...USERS.map((user) => ({ value: user.id, label: user.name })),
        ],
      },
      {
        id: "filter-requirement",
        label: "Requirement ต้นทาง",
        value: state["filter-requirement"] ?? "",
        onChange: (value) => set("filter-requirement", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...requirements.map((req) => ({ value: req.id, label: req.title })),
        ],
      },
    ],

    applyFilters: (items, state) =>
      items.filter((item) => {
        const role = state["filter-role"] ?? "";
        const assignee = state["filter-assignee"] ?? "";
        const requirement = state["filter-requirement"] ?? "";
        if (role !== "" && item.role !== role) return false;
        if (assignee !== "" && item.assigneeId !== assignee) return false;
        if (requirement !== "" && item.requirementId !== requirement) return false;
        return true;
      }),

    groups: (items) =>
      ROLES.map((role) => ({
        key: role,
        label: role,
        color: ROLE_COLORS[role] ?? "gray",
        items: items.filter((item) => item.role === role),
      })),

    card: (item) => ({
      title: item.title,
      meta: (
        <>
          <span>{userName(item.assigneeId)}</span>
          <span>◎ {requirementTitle(item.requirementId)}</span>
          {/* FR2.7 */}
          <span>{countDefectsForTask(item.id, defects)} Defects</span>
        </>
      ),
    }),

    listColumns: [
      { key: "title", header: "หัวข้อ", render: (item) => item.title },
      { key: "role", header: "ตำแหน่ง", render: (item) => item.role },
      {
        key: "assignee",
        header: "ผู้รับผิดชอบ",
        render: (item) => userName(item.assigneeId),
      },
      {
        key: "requirement",
        header: "Requirement ต้นทาง",
        render: (item) => requirementTitle(item.requirementId),
      },
      {
        key: "defects",
        header: "Defects",
        render: (item) => countDefectsForTask(item.id, defects),
      },
    ],

    detail: (item) => [
      { label: "หัวข้อ", value: item.title },
      { label: "รายละเอียด", value: item.description === "" ? "—" : item.description },
      { label: "ตำแหน่ง", value: item.role },
      { label: "ผู้รับผิดชอบ", value: userName(item.assigneeId) },
      // FR2.6 — เห็น Requirement ต้นทาง
      { label: "Requirement ต้นทาง", value: requirementTitle(item.requirementId) },
      { label: "สร้างเมื่อ", value: new Date(item.createdAt).toLocaleString("th-TH") },
    ],

    traceSections: (item) => {
      const own = defects.filter((defect) => defect.taskId === item.id);
      return [
        {
          title: `Defects ที่พบใน Task นี้ (${own.length})`,
          body:
            own.length === 0 ? (
              <p>ยังไม่พบ Defect</p>
            ) : (
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {own.map((defect) => (
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
      const groups = ROLES.map((role) => ({
        key: role,
        label: role,
        color: ROLE_COLORS[role] ?? ("gray" as const),
        items: items.filter((item) => item.role === role),
      }));

      function handleMoveItem(itemId: string, _fromGroup: string, toGroup: string): void {
        const task = tasks.find((t) => t.id === itemId);
        if (!task) return;
        const newRole = toGroup as Role;
        if (!ROLES.includes(newRole)) return;
        // อัปเดต role ของ Task ใน storage
        tasksRepo.update(task.id, {
          title: task.title,
          description: task.description,
          requirementId: task.requirementId,
          role: newRole,
          assigneeId: task.assigneeId,
        });
        refresh();
      }

      return (
        <DndBoardView
          groups={groups}
          testId="board"
          onAdd={onAdd}
          onMoveItem={handleMoveItem}
          renderCard={(item) => (
            <DndBoardCard
              key={item.id}
              id={item.id}
              title={item.title}
              onOpen={() => onOpenItem(item)}
              testId={`card-${item.id}`}
              meta={
                <>
                  <span>{userName(item.assigneeId)}</span>
                  <span>◎ {requirementTitle(item.requirementId)}</span>
                  <span>{countDefectsForTask(item.id, defects)} Defects</span>
                </>
              }
            />
          )}
        />
      );
    },

    renderForm: ({ existing, groupKey, onDone, onCancel }) => (
      <TaskForm
        existing={existing}
        initialRole={
          groupKey !== undefined && ROLES.includes(groupKey as Role)
            ? (groupKey as Role)
            : undefined
        }
        defaultAssigneeId={currentUserId}
        onDone={onDone}
        onCancel={onCancel}
      />
    ),

    // FR4.5
    deleteMessage: (item) => {
      const counts = countOrphansOnTaskDelete(item.id, defects);
      if (counts.defects === 0) {
        return `ลบ "${item.title}" ใช่หรือไม่ การลบนี้กู้คืนไม่ได้`;
      }
      return `"${item.title}" มี ${counts.defects} Defects ผูกอยู่ การลบจะลบ Defect เหล่านั้นตามไปด้วย และกู้คืนไม่ได้`;
    },

    hasChildren: (item) => countOrphansOnTaskDelete(item.id, defects).defects > 0,

    onDelete: (item, cascade) => {
      if (cascade) {
        defectsRepo.removeWhere((defect) => defect.taskId === item.id);
      }
      tasksRepo.remove(item.id);
    },
  };

  return <ModulePage config={config} />;
}
