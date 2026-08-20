import { createRepository, type Draft } from "../../shared/repository";
import { STORAGE_KEYS } from "../../shared/storage";
import {
  REQUIREMENT_CATEGORIES,
  PRIORITIES,
  ValidationError,
  type Requirement,
} from "../../shared/types";

/**
 * กฎบังคับของ Requirement
 *
 * FR1.2 — ต้องระบุประเภท ห้ามเว้นว่าง
 * FR1.3 — ระดับความสำคัญต้องเป็นค่าใน MoSCoW (ค่าเริ่มต้น Should เติมที่ฟอร์ม)
 */
function validate(draft: Draft<Requirement>): void {
  if (draft.title.trim() === "") {
    throw new ValidationError("ต้องระบุหัวข้อของ Requirement", "title");
  }
  if (!REQUIREMENT_CATEGORIES.includes(draft.category)) {
    throw new ValidationError(
      "ต้องเลือกประเภทเป็น Functional หรือ Non-Functional",
      "category",
    );
  }
  if (!PRIORITIES.includes(draft.priority)) {
    throw new ValidationError(
      "ต้องเลือกระดับความสำคัญเป็น Must, Should, Could หรือ Won't",
      "priority",
    );
  }
  if (draft.ownerId.trim() === "") {
    throw new ValidationError("ต้องระบุผู้รับผิดชอบ", "ownerId");
  }
}

export const requirementsRepo = createRepository<Requirement>(
  STORAGE_KEYS.requirements,
  validate,
);
