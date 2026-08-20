import { useState } from "react";
import { Field, PlainSelect } from "../../shared/components/Field";
import { USERS } from "../../shared/users";
import {
  DEFAULT_PRIORITY,
  PRIORITIES,
  REQUIREMENT_CATEGORIES,
  ValidationError,
  type Priority,
  type Requirement,
  type RequirementCategory,
} from "../../shared/types";
import { requirementsRepo } from "./requirements.repo";

export interface RequirementFormProps {
  /** เมื่อมีค่า = โหมดแก้ไข เมื่อไม่มี = โหมดสร้างใหม่ */
  existing?: Requirement;
  /** ค่าตั้งต้นของ priority เมื่อสร้างจากปุ่มเพิ่มใน column */
  initialPriority?: Priority;
  defaultOwnerId: string;
  onDone: () => void;
  onCancel: () => void;
}

export function RequirementForm({
  existing,
  initialPriority,
  defaultOwnerId,
  onDone,
  onCancel,
}: RequirementFormProps) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [category, setCategory] = useState<RequirementCategory | "">(
    existing?.category ?? "",
  );
  // FR1.3 — ค่าเริ่มต้นเป็น Should เมื่อผู้ใช้ไม่เลือก
  const [priority, setPriority] = useState<Priority>(
    existing?.priority ?? initialPriority ?? DEFAULT_PRIORITY,
  );
  const [ownerId, setOwnerId] = useState(existing?.ownerId ?? defaultOwnerId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: React.FormEvent): void {
    event.preventDefault();
    setErrors({});
    try {
      const draft = {
        title,
        description,
        // ส่งค่าว่างต่อไปให้ repository ปฏิเสธ เพื่อให้กฎอยู่ที่เดียว
        category: category as RequirementCategory,
        priority,
        ownerId,
      };
      if (existing) {
        requirementsRepo.update(existing.id, draft);
      } else {
        requirementsRepo.create(draft);
      }
      onDone();
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors({ [error.field ?? "form"]: error.message });
        return;
      }
      // error อื่น (เช่นที่เก็บเต็ม) ต้องขึ้นไปให้ ErrorBoundary หรือหน้าจอจัดการ
      throw error;
    }
  }

  return (
    <form className="flex flex-col gap-5 max-w-[640px]" onSubmit={submit} noValidate>
      <Field id="req-title" label="หัวข้อ" required error={errors["title"]}>
        <input
          id="req-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors["title"] !== undefined}
          data-testid="req-title"
        />
      </Field>

      <Field id="req-description" label="รายละเอียด">
        <textarea
          id="req-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          data-testid="req-description"
        />
      </Field>

      <Field
        id="req-category"
        label="ประเภท"
        required
        hint="Functional คือสิ่งที่ระบบต้องทำได้ Non-Functional คือคุณภาพที่ระบบต้องมี"
        error={errors["category"]}
      >
        <PlainSelect
          id="req-category"
          value={category}
          placeholder="— เลือกประเภท —"
          hasError={errors["category"] !== undefined}
          options={REQUIREMENT_CATEGORIES.map((value) => ({ value, label: value }))}
          onChange={(value) => setCategory(value as RequirementCategory)}
        />
      </Field>

      <Field
        id="req-priority"
        label="ระดับความสำคัญ (MoSCoW)"
        required
        hint="ค่าเริ่มต้นคือ Should"
        error={errors["priority"]}
      >
        <PlainSelect
          id="req-priority"
          value={priority}
          hasError={errors["priority"] !== undefined}
          options={PRIORITIES.map((value) => ({ value, label: value }))}
          onChange={(value) => setPriority(value as Priority)}
        />
      </Field>

      <Field id="req-owner" label="ผู้รับผิดชอบ" required error={errors["ownerId"]}>
        <PlainSelect
          id="req-owner"
          value={ownerId}
          hasError={errors["ownerId"] !== undefined}
          options={USERS.map((user) => ({ value: user.id, label: user.name }))}
          onChange={setOwnerId}
        />
      </Field>

      {errors["form"] !== undefined && (
        <p className="text-danger text-caption" role="alert">
          {errors["form"]}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" data-testid="req-submit">
          {existing ? "บันทึกการแก้ไข" : "สร้าง Requirement"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
