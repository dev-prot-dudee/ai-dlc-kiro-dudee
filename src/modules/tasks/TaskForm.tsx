import { useMemo, useState } from "react";
import { Field, PlainSelect } from "../../shared/components/Field";
import { USERS, userName } from "../../shared/users";
import {
  DEADLINE_TYPES,
  DELAY_CAUSES,
  APPROVAL_STATUSES,
  ROLES,
  TASK_PHASES,
  WORK_PATTERNS,
  ValidationError,
  type ApprovalStatus,
  type DeadlineType,
  type DelayCause,
  type Role,
  type Task,
  type TaskPhase,
  type WorkPattern,
} from "../../shared/types";
import { tasksRepo } from "./tasks.repo";
import { useData } from "../../shared/DataContext";
import { blockerCandidates, formatVariance, todayIso } from "./task-rules";

export interface TaskFormProps {
  existing?: Task;
  initialRole?: Role;
  defaultAssigneeId: string;
  onDone: () => void;
  onCancel: () => void;
}

/** ช่องตัวเลขที่ว่างไว้ได้ — ว่างคือ "ยังไม่รู้" ไม่ใช่ 0 */
function toNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  return Number(trimmed);
}

function toText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function numberText(value: number | undefined): string {
  return value === undefined ? "" : `${value}`;
}

/**
 * ฟอร์ม Task ของ Module 02
 *
 * โครงของฟอร์มแบ่งเป็นกลุ่มตามเรื่อง (งาน / แผนและกำหนดส่ง / ประมาณการ /
 * dependency / ตามตำแหน่ง) เพราะ field ของ M02 มีจำนวนมาก การเรียงเป็นแถวยาว
 * ต่อกันทำให้กรอกช้าและกรอกผิด ซึ่งเป็นความเสี่ยงที่บันทึกไว้ในเอกสารวิเคราะห์
 *
 * field เฉพาะตำแหน่งจะปรากฏตามตำแหน่งที่เลือกเท่านั้น (SA / UX / Tester)
 * ตำแหน่ง Dev ไม่มี field เพิ่ม
 */
export function TaskForm({
  existing,
  initialRole,
  defaultAssigneeId,
  onDone,
  onCancel,
}: TaskFormProps) {
  const { requirements, tasks } = useData();

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [requirementId, setRequirementId] = useState(existing?.requirementId ?? "");
  const [role, setRole] = useState<Role | "">(existing?.role ?? initialRole ?? "");
  const [assigneeId, setAssigneeId] = useState(existing?.assigneeId ?? defaultAssigneeId);

  const [phase, setPhase] = useState<TaskPhase>(existing?.phase ?? "Development");
  const [workPattern, setWorkPattern] = useState<WorkPattern>(
    existing?.workPattern ?? "Independent",
  );
  const [deadlineType, setDeadlineType] = useState<DeadlineType>(
    existing?.deadlineType ?? "Committed",
  );
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");
  const [completedAt, setCompletedAt] = useState(existing?.completedAt ?? "");
  const [delayCause, setDelayCause] = useState<DelayCause | "">(
    existing?.delayCause ?? "",
  );

  const [initialEstimate, setInitialEstimate] = useState(
    numberText(existing?.initialEstimateHours),
  );
  const [actualHours, setActualHours] = useState(numberText(existing?.actualHours));

  const [blockedByIds, setBlockedByIds] = useState<string[]>(
    existing?.blockedByIds ?? [],
  );

  const [deliverable, setDeliverable] = useState(existing?.deliverable ?? "");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
    existing?.approvalStatus ?? "Pending",
  );
  const [figmaLink, setFigmaLink] = useState(existing?.figmaLink ?? "");
  const [revisionCount, setRevisionCount] = useState(numberText(existing?.revisionCount));
  const [passCount, setPassCount] = useState(numberText(existing?.passCount));
  const [failCount, setFailCount] = useState(numberText(existing?.failCount));

  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Task ที่เลือกเป็น blocker ได้ — ตัดตัวเองและตัวที่จะทำให้วนกลับออกแล้ว */
  const candidates = useMemo(
    () => blockerCandidates(existing?.id ?? null, tasks),
    [existing?.id, tasks],
  );

  // ตัวเลขที่คำนวณให้เห็นทันทีระหว่างกรอก เพื่อให้ผู้กรอกเห็นผลของสิ่งที่ตัวเองใส่
  const previewLate = useMemo(() => {
    if (dueDate === "") return 0;
    const end = completedAt === "" ? todayIso() : completedAt;
    const diff = Math.round(
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${dueDate}T00:00:00Z`)) / 86_400_000,
    );
    return Number.isNaN(diff) || diff < 0 ? 0 : diff;
  }, [dueDate, completedAt]);

  const previewVariance = useMemo(() => {
    const initial = toNumber(initialEstimate);
    const actual = toNumber(actualHours);
    if (initial === undefined || actual === undefined) return null;
    if (!Number.isFinite(initial) || !Number.isFinite(actual)) return null;
    return {
      hours: Math.round((actual - initial) * 10) / 10,
      percent:
        initial === 0 ? null : Math.round(((actual - initial) / initial) * 1000) / 10,
    };
  }, [initialEstimate, actualHours]);

  function toggleBlocker(id: string): void {
    setBlockedByIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function submit(event: React.FormEvent): void {
    event.preventDefault();
    setErrors({});
    try {
      const draft = {
        title,
        description,
        requirementId,
        role: role as Role,
        assigneeId,
        phase,
        workPattern,
        deadlineType,
        blockedByIds,
        dueDate: toText(dueDate),
        completedAt: toText(completedAt),
        delayCause: delayCause === "" ? undefined : delayCause,
        initialEstimateHours: toNumber(initialEstimate),
        actualHours: toNumber(actualHours),
        // field เฉพาะตำแหน่ง — repository ล้างของตำแหน่งอื่นออกให้เองก่อนบันทึก
        deliverable: toText(deliverable),
        approvalStatus,
        figmaLink: toText(figmaLink),
        revisionCount: toNumber(revisionCount),
        passCount: toNumber(passCount),
        failCount: toNumber(failCount),
      };
      if (existing) {
        tasksRepo.update(existing.id, draft);
      } else {
        tasksRepo.create(draft);
      }
      onDone();
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors({ [error.field ?? "form"]: error.message });
        return;
      }
      throw error;
    }
  }

  // FR2.2 — ถ้ายังไม่มี Requirement เลย ก็สร้าง Task ไม่ได้ตามกฎ
  if (requirements.length === 0) {
    return (
      <div className="alert" role="alert">
        <p className="alert__title">ยังสร้าง Task ไม่ได้</p>
        <p>
          Task ทุกตัวต้องผูกกับ Requirement อย่างน้อย 1 ตัว ยังไม่มี Requirement ในระบบ
          กรุณาสร้าง Requirement ก่อน
        </p>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          กลับ
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field id="task-title" label="หัวข้อ" required error={errors["title"]}>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors["title"] !== undefined}
          data-testid="task-title"
        />
      </Field>

      <Field id="task-description" label="รายละเอียด">
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          data-testid="task-description"
        />
      </Field>

      <Field
        id="task-requirement"
        label="Requirement ต้นทาง"
        required
        hint="Task ที่ไม่ผูกกับ Requirement จะตามรอยงานไม่ได้"
        error={errors["requirementId"]}
      >
        <PlainSelect
          id="task-requirement"
          value={requirementId}
          placeholder="— เลือก Requirement —"
          hasError={errors["requirementId"] !== undefined}
          options={requirements.map((req) => ({
            value: req.id,
            label: `${req.title} (${req.priority})`,
          }))}
          onChange={setRequirementId}
        />
      </Field>

      <Field
        id="task-role"
        label="ตำแหน่งผู้รับผิดชอบ"
        required
        hint="ตำแหน่งเป็นตัวกำหนดว่าต้องกรอกข้อมูลอะไรเพิ่ม"
        error={errors["role"]}
      >
        <PlainSelect
          id="task-role"
          value={role}
          placeholder="— เลือกตำแหน่ง —"
          hasError={errors["role"] !== undefined}
          options={ROLES.map((value) => ({ value, label: value }))}
          onChange={(value) => setRole(value as Role)}
        />
      </Field>

      <Field id="task-assignee" label="ผู้รับผิดชอบ" required error={errors["assigneeId"]}>
        <PlainSelect
          id="task-assignee"
          value={assigneeId}
          hasError={errors["assigneeId"] !== undefined}
          options={USERS.map((user) => ({ value: user.id, label: user.name }))}
          onChange={setAssigneeId}
        />
      </Field>

      {/* ---------- แผนการทำงาน ---------- */}
      <fieldset className="form__group">
        <legend className="form__group-title">แผนการทำงาน</legend>

        <Field
          id="task-phase"
          label="ช่วงงาน"
          required
          hint="Development = งานสร้างของใหม่ · Maintenance = งานแก้ของเดิม"
          error={errors["phase"]}
        >
          <PlainSelect
            id="task-phase"
            value={phase}
            hasError={errors["phase"] !== undefined}
            options={TASK_PHASES.map((value) => ({ value, label: value }))}
            onChange={(value) => setPhase(value as TaskPhase)}
          />
        </Field>

        <Field
          id="task-work-pattern"
          label="รูปแบบการทำงาน"
          required
          hint="Sequential = ต้องรอคิว · Parallel = ทำคู่ขนานได้ · Independent = ไม่พึ่งใคร"
          error={errors["workPattern"]}
        >
          <PlainSelect
            id="task-work-pattern"
            value={workPattern}
            hasError={errors["workPattern"] !== undefined}
            options={WORK_PATTERNS.map((value) => ({ value, label: value }))}
            onChange={(value) => setWorkPattern(value as WorkPattern)}
          />
        </Field>
      </fieldset>

      {/* ---------- กำหนดส่งและความล่าช้า ---------- */}
      <fieldset className="form__group">
        <legend className="form__group-title">กำหนดส่งและความล่าช้า</legend>

        <Field id="task-due-date" label="กำหนดส่ง" error={errors["dueDate"]}>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-invalid={errors["dueDate"] !== undefined}
            data-testid="task-due-date"
          />
        </Field>

        <Field
          id="task-deadline-type"
          label="ประเภทกำหนดส่ง"
          required
          hint="Committed = ทีมตกลงเอง · Imposed = ถูกกำหนดมาโดยไม่ได้ตกลงด้วย"
          error={errors["deadlineType"]}
        >
          <PlainSelect
            id="task-deadline-type"
            value={deadlineType}
            hasError={errors["deadlineType"] !== undefined}
            options={DEADLINE_TYPES.map((value) => ({ value, label: value }))}
            onChange={(value) => setDeadlineType(value as DeadlineType)}
          />
        </Field>

        <Field
          id="task-completed-at"
          label="วันที่ทำเสร็จ"
          hint="เว้นว่างไว้ถ้ายังไม่เสร็จ — ระบบใช้ช่องนี้คำนวณจำนวนวันที่ช้า"
          error={errors["completedAt"]}
        >
          <input
            id="task-completed-at"
            type="date"
            value={completedAt}
            onChange={(event) => setCompletedAt(event.target.value)}
            aria-invalid={errors["completedAt"] !== undefined}
            data-testid="task-completed-at"
          />
        </Field>

        {previewLate > 0 && (
          <p className="notice" data-testid="task-late-preview">
            งานนี้ช้ากว่ากำหนด {previewLate} วัน{" "}
            {completedAt === "" ? "(นับถึงวันนี้ เพราะยังไม่ระบุวันที่ทำเสร็จ)" : ""} —
            ต้องระบุสาเหตุความล่าช้าเพื่อให้ความรับผิดชอบไปอยู่ที่คนที่ควรรับ
          </p>
        )}

        <Field
          id="task-delay-cause"
          label="สาเหตุความล่าช้า"
          hint="Blocked = รอคนอื่น · Req Change = requirement เปลี่ยน · External = ปัจจัยนอกทีม"
          error={errors["delayCause"]}
        >
          <PlainSelect
            id="task-delay-cause"
            value={delayCause}
            placeholder="— ไม่ระบุ —"
            hasError={errors["delayCause"] !== undefined}
            options={DELAY_CAUSES.map((value) => ({ value, label: value }))}
            onChange={(value) => setDelayCause(value as DelayCause)}
          />
        </Field>
      </fieldset>

      {/* ---------- ประมาณการ ---------- */}
      <fieldset className="form__group">
        <legend className="form__group-title">ประมาณการ</legend>

        <Field
          id="task-initial-estimate"
          label="ประมาณการเริ่มต้น (ชั่วโมง)"
          error={errors["initialEstimateHours"]}
        >
          <input
            id="task-initial-estimate"
            type="number"
            min="0"
            step="0.5"
            value={initialEstimate}
            onChange={(event) => setInitialEstimate(event.target.value)}
            aria-invalid={errors["initialEstimateHours"] !== undefined}
            data-testid="task-initial-estimate"
          />
        </Field>

        <Field
          id="task-actual-hours"
          label="เวลาที่ใช้จริง (ชั่วโมง)"
          error={errors["actualHours"]}
        >
          <input
            id="task-actual-hours"
            type="number"
            min="0"
            step="0.5"
            value={actualHours}
            onChange={(event) => setActualHours(event.target.value)}
            aria-invalid={errors["actualHours"] !== undefined}
            data-testid="task-actual-hours"
          />
        </Field>

        <p className="field__hint" data-testid="task-variance-preview">
          Estimate Variance: {formatVariance(previewVariance)}
          {previewVariance === null && " (ต้องมีทั้งสองช่องจึงคำนวณได้)"}
        </p>
      </fieldset>

      {/* ---------- Dependency ---------- */}
      <fieldset className="form__group">
        <legend className="form__group-title">งานที่บล็อคงานนี้อยู่ (Blocked By)</legend>
        <p className="field__hint">
          เลือกงานที่ต้องเสร็จก่อนงานนี้จึงเดินต่อได้ งานที่ถูกบล็อคจะขึ้นใน PM alert
          ทันที · ตัวเลือกตัดงานที่จะทำให้เกิดการบล็อควนกลับออกให้แล้ว
        </p>
        {errors["blockedByIds"] !== undefined && (
          <span className="field__error" role="alert">
            {errors["blockedByIds"]}
          </span>
        )}
        {candidates.length === 0 ? (
          <p className="field__hint">ยังไม่มี Task อื่นให้เลือก</p>
        ) : (
          <ul className="checklist">
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <label className="checklist__item">
                  <input
                    type="checkbox"
                    checked={blockedByIds.includes(candidate.id)}
                    onChange={() => toggleBlocker(candidate.id)}
                    data-testid={`task-blocker-${candidate.id}`}
                  />
                  <span>
                    {candidate.title} · {candidate.role} · {userName(candidate.assigneeId)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {/* ---------- field เฉพาะตำแหน่ง ---------- */}
      {role === "SA" && (
        <fieldset className="form__group" data-testid="task-role-fields-sa">
          <legend className="form__group-title">ข้อมูลเฉพาะตำแหน่ง SA</legend>

          <Field
            id="task-deliverable"
            label="Deliverable"
            hint="ส่งมอบอะไร เช่น spec doc, flow diagram, data dictionary — บังคับเมื่อปิดงาน"
            error={errors["deliverable"]}
          >
            <input
              id="task-deliverable"
              type="text"
              value={deliverable}
              onChange={(event) => setDeliverable(event.target.value)}
              aria-invalid={errors["deliverable"] !== undefined}
              data-testid="task-deliverable"
            />
          </Field>

          <Field
            id="task-approval-status"
            label="สถานะการอนุมัติ"
            required
            hint="เอกสารที่ยังไม่ approve ถือว่างานยังไม่จบ — ปิดงานได้เมื่อเป็น Approved"
            error={errors["approvalStatus"]}
          >
            <PlainSelect
              id="task-approval-status"
              value={approvalStatus}
              hasError={errors["approvalStatus"] !== undefined}
              options={APPROVAL_STATUSES.map((value) => ({ value, label: value }))}
              onChange={(value) => setApprovalStatus(value as ApprovalStatus)}
            />
          </Field>
        </fieldset>
      )}

      {role === "UX" && (
        <fieldset className="form__group" data-testid="task-role-fields-ux">
          <legend className="form__group-title">ข้อมูลเฉพาะตำแหน่ง UX</legend>

          <Field
            id="task-figma-link"
            label="ลิงก์งานออกแบบ (Figma)"
            hint="เป็นหลักฐานการส่งมอบ — บังคับเมื่อปิดงาน และต้องเริ่มด้วย https://"
            error={errors["figmaLink"]}
          >
            <input
              id="task-figma-link"
              type="text"
              inputMode="url"
              value={figmaLink}
              onChange={(event) => setFigmaLink(event.target.value)}
              aria-invalid={errors["figmaLink"] !== undefined}
              data-testid="task-figma-link"
            />
          </Field>

          <Field
            id="task-revision-count"
            label="จำนวนรอบที่แก้แบบ"
            hint="ตัวเลขนี้จะถูกส่งต่อไป KPI — การแก้ที่เกิดจาก requirement เปลี่ยน ควรบันทึกสาเหตุไว้ในรายละเอียดด้วย"
            error={errors["revisionCount"]}
          >
            <input
              id="task-revision-count"
              type="number"
              min="0"
              step="1"
              value={revisionCount}
              onChange={(event) => setRevisionCount(event.target.value)}
              aria-invalid={errors["revisionCount"] !== undefined}
              data-testid="task-revision-count"
            />
          </Field>
        </fieldset>
      )}

      {role === "Tester" && (
        <fieldset className="form__group" data-testid="task-role-fields-tester">
          <legend className="form__group-title">ข้อมูลเฉพาะตำแหน่ง Tester</legend>

          <Field
            id="task-pass-count"
            label="จำนวน test case ที่ผ่าน"
            error={errors["passCount"]}
          >
            <input
              id="task-pass-count"
              type="number"
              min="0"
              step="1"
              value={passCount}
              onChange={(event) => setPassCount(event.target.value)}
              aria-invalid={errors["passCount"] !== undefined}
              data-testid="task-pass-count"
            />
          </Field>

          <Field
            id="task-fail-count"
            label="จำนวน test case ที่ไม่ผ่าน"
            error={errors["failCount"]}
          >
            <input
              id="task-fail-count"
              type="number"
              min="0"
              step="1"
              value={failCount}
              onChange={(event) => setFailCount(event.target.value)}
              aria-invalid={errors["failCount"] !== undefined}
              data-testid="task-fail-count"
            />
          </Field>
        </fieldset>
      )}

      {errors["form"] !== undefined && (
        <p className="field__error" role="alert">
          {errors["form"]}
        </p>
      )}

      <div className="form__actions">
        <button type="submit" className="btn-primary" data-testid="task-submit">
          {existing ? "บันทึกการแก้ไข" : "สร้าง Task"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
