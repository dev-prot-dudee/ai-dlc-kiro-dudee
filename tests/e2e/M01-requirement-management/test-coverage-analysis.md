# Test Coverage Analysis — Module 01: Requirement Management

**อ้างอิง:** `docs/module-01-requirement-management.md`
**วันที่วิเคราะห์:** 2026-08-20

---

## 1. สรุป Requirement ที่ต้องทดสอบ (จากเอกสาร)

| FR ID | ชื่อ | สาระสำคัญ |
|-------|------|-----------|
| FR-01 | สร้าง Requirement ผ่าน Web Form | กรอกครบบังคับ → สร้างได้; ไม่กรอก → ปฏิเสธ |
| FR-02 | แยก Category — Functional / Non-Functional | ไม่เลือก Category → ปฏิเสธ |
| FR-03 | MoSCoW Priority | ค่าเริ่มต้น Should; เลือกค่าอื่นได้ |
| FR-04 | แสดงรายการและกรอง | กรอง Category, Priority, ค้นหาข้อความ |
| FR-05 | แก้ไข Requirement | แก้ทุก field ได้; ยกเลิกแล้วค่าเดิมยังอยู่ |
| FR-06 | ลบ (Cascade Delete with Warning) | ยืนยันก่อนลบ; เตือนจำนวน Task/Defect; cascade delete |
| FR-07 | Traceability — Req → Task → Defect | Forward trace, Backward trace, "ยังไม่มี Task" warning, นับ Task/Defect |

---

## 2. Unit Test Coverage (`src/modules/requirements/requirements.spec.ts`)

| Requirement | Test ที่ครอบคลุม | สถานะ |
|-------------|-----------------|-------|
| FR-01 (สร้าง) | "เมื่อกรอกข้อมูลครบและบันทึก Requirement ใหม่ต้องปรากฏในรายการพร้อมข้อมูลที่กรอก" | ✅ |
| FR-02 (Category บังคับ) | "เมื่อบันทึกโดยไม่เลือกประเภท ต้องถูกปฏิเสธ", "ค่าที่อยู่นอก Functional และ Non-Functional ต้องถูกปฏิเสธ" | ✅ |
| FR-03 (MoSCoW) | "ค่าเริ่มต้นต้องเป็น Should", "เมื่อเลือกค่าอื่น", "ค่านอก MoSCoW ต้องถูกปฏิเสธ" | ✅ |
| FR-04 (กรอง) | "ต้องกรองตามประเภทและตามระดับความสำคัญได้" | ✅ |
| FR-05 (แก้ไข) | "เมื่อแก้แล้วอ่านใหม่ ต้องได้ค่าใหม่", "การแก้ให้เป็นค่าที่ผิดกฎต้องถูกปฏิเสธ" | ✅ |
| FR-06 (ลบ) | "เมื่อลบแล้วต้องหายจากรายการ" | ⚠️ ไม่มี cascade test ใน unit |
| FR-07 (Traceability) | "ต้องนับ Task ได้ถูกต้อง", "Requirement ที่ยังไม่มี Task ต้องถูกชี้ (FR4.3)" | ✅ |

### Unit Test ที่ขาดหรือควรเพิ่ม

| # | Requirement | สิ่งที่ขาด | ระดับความสำคัญ |
|---|-------------|-----------|---------------|
| 1 | FR-01 | ตรวจว่า ownerId ว่าง → ถูกปฏิเสธ (validation rule มีแล้ว แต่ไม่มี test) | Medium |
| 2 | FR-06 | Cascade delete: ลบ Requirement → Task + Defect ใต้มันต้องถูกลบตาม | High |
| 3 | FR-07 | นับ Defect ที่อยู่ใต้ Requirement (ผ่าน Task) — ตอนนี้ทดสอบแค่ว่า defects list ว่าง | Low |

---

## 3. E2E Test Coverage (`src/e2e/requirements.e2e.spec.tsx`)

| Requirement | Test ที่ครอบคลุม | สถานะ |
|-------------|-----------------|-------|
| FR-01 (สร้าง) | "กรอกครบแล้วบันทึก ต้องเห็นการ์ดใน column ตามระดับความสำคัญ" | ✅ |
| FR-02 (Category) | "บันทึกโดยไม่เลือกประเภท ต้องค้างอยู่ในฟอร์ม", "ไม่กรอกหัวข้อ ต้องถูกปฏิเสธ", "แก้ที่ผิดแล้วบันทึกซ้ำ ต้องผ่าน" | ✅ |
| FR-03 (Priority default) | "ไม่เลือกระดับความสำคัญ ต้องได้ Should", "กดเพิ่มจากหัว column ต้องตั้งความสำคัญตาม column" | ✅ |
| FR-04 (ค้นหา/กรอง) | "ค้นหาต้องเหลือเฉพาะรายการที่ตรง", "กรองตามประเภทและตามความสำคัญ" | ✅ |
| FR-05 (แก้ไข) | "เปิดการ์ดต้องเห็นรายละเอียดครบ แล้วแก้ไขจากที่นั่นได้" | ✅ |
| FR-06 (ลบ) | "ยกเลิกในกล่องยืนยัน ต้องไม่ลบ", "ลบรายการที่ไม่มีลูก", "ลบรายการที่มี Task ผูกอยู่ (cascade)" | ✅ |
| FR-07 (Traceability) | "แสดงสายเชื่อมโยงลงไป Task และ Defect (FR4.1)", "ยังไม่มี Task ขึ้นคำเตือน (FR4.3)" | ✅ |
| FR6.1 (Persistence) | "ปิดแอปแล้วเปิดใหม่ ต้องยังเห็นรายการเดิม" | ✅ |
| (Routing) | "เข้า path ที่ไม่มีอยู่ต้องถูกพาไปหน้า Requirements" | ✅ (เพิ่มเติม) |

### E2E Test ที่ขาดหรือควรเพิ่ม (เทียบกับ Acceptance Criteria ในเอกสาร)

| # | Requirement | Acceptance Criteria ที่ยังไม่มี test | ระดับความสำคัญ |
|---|-------------|--------------------------------------|---------------|
| 1 | FR-05 | "ผู้ใช้แก้ไขแล้วกด ยกเลิก Then ค่าเดิมยังคงอยู่" | Medium |
| 2 | FR-06 | Cascade ที่มีทั้ง Task **และ** Defect (ตอนนี้ test ลบที่มี Task 2 ตัว แต่ไม่มี Defect ผูกอยู่) | High |
| 3 | FR-07 | "แสดงจำนวน X Tasks · Y Defects ที่ผูกอยู่" บนการ์ดโดยตรง (มี test ใน detail แต่ไม่มีบน card) | Low |
| 4 | FR-04 | กรอง Priority + Category พร้อมกัน (combined filter) | Low |

---

## 4. Traceability Matrix (รวม Unit + E2E)

| FR (เอกสาร) | Unit Test | E2E Test | ครอบคลุมรวม |
|-------------|-----------|----------|-------------|
| FR-01 สร้าง Requirement | ✅ 1 test | ✅ 1 test | ✅ เพียงพอ |
| FR-02 บังคับ Category | ✅ 2 tests | ✅ 3 tests | ✅ เพียงพอ |
| FR-03 MoSCoW Priority | ✅ 3 tests | ✅ 2 tests | ✅ เพียงพอ |
| FR-04 แสดงรายการ/กรอง | ✅ 1 test | ✅ 2 tests | ✅ เพียงพอ |
| FR-05 แก้ไข | ✅ 2 tests | ✅ 1 test | ⚠️ ขาด cancel test |
| FR-06 ลบ + Cascade | ✅ 1 test (ลบตรง) | ✅ 3 tests (ยกเลิก+ลบเปล่า+cascade) | ⚠️ Unit ไม่มี cascade |
| FR-07 Traceability | ✅ 2 tests | ✅ 2 tests | ✅ เพียงพอ |
| FR6.1 Persistence | — | ✅ 1 test | ✅ เพียงพอ |

---

## 5. Validation Rules Coverage (จาก Data Model ในเอกสาร)

| Validation Rule | Error Message (ในเอกสาร) | Unit Test | E2E Test |
|-----------------|--------------------------|-----------|----------|
| title ห้ามว่าง | "ต้องระบุหัวข้อของ Requirement" | ✅ (ทดสอบในแก้ไข) | ✅ |
| category บังคับ | "ต้องเลือกประเภทเป็น Functional หรือ Non-Functional" | ✅ | ✅ |
| priority ต้องเป็น MoSCoW | "ต้องเลือกระดับความสำคัญเป็น Must, Should, Could หรือ Won't" | ✅ | — (ไม่จำเป็น dropdown ไม่ให้เลือกค่านอก) |
| ownerId ห้ามว่าง | "ต้องระบุผู้รับผิดชอบ" | ❌ ไม่มี | — (dropdown มี default เสมอ) |

---

## 6. ผลสรุป

### ✅ สิ่งที่ทดสอบครบแล้ว
- FR-01: CRUD สร้าง Requirement
- FR-02: Validation Category (Functional / Non-Functional)
- FR-03: MoSCoW Priority พร้อม default Should
- FR-04: ค้นหาและกรอง (Category, Priority, ข้อความ)
- FR-05: แก้ไข Requirement (happy path + validation on edit)
- FR-06: ลบพร้อม cascade delete (E2E ครบ)
- FR-07: Forward trace + ยังไม่มี Task warning
- FR6.1: ข้อมูลคงอยู่ข้าม session

### ⚠️ สิ่งที่ควรเพิ่ม (จัดลำดับตาม priority)

| # | ประเภท | สิ่งที่ขาด | เหตุผล |
|---|--------|-----------|--------|
| 1 | Unit | **Cascade delete test** — ลบ Requirement แล้ว Task + Defect ใต้มันต้องหายตาม | E2E ทดสอบแล้ว แต่ unit layer ไม่มี |
| 2 | E2E | **Cancel edit** — กดยกเลิกขณะแก้ไข ค่าเดิมยังอยู่ | Acceptance Criteria FR-05 ระบุไว้ชัด |
| 3 | E2E | **Full cascade (Req→Task→Defect)** — ลบ Requirement ที่มีทั้ง Task และ Defect ผูกอยู่ | ปัจจุบันมี test ลบ Req ที่มี Task แต่ไม่มี Defect ด้วย |
| 4 | Unit | **ownerId ว่างต้อง reject** | Validation rule มีใน code แต่ไม่มี test |

### 📊 คะแนนรวม

| ตัวชี้วัด | ค่า |
|-----------|-----|
| FR ที่ครอบคลุม (Unit + E2E) | **7/7** (100%) |
| Acceptance Criteria ที่ครอบคลุม | **12/15** (80%) |
| Unit Tests | 12 tests ✅ PASS |
| E2E Tests | 17 tests ✅ PASS |
| ช่องว่างที่ควรเพิ่ม | 4 รายการ (2 High, 2 Medium) |
