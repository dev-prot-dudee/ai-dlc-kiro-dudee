import { ModulePage, type ModulePageConfig } from "../../shared/components/ModulePage";
import { TaskForm } from "./TaskForm";
import { tasksRepo } from "./tasks.repo";
import { defectsRepo } from "../defects/defects.repo";
import { useData } from "../../shared/DataContext";
import { USERS, userName } from "../../shared/users";
import { ROLE_COLORS } from "../../shared/status-colors";
import {
  DEADLINE_TYPES,
  DELAY_CAUSES,
  ROLES,
  TASK_PHASES,
  WORK_PATTERNS,
  type Role,
  type Task,
} from "../../shared/types";
import {
  countDefectsForTask,
  countOrphansOnTaskDelete,
} from "../../shared/traceability";
import {
  activeBlockers,
  daysLate,
  estimateVariance,
  formatVariance,
  isDone,
  isOverdueOpen,
  roleFieldRows,
  todayIso,
} from "./task-rules";

/**
 * PM alert view (M02)
 *
 * สองอย่างที่ PM ต้องเห็นก่อนอย่างอื่น: งานที่ติดบล็อคอยู่ (ใครรออะไร) และงานที่
 * เลยกำหนดแล้วยังไม่ปิด แสดงเป็นแถบบนสุดของหน้า ไม่ใช่ซ่อนไว้ใน filter
 * เพราะข้อมูลนี้มีค่าเฉพาะเมื่อเห็นทันทีโดยไม่ต้องไปหา
 */
function PmAlertPanel({ tasks, today }: { tasks: Task[]; today: string }) {
  const blocked = tasks
    .map((task) => ({ task, blockers: activeBlockers(task, tasks) }))
    .filter((row) => row.blockers.length > 0);
  const overdue = tasks
    .filter((task) => isOverdueOpen(task, today))
    .sort((left, right) => daysLate(right, today) - daysLate(left, today));

  if (blocked.length === 0 && overdue.length === 0) return null;

  return (
    <section className="pm-alert" aria-labelledby="pm-alert-title" data-testid="pm-alert">
      <h2 className="pm-alert__title" id="pm-alert-title">
        ⚠ PM Alert
      </h2>

      {blocked.length > 0 && (
        <div className="pm-alert__group">
          <p className="pm-alert__heading">
            งานที่ติดบล็อคอยู่ ({blocked.length})
          </p>
          <ul className="trace-list">
            {blocked.map(({ task, blockers }) => (
              <li key={task.id} data-testid={`pm-alert-blocked-${task.id}`}>
                <strong>{task.title}</strong> ({userName(task.assigneeId)}) รอ:{" "}
                {blockers
                  .map((blocker) => `${blocker.title} — ${userName(blocker.assigneeId)}`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="pm-alert__group">
          <p className="pm-alert__heading">
            งานที่เลยกำหนดและยังไม่ปิด ({overdue.length})
          </p>
          <ul className="trace-list">
            {overdue.map((task) => (
              <li key={task.id} data-testid={`pm-alert-overdue-${task.id}`}>
                <strong>{task.title}</strong> ({userName(task.assigneeId)}) ช้า{" "}
                {daysLate(task, today)} วัน · กำหนดส่ง {task.dueDate} ·{" "}
                {task.deadlineType}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * หน้า Task Management (Module 02)
 *
 * Board จัดกลุ่มด้วยตำแหน่งผู้รับผิดชอบ (SA/UX/Dev/Tester) ทำให้เห็นภาระงาน
 * ของแต่ละตำแหน่งได้ทันทีจากตัวเลขบนหัว column
 */
export function TaskBoard() {
  const { requirements, tasks, defects, currentUserId } = useData();
  const today = todayIso();

  function requirementTitle(id: string): string {
    return requirements.find((req) => req.id === id)?.title ?? "(Requirement ถูกลบแล้ว)";
  }

  function blockerTitles(task: Task): string {
    const blockers = activeBlockers(task, tasks);
    if (blockers.length === 0) return "—";
    return blockers.map((blocker) => blocker.title).join(", ");
  }

  const config: ModulePageConfig<Task> = {
    icon: "✓",
    title: "Tasks",
    subtitle:
      "แตก Task ตาม Role พร้อมข้อมูลเฉพาะตำแหน่ง กำหนดส่ง dependency และ variance",
    newLabel: "Task",
    emptyMessage:
      "ยังไม่มี Task ในระบบ Task ทุกตัวต้องผูกกับ Requirement จึงต้องมี Requirement ก่อน",
    items: tasks,
    searchText: (item) => `${item.title} ${item.description}`,

    banner: <PmAlertPanel tasks={tasks} today={today} />,

    // FR2.4 + M02 — กรองได้ทั้งของเดิมและมิติใหม่ของ M02
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
      {
        id: "filter-phase",
        label: "ช่วงงาน",
        value: state["filter-phase"] ?? "",
        onChange: (value) => set("filter-phase", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...TASK_PHASES.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-work-pattern",
        label: "รูปแบบการทำงาน",
        value: state["filter-work-pattern"] ?? "",
        onChange: (value) => set("filter-work-pattern", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...WORK_PATTERNS.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-deadline-type",
        label: "ประเภทกำหนดส่ง",
        value: state["filter-deadline-type"] ?? "",
        onChange: (value) => set("filter-deadline-type", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...DEADLINE_TYPES.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-delay-cause",
        label: "สาเหตุความล่าช้า",
        value: state["filter-delay-cause"] ?? "",
        onChange: (value) => set("filter-delay-cause", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          ...DELAY_CAUSES.map((value) => ({ value, label: value })),
        ],
      },
      {
        id: "filter-status",
        label: "สถานะ",
        value: state["filter-status"] ?? "",
        onChange: (value) => set("filter-status", value),
        options: [
          { value: "", label: "ทั้งหมด" },
          { value: "blocked", label: "ติดบล็อคอยู่" },
          { value: "overdue", label: "เลยกำหนดและยังไม่ปิด" },
          { value: "open", label: "ยังไม่ปิด" },
          { value: "done", label: "ปิดแล้ว" },
        ],
      },
    ],

    applyFilters: (items, state) =>
      items.filter((item) => {
        const role = state["filter-role"] ?? "";
        const assignee = state["filter-assignee"] ?? "";
        const requirement = state["filter-requirement"] ?? "";
        const phase = state["filter-phase"] ?? "";
        const workPattern = state["filter-work-pattern"] ?? "";
        const deadlineType = state["filter-deadline-type"] ?? "";
        const delayCause = state["filter-delay-cause"] ?? "";
        const status = state["filter-status"] ?? "";

        if (role !== "" && item.role !== role) return false;
        if (assignee !== "" && item.assigneeId !== assignee) return false;
        if (requirement !== "" && item.requirementId !== requirement) return false;
        if (phase !== "" && item.phase !== phase) return false;
        if (workPattern !== "" && item.workPattern !== workPattern) return false;
        if (deadlineType !== "" && item.deadlineType !== deadlineType) return false;
        if (delayCause !== "" && item.delayCause !== delayCause) return false;
        if (status === "blocked" && activeBlockers(item, tasks).length === 0) return false;
        if (status === "overdue" && !isOverdueOpen(item, today)) return false;
        if (status === "open" && isDone(item)) return false;
        if (status === "done" && !isDone(item)) return false;
        return true;
      }),

    groups: (items) =>
      ROLES.map((role) => ({
        key: role,
        label: role,
        color: ROLE_COLORS[role] ?? "gray",
        items: items.filter((item) => item.role === role),
      })),

    card: (item) => {
      const blockers = activeBlockers(item, tasks);
      const late = daysLate(item, today);
      const variance = estimateVariance(item);
      const warnings: string[] = [];
      if (blockers.length > 0) {
        warnings.push(`⛔ ติดบล็อค ${blockers.length} งาน`);
      }
      if (late > 0) {
        warnings.push(isDone(item) ? `ส่งช้า ${late} วัน` : `⏰ เลยกำหนด ${late} วัน`);
      }

      return {
        title: item.title,
        ...(warnings.length > 0 ? { warning: warnings.join(" · ") } : {}),
        meta: (
          <>
            <span>{userName(item.assigneeId)}</span>
            <span>{item.phase}</span>
            <span>{item.workPattern}</span>
            {item.dueDate !== undefined && (
              <span>
                📅 {item.dueDate} ({item.deadlineType})
              </span>
            )}
            {variance !== null && <span>Δ {formatVariance(variance)}</span>}
            <span>◎ {requirementTitle(item.requirementId)}</span>
            {/* FR2.7 */}
            <span>{countDefectsForTask(item.id, defects)} Defects</span>
          </>
        ),
      };
    },

    listColumns: [
      { key: "title", header: "หัวข้อ", render: (item) => item.title },
      { key: "role", header: "ตำแหน่ง", render: (item) => item.role },
      {
        key: "assignee",
        header: "ผู้รับผิดชอบ",
        render: (item) => userName(item.assigneeId),
      },
      { key: "phase", header: "ช่วงงาน", render: (item) => item.phase },
      { key: "workPattern", header: "รูปแบบ", render: (item) => item.workPattern },
      {
        key: "dueDate",
        header: "กำหนดส่ง",
        render: (item) =>
          item.dueDate === undefined ? "—" : `${item.dueDate} (${item.deadlineType})`,
      },
      {
        key: "late",
        header: "ช้า (วัน)",
        render: (item) => {
          const late = daysLate(item, today);
          if (late === 0) return "—";
          return `${late}${item.delayCause === undefined ? "" : ` · ${item.delayCause}`}`;
        },
      },
      {
        key: "variance",
        header: "Variance",
        render: (item) => formatVariance(estimateVariance(item)),
      },
      { key: "blockedBy", header: "รอ", render: (item) => blockerTitles(item) },
      {
        key: "defects",
        header: "Defects",
        render: (item) => countDefectsForTask(item.id, defects),
      },
    ],

    detail: (item) => {
      const late = daysLate(item, today);
      return [
        { label: "หัวข้อ", value: item.title },
        { label: "รายละเอียด", value: item.description === "" ? "—" : item.description },
        { label: "ตำแหน่ง", value: item.role },
        { label: "ผู้รับผิดชอบ", value: userName(item.assigneeId) },
        // FR2.6 — เห็น Requirement ต้นทาง
        { label: "Requirement ต้นทาง", value: requirementTitle(item.requirementId) },
        { label: "ช่วงงาน", value: item.phase },
        { label: "รูปแบบการทำงาน", value: item.workPattern },
        { label: "กำหนดส่ง", value: item.dueDate ?? "—" },
        { label: "ประเภทกำหนดส่ง", value: item.deadlineType },
        { label: "วันที่ทำเสร็จ", value: item.completedAt ?? "ยังไม่ปิด" },
        {
          label: "ความล่าช้า",
          value:
            late === 0
              ? "ไม่ช้า"
              : `${late} วัน${item.delayCause === undefined ? "" : ` (${item.delayCause})`}`,
        },
        {
          label: "ประมาณการเริ่มต้น",
          value:
            item.initialEstimateHours === undefined
              ? "—"
              : `${item.initialEstimateHours} ชม.`,
        },
        {
          label: "เวลาที่ใช้จริง",
          value: item.actualHours === undefined ? "—" : `${item.actualHours} ชม.`,
        },
        {
          label: "Estimate Variance",
          value: formatVariance(estimateVariance(item)),
        },
        { label: "รอ (Blocked By)", value: blockerTitles(item) },
        ...roleFieldRows(item),
        { label: "สร้างเมื่อ", value: new Date(item.createdAt).toLocaleString("th-TH") },
      ];
    },

    traceSections: (item) => {
      const own = defects.filter((defect) => defect.taskId === item.id);
      const blocking = tasks.filter((candidate) =>
        candidate.blockedByIds.includes(item.id),
      );
      return [
        {
          title: `Defects ที่พบใน Task นี้ (${own.length})`,
          body:
            own.length === 0 ? (
              <p>ยังไม่พบ Defect</p>
            ) : (
              <ul className="trace-list">
                {own.map((defect) => (
                  <li key={defect.id}>
                    {defect.title} · {defect.type} · {defect.severity}
                  </li>
                ))}
              </ul>
            ),
        },
        {
          title: `งานที่รอ Task นี้อยู่ (${blocking.length})`,
          body:
            blocking.length === 0 ? (
              <p>ไม่มีงานอื่นรองานนี้</p>
            ) : (
              <ul className="trace-list">
                {blocking.map((waiting) => (
                  <li key={waiting.id}>
                    {waiting.title} · {waiting.role} · {userName(waiting.assigneeId)}
                  </li>
                ))}
              </ul>
            ),
        },
      ];
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

    // FR4.5 + M02 — บอกทั้ง defect ที่จะหายตามและงานที่จะเสียสาย dependency
    deleteMessage: (item) => {
      const counts = countOrphansOnTaskDelete(item.id, defects);
      const waiting = tasks.filter((candidate) =>
        candidate.blockedByIds.includes(item.id),
      ).length;
      const parts: string[] = [];
      if (counts.defects > 0) {
        parts.push(`มี ${counts.defects} Defects ผูกอยู่ ซึ่งจะถูกลบตามไปด้วย`);
      }
      if (waiting > 0) {
        parts.push(`มีอีก ${waiting} งานที่ระบุว่ารองานนี้ ซึ่งจะไม่ถูกบล็อคอีก`);
      }
      if (parts.length === 0) {
        return `ลบ "${item.title}" ใช่หรือไม่ การลบนี้กู้คืนไม่ได้`;
      }
      return `"${item.title}" ${parts.join(" และ")} การลบนี้กู้คืนไม่ได้`;
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
