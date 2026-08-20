# Task Management — Module 01: Requirement Management

> **จัดทำโดย:** PM / SA
> **สถานะ:** Draft
> **อ้างอิง:** `docs/module-01-requirement-management.md`, `docs/team-roles-responsibilities.md`
> **Stack:** React + Vite + TypeScript · localStorage

---

## สรุปภาพรวม

Module 01 คือระบบจัดการ Requirement — จุดเริ่มต้นของสายข้อมูล `Requirement → Task → Defect`
เป้าหมายรอบ MVP: พิสูจน์โครงข้อมูลหลักบนหน้าจอ สร้าง Requirement ได้ เชื่อมโยงไป Task/Defect ได้

---

## บทบาทแต่ละตำแหน่งใน Module นี้

| Role | บทบาท | KPI ที่เกี่ยวข้อง |
|------|--------|-----------------|
| **SA** | เจ้าของ Requirement โดยตำแหน่ง — เขียน spec, กำหนด Category (Functional/Non-Functional), ร่วมกำหนด MoSCoW Priority, ตรวจสอบว่าสเปคครบก่อนส่ง Dev | Gap Rate (สัดส่วน Defect ประเภท `SA Gap` ต่อจำนวน Requirement ที่เขียน) |
| **UX/UI** | ออกแบบหน้าจอ Board View, Form, Detail View, Warning Dialog — ส่ง Figma link เป็นหลักฐานส่งมอบ | Revision Rate (จำนวนรอบแก้แบบเฉลี่ยต่องาน), Design Gap count |
| **Dev** | Implement ทั้ง Data Layer (types, repository, traceability) และ UI Components (Board, List, Form, Detail, Dialog) | Bug Rate (สัดส่วน `Code Bug` ต่อปริมาณงานที่ส่ง), Estimate Variance |
| **Tester (QA)** | ทดสอบตาม Acceptance Criteria ทุกข้อ — ทั้ง Functional (CRUD, Filter, Cascade Delete, Trace) และ Non-Functional (Performance, Accessibility) | Escape Rate (สัดส่วน `Test Escape` ต่อ defect ทั้งหมด) |
| **PM** | ร่วมกำหนด Priority กับ SA, ติดตามความคืบหน้า, แก้ blockers, Acknowledge defect ระดับ Critical/High, ให้คะแนน PM Qualitative Score 20% | ไม่มี KPI ของตัวเองในระบบรอบนี้ |
| **HR** | ไม่มีบทบาทตรงใน Module นี้ — ดู KPI Summary ของแต่ละคนเพื่อประเมิน | HR Assessment 10% |

---

## Task List

### Phase 1: Specification & Planning

| # | Task | ผู้รับผิดชอบ | สถานะ | รายละเอียด |
|---|------|-------------|-------|-----------|
| 1 | เขียน Requirement spec ฉบับ Final | SA | ⬜ TODO | ทบทวนและ finalize เอกสาร requirement ทุก FR (FR-01 ถึง FR-07) ให้ครบถ้วน ไม่มี gap |
| 2 | Review spec ก่อนส่งต่อ Dev | SA | ⬜ TODO | ตรวจสอบ edge case, ตรวจว่า Acceptance Criteria ครอบคลุม, ให้ Approval |
| 3 | กำหนด MoSCoW Priority ร่วมกับ SA | PM | ⬜ TODO | ตัดสินใจลำดับความสำคัญของแต่ละ FR ร่วมกับ SA |

---

### Phase 2: Design (UX/UI)

| # | Task | ผู้รับผิดชอบ | สถานะ | รายละเอียด |
|---|------|-------------|-------|-----------|
| 4 | ออกแบบ Board View (หน้าหลัก) | UX/UI | ⬜ TODO | Layout 4 columns ตาม MoSCoW, Card design, Filter bar |
| 5 | ออกแบบ List View | UX/UI | ⬜ TODO | ตารางรายการ Requirement พร้อม filter |
| 6 | ออกแบบฟอร์ม Create/Edit | UX/UI | ⬜ TODO | ฟอร์มกรอก Title, Description, Category, Priority, Owner พร้อม error states |
| 7 | ออกแบบหน้า Detail View | UX/UI | ⬜ TODO | แสดงข้อมูล Requirement + Forward Trace (Tasks, Defects) |
| 8 | ออกแบบ Cascade Delete Warning Dialog | UX/UI | ⬜ TODO | ข้อความเตือนที่ชัดเจนว่าจะลบอะไรบ้าง กี่รายการ |

---

### Phase 3: Development — Data Layer

| # | Task | ผู้รับผิดชอบ | สถานะ | รายละเอียด |
|---|------|-------------|-------|-----------|
| 9 | สร้าง Data Model (types.ts) | Dev | ⬜ TODO | กำหนด interface `Requirement`, enums: `RequirementCategory`, `Priority`, `DEFAULT_PRIORITY`, User list 12 คน hardcoded |
| 10 | สร้าง Generic Repository (createRepository) | Dev | ⬜ TODO | CRUD operations บน localStorage: `list()`, `find(id)`, `create(draft)`, `update(id, changes)`, `remove(id)`, `removeWhere(predicate)` |
| 11 | สร้าง Requirement Repository + Validation | Dev | ⬜ TODO | Validation: title ห้ามว่าง, category บังคับ, priority บังคับ, ownerId บังคับ พร้อม error messages ภาษาไทย |
| 12 | สร้าง Traceability Functions | Dev | ⬜ TODO | `traceForward()`, `traceBackward()`, `findRequirementsWithoutTasks()`, `countOrphansOnRequirementDelete()` |

---

### Phase 4: Development — UI Components

| # | Task | ผู้รับผิดชอบ | สถานะ | รายละเอียด |
|---|------|-------------|-------|-----------|
| 13 | สร้างฟอร์ม Create/Edit Requirement | Dev | ⬜ TODO | ฟอร์มกรอก: Title*, Description, Category* (Functional/Non-Functional), Priority* (default=Should), Owner* (default=current user) พร้อม inline validation |
| 14 | สร้าง Board View (หน้าหลัก) | Dev | ⬜ TODO | แสดง card จัดกลุ่มตาม MoSCoW: Must / Should / Could / Won't แต่ละ card แสดง title, category, owner, task/defect count |
| 15 | สร้าง List View | Dev | ⬜ TODO | แสดง Requirement เป็นรายการ (ตาราง) |
| 16 | สร้าง Filter Bar | Dev | ⬜ TODO | ตัวกรอง: dropdown Category, dropdown Priority, ช่องค้นหาข้อความ (ค้นใน title + description) |
| 17 | สร้างหน้า Detail View | Dev | ⬜ TODO | แสดงรายละเอียด Requirement ครบทุก field + Forward Trace แสดง Tasks/Defects ที่ผูก + เครื่องหมาย "⚠ ยังไม่มี Task" |
| 18 | สร้าง Cascade Delete with Warning Dialog | Dev | ⬜ TODO | กดลบ → แสดงจำนวน Task/Defect ที่จะลบตาม → ยืนยัน → ลบทั้ง Requirement + Tasks + Defects ใต้สาย |
| 19 | สร้าง Edit Requirement (pre-fill form) | Dev | ⬜ TODO | โหลดค่าเดิมทุก field, บันทึก → อัปเดต, ยกเลิก → ค่าเดิมคงอยู่ |

---

### Phase 5: Testing

| # | Task | ผู้รับผิดชอบ | สถานะ | รายละเอียด |
|---|------|-------------|-------|-----------|
| 20 | ทดสอบ Create Requirement | Tester (QA) | ⬜ TODO | ตาม FR-01: กรอกครบ → สร้างสำเร็จ + UUID auto, กรอกไม่ครบ → error ระบุ field |
| 21 | ทดสอบ Category Validation | Tester (QA) | ⬜ TODO | ตาม FR-02: ไม่เลือก → error "ต้องเลือกประเภทเป็น Functional หรือ Non-Functional" |
| 22 | ทดสอบ MoSCoW Priority | Tester (QA) | ⬜ TODO | ตาม FR-03: ไม่แตะ Priority → default "Should", เลือกค่าอื่น → เก็บค่าที่เลือก |
| 23 | ทดสอบ Filter & Search | Tester (QA) | ⬜ TODO | ตาม FR-04: กรอง Category, กรอง Priority, ค้นข้อความใน title+description, Board view แบ่ง column ถูกต้อง |
| 24 | ทดสอบ Edit Requirement | Tester (QA) | ⬜ TODO | ตาม FR-05: แก้ field → บันทึก → ค่าใหม่ถูกต้อง, กดยกเลิก → ค่าเดิมคงอยู่ |
| 25 | ทดสอบ Cascade Delete | Tester (QA) | ⬜ TODO | ตาม FR-06: ไม่มี Task → ถามยืนยัน → ลบ, มี Task+Defect → แสดงจำนวน → ยืนยัน → ลบทั้งสาย, ยกเลิก → ยังอยู่ |
| 26 | ทดสอบ Traceability | Tester (QA) | ⬜ TODO | ตาม FR-07: Forward trace แสดง Tasks+Defects, Backward trace จาก Defect กลับถึง Requirement, เครื่องหมาย "⚠ ยังไม่มี Task" |
| 27 | ทดสอบ NFR — Performance | Tester (QA) | ⬜ TODO | FCP ≤ 1.5s (100 Requirement), Filter ≤ 200ms (500 รายการรวม), Bundle ≤ 300KB gzip |
| 28 | ทดสอบ NFR — Accessibility | Tester (QA) | ⬜ TODO | WCAG 2.1 AA, Lighthouse ≥ 90, keyboard navigable |

---

### Phase 6: Oversight & Tracking (ตลอดทั้งโปรเจค)

| # | Task | ผู้รับผิดชอบ | สถานะ | รายละเอียด |
|---|------|-------------|-------|-----------|
| 29 | ติดตามความคืบหน้า | PM | ⬜ TODO | ดูภาพรวม task ทั้งหมด ติดตามว่าแต่ละ phase เสร็จตามกำหนดไหม |
| 30 | แก้ไข Blockers | PM | ⬜ TODO | จัดการเมื่อทีมติดปัญหา (รอ spec, รอ design, ติด technical issue) |
| 31 | Acknowledge Defect (Critical/High) | PM | ⬜ TODO | รับรู้และจัดลำดับ defect ที่ส่งผลกระทบสูง |

---

## Dependencies (ลำดับงานที่ต้องทำก่อน-หลัง)

```
Phase 1 (Spec) ──→ Phase 2 (Design) ──→ Phase 4 (UI Dev)
                                              ↑
Phase 1 (Spec) ──→ Phase 3 (Data Layer Dev) ──┘
                                              ↓
                                        Phase 5 (Testing)
```

- **SA** ต้อง finalize spec ก่อน → UX/UI และ Dev ถึงเริ่มได้
- **UX/UI** ส่ง design ก่อน → Dev เริ่ม UI Components ได้
- **Dev** สร้าง Data Layer ได้ขนานกับ UX/UI ออกแบบ (ไม่ต้องรอ design)
- **Tester** เริ่มเขียน test case ได้ตั้งแต่ Phase 1 เสร็จ แต่ execute ได้เมื่อ Dev ส่งงาน

---

## Acceptance Criteria สำคัญ (สรุปจาก FR)

| FR | เงื่อนไขผ่าน |
|----|-------------|
| FR-01 | สร้าง Requirement ได้ + UUID auto + กรอกไม่ครบ → error |
| FR-02 | Category บังคับเลือก Functional หรือ Non-Functional |
| FR-03 | Priority default = "Should", เลือกค่าอื่นได้ |
| FR-04 | Board view แบ่ง 4 columns + Filter ทำงานถูกต้อง |
| FR-05 | แก้ไขได้ทุก field, ยกเลิกแล้วค่าเดิมยังอยู่ |
| FR-06 | Cascade delete พร้อมเตือนจำนวน Task/Defect ที่จะลบตาม |
| FR-07 | Forward/Backward trace ทำงาน + เตือนเมื่อไม่มี Task |

---

## Non-Functional Requirements (เป้าหมาย)

| ID | เป้าหมาย | วิธีวัด |
|----|----------|--------|
| NFR-01 | FCP ≤ 1.5 วินาที (100 Requirement) | Chrome DevTools Lighthouse |
| NFR-02 | Filter/Search ≤ 200ms (500 รายการรวม) | Performance API |
| NFR-03 | รองรับ 500 รายการรวม (Req+Task+Defect) | สร้างข้อมูลทดสอบ |
| NFR-04 | WCAG 2.1 AA, Lighthouse ≥ 90, keyboard navigable | Lighthouse + ทดสอบด้วยมือ |
| NFR-05 | Production bundle (gzip) ≤ 300 KB | `vite build` |

---

## หมายเหตุ

- **ไม่มีระบบ Auth** — ผู้ใช้เลือกชื่อจาก dropdown 12 คน hardcoded
- **ไม่มีการจำกัดสิทธิ์** — ทุกคนสร้าง แก้ไข ลบได้หมด
- **ข้อมูลอยู่ใน localStorage เท่านั้น** — ไม่ sync ข้ามเครื่อง
- **ภาษาหน้าจอเป็นภาษาไทย** — คำศัพท์เฉพาะทางคงเป็นอังกฤษ
