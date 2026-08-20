import { createRepository, type Draft } from "../../shared/repository";
import { STORAGE_KEYS } from "../../shared/storage";
import {
  DEFECT_TYPES,
  SEVERITIES,
  ValidationError,
  type Defect,
} from "../../shared/types";

/**
 * กฎบังคับของ Defect
 *
 * FR3.2 — ต้องระบุประเภทเป็นค่าใน 5 ค่า ห้ามค่าอื่น เพราะประเภทคือสิ่งที่ระบุ
 *         ต้นน้ำของปัญหา (สเปคไม่ครบ / design ไม่ครอบ / code ผิด / test ปล่อยผ่าน)
 * FR3.3 — ต้องระบุความรุนแรง
 * FR3.4 — ต้องผูกกับ Task อย่างน้อย 1 ตัว
 */
function validate(draft: Draft<Defect>): void {
  if (draft.title.trim() === "") {
    throw new ValidationError("ต้องระบุหัวข้อของ Defect", "title");
  }
  if (draft.taskId.trim() === "") {
    throw new ValidationError(
      "ต้องเลือก Task ต้นทาง — Defect ที่ไม่ผูกกับ Task ทำให้ย้อนหาต้นเหตุไม่ได้",
      "taskId",
    );
  }
  if (!DEFECT_TYPES.includes(draft.type)) {
    throw new ValidationError(
      "ต้องเลือกประเภทเป็น Code Bug, SA Gap, Design Gap, Test Escape หรือ NFR Violation",
      "type",
    );
  }
  if (!SEVERITIES.includes(draft.severity)) {
    throw new ValidationError(
      "ต้องเลือกความรุนแรงเป็น Critical, High, Medium หรือ Low",
      "severity",
    );
  }
  if (draft.reporterId.trim() === "") {
    throw new ValidationError("ต้องระบุผู้รายงาน", "reporterId");
  }
}

export const defectsRepo = createRepository<Defect>(STORAGE_KEYS.defects, validate);
