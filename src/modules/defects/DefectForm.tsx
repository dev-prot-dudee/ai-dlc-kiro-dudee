import { useState } from "react";
import { Field, PlainSelect } from "../../shared/components/Field";
import { USERS } from "../../shared/users";
import {
  DEFECT_TYPES,
  SEVERITIES,
  ValidationError,
  type Defect,
  type DefectType,
  type Severity,
} from "../../shared/types";
import { defectsRepo } from "./defects.repo";
import { useData } from "../../shared/DataContext";

export interface DefectFormProps {
  existing?: Defect;
  initialType?: DefectType;
  defaultReporterId: string;
  onDone: () => void;
  onCancel: () => void;
}

/** คำอธิบายว่าแต่ละประเภทหมายถึงต้นน้ำที่ไหน ช่วยให้เลือกถูก */
const TYPE_HINTS: Record<DefectType, string> = {
  "Code Bug": "โค้ดทำไม่ตรงกับที่สเปคและ design ระบุไว้",
  "SA Gap": "สเปคไม่ครบ ไม่ชัด หรือขัดแย้งกันเอง",
  "Design Gap": "design ไม่ครอบกรณีนี้ เช่นไม่ได้ออกแบบหน้าที่ข้อมูลว่าง",
  "Test Escape": "ปัญหาที่ควรเจอตอนทดสอบ แต่หลุดไปเจอในขั้นถัดไป",
  "NFR Violation": "ทำงานถูกแต่ไม่ผ่านเกณฑ์ที่วัดได้ เช่นช้ากว่าที่กำหนด",
};

export function DefectForm({
  existing,
  initialType,
  defaultReporterId,
  onDone,
  onCancel,
}: DefectFormProps) {
  const { tasks, requirements } = useData();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [taskId, setTaskId] = useState(existing?.taskId ?? "");
  const [type, setType] = useState<DefectType | "">(existing?.type ?? initialType ?? "");
  const [severity, setSeverity] = useState<Severity | "">(existing?.severity ?? "");
  const [reporterId, setReporterId] = useState(existing?.reporterId ?? defaultReporterId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: React.FormEvent): void {
    event.preventDefault();
    setErrors({});
    try {
      const draft = {
        title,
        description,
        taskId,
        type: type as DefectType,
        severity: severity as Severity,
        reporterId,
      };
      if (existing) {
        defectsRepo.update(existing.id, draft);
      } else {
        defectsRepo.create(draft);
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

  // FR3.4 — ถ้ายังไม่มี Task เลย ก็สร้าง Defect ไม่ได้ตามกฎ
  if (tasks.length === 0) {
    return (
      <div className="border border-danger bg-danger-light rounded px-5 py-4 my-5" role="alert">
        <p className="font-semibold m-0 mb-2">ยังสร้าง Defect ไม่ได้</p>
        <p className="m-0">
          Defect ทุกตัวต้องผูกกับ Task อย่างน้อย 1 ตัว ยังไม่มี Task ในระบบ กรุณาสร้าง Task
          ก่อน
        </p>
        <button type="button" className="btn-secondary mt-3" onClick={onCancel}>
          กลับ
        </button>
      </div>
    );
  }

  function taskLabel(id: string): string {
    const task = tasks.find((candidate) => candidate.id === id);
    if (task === undefined) return id;
    const req = requirements.find((candidate) => candidate.id === task.requirementId);
    return `${task.title} (${task.role}${req ? ` · ${req.title}` : ""})`;
  }

  return (
    <form className="flex flex-col gap-5 max-w-[640px]" onSubmit={submit} noValidate>
      <Field id="defect-title" label="หัวข้อ" required error={errors["title"]}>
        <input
          id="defect-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors["title"] !== undefined}
          data-testid="defect-title"
        />
      </Field>

      <Field
        id="defect-description"
        label="รายละเอียด"
        hint="ระบุขั้นตอนที่ทำให้เกิดซ้ำได้ และผลที่คาดหวังเทียบกับผลที่เกิดขึ้นจริง"
      >
        <textarea
          id="defect-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          data-testid="defect-description"
        />
      </Field>

      <Field
        id="defect-task"
        label="Task ต้นทาง"
        required
        hint="Defect ที่ไม่ผูกกับ Task จะย้อนหาต้นเหตุไม่ได้"
        error={errors["taskId"]}
      >
        <PlainSelect
          id="defect-task"
          value={taskId}
          placeholder="— เลือก Task —"
          hasError={errors["taskId"] !== undefined}
          options={tasks.map((task) => ({ value: task.id, label: taskLabel(task.id) }))}
          onChange={setTaskId}
        />
      </Field>

      <Field
        id="defect-type"
        label="ประเภท"
        required
        hint={type === "" ? "ประเภทระบุว่าต้นน้ำของปัญหาอยู่ที่ใด" : TYPE_HINTS[type]}
        error={errors["type"]}
      >
        <PlainSelect
          id="defect-type"
          value={type}
          placeholder="— เลือกประเภท —"
          hasError={errors["type"] !== undefined}
          options={DEFECT_TYPES.map((value) => ({ value, label: value }))}
          onChange={(value) => setType(value as DefectType)}
        />
      </Field>

      <Field id="defect-severity" label="ความรุนแรง" required error={errors["severity"]}>
        <PlainSelect
          id="defect-severity"
          value={severity}
          placeholder="— เลือกความรุนแรง —"
          hasError={errors["severity"] !== undefined}
          options={SEVERITIES.map((value) => ({ value, label: value }))}
          onChange={(value) => setSeverity(value as Severity)}
        />
      </Field>

      <Field id="defect-reporter" label="ผู้รายงาน" required error={errors["reporterId"]}>
        <PlainSelect
          id="defect-reporter"
          value={reporterId}
          hasError={errors["reporterId"] !== undefined}
          options={USERS.map((user) => ({ value: user.id, label: user.name }))}
          onChange={setReporterId}
        />
      </Field>

      {errors["form"] !== undefined && (
        <p className="text-danger text-caption" role="alert">
          {errors["form"]}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" data-testid="defect-submit">
          {existing ? "บันทึกการแก้ไข" : "สร้าง Defect"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
