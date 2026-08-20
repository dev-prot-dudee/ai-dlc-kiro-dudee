# Unit Test แยกตาม Requirement — PM Tool MVP (Tester-Aiy)

**วันที่:** 2026-08-20  
**ผลรัน:** 98 test ผ่านทั้งหมด ✅  
**คำสั่งรัน:** `npm test`

---

## FR1 — Requirement Management (7 ข้อกำหนด)

### FR1.1 — สร้าง Requirement ใหม่ได้

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | เมื่อกรอกข้อมูลครบและบันทึก Requirement ใหม่ต้องปรากฏในรายการ | สร้างสำเร็จ ข้อมูลครบ |
| 2 | edge-cases.spec.ts | title มีช่องว่างนำหน้า/ตามหลังแต่มีเนื้อหา ต้องบันทึกได้ | บันทึกสำเร็จ |
| 3 | edge-cases.spec.ts | description ว่างต้องอนุญาต | ไม่ throw |
| 4 | edge-cases.spec.ts | title มี emoji ต้องบันทึกและอ่านกลับครบ | ข้อมูลครบ |
| 5 | edge-cases.spec.ts | title มี HTML-like content ต้องเก็บเป็น plain text | ไม่ถูก sanitize |
| 6 | edge-cases.spec.ts | title ยาว 1000 ตัวอักษร ต้องบันทึกได้ | ความยาว = 1000 |

### FR1.2 — บังคับระบุประเภท (Functional / Non-Functional)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | เมื่อบันทึกโดยไม่เลือกประเภท ต้องถูกปฏิเสธ | throw ValidationError |
| 2 | requirements.spec.ts | ค่าที่อยู่นอก Functional และ Non-Functional ต้องถูกปฏิเสธ | throw ValidationError |
| 3 | edge-cases.spec.ts | title ที่เป็นช่องว่างล้วนต้องถูกปฏิเสธเหมือน string ว่าง | throw ValidationError |

### FR1.3 — ระดับความสำคัญแบบ MoSCoW (ค่าเริ่มต้น Should)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | ค่าเริ่มต้นต้องเป็น Should | priority = "Should" |
| 2 | requirements.spec.ts | เมื่อเลือกค่าอื่นใน MoSCoW ต้องบันทึกค่าที่เลือก | priority = "Must" |
| 3 | requirements.spec.ts | ค่านอก MoSCoW ต้องถูกปฏิเสธ | throw ValidationError |

### FR1.4 — กรองตามประเภทและระดับความสำคัญ

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | ต้องกรองตามประเภทและตามระดับความสำคัญได้ | กรองถูกต้อง |
| 2 | ui-interaction.spec.tsx | กรองตามประเภท Functional → เห็นเฉพาะ Functional | ซ่อน Non-Functional |
| 3 | ui-interaction.spec.tsx | กรองตาม priority Must → เห็นเฉพาะ Must | ซ่อน Should/Could/Won't |
| 4 | ui-interaction.spec.tsx | เลือก "ทั้งหมด" กลับ → เห็นทุกรายการ | แสดงครบ |
| 5 | ui-interaction.spec.tsx | พิมพ์ค้นหา "2FA" → เห็นเฉพาะรายการที่ตรง | ซ่อนรายการอื่น |
| 6 | ui-interaction.spec.tsx | ลบคำค้นทั้งหมด → เห็นทุกรายการอีกครั้ง | แสดงครบ |
| 7 | ui-interaction.spec.tsx | คำค้นไม่ตรงอะไรเลย → ไม่แสดงรายการใดๆ | ไม่มีรายการ |

### FR1.5 — แก้ไขทุก field ได้

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | แก้แล้วอ่านใหม่ ต้องได้ค่าใหม่ | title + priority เปลี่ยน |
| 2 | requirements.spec.ts | แก้ให้เป็นค่าที่ผิดกฎต้องถูกปฏิเสธ ค่าเดิมยังอยู่ | throw + ค่าเดิมคงอยู่ |
| 3 | edge-cases.spec.ts | update field เดียวต้องไม่กระทบ field อื่น | field อื่นคงเดิม |
| 4 | edge-cases.spec.ts | update ด้วย id ที่ไม่มีอยู่ต้อง throw | throw ValidationError |

### FR1.6 — ลบ Requirement ได้ (ถามยืนยันก่อน)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | ลบแล้วต้องหายจากรายการ | find = null |
| 2 | components.spec.tsx | กดยกเลิกต้องเรียก onCancel ไม่เรียก onConfirm | ไม่ถูกลบ |
| 3 | edge-cases.spec.ts | remove id ที่ไม่มีต้องไม่ error (idempotent) | ไม่ throw |

### FR1.7 — แสดงจำนวน Task/Defect ที่ผูกอยู่

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | requirements.spec.ts | นับ Task ที่ผูกกับ Requirement ได้ถูกต้อง | count = 2 |
| 2 | requirements.spec.ts | Requirement ที่ยังไม่มี Task ต้องถูกชี้ (FR4.3) | อยู่ใน orphan list |

---

## FR2 — Task Management (7 ข้อกำหนด)

### FR2.1 — สร้าง Task ใหม่ (ผูกกับ Requirement)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | สร้างพร้อมเลือก Requirement ต้องปรากฏและผูกจริง | requirementId ตรง |

### FR2.2 — บังคับผูกกับ Requirement

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | บันทึกโดยไม่เลือก Requirement ต้องถูกปฏิเสธ | throw ValidationError |
| 2 | tasks.spec.ts | ข้อความปฏิเสธต้องระบุ field และเหตุผล | field = "requirementId" |
| 3 | edge-cases.spec.ts | requirementId ชี้ไป id ที่ไม่มีจริง ยังสร้างได้ | สร้างสำเร็จ (known limitation) |

### FR2.3 — บังคับระบุตำแหน่ง (SA/UX/Dev/Tester)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | ไม่เลือกตำแหน่ง ต้องถูกปฏิเสธ | throw ValidationError |
| 2 | tasks.spec.ts | ตำแหน่งนอก SA/UX/Dev/Tester ต้องถูกปฏิเสธ | throw ValidationError |
| 3 | edge-cases.spec.ts | role เป็น empty string ต้องถูกปฏิเสธ | throw ValidationError |

### FR2.4 — กรองตามผู้รับผิดชอบ ตำแหน่ง และ Requirement ต้นทาง

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | กรองตามผู้รับผิดชอบ ตำแหน่ง และ Requirement ได้ | กรองถูกต้อง |
| 2 | ui-interaction.spec.tsx | กรองตามตำแหน่ง Tester → เห็นเฉพาะ Task ของ Tester | ซ่อน Task ของ Dev |

### FR2.5 — แก้ไขและลบ Task

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | แก้แล้วต้องได้ค่าใหม่ และลบแล้วต้องหาย | ค่าใหม่ + find = null |

### FR2.6 — แสดงว่า Task มาจาก Requirement ไหน

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | จาก Task ต้องหา Requirement ต้นทางได้ | req.id ตรง |

### FR2.7 — แสดงจำนวน Defect ที่ผูกกับ Task

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | tasks.spec.ts | นับ Defect ใต้ Task ได้ถูกต้อง + บอกจำนวนกำพร้า | count = 3 |

---

## FR3 — Defect Tracking (7 ข้อกำหนด)

### FR3.1 — สร้าง Defect ใหม่ (ผูกกับ Task)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | สร้างพร้อมเลือก Task ต้องปรากฏและผูกจริง | taskId ตรง |
| 2 | edge-cases.spec.ts | title เป็น whitespace ล้วนต้องถูกปฏิเสธ | throw ValidationError |

### FR3.2 — บังคับระบุประเภทจาก 5 ค่า

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | ไม่เลือกประเภท ต้องถูกปฏิเสธ | throw ValidationError |
| 2 | defects.spec.ts | ค่านอก 5 ประเภทต้องถูกปฏิเสธ | throw ValidationError |
| 3 | defects.spec.ts | ทั้ง 5 ประเภทบันทึกได้ทุกค่า | สร้างได้ 5 ตัว |

### FR3.3 — บังคับระบุความรุนแรง

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | ไม่เลือกความรุนแรง ต้องถูกปฏิเสธ | throw ValidationError |
| 2 | edge-cases.spec.ts | severity นอกชุดที่กำหนดต้องถูกปฏิเสธ | throw ValidationError |

### FR3.4 — บังคับผูกกับ Task

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | ไม่เลือก Task ต้องถูกปฏิเสธพร้อมข้อความ | field = "taskId" |

### FR3.5 — กรองตามประเภทและความรุนแรง

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | กรองตามประเภทและความรุนแรงได้ | กรองถูกต้อง |

### FR3.6 — แก้ไขและลบ Defect

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | แก้ประเภทแล้วได้ค่าใหม่ ลบแล้วหาย | ค่าใหม่ + find = null |

### FR3.7 — แสดงจำนวน Defect แยกตาม 5 ประเภท

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | defects.spec.ts | นับครบทุกประเภท ที่ไม่มีต้องเป็น 0 | 5 keys ครบ |
| 2 | traceability.spec.ts | นับครบทั้ง 5 ประเภท ไม่มีต้องเป็น 0 | Object.keys = 5 |
| 3 | components.spec.tsx | ตัวเลขนับบนหัว column ต้องแสดงค่าที่ส่งเข้ามา | count = 7 |
| 4 | components.spec.tsx | count เป็น 0 ยังแสดง column และเลข 0 | count = "0" |

---

## FR4 — Traceability สายเชื่อมโยง (5 ข้อกำหนด)

### FR4.1 — สายเชื่อมโยงจาก Requirement ลงไป Task/Defect

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | traceability.spec.ts | เห็นทั้ง 2 Task และทั้ง 2 Defect ไม่ปนของ Req อื่น | tasks=2, defects=2 |
| 2 | traceability.spec.ts | Req ไม่มี Task → รายการว่างทั้งสองระดับ | tasks=[], defects=[] |
| 3 | cross-module.spec.ts | ย้าย Task ไป Req อื่น → สายเชื่อมโยง Req เดิมลดลง | Req เดิม: 1, Req ใหม่: 1 |
| 4 | cross-module.spec.ts | traceForward ไม่มีข้อมูล → รายการว่าง | tasks=[], defects=[] |

### FR4.2 — สายย้อนกลับจาก Defect ขึ้นถึง Task/Requirement

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | traceability.spec.ts | เปิด Defect → เห็น Task และ Requirement ต้นทาง | task + req ตรง |
| 2 | traceability.spec.ts | Task ถูกลบไปแล้ว → คืน null ทั้งคู่ ไม่ล้ม | task=null, req=null |
| 3 | tasks.spec.ts | สายย้อนจาก Defect ขึ้นถึง Requirement ครบ (FR4.2) | trace ครบ 3 ระดับ |
| 4 | cross-module.spec.ts | traceBackward ยังถูกต้องหลังย้าย Task | ชี้ไป Req ใหม่ |
| 5 | cross-module.spec.ts | ลบ Task → traceBackward คืน null ไม่ล้ม | task=null, req=null |

### FR4.3 — ระบุ Requirement ที่ยังไม่มี Task

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | traceability.spec.ts | คืนเฉพาะ Req ที่ไม่มี Task ผูก | [r2] |
| 2 | components.spec.tsx | การ์ดมีข้อความเตือน "⚠ ยังไม่มี Task" | เห็น warning |
| 3 | cross-module.spec.ts | findRequirementsWithoutTasks อัปเดตเมื่อ Task ถูกลบ | Req ปรากฏใน list |
| 4 | cross-module.spec.ts | ไม่มี Req เลย → รายการว่าง | [] |

### FR4.4 — เตือนก่อนลบ Requirement ที่มีลูก

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | traceability.spec.ts | นับ Task + Defect ที่จะกำพร้าได้ถูกต้อง | {tasks:2, defects:2} |
| 2 | components.spec.tsx | dialog บอกจำนวน เป็น dialog ที่ screen reader อ่านได้ | role="dialog" + ข้อความ |
| 3 | cross-module.spec.ts | ลบ Req → Task ทั้งหมดถูกลบตาม | Task = null |
| 4 | cross-module.spec.ts | ลบ Req → Defect ใต้ Task หายด้วย | Defect = null |
| 5 | cross-module.spec.ts | ลบ Req ที่ไม่มีลูก → ไม่กระทบ Task/Defect อื่น | จำนวนคงเดิม |
| 6 | cross-module.spec.ts | countOrphans นับเฉพาะลูกของ Req นั้น | ไม่นับของ Req อื่น |
| 7 | cross-module.spec.ts | Req ไม่มีลูก → 0 ทั้งคู่ | {tasks:0, defects:0} |

### FR4.5 — เตือนก่อนลบ Task ที่มี Defect

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | traceability.spec.ts | นับ Defect ที่จะกำพร้าเมื่อลบ Task | {defects:3} |
| 2 | cross-module.spec.ts | ลบ Task → Defect ใต้ Task ถูกลบตาม | Defect ของ task อื่นยังอยู่ |
| 3 | cross-module.spec.ts | ลบ Task ที่ไม่มี Defect → ไม่กระทบ Defect อื่น | จำนวนคงเดิม |
| 4 | cross-module.spec.ts | countOrphansOnTaskDelete นับเฉพาะ Defect ของ Task นั้น | task1=2, task2=1 |
| 5 | cross-module.spec.ts | Defect หลายตัวจาก Task เดียว นับแยกไม่ซ้ำ | count = 7 |

---

## FR5 — การเลือกผู้ใช้ (3 ข้อกำหนด)

### FR5.1 — Dropdown เลือกผู้ใช้ปัจจุบัน

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | components.spec.tsx | มี label ผูกกับ select จริง แสดงรายชื่อครบ | 12 options |

### FR5.2 — ผู้ใช้ที่เลือกเป็นค่าเริ่มต้นของ field ผู้รับผิดชอบ/ผู้รายงาน

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | current-user.spec.tsx | สร้าง Requirement → ผู้รับผิดชอบเป็นผู้ใช้ปัจจุบัน | value = actor.id |
| 2 | current-user.spec.tsx | สร้าง Task → ผู้รับผิดชอบเป็นผู้ใช้ปัจจุบัน | value = actor.id |
| 3 | current-user.spec.tsx | สร้าง Defect → ผู้รายงานเป็นผู้ใช้ปัจจุบัน | value = actor.id |

### FR5.3 — จำผู้ใช้ข้าม session

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | components.spec.tsx | เลือกแล้ว ค่าคงอยู่ข้าม session | readCurrentUserId = target |
| 2 | components.spec.tsx | ค่าชี้ไปผู้ใช้ที่ไม่มี → ถอยไปใช้คนแรก | fallback = USERS[0] |

---

## FR6 — การเก็บข้อมูล (4 ข้อกำหนด)

### FR6.1 — ข้อมูลคงอยู่ใน localStorage ข้าม session

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | storage.spec.ts | เขียนแล้วอ่านใหม่ ได้ข้อมูลเดิมครบ | 3 รายการครบ |
| 2 | storage.spec.ts | ยังไม่เคยเขียน อ่านได้รายการว่าง ไม่ error | [] |
| 3 | edge-cases.spec.ts | title มี HTML-like content เก็บครบไม่หาย | plain text ครบ |

### FR6.2 — Export/Import เป็น JSON

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | storage.spec.ts | export ลบ import กลับ → ข้อมูลครบเท่าเดิม | 3 ชนิดครบ |
| 2 | storage.spec.ts | import ไฟล์ผิดรูปแบบ → ปฏิเสธ ข้อมูลเดิมไม่ทับ | throw + ข้อมูลเดิมอยู่ |
| 3 | ui-interaction.spec.tsx | กดปุ่ม export ต้องไม่ error | ไม่ throw |

### FR6.3 — ข้อมูลเสียหายต้องไม่ทำให้ระบบล้ม

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | storage.spec.ts | ข้อมูล parse ไม่ได้ → โยน StorageCorruptError ระบุ key | error.key ตรง |
| 2 | storage.spec.ts | ข้อมูล parse ได้แต่ไม่ใช่ array → โยน StorageCorruptError | throw |

### FR6.4 — localStorage เต็มต้องแจ้งเตือน ข้อมูลเดิมไม่หาย

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | storage.spec.ts | เขียนไม่ได้เพราะเต็ม → StorageFullError + ข้อมูลเดิมยังอยู่ | throw + survived |

---

## NFR5 — Accessibility (WCAG 2.1 AA)

| # | ไฟล์ | ชื่อ Test | ผลที่คาดหวัง |
|---|------|-----------|-------------|
| 1 | components.spec.tsx | หัว column ต้องแสดงชื่อเป็นตัวอักษร ไม่ใช่แค่สี | text content + aria |
| 2 | components.spec.tsx | การ์ดเข้าถึงด้วย keyboard ได้ (Tab + Enter) | focus + onOpen called |
| 3 | components.spec.tsx | dialog มี role="dialog" + accessible name | role ตรง |
| 4 | components.spec.tsx | UserPicker มี label ผูกจริง | getByLabelText สำเร็จ |

---

## สรุปจำนวน test ต่อ FR

| FR | ชื่อ | จำนวน test |
|----|------|-----------|
| FR1.1 | สร้าง Requirement | 6 |
| FR1.2 | บังคับระบุประเภท | 3 |
| FR1.3 | MoSCoW priority | 3 |
| FR1.4 | กรองรายการ | 7 |
| FR1.5 | แก้ไข | 4 |
| FR1.6 | ลบ | 3 |
| FR1.7 | นับ Task/Defect | 2 |
| FR2.1 | สร้าง Task | 1 |
| FR2.2 | บังคับผูก Req | 3 |
| FR2.3 | บังคับตำแหน่ง | 3 |
| FR2.4 | กรอง Task | 2 |
| FR2.5 | แก้ไข/ลบ Task | 1 |
| FR2.6 | ย้อนกลับ Req | 1 |
| FR2.7 | นับ Defect | 1 |
| FR3.1 | สร้าง Defect | 2 |
| FR3.2 | บังคับ 5 ประเภท | 3 |
| FR3.3 | บังคับ severity | 2 |
| FR3.4 | บังคับผูก Task | 1 |
| FR3.5 | กรอง Defect | 1 |
| FR3.6 | แก้ไข/ลบ Defect | 1 |
| FR3.7 | นับแยก 5 ประเภท | 4 |
| FR4.1 | Forward trace | 4 |
| FR4.2 | Backward trace | 5 |
| FR4.3 | Req ไม่มี Task | 4 |
| FR4.4 | Cascade ลบ Req | 7 |
| FR4.5 | Cascade ลบ Task | 5 |
| FR5.1 | Dropdown ผู้ใช้ | 1 |
| FR5.2 | ค่าตั้งต้น | 3 |
| FR5.3 | จำข้าม session | 2 |
| FR6.1 | คงอยู่ข้าม session | 3 |
| FR6.2 | Export/Import | 3 |
| FR6.3 | ข้อมูลเสียหาย | 2 |
| FR6.4 | โควตาเต็ม | 1 |
| NFR5 | Accessibility | 4 |
