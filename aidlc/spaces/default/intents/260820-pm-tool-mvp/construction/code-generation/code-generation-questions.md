# Code Generation — คำถาม

**Stage:** code-generation · **Unit:** ไม่มี (zero-Unit — express scope)

---

## บริบทของแผนที่นำเสนอ

คำถาม Plan Approval ด้านล่างครอบเอกสาร 3 ส่วนที่ต้องอนุมัติร่วมกัน:

1. `code-generation-plan.md` — แผน 19 ขั้นตอน พร้อมหัวข้อ UX/UI Design Direction
2. Testing Contract ที่ฝังอยู่ในแผนนั้น (methodology: `bdd`, contract `sha256:e53ce9e9…`)
3. `unit-test-instructions.md` — วิธีตั้งค่าและรัน test พร้อมคำสั่งที่ระบุ path ชัดเจน

สาระของแผน:

- **Stack**: React + Vite + TypeScript, ไม่มี backend, เก็บข้อมูลใน localStorage
- **UX/UI**: Notion-style ตามภาพที่ทีมให้มา — sidebar ซ้าย 240px, page header, view tabs (Board/List), toolbar พร้อมปุ่ม New สีน้ำเงิน, และ Kanban board ที่มีหัว column พร้อมจุดสีและตัวเลขนับ
- **โครงสร้าง**: `src/styles/` + `src/shared/` (พื้นที่ร่วม ต้องเสร็จก่อน) + `src/modules/{requirements,tasks,defects}/` (ทีมละโฟลเดอร์ แตะกันไม่ทับ)
- **ลำดับ**: shared data layer → design tokens + shell → board components → Requirement → Task → Defect → export/import → accessibility → เอกสาร
- **BDD**: ทุก slice เขียน scenario ที่รันได้ก่อน implement แล้วจึงทำครบทุก layer ของ slice นั้น
- **Test**: 43 scenario ครอบทุก FR ที่ทดสอบได้ (FR1.1–FR6.4)
- **คำสั่งรัน**: `npx vitest run src/shared src/modules`

## การตัดสินใจด้าน design ที่ทีมต้องรับรู้

**1. Board จัดกลุ่มด้วย field ที่ต่างกันในแต่ละ module**

ภาพต้นแบบใช้สถานะ (To-do / In progress / In review / Complete) เป็น column แต่รอบนี้ **ไม่มี status workflow** เพราะตัดออกตาม Out of Scope ของ requirements จึงต้องใช้ field อื่นจัดกลุ่มแทน:

| Module | column จัดกลุ่มด้วย |
|--------|-------------------|
| Requirements | MoSCoW Priority — Must / Should / Could / Won't |
| Tasks | ตำแหน่งผู้รับผิดชอบ — SA / UX / Dev / Tester |
| Defects | ประเภท defect — Code Bug / SA Gap / Design Gap / Test Escape / NFR Violation |

การจัดกลุ่ม Defect ด้วยประเภทให้ผลพลอยได้: ตัวเลขนับบนหัว column คือคำตอบของ FR3.7 โดยตรง

**2. ไม่ทำการลากการ์ดข้าม column ในรอบนี้**

เมื่อ column แทน field อย่างประเภท defect การลากข้าม column = การเปลี่ยนประเภท defect ซึ่งเป็นการเปลี่ยนข้อมูลที่มีนัยสำคัญและต้องมีการยืนยัน ยังไม่ได้ออกแบบไว้ในรอบนี้ การแก้ค่าจึงทำผ่านฟอร์มแก้ไขเท่านั้น

**3. เพิ่ม List view นอกเหนือจาก Board**

Board แสดง filter ได้ไม่ครบตามที่ FR กำหนด (เช่น FR2.4 ต้องกรองตามผู้รับผิดชอบ ตำแหน่ง และ Requirement ต้นทางพร้อมกัน) จึงเพิ่มมุมมองตารางไว้

**4. สีไม่ใช่ตัวสื่อความหมายเพียงอย่างเดียว**

ทุก column มีชื่อสถานะเป็นตัวอักษรกำกับ ไม่ได้ใช้แค่จุดสี เพื่อให้ผู้ใช้ที่แยกสีไม่ได้ยังใช้งานได้ (NFR5) และคู่สีทั้งหมดเลือกให้ได้ contrast ratio ≥ 4.5:1

**5. ฟอนต์ต้องมี Noto Sans Thai ใน stack**

UI เป็นภาษาไทยตาม assumption A4 ฟอนต์ที่ภาพต้นแบบใช้ไม่รองรับไทย

## เรื่องที่ต้องแจ้งเกี่ยวกับ Testing Contract

ตัวแก้ไขค่า posture คืนค่า `methodology: "bdd"` โดยระบุ `source: "team"` แต่เมื่อตรวจไฟล์ `aidlc/spaces/default/memory/team.md` แล้วพบว่าหัวข้อ `## Testing Posture` ยังเป็น template ที่มีแต่ HTML comment — ข้อความที่ถูกอ่านเป็น BDD คือบรรทัดตัวอย่างในคอมเมนต์ ไม่ใช่แนวปฏิบัติที่ทีมยืนยันไว้จริง

ค่า default ตาม `org.md` เมื่อยังไม่มีการยืนยัน posture คือ test-after ไม่ใช่ BDD

แผนนี้ทำตาม contract ที่เครื่องมือคืนมา (BDD) ตามที่ stage กำหนดให้ยึด contract เป็นหลัก

---

## Plan Approval

อนุมัติแผน `code-generation-plan.md` (19 ขั้นตอน) พร้อม Testing Contract ที่ฝังอยู่ และ `unit-test-instructions.md` เพื่อเริ่มสร้างโค้ดหรือไม่

- Approve Plan
- Request Changes

[Approval Fingerprint]: sha256:d43f62663eb421d1198453c2912624b9ab0c830de6f849705797e2c350e9e676

[Answer]: Approve Plan

---
