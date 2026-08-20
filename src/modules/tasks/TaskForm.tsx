import { useState } from "react";
import { Field, PlainSelect } from "../../shared/components/Field";
import { USERS } from "../../shared/users";
import { ROLES, ValidationError, type Role, type Task } from "../../shared/types";
import { tasksRepo } from "./tasks.repo";
import { useData } from "../../shared/DataContext";

export interface TaskFormProps {
  existing?: Task;
  initialRole?: Role;
  defaultAssigneeId: string;
  onDone: () => void;
  onCancel: () => void;
}

export function TaskForm({
  existing,
  initialRole,
  defaultAssigneeId,
  onDone,
  onCancel,
}: TaskFormProps) {
  const { requirements } = useData();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [requirementId, setRequirementId] = useState(existing?.requirementId ?? "");
  const [role, setRole] = useState<Role | "">(existing?.role ?? initialRole ?? "");
  const [assigneeId, setAssigneeId] = useState(existing?.assigneeId ?? defaultAssigneeId);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      <div className="border border-danger bg-danger-light rounded px-5 py-4 my-5" role="alert">
        <p className="font-semibold m-0 mb-2">ยังสร้าง Task ไม่ได้</p>
        <p className="m-0">
          Task ทุกตัวต้องผูกกับ Requirement อย่างน้อย 1 ตัว ยังไม่มี Requirement ในระบบ
          กรุณาสร้าง Requirement ก่อน
        </p>
        <button type="button" className="btn-secondary mt-3" onClick={onCancel}>
          กลับ
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5 max-w-[640px]" onSubmit={submit} noValidate>
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

      <Field id="task-role" label="ตำแหน่งผู้รับผิดชอบ" required error={errors["role"]}>
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

      {errors["form"] !== undefined && (
        <p className="text-danger text-caption" role="alert">
          {errors["form"]}
        </p>
      )}

      <div className="flex gap-3">
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
