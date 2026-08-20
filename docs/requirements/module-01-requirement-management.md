# Requirement Document — Module 01: Requirement Management

> **จัดทำโดย:** System Analyst (SA)
> **สถานะ:** Draft — รอ Review
> **Priority:** 🔴 MUST HAVE
> **ที่มา:** สไลด์ `03 — FUNCTIONAL REQUIREMENTS` (`img/`), `docs/project-modules-overview.md`, `docs/team-roles-responsibilities.md`
> **ผู้อ่านเอกสารนี้:** SA, UX/UI, Dev, Tester (QA), PM, HR

---

## 1. ภาพรวม (Overview)

### 1.1 วัตถุประสงค์

Module Requirement Management คือจุดเริ่มต้นของสายข้อมูลทั้งระบบ:

```
Requirement → Task → Defect → Sprint → KPI
```

โมดูลนี้เป็นเครื่องมือให้ SA แปลงความต้องการของลูกค้า/stakeholder ให้เป็น Requirement ที่มีโครงสร้างชัดเจน วัดผลได้ และสามารถผูก (trace) ต่อไปยัง Task และ Defect ในโมดูลอื่นได้ตลอดสาย

### 1.2 Pain Point ที่ต้องแก้

Requirement ที่เขียนแบบคลุมเครือ (เช่น "ระบบต้องเร็ว", "หน้าเว็บต้องใช้งานง่าย") ทำให้เกิดความขัดแย้งตอน UAT เพราะไม่มีเกณฑ์ตัดสินร่วมกันว่า "ผ่าน" หรือ "ไม่ผ่าน" — Module นี้บังคับให้ Non-Functional Requirement (NFR) ทุกข้อต้องมีตัวเลขที่วัดได้ และบังคับให้ Requirement ทุกข้อผูกกับ Module และ Sprint เพื่อให้ตรวจสอบย้อนกลับได้

### 1.3 ตำแหน่งของโมดูลในสายข้อมูล

```mermaid
graph LR
    M1[01 Requirement Management] --> M2[02 Task Management]
    M1 --> M3[03 Defect Tracking]
    M2 --> M3
    M2 --> M4[04 Sprint Management]
    M3 --> M4
    M4 --> M5[05 KPI Dashboard]
```

Requirement เป็นจุดเริ่ม — กำหนดว่าต้องทำอะไร ก่อนถูกแตกเป็น Task (Module 02) และใช้เป็นข้อมูลอ้างอิงเมื่อเกิด Defect ประเภท `SA Gap` (Module 03)

**Text fallback (กรณี Mermaid render ไม่ได้):**
Requirement Management → ส่งต่อไปยัง Task Management และ Defect Tracking → Task Management ส่งต่อไปยัง Defect Tracking และ Sprint Management → Defect Tracking ส่งต่อไปยัง Sprint Management → Sprint Management ส่งต่อไปยัง KPI Dashboard

---

## 2. ผู้ใช้งานและบทบาท (Actors)

| Role | บทบาทใน Module นี้ |
|------|---------------------|
| **SA** | เจ้าของหลักของโมดูลนี้ — สร้าง, แก้ไข, และดูแล Requirement ทุกข้อ รวมถึงกรอก NFR Metric และผูก Requirement เข้ากับ Module/Sprint |
| **PM** | ร่วมกำหนด MoSCoW Priority กับ SA, ใช้ Requirement เป็นฐานในการแตก Task (Module 02) |
| **UX/UI** | อ่าน Requirement เพื่อนำไปออกแบบ (consumer ของข้อมูล ไม่มีสิทธิ์แก้ไข) |
| **Dev** | อ่าน Requirement เพื่อ implement และอ้างอิงเมื่อเถียงเรื่อง Defect type (`SA Gap` vs `Code Bug`) |
| **Tester (QA)** | อ่าน Requirement โดยเฉพาะ NFR Metric เพื่อใช้เป็นเกณฑ์ตรวจสอบ `NFR Violation` |
| **HR** | ไม่เกี่ยวข้องกับโมดูลนี้โดยตรง |

> หมายเหตุ: สิทธิ์แก้ไข (create/update/delete) จำกัดเฉพาะ SA และ PM (ร่วมกำหนด Priority) ส่วน role อื่นมีสิทธิ์อ่าน (read-only) และผูก reference กลับมา (เช่น Task อ้าง Requirement ID)

---

## 3. Functional Requirements

### FR-01: สร้าง Requirement ผ่าน Web Form

**คำอธิบาย:** ผู้ใช้ (SA) ต้องสามารถสร้าง Requirement ใหม่ผ่านฟอร์มบนเว็บ โดยฟอร์มต้องมี Conditional Fields ที่เปลี่ยนตาม Req Category ที่เลือก

**Field หลักของ Requirement:**

| Field | ประเภทข้อมูล | บังคับ | คำอธิบาย |
|-------|--------------|--------|----------|
| Requirement ID | String (auto-generated) | ✅ | รหัสอ้างอิงไม่ซ้ำ เช่น `REQ-001` |
| Title | String | ✅ | ชื่อสั้นของ Requirement |
| Description | Text | ✅ | รายละเอียดความต้องการ |
| Req Category | Enum: `Functional` \| `Non-Functional` | ✅ | ดู FR-02 |
| MoSCoW Priority | Enum: `Must` \| `Should` \| `Could` \| `Won't` | ✅ | ดู FR-04 |
| Module | Reference (M01–M08) | ✅ | Requirement นี้เกี่ยวข้องกับ Module ไหน |
| Sprint | Reference (Sprint ID) | ✅ | Requirement ถูกกำหนดให้ทำใน Sprint ไหน |
| Initial Estimate | Number (hours/days/story point) | ✅ | ดู FR-05 |
| Actual Estimate (rollup) | Number (auto-calculate) | — (ระบบคำนวณ) | ดู FR-05 |
| Created By | Reference (User = SA) | ✅ (auto) | ผู้สร้าง Requirement |
| Created Date | Date (auto) | ✅ (auto) | วันที่สร้าง |
| Status | Enum: `Draft` \| `Approved` \| `In Progress` \| `Done` | ✅ | สถานะปัจจุบัน |

**เกณฑ์การรับ (Acceptance Criteria):**

- Given ผู้ใช้เป็น SA, When กรอกฟอร์มครบทุก field บังคับและกดบันทึก, Then ระบบสร้าง Requirement ใหม่พร้อม Requirement ID อัตโนมัติ และสถานะเริ่มต้นเป็น `Draft`
- Given ผู้ใช้ยังไม่กรอก field บังคับ, When กดบันทึก, Then ระบบแสดง error ระบุ field ที่ขาดและไม่บันทึกข้อมูล
- Given ผู้ใช้เลือก Req Category เป็น `Non-Functional`, When ฟอร์มแสดงผล, Then ระบบแสดง field เพิ่มเติมตาม FR-03 (NFR Metric) และบังคับกรอก

---

### FR-02: แยก Req Category — Functional / Non-Functional

**คำอธิบาย:** Requirement ทุกข้อต้องถูกจำแนกเป็นหนึ่งใน 2 ประเภท เพื่อกำหนด field และเกณฑ์ตรวจสอบที่ต่างกัน

| ประเภท | ความหมาย | ตัวอย่าง |
|--------|----------|----------|
| **Functional** | ความต้องการเชิงพฤติกรรม/ฟีเจอร์ของระบบ | "ผู้ใช้ต้องสามารถ login ด้วยอีเมลและรหัสผ่านได้" |
| **Non-Functional (NFR)** | ความต้องการเชิงคุณภาพ ต้องมีตัวเลขวัดผลได้ (ดู FR-03) | "หน้า Dashboard ต้องโหลดเสร็จภายใน 2 วินาที ที่ concurrent user 100 คน" |

**เกณฑ์การรับ:**

- Given SA เลือก Req Category = `Functional`, When บันทึก, Then ระบบไม่บังคับกรอก NFR Metric field
- Given SA เลือก Req Category = `Non-Functional`, When บันทึก, Then ระบบบังคับกรอก NFR Metric field ตาม FR-03 ก่อนอนุญาตให้บันทึกสำเร็จ

---

### FR-03: NFR Metric Validation

**คำอธิบาย:** เมื่อ Requirement เป็นประเภท Non-Functional ระบบต้องบังคับให้กรอกตัวเลขที่วัดผลได้จริง ห้ามปล่อยให้เขียนคำคลุมเครือ เช่น "ต้องเร็ว" หรือ "ต้องใช้งานง่าย" โดยไม่มีค่าตัวเลขประกอบ

**Field เพิ่มเติมสำหรับ NFR:**

| Field | ประเภทข้อมูล | บังคับ | คำอธิบาย |
|-------|--------------|--------|----------|
| NFR Type | Enum: `Performance` \| `Security` \| `Usability` \| `Reliability` \| `Scalability` \| `Other` | ✅ | หมวดของ NFR |
| Metric Value | Number | ✅ | ค่าตัวเลขที่ต้องวัดได้ |
| Metric Unit | String (เช่น `seconds`, `%`, `concurrent users`, `requests/sec`) | ✅ | หน่วยของค่าตัวเลข |
| Measurement Condition | Text | ✅ | เงื่อนไขที่วัด เช่น "ที่ 100 concurrent users", "บน 4G connection" |

**เกณฑ์การรับ:**

- Given Req Category = `Non-Functional`, When SA พยายามบันทึกโดยไม่กรอก Metric Value หรือ Metric Unit, Then ระบบปฏิเสธการบันทึกและแสดง error "NFR ต้องระบุค่าตัวเลขที่วัดได้"
- Given SA กรอก Metric Value เป็นข้อความ (ไม่ใช่ตัวเลข), When บันทึก, Then ระบบแสดง error validation
- Given NFR ถูกสร้างสำเร็จ, When Tester ทำการทดสอบใน Module 03, Then ระบบสามารถอ้างอิง Metric Value/Unit/Condition นี้เป็นเกณฑ์ตัดสิน `NFR Violation` ได้

> **เชื่อมโยงกับ Module 03 (Defect Tracking):** ค่า NFR Metric ที่กรอกในโมดูลนี้คือ "อ้างอิง" (reference) ที่ Tester ใช้เทียบกับผลทดสอบจริงใน Evidence form 3 ส่วน (อ้างอิง/จริง/กระทบ) เมื่อรายงาน Defect ประเภท `NFR Violation`

---

### FR-04: MoSCoW Priority

**คำอธิบาย:** ทุก Requirement ต้องมีระดับความสำคัญตามหลัก MoSCoW กำหนดร่วมกันระหว่าง SA และ PM

| ค่า | ความหมาย |
|-----|----------|
| `Must` | ต้องมีในเวอร์ชันนี้ ขาดไม่ได้ |
| `Should` | สำคัญ แต่พอยอมเลื่อนได้หากจำเป็น |
| `Could` | มีก็ดี ไม่มีก็ไม่กระทบ scope หลัก |
| `Won't` | ตกลงร่วมกันแล้วว่าจะไม่ทำในรอบนี้ |

**เกณฑ์การรับ:**

- Given SA สร้าง Requirement ใหม่, When บันทึก, Then ต้องเลือก MoSCoW Priority หนึ่งค่าเสมอ (ไม่มีค่า default ว่าง)
- Given PM ต้องการเปลี่ยน Priority ที่ SA กำหนดไว้, When PM แก้ไขค่า, Then ระบบบันทึก log ว่าใครเปลี่ยนและเมื่อไร (audit trail)

---

### FR-05: Dual Estimate — Initial vs Actual

**คำอธิบาย:** แยกประมาณการเวลา/ความพยายาม 2 ค่า เพื่อวัด Estimate Variance ในภายหลัง

| Field | วิธีได้ค่า | คำอธิบาย |
|-------|-----------|----------|
| **Initial Estimate** | กรอกโดย SA ตอนสร้าง Requirement | ประมาณการเริ่มต้น ระดับ Requirement |
| **Actual Estimate** | Auto-rollup จาก Task ที่ลิงก์กับ Requirement นี้ (Module 02) | รวมเวลาจริงที่ใช้จาก Task ทั้งหมดที่ผูกกับ Requirement |

**เกณฑ์การรับ:**

- Given Requirement ถูกสร้างและยังไม่มี Task ผูกอยู่, When ดูหน้า Requirement, Then Actual Estimate แสดงเป็น `0` หรือ `—` (ยังไม่มีข้อมูล)
- Given มี Task ที่ผูกกับ Requirement นี้ถูกปิด (Done) พร้อมบันทึกเวลาจริง, When ระบบ rollup, Then Actual Estimate อัปเดตเป็นผลรวมอัตโนมัติโดยไม่ต้องมีคนกรอกมือ
- Given Initial Estimate และ Actual Estimate มีค่าทั้งคู่, When Module 05 (KPI Dashboard) ดึงข้อมูล, Then สามารถคำนวณ Estimate Variance ได้ (`(Actual - Initial) / Initial`)

---

### FR-06: Traceability — Requirement → Task → Defect

**คำอธิบาย:** ทุก Requirement ต้องสามารถตรวจสอบย้อนกลับ (trace) ไปยัง Task ที่แตกออกมา (Module 02) และ Defect ที่เกี่ยวข้อง (Module 03) ได้แบบสองทาง

**เกณฑ์การรับ:**

- Given Requirement `REQ-001` ถูกแตกเป็น Task หลายรายการใน Module 02, When ดูหน้า Requirement, Then แสดงรายการ Task ที่ผูกอยู่ทั้งหมดพร้อมสถานะ
- Given Task ที่ผูกกับ `REQ-001` เกิด Defect ประเภทใดก็ตาม, When ดูหน้า Requirement, Then แสดงจำนวนและรายการ Defect ที่โยงมาจาก Requirement นี้ (ทางตรงผ่าน Task)
- Given Defect ถูกจำแนกเป็นประเภท `SA Gap`, When ดูหน้า Defect, Then ต้องแสดงลิงก์กลับไปยัง Requirement ต้นทางที่เป็นสาเหตุ เพื่อให้ตรวจสอบได้ว่าสเปคข้อไหนไม่ครบ

---

### FR-07: Module + Sprint Assignment

**คำอธิบาย:** Requirement ทุกข้อต้องผูกกับ Module (M01–M08) และ Sprint ที่วางแผนจะทำ เพื่อให้ Module 04 (Sprint Management) และ Module 06 (Multi-Project Management) ดึงข้อมูลไปแสดงผลได้

**เกณฑ์การรับ:**

- Given SA สร้าง Requirement, When บันทึกโดยไม่เลือก Module หรือ Sprint, Then ระบบปฏิเสธการบันทึก
- Given Requirement ถูกผูกกับ Sprint X, When ดูหน้า Sprint X ใน Module 04, Then Requirement นี้ปรากฏในรายการของ Sprint นั้น
- Given ต้องการย้าย Requirement ไป Sprint อื่น (re-planning), When SA/PM เปลี่ยนค่า Sprint, Then ระบบบันทึก log การเปลี่ยนแปลงและอัปเดตความสัมพันธ์ในทันที

---

### FR-08: แก้ไขและลบ Requirement

**คำอธิบาย:** SA ต้องสามารถแก้ไข Requirement ที่มีอยู่ได้ และลบ Requirement ที่ยังไม่ถูกใช้งานได้ ภายใต้เงื่อนไขความปลอดภัยของข้อมูล

**เกณฑ์การรับ:**

- Given Requirement ยังไม่มี Task ผูกอยู่, When SA กดลบ, Then ระบบลบ Requirement ได้ทันที
- Given Requirement มี Task ผูกอยู่แล้วอย่างน้อย 1 รายการ, When SA กดลบ, Then ระบบปฏิเสธการลบและแสดง error "ไม่สามารถลบ Requirement ที่มี Task ผูกอยู่ กรุณายกเลิกความสัมพันธ์ก่อน" (ป้องกันข้อมูล Traceability หาย)
- Given Requirement ถูกแก้ไข field ใดก็ตามหลังจากมี Task ผูกอยู่แล้ว, When บันทึก, Then ระบบเก็บ version/log การเปลี่ยนแปลง (ใครแก้ เมื่อไร แก้อะไร) เพื่อรองรับการตรวจสอบย้อนหลัง

---

### FR-09: Status Workflow ของ Requirement

**คำอธิบาย:** Requirement มีสถานะที่สะท้อนความคืบหน้า

```
Draft → Approved → In Progress → Done
```

| สถานะ | ความหมาย | ใครเปลี่ยนได้ |
|-------|----------|----------------|
| `Draft` | สร้างใหม่ ยังไม่ถูกอนุมัติ | SA |
| `Approved` | PM/stakeholder ยืนยันแล้วว่าถูกต้อง พร้อมแตก Task | PM, SA |
| `In Progress` | มี Task ที่ผูกอยู่กำลังดำเนินการ (auto-update เมื่อ Task แรกเริ่มทำ) | ระบบ (auto) |
| `Done` | Task ทั้งหมดที่ผูกอยู่ปิดสำเร็จ | ระบบ (auto) |

**เกณฑ์การรับ:**

- Given Requirement อยู่ที่ `Draft`, When ยังไม่ถูก Approve, Then ระบบไม่อนุญาตให้แตก Task จาก Requirement นี้ใน Module 02
- Given Requirement ถูก Approve แล้วและมี Task ถูกสร้างและเริ่มทำงาน, When Task แรกเปลี่ยนสถานะเป็น "กำลังทำ", Then Requirement เปลี่ยนสถานะเป็น `In Progress` อัตโนมัติ
- Given Task ทั้งหมดที่ผูกกับ Requirement ปิดสำเร็จ (Done), When ระบบตรวจสอบ, Then Requirement เปลี่ยนสถานะเป็น `Done` อัตโนมัติ

---

## 4. Non-Functional Requirements (NFR ของโมดูลนี้เอง)

> ข้อสังเกต: นี่คือ NFR ของ "ระบบที่ใช้บริหาร Requirement" เอง (meta-level) แยกจาก FR-02/FR-03 ที่เป็นฟีเจอร์ให้ SA กรอก NFR ของ Requirement อื่น

| ID | หมวด | Requirement | Metric |
|----|------|-------------|--------|
| NFR-01 | Performance | หน้ารายการ Requirement ต้องโหลดเสร็จภายในเวลาที่กำหนด | ≤ 2 วินาที ที่ 200 Requirement records และ concurrent user 20 คน |
| NFR-02 | Usability | ฟอร์มสร้าง/แก้ไข Requirement ต้องกรอกเสร็จได้รวดเร็ว เพื่อลด data entry burden | เฉลี่ย ≤ 3 นาทีต่อ Requirement (วัดใน Sprint แรกช่วง Calibration Mode) |
| NFR-03 | Data Integrity | ห้ามลบ Requirement ที่มี Task ผูกอยู่ (ดู FR-08) | 0 กรณีที่ Traceability chain ขาดหายจากการลบ |
| NFR-04 | Auditability | การเปลี่ยนแปลงทุก field สำคัญ (Priority, Status, Sprint) ต้องมี audit log | เก็บ log ครบ 100% ของการเปลี่ยนแปลง พร้อม user + timestamp |
| NFR-05 | Availability | โมดูลนี้เป็น MUST HAVE ต้นน้ำของทั้งระบบ | Uptime ≥ 99% ในเวลาทำการ |

---

## 5. Business Rules

1. Requirement ที่ Req Category = `Non-Functional` ต้องมี Metric Value + Metric Unit + Measurement Condition ครบ จึงบันทึกได้ (ไม่มีข้อยกเว้น)
2. Requirement ต้องผูกกับ Module และ Sprint เสมอ — ไม่มี Requirement ที่ "ไม่มีเจ้าของ" ลอยอยู่ในระบบ
3. ห้ามลบ Requirement ที่มี Task ผูกอยู่แล้ว เพื่อรักษาความสมบูรณ์ของ Traceability chain
4. MoSCoW Priority กำหนดร่วมกันระหว่าง SA และ PM — SA เสนอ ค่าเริ่มต้น, PM มีสิทธิ์ปรับ พร้อม audit log
5. Requirement ที่ยังอยู่สถานะ `Draft` (ยังไม่ Approved) ห้ามถูกแตกเป็น Task ใน Module 02

---

## 6. ความเชื่อมโยงกับ Role อื่น (Cross-Role Impact)

อ้างอิงจาก `docs/team-roles-responsibilities.md`:

- **SA:** เจ้าของโมดูลนี้ ถูกวัด KPI ด้วย **Gap Rate** — สัดส่วน Defect ประเภท `SA Gap` ต่อจำนวน Requirement ที่เขียน หาก Requirement ในโมดูลนี้ไม่ครบหรือ NFR Metric ไม่ชัด จะสะท้อนออกมาเป็น Gap Rate สูงใน Module 05
- **PM:** ใช้ MoSCoW Priority และ Module/Sprint assignment จากโมดูลนี้เป็นฐานในการแตก Task (Module 02) และวางแผน Sprint (Module 04)
- **Dev/UX/Tester:** ใช้ Requirement (โดยเฉพาะ NFR Metric) เป็นเกณฑ์อ้างอิงเมื่อเถียงเรื่อง Defect type — Requirement ที่เขียนไม่ชัดคือสาเหตุหลักของข้อพิพาทระหว่าง `SA Gap` และ `Code Bug`/`Design Gap`

---

## 7. Open Questions / Assumptions

### Assumptions (สมมติฐานที่ตั้งไว้ เนื่องจากสไลด์ต้นทางไม่ได้ระบุรายละเอียดระดับ field)

- [assumption] Requirement ID เป็นรูปแบบ `REQ-XXX` auto-generated แบบ sequential
- [assumption] สิทธิ์แก้ไข Requirement จำกัดที่ SA และ PM เท่านั้น role อื่นเป็น read-only — ยังไม่มีการยืนยันจากสไลด์ต้นทาง
- [assumption] Status workflow (`Draft → Approved → In Progress → Done`) เป็นการตีความเพิ่มจาก SA เนื่องจากสไลด์ไม่ได้ระบุ status flow ของ Requirement ไว้ชัดเจน (มีระบุไว้ชัดเฉพาะ Defect status flow ใน Module 03)

### Open Questions (ควรถามผู้จัดทำสไลด์/stakeholder ก่อน implement)

1. Requirement สามารถผูกกับหลาย Module พร้อมกันได้หรือไม่ หรือ 1 Requirement ต่อ 1 Module เท่านั้น?
2. ต้องมีการ approve Requirement แบบ formal (เช่น ต้องมีลายเซ็นดิจิทัลหรือ sign-off record) หรือแค่เปลี่ยน status ก็เพียงพอ?
3. Requirement เดิมที่ Sprint ปัจจุบันทำไม่ทัน (carry over) ต้องสร้าง Requirement ใหม่หรือแค่เปลี่ยน Sprint assignment ของตัวเดิม?
4. Version history ของ Requirement (เมื่อแก้ไขหลังมี Task ผูกแล้ว) ต้องแสดงในหน้า UI ให้ทุก role เห็น หรือเก็บเป็น log เบื้องหลังพอ?

---

## 8. Technical Design Spec (สำหรับ Dev — React + NestJS)

> **วัตถุประสงค์ของหมวดนี้:** ให้ Dev implement ได้ทันทีโดยไม่ต้องรอ UX/UI mockup และไม่ต้องเดา layout, validation message, หรือ API contract เอง ("vibe code ได้ตรง spec")
> **Stack:** Frontend = React (+ TypeScript), Backend = NestJS (+ TypeScript), DB = PostgreSQL (assumption — ปรับ ORM/DB จริงได้ถ้าโปรเจกต์กำหนดต่างจากนี้)

### 8.1 Data Model (Entity)

```typescript
// requirement.entity.ts
export enum ReqCategory {
  FUNCTIONAL = 'FUNCTIONAL',
  NON_FUNCTIONAL = 'NON_FUNCTIONAL',
}

export enum MoscowPriority {
  MUST = 'MUST',
  SHOULD = 'SHOULD',
  COULD = 'COULD',
  WONT = 'WONT',
}

export enum RequirementStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum NfrType {
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  USABILITY = 'USABILITY',
  RELIABILITY = 'RELIABILITY',
  SCALABILITY = 'SCALABILITY',
  OTHER = 'OTHER',
}

@Entity('requirements')
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id: string; // internal PK (uuid)

  @Column({ unique: true })
  code: string; // display ID เช่น "REQ-001" — generate ที่ service layer (ดู 8.4)

  @Column()
  title: string; // maxLength 200

  @Column('text')
  description: string; // maxLength 5000

  @Column({ type: 'enum', enum: ReqCategory })
  reqCategory: ReqCategory;

  @Column({ type: 'enum', enum: MoscowPriority })
  moscowPriority: MoscowPriority;

  @Column({ type: 'enum', enum: RequirementStatus, default: RequirementStatus.DRAFT })
  status: RequirementStatus;

  @ManyToOne(() => Module, { nullable: false })
  module: Module; // FK -> modules.id

  @ManyToOne(() => Sprint, { nullable: false })
  sprint: Sprint; // FK -> sprints.id

  @Column('float')
  initialEstimate: number; // > 0, unit = story point (assumption)

  @Column('float', { nullable: true })
  actualEstimate: number | null; // auto-rollup, ไม่รับจาก request body ตรง (read-only field)

  // --- NFR-only fields (nullable เมื่อ reqCategory = FUNCTIONAL) ---
  @Column({ type: 'enum', enum: NfrType, nullable: true })
  nfrType: NfrType | null;

  @Column('float', { nullable: true })
  metricValue: number | null;

  @Column({ nullable: true })
  metricUnit: string | null; // maxLength 50

  @Column('text', { nullable: true })
  measurementCondition: string | null; // maxLength 500

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RequirementAuditLog, (log) => log.requirement)
  auditLogs: RequirementAuditLog[];
}

@Entity('requirement_audit_logs')
export class RequirementAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Requirement, (r) => r.auditLogs)
  requirement: Requirement;

  @ManyToOne(() => User)
  changedBy: User;

  @Column()
  fieldName: string; // เช่น "moscowPriority", "status", "sprint"

  @Column('text', { nullable: true })
  oldValue: string | null;

  @Column('text', { nullable: true })
  newValue: string | null;

  @CreateDateColumn()
  changedAt: Date;
}
```

### 8.2 Validation Rules (NestJS `class-validator` DTO)

```typescript
// create-requirement.dto.ts
export class CreateRequirementDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsString()
  @Length(1, 5000)
  description: string;

  @IsEnum(ReqCategory)
  reqCategory: ReqCategory;

  @IsEnum(MoscowPriority)
  moscowPriority: MoscowPriority;

  @IsUUID()
  moduleId: string;

  @IsUUID()
  sprintId: string;

  @IsNumber()
  @Min(0.1)
  initialEstimate: number;

  // --- Conditional: บังคับเมื่อ reqCategory === NON_FUNCTIONAL ---
  @ValidateIf((o) => o.reqCategory === ReqCategory.NON_FUNCTIONAL)
  @IsEnum(NfrType)
  @IsNotEmpty({ message: 'nfrType เป็นค่าที่ต้องระบุเมื่อ Req Category เป็น Non-Functional' })
  nfrType?: NfrType;

  @ValidateIf((o) => o.reqCategory === ReqCategory.NON_FUNCTIONAL)
  @IsNumber({ message: 'Metric Value ต้องเป็นตัวเลข' })
  @IsNotEmpty({ message: 'NFR ต้องระบุค่าตัวเลขที่วัดได้ (Metric Value)' })
  metricValue?: number;

  @ValidateIf((o) => o.reqCategory === ReqCategory.NON_FUNCTIONAL)
  @IsString()
  @Length(1, 50, { message: 'NFR ต้องระบุหน่วยของค่าตัวเลข (Metric Unit)' })
  metricUnit?: string;

  @ValidateIf((o) => o.reqCategory === ReqCategory.NON_FUNCTIONAL)
  @IsString()
  @Length(1, 500, { message: 'NFR ต้องระบุเงื่อนไขการวัด (Measurement Condition)' })
  measurementCondition?: string;
}

// update-requirement.dto.ts
export class UpdateRequirementDto extends PartialType(CreateRequirementDto) {}

// change-status.dto.ts
export class ChangeStatusDto {
  @IsEnum(RequirementStatus)
  status: RequirementStatus;
}
```

**กฎ validation เพิ่มเติมที่ implement ที่ Service layer (ไม่ใช่ DTO decorator):**

| กฎ | ที่มา | Error ที่ต้อง throw |
|----|------|----------------------|
| ห้าม `DELETE` เมื่อมี Task ผูกอยู่ | FR-08 | `409 Conflict` — `"ไม่สามารถลบ Requirement ที่มี Task ผูกอยู่ กรุณายกเลิกความสัมพันธ์ก่อน"` |
| ห้ามแตก Task จาก Requirement ที่ status = `DRAFT` | FR-09 | (ตรวจใน Module 02 service — cross-module rule ระบุไว้ที่นี่เพื่อ traceability) |
| เปลี่ยน `status` ต้องตามลำดับ `DRAFT → APPROVED → IN_PROGRESS → DONE` เท่านั้น ห้ามข้ามหรือย้อนกลับผ่าน API ตรง (IN_PROGRESS/DONE เป็น auto-only ดู 8.4) | FR-09 | `400 Bad Request` — `"ไม่สามารถเปลี่ยนสถานะจาก {current} เป็น {target} ได้"` |
| `moduleId` / `sprintId` ต้องมีอยู่จริงใน DB | FR-07 | `404 Not Found` — `"ไม่พบ Module/Sprint ที่ระบุ"` |
| แก้ไข field ที่อยู่ใน audit list ต้องเขียน `RequirementAuditLog` | FR-08/NFR-04 | (side-effect, ไม่ throw error) |

### 8.3 REST API Contract

**Base path:** `/api/v1/requirements`
**Auth:** ทุก endpoint ต้องมี `Authorization: Bearer <JWT>` — ปฏิเสธด้วย `401 Unauthorized` ถ้าไม่มี/หมดอายุ (รายละเอียด role-based guard ดู 8.3.1)

| # | Method | Path | คำอธิบาย | Role ที่เรียกได้ |
|---|--------|------|----------|-------------------|
| 1 | `GET` | `/api/v1/requirements` | รายการ Requirement พร้อม filter/pagination | SA, PM, UX, Dev, Tester (read) |
| 2 | `GET` | `/api/v1/requirements/:id` | ดู Requirement เดี่ยว พร้อม linked Task/Defect | SA, PM, UX, Dev, Tester (read) |
| 3 | `POST` | `/api/v1/requirements` | สร้าง Requirement ใหม่ | SA |
| 4 | `PATCH` | `/api/v1/requirements/:id` | แก้ไข Requirement | SA, PM |
| 5 | `PATCH` | `/api/v1/requirements/:id/status` | เปลี่ยนสถานะ (manual transition เท่านั้น) | SA, PM |
| 6 | `DELETE` | `/api/v1/requirements/:id` | ลบ Requirement (เฉพาะที่ไม่มี Task ผูก) | SA |
| 7 | `GET` | `/api/v1/requirements/:id/audit-logs` | ดู audit log ของ Requirement | SA, PM |

#### 8.3.1 Role Guard

```typescript
// ใช้ NestJS Guard + Decorator
@Roles('SA')
@Post()
create(@Body() dto: CreateRequirementDto) { ... }

@Roles('SA', 'PM')
@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateRequirementDto) { ... }
```
ถ้า role ไม่ตรง → `403 Forbidden`, body: `{ "message": "คุณไม่มีสิทธิ์ทำรายการนี้" }`

#### 8.3.2 `GET /api/v1/requirements`

**Query params:**

| Param | ประเภท | Default | คำอธิบาย |
|-------|--------|---------|----------|
| `page` | number | 1 | เลขหน้า |
| `pageSize` | number | 20 | จำนวนต่อหน้า (max 100) |
| `reqCategory` | enum | — | filter ตาม category |
| `status` | enum | — | filter ตาม status |
| `moduleId` | uuid | — | filter ตาม module |
| `sprintId` | uuid | — | filter ตาม sprint |
| `search` | string | — | ค้นหาใน `title`/`description` (ILIKE) |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "code": "REQ-001",
      "title": "ผู้ใช้ต้องสามารถ login ด้วยอีเมลและรหัสผ่านได้",
      "reqCategory": "FUNCTIONAL",
      "moscowPriority": "MUST",
      "status": "DRAFT",
      "module": { "id": "...", "name": "Module 02 - Task Management" },
      "sprint": { "id": "...", "name": "Sprint 3" },
      "initialEstimate": 5,
      "actualEstimate": null,
      "createdAt": "2026-08-20T04:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 42, "totalPages": 3 }
}
```

#### 8.3.3 `POST /api/v1/requirements`

**Request body (Functional):**
```json
{
  "title": "ผู้ใช้ต้องสามารถ login ด้วยอีเมลและรหัสผ่านได้",
  "description": "หน้า login ต้องรองรับ email + password พร้อม validation",
  "reqCategory": "FUNCTIONAL",
  "moscowPriority": "MUST",
  "moduleId": "b2c3d4e5-...",
  "sprintId": "c3d4e5f6-...",
  "initialEstimate": 5
}
```

**Request body (Non-Functional):**
```json
{
  "title": "หน้า Dashboard ต้องโหลดเร็ว",
  "description": "โหลดข้อมูล dashboard สำหรับผู้ใช้ทั่วไป",
  "reqCategory": "NON_FUNCTIONAL",
  "moscowPriority": "MUST",
  "moduleId": "b2c3d4e5-...",
  "sprintId": "c3d4e5f6-...",
  "initialEstimate": 8,
  "nfrType": "PERFORMANCE",
  "metricValue": 2,
  "metricUnit": "seconds",
  "measurementCondition": "ที่ 100 concurrent users"
}
```

**Response `201 Created`:** object เดียวกับ item ใน 8.3.2 พร้อม `code` ที่ generate อัตโนมัติ

**Response `400 Bad Request`** (validation fail):
```json
{
  "statusCode": 400,
  "message": [
    "NFR ต้องระบุค่าตัวเลขที่วัดได้ (Metric Value)",
    "NFR ต้องระบุหน่วยของค่าตัวเลข (Metric Unit)"
  ],
  "error": "Bad Request"
}
```

#### 8.3.4 `PATCH /api/v1/requirements/:id/status`

**Request:**
```json
{ "status": "APPROVED" }
```

**Response `200 OK`:** Requirement object พร้อม status ใหม่
**Response `400 Bad Request`:** `{ "statusCode": 400, "message": "ไม่สามารถเปลี่ยนสถานะจาก DRAFT เป็น DONE ได้" }`

#### 8.3.5 `DELETE /api/v1/requirements/:id`

**Response `204 No Content`:** ลบสำเร็จ
**Response `409 Conflict`:**
```json
{
  "statusCode": 409,
  "message": "ไม่สามารถลบ Requirement ที่มี Task ผูกอยู่ กรุณายกเลิกความสัมพันธ์ก่อน",
  "linkedTaskCount": 3
}
```

#### 8.3.6 Error Response มาตรฐาน (ใช้ทุก endpoint)

```json
{
  "statusCode": 404,
  "message": "ไม่พบ Requirement ที่ระบุ",
  "error": "Not Found"
}
```

| HTTP Code | กรณี |
|-----------|------|
| `400` | Validation error (DTO หรือ business rule) |
| `401` | ไม่มี/หมดอายุ JWT token |
| `403` | Role ไม่มีสิทธิ์ |
| `404` | ไม่พบ resource (`id`, `moduleId`, `sprintId`) |
| `409` | Conflict (ลบ Requirement ที่มี Task ผูก, status transition ผิดลำดับ) |
| `500` | Unhandled server error — ต้อง log แต่ห้าม leak stack trace ให้ client |

---

### 8.4 Business Logic ที่ต้อง Implement ที่ Service Layer

1. **Code generation:** `code` field generate จาก sequence ต่อจากตัวล่าสุดในระบบ format `REQ-{n}` โดย `n` เป็นเลข 3 หลักขึ้นไป zero-padded (เช่น `REQ-001`, `REQ-042`, `REQ-1024`) — ใช้ DB sequence หรือ `SELECT COUNT(*) + 1` ภายใน transaction เพื่อป้องกัน race condition
2. **Actual Estimate rollup:** เมื่อ Task (Module 02) ที่ผูกกับ Requirement เปลี่ยนสถานะเป็น `DONE` พร้อม `actualHours`, ต้อง trigger การ re-sum `actualEstimate` ของ Requirement นั้น (event-driven ผ่าน NestJS `EventEmitter` หรือ message queue — ไม่ implement เป็น cron poll)
3. **Auto status transition:**
   - เมื่อ Task แรกที่ผูกกับ Requirement เปลี่ยนเป็น "กำลังทำ" → emit event ให้ Requirement service เปลี่ยน status เป็น `IN_PROGRESS` (เฉพาะกรณีปัจจุบันเป็น `APPROVED`)
   - เมื่อ Task ทั้งหมดที่ผูกกับ Requirement เป็น `DONE` → เปลี่ยน Requirement เป็น `DONE`
   - Manual `PATCH /status` เปลี่ยนได้เฉพาะ `DRAFT → APPROVED` เท่านั้น (transition อื่นเป็น auto-only ตามด้านบน) — ถ้า client พยายาม `PATCH` ไปเป็น `IN_PROGRESS`/`DONE` ตรง ให้ตอบ `400`
4. **Audit log write:** ทุกครั้งที่ `PATCH` เปลี่ยนค่า `moscowPriority`, `status`, หรือ `sprintId` ให้ insert record ใน `requirement_audit_logs` ภายใน transaction เดียวกับการ update (ไม่ fire-and-forget)
5. **Delete guard:** ก่อนลบ ต้อง query จำนวน Task ที่ `requirementId = :id` ก่อนเสมอ ถ้า count > 0 ให้ throw `ConflictException` ทันที ไม่ลบ

---

### 8.5 Frontend Wireframes (React)

> Component library: ไม่ fix (assumption: MUI หรือ Ant Design ก็ map ได้ตรงกับ spec นี้) — ระบุ "ชนิด component" ที่ต้องใช้ต่อ field ให้ Dev เลือก component จริงจาก library ที่โปรเจกต์ใช้

#### 8.5.1 หน้า List — `/requirements`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Requirement Management                              [+ New Requirement]│ <- Button (primary)
├─────────────────────────────────────────────────────────────────────────┤
│  [Search box...............]  [Category ▾] [Status ▾] [Module ▾] [Sprint ▾] │
│   ^TextInput (debounce 400ms)  ^Select      ^Select    ^Select    ^Select │
├─────────────────────────────────────────────────────────────────────────┤
│  Code    │ Title              │ Category │ Priority │ Status    │ Module │
├──────────┼─────────────────────┼──────────┼──────────┼───────────┼────────┤
│  REQ-001 │ Login ด้วยอีเมล...  │ Function │ Must     │ 🟡 Draft  │ M02   │ <- Row คลิกได้ → ไป Detail
│  REQ-002 │ Dashboard ต้องโหลด..│ Non-Func │ Must     │ 🟢 Approv │ M04   │
│  ...     │ ...                 │ ...      │ ...      │ ...       │ ...    │
├─────────────────────────────────────────────────────────────────────────┤
│                         [< Prev]  Page 1 of 3  [Next >]                 │ <- Pagination component
└─────────────────────────────────────────────────────────────────────────┘
```

**Component/behavior spec:**

| Element | Component ชนิด | Behavior |
|---------|-----------------|----------|
| Search box | Text Input พร้อม debounce | ยิง `GET ?search=` ทุก 400ms หลังหยุดพิมพ์ |
| Category filter | Select (single) | ค่า: All / Functional / Non-Functional |
| Status filter | Select (single) | ค่า: All / Draft / Approved / In Progress / Done |
| Module filter | Select (single, async load options จาก `GET /api/v1/modules`) | — |
| Sprint filter | Select (single, async load options จาก `GET /api/v1/sprints`) | — |
| Status badge | Colored badge/chip | Draft=เทา, Approved=เขียวอ่อน, In Progress=น้ำเงิน, Done=เขียว |
| Table row | Clickable row | คลิก → navigate ไป `/requirements/:id` |
| "New Requirement" button | Button (primary) | แสดงเฉพาะเมื่อ `currentUser.role === 'SA'` — ซ่อนถ้าไม่ใช่ |
| Pagination | Pagination component | sync กับ query param `page` |
| Loading state | Skeleton rows (5 แถว) | แสดงระหว่างรอ API response |
| Empty state | ข้อความ "ยังไม่มี Requirement — เริ่มสร้างรายการแรก" + ปุ่ม New (ถ้า role = SA) | แสดงเมื่อ `data.length === 0` |

#### 8.5.2 หน้า Create/Edit Form — `/requirements/new`, `/requirements/:id/edit`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back            New Requirement / Edit REQ-001                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Title *                                                                 │
│  [_____________________________________________________________]       │ <- TextInput, maxLength=200
│                                                                           │
│  Description *                                                          │
│  [_____________________________________________________________]       │
│  [_____________________________________________________________]       │ <- TextArea (multiline), maxLength=5000
│                                                                           │
│  Req Category *              MoSCoW Priority *                          │
│  ( ) Functional               [Must ▾]                                  │ <- RadioGroup          Select (single)
│  (•) Non-Functional                                                     │
│                                                                           │
│  ┌─ NFR Fields (แสดงเฉพาะเมื่อ Category = Non-Functional) ──────────┐  │
│  │  NFR Type *          Metric Value *      Metric Unit *           │  │
│  │  [Performance ▾]     [____2____]          [seconds_______]       │  │ <- Select    NumberInput   TextInput
│  │                                                                    │  │
│  │  Measurement Condition *                                          │  │
│  │  [ที่ 100 concurrent users_______________________________]      │  │ <- TextInput
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  Module *                    Sprint *                                  │
│  [Module 04 - Sprint Mgmt ▾]  [Sprint 3 ▾]                              │ <- Select(async)      Select(async)
│                                                                           │
│  Initial Estimate (story point) *                                       │
│  [___5___]                                                              │ <- NumberInput, min=0.1, step=0.5
│                                                                           │
│                                          [Cancel]        [Save]          │ <- Button(text)  Button(primary, submit)
└─────────────────────────────────────────────────────────────────────────┘
```

**Component/behavior spec:**

| Field | Component ชนิด | Validation แสดงผล (inline, ใต้ field) |
|-------|-----------------|----------------------------------------|
| Title | Text Input | required — `"กรุณาระบุชื่อ Requirement"`; maxLength exceeded — `"ต้องไม่เกิน 200 ตัวอักษร"` |
| Description | Text Area (multiline, 4 แถว) | required — `"กรุณาระบุรายละเอียด"` |
| Req Category | Radio Group (2 ตัวเลือก) | required, default ยังไม่เลือกอะไร |
| MoSCoW Priority | Select (single, 4 ตัวเลือก) | required — `"กรุณาเลือก Priority"` |
| NFR Type | Select (single, 6 ตัวเลือก) | **แสดง/ซ่อนตาม Req Category** — required เมื่อแสดง |
| Metric Value | Number Input | required เมื่อ NFR แสดง — `"NFR ต้องระบุค่าตัวเลขที่วัดได้"`; ห้ามใส่ตัวอักษร |
| Metric Unit | Text Input | required เมื่อ NFR แสดง — `"NFR ต้องระบุหน่วยของค่าตัวเลข"` |
| Measurement Condition | Text Input | required เมื่อ NFR แสดง — `"NFR ต้องระบุเงื่อนไขการวัด"` |
| Module | Select (single, async, searchable) | required — โหลด options จาก `GET /api/v1/modules` |
| Sprint | Select (single, async, searchable) | required — โหลด options จาก `GET /api/v1/sprints` |
| Initial Estimate | Number Input | required, min 0.1 — `"ค่าประมาณต้องมากกว่า 0"` |
| Save button | Button (primary, type=submit) | disabled ระหว่างรอ API response (แสดง spinner ในปุ่ม); เมื่อ API ตอบ `400` ให้ map error message ไปแสดงใต้ field ที่ตรงกับ key ใน response |
| Cancel button | Button (text/secondary) | navigate กลับหน้า list โดยไม่บันทึก — ถ้ามีการแก้ไขค่าแล้วให้ confirm dialog `"ยกเลิกการแก้ไข? การเปลี่ยนแปลงจะไม่ถูกบันทึก"` |

**Conditional rendering logic (React):**
```
NFR fields block แสดงเมื่อ: watch('reqCategory') === 'NON_FUNCTIONAL'
เมื่อสลับจาก Non-Functional -> Functional: clear ค่า nfrType/metricValue/metricUnit/measurementCondition ทิ้ง ก่อน submit
```

#### 8.5.3 หน้า Detail — `/requirements/:id`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back        REQ-001 — Login ด้วยอีเมล...          [Edit] [Delete]    │ <- ปุ่มแสดงเฉพาะ role SA (Edit: SA,PM)
├─────────────────────────────────────────────────────────────────────────┤
│  Status: 🟡 Draft     [Approve →]                                       │ <- ปุ่ม Approve แสดงเมื่อ status=DRAFT และ role SA/PM
│  Category: Functional        Priority: Must                            │
│  Module: M02 - Task Mgmt     Sprint: Sprint 3                          │
│  Initial Estimate: 5 pts     Actual Estimate: — (ยังไม่มี Task)         │
│                                                                           │
│  Description:                                                           │
│  หน้า login ต้องรองรับ email + password พร้อม validation                │
│                                                                           │
│  ── Linked Tasks (2) ──────────────────────────────────────────────────  │
│  │ TASK-014 │ Implement login API      │ Dev: สมชาย │ 🟢 Done         │
│  │ TASK-015 │ Login form UI            │ Dev: สมหญิง│ 🔵 In Progress  │
│                                                                           │
│  ── Linked Defects (0) ────────────────────────────────────────────────  │
│  (ไม่มี Defect ที่เกี่ยวข้อง)                                            │
│                                                                           │
│  ── Audit Log ──────────────────────────────────────────────────────────│
│  │ 2026-08-19 10:00 │ สมศักดิ์ (SA) │ สร้าง Requirement                │
│  │ 2026-08-20 09:00 │ พีระ (PM)     │ moscowPriority: Should → Must     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Component/behavior spec:**

| Element | Component ชนิด | Behavior |
|---------|-----------------|----------|
| Edit button | Button | แสดงเมื่อ `role in ['SA','PM']` — navigate ไป `/requirements/:id/edit` |
| Delete button | Button (danger) | แสดงเมื่อ `role === 'SA'` — เปิด confirm dialog ก่อนเรียก `DELETE`; ถ้า API ตอบ `409` ให้แสดง dialog แจ้ง `"มี Task ผูกอยู่ {n} รายการ ไม่สามารถลบได้"` |
| Approve button | Button (primary) | แสดงเมื่อ `status === 'DRAFT'` และ `role in ['SA','PM']` — เรียก `PATCH /status` body `{status:'APPROVED'}` |
| Linked Tasks table | Table (read-only) | ดึงจาก response ของ `GET /:id` field `tasks[]`; แถวคลิกได้ไปหน้า Task detail (Module 02) |
| Linked Defects table | Table (read-only) | เหมือนกัน field `defects[]`; ถ้า array ว่างแสดง empty state text |
| Audit Log list | Timeline/List (read-only) | ดึงจาก `GET /:id/audit-logs`, format `oldValue → newValue` |

---

## 9. เอกสารที่เกี่ยวข้อง

- `docs/project-modules-overview.md` — ภาพรวม 8 Modules และความเชื่อมโยง
- `docs/team-roles-responsibilities.md` — บทบาทและ KPI ของแต่ละ role
