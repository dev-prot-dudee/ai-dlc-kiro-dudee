import { createRepository, type Draft } from "../../shared/repository";
import { STORAGE_KEYS } from "../../shared/storage";
import { ROLES, ValidationError, type Task } from "../../shared/types";

/**
 * กฎบังคับของ Task
 *
 * FR2.2 — Task ทุกตัวต้องผูกกับ Requirement อย่างน้อย 1 ตัว ห้ามมี Task ลอย
 * FR2.3 — ต้องระบุตำแหน่งของผู้รับผิดชอบเป็นค่าใน SA/UX/Dev/Tester
 */
function validate(draft: Draft<Task>): void {
  if (draft.title.trim() === "") {
    throw new ValidationError("ต้องระบุหัวข้อของ Task", "title");
  }
  if (draft.requirementId.trim() === "") {
    throw new ValidationError(
      "ต้องเลือก Requirement ต้นทาง — Task ที่ไม่ผูกกับ Requirement ทำให้ตามรอยงานไม่ได้",
      "requirementId",
    );
  }
  if (!ROLES.includes(draft.role)) {
    throw new ValidationError(
      "ต้องเลือกตำแหน่งเป็น SA, UX, Dev หรือ Tester",
      "role",
    );
  }
  if (draft.assigneeId.trim() === "") {
    throw new ValidationError("ต้องระบุผู้รับผิดชอบ", "assigneeId");
  }
}

export const tasksRepo = createRepository<Task>(STORAGE_KEYS.tasks, validate);
