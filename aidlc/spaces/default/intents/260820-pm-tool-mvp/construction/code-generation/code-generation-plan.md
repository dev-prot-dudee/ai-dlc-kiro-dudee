# Code Generation Plan — PM Tool MVP

**Stage:** code-generation · **Scope:** express · **Depth:** Minimal · **Test Strategy:** Minimal
**Project type:** Greenfield · **Unit:** ไม่มี (zero-Unit — express scope ข้าม Units Generation)
**วันที่:** 2026-08-20

**Consumes:** `aidlc/spaces/default/intents/260820-pm-tool-mvp/inception/requirements-analysis/requirements.md`

---

## Testing Contract

```json
{
  "version": 1,
  "methodology": "bdd",
  "source": "team",
  "ordering": "Define executable behavior scenarios before implementing each observable feature slice.",
  "scope": "express",
  "test_strategy": "minimal",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "<!-- Affirmed during practices-discovery. Example: -->\n<!-- We use BDD. Specifications drive scenarios; scenarios drive code. -->\n<!-- Each Unit ships with feature files in /features/. -->"
    },
    {
      "layer": "project",
      "text": "<!-- Project-specific specialisation. -->"
    }
  ],
  "obligations": {
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "bdd",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Behavior scenarios - define executable examples for the observable feature slice before implementation.",
      "Feature slice - implement the required data, repository, business, API, and frontend layers.",
      "Behavior scenarios - run the scenarios until they pass.",
      "Feature slice - refactor while the scenarios stay green.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:24187dee6792881aefab6e38774af52629c357902304a256dfb33a832a130d61",
  "contract_sha256": "sha256:e53ce9e99b0b2c89155c39b0661a619d08091f9c02e171aeb543505bccc8c498"
}
```

### วิธีที่แผนนี้ทำตาม Testing Contract

Contract กำหนด **BDD** — เขียน scenario ที่รันได้ก่อน implement แต่ละ feature slice แผนนี้จึงจัดเป็น slice ตาม module: แต่ละ slice เขียน scenario ก่อน (`.spec.ts`) → implement ครบทุก layer ที่ slice นั้นต้องใช้ (data → repository → business → UI) → รัน scenario ให้ผ่าน → refactor ขณะที่ scenario ยังเขียว

`API / endpoint` layer ใน `testable_layers` **ไม่มีในรอบนี้** เพราะไม่มี backend (constraint C1) — layer นี้ถูกแทนด้วย repository layer ที่คุยกับ localStorage ซึ่งเป็นขอบเขต I/O จริงของรอบนี้

---

## UX/UI Design Direction

อ้างอิงจากภาพหน้าจอที่ทีมให้มา (Notion-style workspace) โครงหน้าจอมี 4 ส่วน

```
+----------------+--------------------------------------------------------+
| SIDEBAR        | HEADER: [icon] ชื่อหน้า                                |
| (240px คงที่)  +--------------------------------------------------------+
|                | VIEW TABS: [Board] [List]        TOOLBAR: [sort]       |
| Workspace      |                                  [filter] [search]     |
|  - ภาพรวม      |                                  [+ New v]             |
|                +--------------------------------------------------------+
| Modules        | BOARD: column ตามสถานะ เรียงแนวนอน เลื่อนซ้ายขวาได้      |
|  - Requirements|                                                        |
|  - Tasks       |  +-----------+ +-----------+ +-----------+            |
|  - Defects     |  | (o) ชื่อ 10| | (o) ชื่อ 5 | | (o) ชื่อ 3 |            |
|                |  +-----------+ +-----------+ +-----------+            |
| ผู้ใช้ปัจจุบัน   |  | [ card  ] | | [ card  ] | | [ card  ] |            |
|  [UserPicker]  |  | [ card  ] | | [ card  ] | | + New     |            |
|                |  | + New     | | + New     | |           |            |
+----------------+--------------------------------------------------------+
```

<!-- Text fallback: หน้าจอแบ่งเป็น sidebar ซ้ายกว้าง 240px คงที่ กับพื้นที่หลักด้านขวา พื้นที่หลักเรียงจากบนลงล่าง: header แสดงไอคอนและชื่อหน้า, แถบ view tabs ทางซ้ายคู่กับ toolbar ทางขวา, และ board ที่มี column เรียงแนวนอนเลื่อนได้ แต่ละ column มีหัวข้อพร้อมจุดสีและตัวเลขนับ ใต้หัวข้อเป็น card เรียงลงมาและปุ่มเพิ่มรายการท้าย column -->

### องค์ประกอบที่ต้องสร้าง (ทั้งหมดอยู่ใน `src/shared/components/`)

| Component | หน้าที่ | อ้างอิงจากภาพ |
|-----------|--------|--------------|
| `Sidebar.tsx` | นำทางซ้าย จัดกลุ่มด้วยหัวข้อตัวเล็กสีเทา แต่ละรายการมีไอคอนนำหน้า รายการที่เลือกอยู่มีพื้นหลังเทาอ่อนและมุมโค้ง | แถบซ้ายที่มี Home / Agents / Teamspaces / Private |
| `PageHeader.tsx` | ไอคอนวงกลมพื้นเทาอ่อน + ชื่อหน้าตัวหนาขนาดใหญ่ | หัวข้อ "Ramp HQ" พร้อมไอคอนวงกลม |
| `ViewTabs.tsx` | แถบสลับมุมมอง tab ที่เลือกมีพื้นหลังเทาอ่อนและมุมโค้ง ที่ไม่เลือกเป็นตัวอักษรสีเทาไม่มีพื้นหลัง | แถบ Company tasks / My tasks / Current sprint / Timeline |
| `Toolbar.tsx` | ปุ่มไอคอนเรียงขวา ปิดท้ายด้วยปุ่ม New พื้นสีน้ำเงินตัวอักษรขาว | กลุ่มไอคอนขวาและปุ่ม New สีน้ำเงิน |
| `BoardView.tsx` | container ของ column เรียงแนวนอน เลื่อนซ้ายขวาได้เมื่อ column เกินความกว้างจอ | board 4 column |
| `BoardColumn.tsx` | หัว column: จุดสีกลม + ชื่อสถานะบนพื้นหลังสีอ่อนของสถานะนั้น + ตัวเลขนับสีเทาถัดมา; ท้าย column มีปุ่ม "+ เพิ่ม" | หัว To-do 10 / In progress 5 / In review 3 / Complete 34 |
| `BoardCard.tsx` | การ์ดพื้นขาว ขอบเทาอ่อน มุมโค้ง เงาบางมาก ข้อความตัดบรรทัดได้ กดแล้วเปิดรายละเอียด | การ์ดในแต่ละ column |
| `ListView.tsx` | มุมมองตารางสำหรับข้อมูลที่ board แสดงไม่พอ (ใช้ filter ครบทุกเงื่อนไขตาม FR) | — (เพิ่มเพื่อรองรับ FR ที่ board แสดงไม่ครบ) |

### สีของสถานะแต่ละ column

การ์ดถูกจัดกลุ่มด้วย field ที่ต่างกันในแต่ละ module เพราะรอบนี้ไม่มี status workflow (ตัดออกตาม Out of Scope)

| Module | จัดกลุ่ม column ด้วย | column ที่ได้ |
|--------|---------------------|--------------|
| Requirements | MoSCoW Priority | Must / Should / Could / Won't |
| Tasks | ตำแหน่งผู้รับผิดชอบ | SA / UX / Dev / Tester |
| Defects | ประเภท defect | Code Bug / SA Gap / Design Gap / Test Escape / NFR Violation |

| ชื่อสี | จุดสี | พื้นหลังหัว column | ใช้กับ |
|-------|------|------------------|-------|
| เทา | `#787774` | `#F1F1EF` | Won't / SA / Code Bug |
| ส้ม | `#CB7B37` | `#FAEBDD` | Should / Dev / Design Gap |
| น้ำเงิน | `#337EA9` | `#DDEBF1` | Could / UX / Test Escape |
| เขียว | `#448361` | `#DDEDEA` | Must / Tester / SA Gap |
| แดง | `#C4554D` | `#FBE4E4` | NFR Violation |

**หมายเหตุเรื่อง accessibility (NFR5):** คู่สีข้างบนเลือกให้ตัวอักษรสีเข้มบนพื้นอ่อนได้ contrast ratio ≥ 4.5:1 ทุกคู่ และ **ห้ามใช้สีเป็นตัวสื่อความหมายเพียงอย่างเดียว** — ทุก column ต้องมีชื่อสถานะเป็นตัวอักษรกำกับ ไม่ใช่แค่จุดสี เพื่อให้ผู้ใช้ที่แยกสีไม่ได้ยังใช้งานได้

### ค่าพื้นฐานของงานออกแบบ

| รายการ | ค่า |
|-------|-----|
| ตัวอักษร | `-apple-system, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif` — ต้องมีฟอนต์ไทยใน stack เพราะ UI เป็นภาษาไทย |
| ขนาดตัวอักษร | หัวหน้า 40px/700 · หัว column 14px/600 · การ์ด 14px/400 · หัวข้อ sidebar 12px/600 ตัวพิมพ์ใหญ่ |
| สีข้อความ | หลัก `#37352F` · รอง `#787774` |
| สีพื้น | sidebar `#FBFBFA` · พื้นที่หลัก `#FFFFFF` · การ์ด `#FFFFFF` ขอบ `#E9E9E7` |
| สีปุ่มหลัก | `#2383E2` ตัวอักษรขาว |
| ระยะห่าง | ใช้ทวีคูณของ 4px · ช่องไฟระหว่าง column 12px · ระหว่างการ์ด 8px |
| มุมโค้ง | การ์ดและปุ่ม 6px · หัว column 4px |
| เงา | การ์ด `0 1px 2px rgba(0,0,0,0.06)` เท่านั้น ไม่ใช้เงาหนา |
| ความกว้าง column | 280px คงที่ |

### สิ่งที่ **ไม่** ลอกมาจากภาพ

- ปฏิทินและรายการนัดหมายใน sidebar (ไม่มีในขอบเขตรอบนี้)
- รายการ Agents (ไม่เกี่ยวกับระบบนี้)
- ช่องแชทด้านล่าง sidebar
- มุมมอง Timeline และ Current sprint (Sprint อยู่ใน Out of Scope)
- การลากการ์ดข้าม column — **ไม่ทำในรอบนี้** เพราะเปลี่ยนค่าของ field ที่จัดกลุ่ม (เช่นลากข้าม column ของ Defect = เปลี่ยนประเภท defect) ซึ่งต้องมีการยืนยันและ validation ที่ยังไม่ได้ออกแบบ การเปลี่ยนค่าทำผ่านฟอร์มแก้ไขเท่านั้น

---

## โครงสร้างโปรเจกต์

ออกแบบให้ 3 ทีมแก้ไฟล์ทับกันน้อยที่สุด (ตอบความเสี่ยง R4 และคำถาม OQ2)

```
/
+-- package.json
+-- vite.config.ts
+-- vitest.config.ts
+-- tsconfig.json
+-- index.html
+-- src/
    +-- main.tsx
    +-- App.tsx
    +-- styles/
    |   +-- tokens.css           <-- ค่าสี ระยะห่าง ตัวอักษร ตามตารางข้างบน
    |   +-- global.css
    +-- shared/                  <-- แก้ร่วมกัน ต้องตกลงก่อนแตะ
    |   +-- types.ts             <-- type ของทั้ง 3 entity
    |   +-- storage.ts           <-- localStorage repository (generic)
    |   +-- storage.spec.ts
    |   +-- traceability.ts      <-- ตรรกะสายเชื่อมโยง
    |   +-- traceability.spec.ts
    |   +-- users.ts             <-- รายชื่อผู้ใช้ + ผู้ใช้ปัจจุบัน
    |   +-- test-factories.ts
    |   +-- components/          <-- component ที่ใช้ร่วม (ตาม design ข้างบน)
    |       +-- Sidebar.tsx
    |       +-- PageHeader.tsx
    |       +-- ViewTabs.tsx
    |       +-- Toolbar.tsx
    |       +-- BoardView.tsx
    |       +-- BoardColumn.tsx
    |       +-- BoardCard.tsx
    |       +-- ListView.tsx
    |       +-- UserPicker.tsx
    |       +-- ConfirmDialog.tsx
    |       +-- FilterBar.tsx
    |       +-- EmptyState.tsx
    |       +-- ErrorBoundary.tsx
    |       +-- components.spec.ts
    +-- modules/
        +-- requirements/        <-- ทีม A เท่านั้น
        |   +-- RequirementBoard.tsx
        |   +-- RequirementForm.tsx
        |   +-- RequirementDetail.tsx
        |   +-- requirements.repo.ts
        |   +-- requirements.spec.ts
        +-- tasks/               <-- ทีม B เท่านั้น
        |   +-- TaskBoard.tsx
        |   +-- TaskForm.tsx
        |   +-- TaskDetail.tsx
        |   +-- tasks.repo.ts
        |   +-- tasks.spec.ts
        +-- defects/             <-- ทีม C เท่านั้น
            +-- DefectBoard.tsx
            +-- DefectForm.tsx
            +-- DefectDetail.tsx
            +-- defects.repo.ts
            +-- defects.spec.ts
```

**กฎการแบ่งงาน:** `src/shared/` และ `src/styles/` เป็นพื้นที่ร่วม — ต้องเสร็จและนิ่งก่อนทั้ง 3 ทีมเริ่มงานใน `src/modules/` ของตัวเอง หลังจากนั้นแต่ละทีมแตะแค่โฟลเดอร์ตัวเอง merge conflict จึงเกิดน้อย

---

## ขั้นตอนการทำงาน

### Step 1: โครงสร้างโปรเจกต์และ config
- [x] สร้าง `package.json` พร้อม dependency: react, react-dom, react-router-dom, typescript, vite, @vitejs/plugin-react (ระบุเวอร์ชันแบบ pin ไม่ใช้ช่วง)
- [x] สร้าง `tsconfig.json` เปิด `strict: true`
- [x] สร้าง `vite.config.ts`
- [x] สร้าง `index.html` และ `src/main.tsx`
- [x] สร้าง `.gitignore` (node_modules, dist, coverage)
- [x] สร้าง `eslint.config.js` และ `.prettierrc` (ตาม Code Style ของ org: Prettier + ESLint)

**Traceability:** โครงพื้นฐาน ไม่ผูก FR ใดโดยตรง

### Step 2: ติดตั้ง test runner และบันทึกคำสั่งรัน
- [x] เพิ่ม dependency: vitest, @testing-library/react, @testing-library/user-event, jsdom, @testing-library/jest-dom (pin เวอร์ชัน)
- [x] สร้าง `vitest.config.ts` (environment: jsdom, setupFiles)
- [x] สร้าง `src/test-setup.ts`
- [x] ยืนยันว่าคำสั่งรันได้จริงก่อนเขียน scenario แรก
- [x] บันทึกคำสั่งที่รันได้ลงใน `unit-test-instructions.md`

**Traceability:** NFR6 (ความครอบคลุมของ test)

> Contract กำหนด `runner_ready_before_first_test: true` — Step 2 ต้องเสร็จและรันได้จริงก่อน Step 3

### Step 3: Scenario ของ shared layer (เขียนก่อน implement)
- [x] `src/shared/storage.spec.ts` — scenario: อ่าน/เขียน/ลบข้อมูลใน localStorage คงอยู่หลัง reload; ข้อมูลเสียหายไม่ทำให้ระบบล้ม; โควตาเต็มแล้วแจ้งเตือนและข้อมูลเดิมไม่หาย
- [x] `src/shared/traceability.spec.ts` — scenario: หา Task ทั้งหมดใต้ Requirement; หา Defect ทั้งหมดใต้ Requirement ผ่าน Task; ย้อนจาก Defect ขึ้นถึง Requirement; ระบุ Requirement ที่ยังไม่มี Task; นับจำนวนที่จะกำพร้าเมื่อลบ

**Traceability:** FR6.1, FR6.3, FR6.4, FR4.1, FR4.2, FR4.3, FR4.4, FR4.5

### Step 4: Implement shared layer (data + ตรรกะ)
- [x] `src/shared/types.ts` — type ของ Requirement, Task, Defect + enum ของ MoSCoW, ประเภท defect 5 ค่า, ความรุนแรง 4 ค่า, ตำแหน่ง 4 ค่า
- [x] `src/shared/storage.ts` — repository ทั่วไปคุยกับ localStorage พร้อม error handling ครบ (parse ล้มเหลว, โควตาเต็ม) ตามกฎ Construction phase เรื่อง error handling ที่ขอบเขต I/O
- [x] `src/shared/traceability.ts` — ตรรกะสายเชื่อมโยงทั้ง forward และ backward
- [x] `src/shared/users.ts` — รายชื่อผู้ใช้ที่กำหนดไว้ + จำผู้ใช้ปัจจุบัน
- [x] `src/shared/test-factories.ts` — factory สร้างข้อมูลทดสอบ

**Traceability:** FR5.1, FR5.2, FR5.3, FR6.1, FR6.3, FR6.4, FR4.1–FR4.5

### Step 5: รัน scenario ของ shared layer ให้ผ่าน
- [x] รัน scenario จาก Step 3 จนผ่านทั้งหมด
- [x] refactor ขณะที่ scenario ยังเขียว

**Traceability:** เหมือน Step 3

### Step 6: Design tokens และเปลือกหน้าจอ (Notion-style shell)
- [x] `src/styles/tokens.css` — ตัวแปร CSS ของสี ระยะห่าง ตัวอักษร มุมโค้ง เงา ตามตาราง "ค่าพื้นฐานของงานออกแบบ"
- [x] `src/styles/global.css` — reset พื้นฐาน + ฟอนต์ที่มี Noto Sans Thai ใน stack
- [x] `src/shared/components/Sidebar.tsx` — นำทางซ้าย 240px จัดกลุ่มด้วยหัวข้อ รายการที่เลือกมีพื้นหลังเทาอ่อน
- [x] `src/shared/components/PageHeader.tsx` — ไอคอนวงกลม + ชื่อหน้า 40px/700
- [x] `src/shared/components/ViewTabs.tsx` — สลับ Board / List
- [x] `src/shared/components/Toolbar.tsx` — ปุ่มไอคอน + ปุ่ม New สีน้ำเงิน
- [x] `src/shared/components/UserPicker.tsx` — dropdown เลือกผู้ใช้ปัจจุบัน (FR5.1–FR5.3)
- [x] `src/shared/components/ErrorBoundary.tsx` — กัน error ไม่ให้จอขาว (FR6.3)
- [x] `src/shared/components/ConfirmDialog.tsx`, `FilterBar.tsx`, `EmptyState.tsx`
- [x] วาง `ErrorBoundary` ครอบ `App.tsx` และประกอบ shell เข้าด้วยกัน

**Traceability:** FR5.1, FR5.2, FR5.3, FR6.3, NFR5

### Step 7: Board components + scenario ของ component ที่ใช้ร่วม
- [x] เขียน scenario ใน `src/shared/components/components.spec.ts` ก่อน: BoardColumn แสดงชื่อสถานะเป็นตัวอักษรไม่ใช่แค่สี; ตัวเลขนับตรงกับจำนวนการ์ด; BoardCard กดแล้วเรียก callback; UserPicker เลือกแล้วจำค่าข้าม reload; ConfirmDialog ยกเลิกแล้วไม่เกิดผล; ทุก interactive element เข้าถึงด้วย keyboard ได้
- [x] `src/shared/components/BoardCard.tsx` — การ์ดพื้นขาว ขอบเทาอ่อน มุมโค้ง 6px เงาบาง มี `data-testid`
- [x] `src/shared/components/BoardColumn.tsx` — หัว column มีจุดสี + ชื่อสถานะ + ตัวเลขนับ, ท้าย column มีปุ่มเพิ่ม
- [x] `src/shared/components/BoardView.tsx` — container เลื่อนแนวนอน column กว้าง 280px
- [x] `src/shared/components/ListView.tsx` — มุมมองตารางสำหรับ filter ที่ board แสดงไม่ครบ
- [x] รัน scenario ให้ผ่าน แล้ว refactor ขณะที่ยังเขียว

**Traceability:** FR1.4, FR2.4, FR3.5, FR3.7, FR5.1–FR5.3, NFR5

### Step 8: Scenario ของ Requirement Management (เขียนก่อน implement)
- [x] `src/modules/requirements/requirements.spec.ts` — scenario ครอบ FR1.1 ถึง FR1.7 ทีละข้อ: สร้างแล้วปรากฏใน column ตาม priority; บันทึกโดยไม่เลือกประเภทถูกปฏิเสธ; ไม่เลือก priority ได้ค่า Should; กรองตามประเภทและ priority; แก้แล้วเห็นค่าใหม่; ลบต้องยืนยันก่อน; แสดงจำนวน Task และ Defect ที่ผูกอยู่

**Traceability:** FR1.1, FR1.2, FR1.3, FR1.4, FR1.5, FR1.6, FR1.7

### Step 9: Implement Requirement Management
- [x] `requirements.repo.ts` — CRUD บน storage layer
- [x] `RequirementForm.tsx` — ฟอร์มพร้อม validation, ใส่ `data-testid` ทุก element ที่กดได้
- [x] `RequirementBoard.tsx` — board จัดกลุ่มด้วย MoSCoW (Must / Should / Could / Won't) พร้อมเครื่องหมายบอก Requirement ที่ยังไม่มี Task (FR4.3)
- [x] `RequirementDetail.tsx` — รายละเอียด + สายเชื่อมโยงลงไป Task/Defect (FR4.1)
- [x] เชื่อม route และรายการใน Sidebar

**Traceability:** FR1.1–FR1.7, FR4.1, FR4.3, FR4.4

### Step 10: รัน scenario ของ Requirement Management ให้ผ่าน
- [x] รัน scenario จาก Step 8 จนผ่าน
- [x] refactor ขณะที่ scenario ยังเขียว

### Step 11: Scenario ของ Task Management (เขียนก่อน implement)
- [x] `src/modules/tasks/tasks.spec.ts` — scenario ครอบ FR2.1 ถึง FR2.7: สร้างแล้วผูกกับ Requirement จริง; Task ที่ไม่ผูก Requirement ถูกปฏิเสธ; ไม่เลือกตำแหน่งถูกปฏิเสธ; กรองตามผู้รับผิดชอบ/ตำแหน่ง/Requirement; แก้และลบ; กดชื่อ Requirement ไปหน้านั้นได้; แสดงจำนวน Defect

**Traceability:** FR2.1, FR2.2, FR2.3, FR2.4, FR2.5, FR2.6, FR2.7

### Step 12: Implement Task Management
- [x] `tasks.repo.ts` — CRUD + การผูกกับ Requirement
- [x] `TaskForm.tsx` — ฟอร์มพร้อม validation บังคับ Requirement และตำแหน่ง
- [x] `TaskBoard.tsx` — board จัดกลุ่มด้วยตำแหน่งผู้รับผิดชอบ (SA / UX / Dev / Tester) + ListView สำหรับกรอง 3 แบบ
- [x] `TaskDetail.tsx` — รายละเอียด + ลิงก์ขึ้นไป Requirement และลงไป Defect
- [x] เชื่อม route และรายการใน Sidebar

**Traceability:** FR2.1–FR2.7, FR4.2, FR4.5

### Step 13: รัน scenario ของ Task Management ให้ผ่าน
- [x] รัน scenario จาก Step 11 จนผ่าน
- [x] refactor ขณะที่ scenario ยังเขียว

### Step 14: Scenario ของ Defect Tracking (เขียนก่อน implement)
- [x] `src/modules/defects/defects.spec.ts` — scenario ครอบ FR3.1 ถึง FR3.7: สร้างแล้วผูกกับ Task; ไม่เลือกประเภทถูกปฏิเสธ และเลือกค่านอก 5 ค่าไม่ได้; ไม่เลือกความรุนแรงถูกปฏิเสธ; ไม่ผูก Task ถูกปฏิเสธ; กรองตามประเภทและความรุนแรง; แก้และลบ; นับจำนวนแยกตามประเภททั้ง 5

**Traceability:** FR3.1, FR3.2, FR3.3, FR3.4, FR3.5, FR3.6, FR3.7

### Step 15: Implement Defect Tracking
- [x] `defects.repo.ts` — CRUD + การผูกกับ Task
- [x] `DefectForm.tsx` — ฟอร์มพร้อม validation บังคับประเภท ความรุนแรง และ Task
- [x] `DefectBoard.tsx` — board จัดกลุ่มด้วยประเภท defect ทั้ง 5 ค่า ตัวเลขนับบนหัว column คือคำตอบของ FR3.7 โดยตรง
- [x] `DefectDetail.tsx` — รายละเอียด + สายย้อนกลับขึ้นถึง Requirement (FR4.2)
- [x] เชื่อม route และรายการใน Sidebar

**Traceability:** FR3.1–FR3.7, FR4.2

### Step 16: รัน scenario ของ Defect Tracking ให้ผ่าน
- [x] รัน scenario จาก Step 14 จนผ่าน
- [x] refactor ขณะที่ scenario ยังเขียว

### Step 17: Export / Import
- [x] เพิ่ม scenario ใน `storage.spec.ts`: export ได้ไฟล์; ลบข้อมูลแล้ว import กลับ ได้ข้อมูลครบเท่าเดิม
- [x] implement export เป็นไฟล์ JSON และ import พร้อม validate รูปแบบก่อนเขียนทับ
- [x] รัน scenario ให้ผ่าน

**Traceability:** FR6.2

### Step 18: Accessibility และ build config
- [x] ตรวจ contrast ratio ≥ 4.5:1 ทุกคู่สีในตารางสีสถานะ
- [x] ยืนยันว่าทุก column มีชื่อสถานะเป็นตัวอักษร ไม่ได้สื่อความหมายด้วยสีเพียงอย่างเดียว
- [x] ทุก interactive element เข้าถึงด้วย keyboard ได้ และมีลำดับ focus ที่ถูกต้อง
- [x] board ที่เลื่อนแนวนอนต้องเลื่อนด้วย keyboard ได้
- [x] ทุก form field มี `<label>` ผูกกับ input จริง
- [x] ตรวจขนาด production bundle ≤ 300 KB (gzip)
- [x] เพิ่ม script `build`, `dev`, `test`, `lint`, `typecheck` ใน package.json

**Traceability:** NFR5, NFR7

### Step 19: เอกสารและ traceability
- [x] `README.md` — วิธีติดตั้ง รัน และ test พร้อมระบุข้อจำกัดของรอบนี้ (localStorage, ไม่มี auth) ให้ชัด
- [x] เขียน `code-summary.md`
- [x] เขียน `traceability.json` แม็ปทุก FR/NFR ไปยังไฟล์จริง

**Traceability:** ทุก FR และ NFR

---

## สรุปจำนวน test ที่วางแผนไว้

| ไฟล์ | จำนวน scenario | ครอบ |
|------|---------------|------|
| `shared/storage.spec.ts` | 6 | FR6.1, FR6.2, FR6.3, FR6.4 |
| `shared/traceability.spec.ts` | 5 | FR4.1–FR4.5 |
| `shared/components/components.spec.ts` | 8 | FR5.1–FR5.3, NFR5 + happy-path floor ของ component ที่ใช้ร่วม |
| `modules/requirements/requirements.spec.ts` | 8 | FR1.1–FR1.7 + happy path |
| `modules/tasks/tasks.spec.ts` | 8 | FR2.1–FR2.7 + happy path |
| `modules/defects/defects.spec.ts` | 8 | FR3.1–FR3.7 + happy path |
| **รวม** | **43** | ครอบทุก FR ที่ทดสอบได้ |

เป็นไปตาม Minimal strategy: 1 test ต่อ 1 requirement เป็นอย่างน้อย บวก happy-path floor ต่อ component

**NFR ที่ยังไม่ครอบด้วย automated test** (วัดด้วยมือใน stage Build and Test): NFR1, NFR2, NFR3 (ต้องวัดด้วย Lighthouse และข้อมูลทดสอบ 500 รายการ), NFR4 (ทดสอบข้ามเบราว์เซอร์ด้วยมือ)

---

## สิ่งที่แผนนี้ไม่ทำ

- ไม่มี backend, API, ฐานข้อมูล (constraint C1)
- ไม่มี authentication (constraint C3)
- ไม่มี KPI, evidence enforcement, NFR validation, status workflow (ตาม Out of Scope ของ requirements)
- ไม่ทำ responsive สำหรับมือถือ (assumption A5)
- ไม่ทำการลากการ์ดข้าม column (ดูเหตุผลในหัวข้อ UX/UI Design Direction)
