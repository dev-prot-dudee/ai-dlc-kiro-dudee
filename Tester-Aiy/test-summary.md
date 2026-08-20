# Unit Test Summary — PM Tool MVP (Tester-Aiy)

**วันที่:** 2026-08-20  
**ผลรัน:** 98 test ผ่านทั้งหมด ✅ (59 เดิม + 39 ใหม่)  
**คำสั่งรัน:** `npx vitest run src/shared src/modules`

---

## 📋 ไฟล์ 1: `edge-cases.spec.ts` — Edge Cases (14 test)

| # | กลุ่ม | ชื่อ Test | FR ที่เกี่ยว | ผลที่คาดหวัง |
|---|-------|-----------|-------------|-------------|
| 1 | String ว่าง/Whitespace | title ที่เป็นช่องว่างล้วนต้องถูกปฏิเสธ | FR1.2 | throw ValidationError |
| 2 | String ว่าง/Whitespace | title มีช่องว่างนำหน้า/ตามหลังแต่มีเนื้อหา ต้องบันทึกได้ | FR1.1 | บันทึกสำเร็จ |
| 3 | String ว่าง/Whitespace | description ว่างต้องอนุญาต | FR1.1 | ไม่ throw |
| 4 | Unicode/อักขระพิเศษ | title มี emoji ต้องบันทึกและอ่านกลับครบ | FR1.1 | ข้อมูลครบ |
| 5 | Unicode/อักขระพิเศษ | title มี HTML-like content ต้องเก็บเป็น plain text | FR6.1 | ไม่ถูก sanitize |
| 6 | Unicode/อักขระพิเศษ | title ยาว 1000 ตัวอักษร ต้องบันทึกได้ | FR1.1 | ความยาว = 1000 |
| 7 | Update บางส่วน | update field เดียวต้องไม่กระทบ field อื่น | FR1.5 | field อื่นคงเดิม |
| 8 | Update บางส่วน | update ด้วย id ที่ไม่มีอยู่ต้อง throw | FR1.5 | throw ValidationError |
| 9 | Task edge case | requirementId ชี้ไป id ที่ไม่มีจริง ยังสร้างได้ | FR2.2 | สร้างสำเร็จ (known limitation) |
| 10 | Task edge case | role เป็น empty string ต้องถูกปฏิเสธ | FR2.3 | throw ValidationError |
| 11 | Defect edge case | severity นอกชุดที่กำหนดต้องถูกปฏิเสธ | FR3.3 | throw ValidationError |
| 12 | Defect edge case | title เป็น whitespace ล้วนต้องถูกปฏิเสธ | FR3.1 | throw ValidationError |
| 13 | ลบรายการไม่มีอยู่ | remove id ที่ไม่มีต้องไม่ error (idempotent) | FR1.6 | ไม่ throw |
| 14 | ลบรายการไม่มีอยู่ | find id ที่ไม่มีต้องคืน null | — | คืน null |

---

## 📋 ไฟล์ 2: `ui-interaction.spec.tsx` — Component UI (10 test)

| # | กลุ่ม | ชื่อ Test | FR ที่เกี่ยว | ผลที่คาดหวัง |
|---|-------|-----------|-------------|-------------|
| 1 | FilterBar Requirements | กรองตามประเภท Functional → เห็นเฉพาะ Functional | FR1.4 | ซ่อน Non-Functional |
| 2 | FilterBar Requirements | กรองตาม priority Must → เห็นเฉพาะ Must | FR1.4 | ซ่อน Should/Could/Won't |
| 3 | FilterBar Requirements | เลือก "ทั้งหมด" กลับ → เห็นทุกรายการ | FR1.4 | แสดงครบ |
| 4 | FilterBar Tasks | กรองตามตำแหน่ง Tester → เห็นเฉพาะ Task ของ Tester | FR2.4 | ซ่อน Task ของ Dev |
| 5 | Toolbar ค้นหา | พิมพ์ "2FA" → เห็นเฉพาะรายการที่มีคำว่า 2FA | FR1.4 | ซ่อนรายการอื่น |
| 6 | Toolbar ค้นหา | ลบคำค้นทั้งหมด → เห็นทุกรายการอีกครั้ง | FR1.4 | แสดงครบ |
| 7 | Toolbar ค้นหา | คำค้นไม่ตรงอะไรเลย → ไม่แสดงรายการใดๆ | FR1.4 | ไม่มีรายการ |
| 8 | View switching | เปลี่ยนเป็น List → เห็นตารางแทน board | — | testId "list" ปรากฏ |
| 9 | View switching | สลับกลับเป็น Board → เห็น column จัดกลุ่ม | — | testId "board" ปรากฏ |
| 10 | Export button | กดปุ่ม export ต้องไม่ error | FR6.2 | ไม่ throw |

---

## 📋 ไฟล์ 3: `cross-module.spec.ts` — Cross-Module Interaction (15 test)

| # | กลุ่ม | ชื่อ Test | FR ที่เกี่ยว | ผลที่คาดหวัง |
|---|-------|-----------|-------------|-------------|
| 1 | Cascade Delete Req | ลบ Requirement → Task ทั้งหมดต้องถูกลบตาม | FR4.4 | Task = null |
| 2 | Cascade Delete Req | ลบ Requirement → Defect ใต้ Task ต้องหายด้วย | FR4.4 | Defect = null |
| 3 | Cascade Delete Req | ลบ Req ที่ไม่มีลูก → ไม่กระทบ Task/Defect อื่น | FR4.4 | จำนวนคงเดิม |
| 4 | Cascade Delete Task | ลบ Task → Defect ใต้ Task นั้นต้องถูกลบตาม | FR4.5 | Defect ของ task อื่นยังอยู่ |
| 5 | Cascade Delete Task | ลบ Task ที่ไม่มี Defect → ไม่กระทบ Defect อื่น | FR4.5 | จำนวน Defect คงเดิม |
| 6 | Traceability หลังแก้ | ย้าย Task ไป Req อื่น → สายเชื่อมโยง Req เดิมลดลง | FR4.1 | Req เดิม: 1 task, Req ใหม่: 1 task |
| 7 | Traceability หลังแก้ | traceBackward ยังถูกต้องหลังย้าย Task | FR4.2 | ชี้ไป Req ใหม่ |
| 8 | Traceability หลังแก้ | ลบ Task → traceBackward จาก Defect คืน null ไม่ล้ม | FR4.2 | task = null, req = null |
| 9 | Orphan Detection | countOrphansOnRequirementDelete นับเฉพาะลูกของ Req นั้น | FR4.4 | ไม่นับ Defect ของ Req อื่น |
| 10 | Orphan Detection | countOrphansOnTaskDelete นับเฉพาะ Defect ของ Task นั้น | FR4.5 | task1=2, task2=1 |
| 11 | Orphan Detection | findRequirementsWithoutTasks อัปเดตเมื่อ Task ถูกลบ | FR4.3 | Req ปรากฏใน orphan list |
| 12 | Orphan Detection | Defect หลายตัวจาก Task เดียว ต้องนับแยกไม่ซ้ำ | FR4.5 | count = 7 |
| 13 | Zero-state | traceForward ไม่มีข้อมูล → รายการว่าง | FR4.1 | tasks=[], defects=[] |
| 14 | Zero-state | findRequirementsWithoutTasks ไม่มี Req → รายการว่าง | FR4.3 | [] |
| 15 | Zero-state | countOrphans Req ที่ไม่มีลูก → 0 ทั้งคู่ | FR4.4 | {tasks:0, defects:0} |

---

## สรุปความครอบคลุม FR

| FR Group | จำนวน FR | ครอบด้วย test เดิม | เพิ่มจาก test ใหม่ |
|----------|----------|-------------------|-------------------|
| FR1 (Requirements) | 7 | ✅ ครบ | edge case + UI filter |
| FR2 (Tasks) | 7 | ✅ ครบ | edge case + UI filter |
| FR3 (Defects) | 7 | ✅ ครบ | edge case |
| FR4 (Traceability) | 5 | ✅ ครบ | cascade delete + orphan |
| FR5 (User Selection) | 3 | ✅ ครบ | — |
| FR6 (Storage) | 4 | ✅ ครบ | edge case + export UI |

---

## วิธีรัน test

```bash
# รันทั้งหมด
npm test

# รันเฉพาะไฟล์ใหม่
npx vitest run src/shared/edge-cases.spec.ts
npx vitest run src/shared/components/ui-interaction.spec.tsx
npx vitest run src/shared/cross-module.spec.ts

# โหมด watch
npx vitest watch src/shared
```
