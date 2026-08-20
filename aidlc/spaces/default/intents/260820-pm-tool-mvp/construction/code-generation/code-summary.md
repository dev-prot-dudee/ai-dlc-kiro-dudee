# Code Summary — PM Tool MVP

**Stage:** code-generation · **Scope:** express · **Unit:** ไม่มี (zero-Unit)
**วันที่:** 2026-08-20

---

## ผลการตรวจสอบ (ตัวเลขจริงจากการรัน)

| การตรวจ | คำสั่ง | ผล |
|---------|-------|-----|
| Test | `npx vitest run src/shared src/modules` | **56 ผ่าน / 56** (6 ไฟล์) |
| Type | `npx tsc --noEmit` | **ไม่มี error** |
| Lint | `npx eslint src` | **ไม่มี error** |
| Build | `npx vite build` | **สำเร็จ** ใน 666 ms |

**ขนาดไฟล์ที่ส่งถึงผู้ใช้ (NFR7 — เกณฑ์ ≤ 300 KB gzip):**

| ไฟล์ | ดิบ | gzip |
|------|-----|------|
| JS | 202.56 KB | **64.51 KB** |
| CSS | 9.65 KB | **2.25 KB** |
| HTML | 0.43 KB | 0.33 KB |
| **รวม** | | **67.09 KB** |

ผ่านเกณฑ์ NFR7 โดยใช้เพียง 22% ของงบที่กำหนดไว้

---

## ไฟล์ที่สร้าง

### โครงและ config (7 ไฟล์)
`package.json` · `tsconfig.json` · `vite.config.ts` · `vitest.config.ts` · `index.html` · `.eslintrc.cjs` · `.prettierrc`

### Design tokens (2 ไฟล์)
- `src/styles/tokens.css` — ตัวแปร CSS ของสี ระยะห่าง ตัวอักษร มุมโค้ง เงา ตามตารางในแผน
- `src/styles/global.css` — reset, เปลือกหน้าจอ, board, form, dialog, table

### Shared layer (9 ไฟล์)
| ไฟล์ | หน้าที่ |
|------|--------|
| `types.ts` | type ของ 3 entity + enum ทุกชุด + error 3 ชนิด |
| `storage.ts` | คุยกับ localStorage พร้อม error handling ครบ + export/import |
| `repository.ts` | CRUD ทั่วไป เรียก validate ทั้งตอนสร้างและตอนแก้ |
| `traceability.ts` | ตรรกะสายเชื่อมโยงทั้งสองทิศทาง + การนับ |
| `users.ts` | รายชื่อผู้ใช้ 12 คน + จำผู้ใช้ปัจจุบัน |
| `status-colors.ts` | การจับคู่ค่าสถานะกับสี |
| `DataContext.tsx` | แหล่งข้อมูลกลางที่ทั้ง 3 module อ่านร่วมกัน |
| `test-factories.ts` | factory สร้างข้อมูลทดสอบ |
| `test-setup.ts` | ติดตั้ง Storage ที่ทำงานถูกต้องใน test env |

### Shared components (15 ไฟล์)
`Sidebar` · `PageHeader` · `ViewTabs` · `Toolbar` · `BoardView` · `BoardColumn` · `BoardCard` · `ListView` · `ModulePage` · `Field` · `UserPicker` · `ConfirmDialog` · `FilterBar` · `EmptyState` · `ErrorBoundary`

### Module (12 ไฟล์ — 4 ต่อ module)
แต่ละ module มี `<Name>Board.tsx` (หน้า), `<Name>Form.tsx` (ฟอร์ม), `<name>.repo.ts` (CRUD + validation), `<name>.spec.ts` (scenario)

### Test (6 ไฟล์ 56 scenario)
| ไฟล์ | จำนวน |
|------|-------|
| `shared/storage.spec.ts` | 7 |
| `shared/traceability.spec.ts` | 8 |
| `shared/components/components.spec.tsx` | 11 |
| `modules/requirements/requirements.spec.ts` | 12 |
| `modules/tasks/tasks.spec.ts` | 9 |
| `modules/defects/defects.spec.ts` | 9 |

วางแผนไว้ 43 ทำได้ **56** เกินเป้าเพราะบาง FR ต้องมีมากกว่า 1 scenario จึงครอบได้จริง เช่น FR1.2 ต้องทดสอบทั้งกรณีเว้นว่างและกรณีใส่ค่านอกชุดที่อนุญาต

---

## การตัดสินใจสำคัญ

### 1. `ModulePage` แบบ generic แทนหน้าจอแยกต่อ module

**เบี่ยงจากแผน** ที่ระบุ `RequirementList.tsx`, `TaskList.tsx`, `DefectList.tsx` แยกกัน

ทั้ง 3 module มีรูปแบบหน้าจอเหมือนกันทุกอย่าง — board/list, ฟอร์ม, รายละเอียด, ยืนยันก่อนลบ, ค้นหา, กรอง — ต่างกันแค่ field และวิธีจัดกลุ่ม การเขียนแยก 3 ชุดจะได้โค้ดซ้ำ ~600 บรรทัดที่ต้องแก้พร้อมกันทุกครั้ง

จึงรวมเป็น `ModulePage` ตัวเดียวที่รับ config แล้วแต่ละ module ส่ง config เข้าไป ผลคือแต่ละ module เหลือไฟล์หน้าจอไฟล์เดียว (`<Name>Board.tsx`) ที่อ่านเป็น "คำประกาศ" ว่า module นี้จัดกลุ่มด้วยอะไร กรองด้วยอะไร แสดงอะไรบนการ์ด

**ผลต่อการแบ่งงาน 3 ทีม:** ยังคงเป้าหมายเดิม — `ModulePage` อยู่ใน `src/shared/` ซึ่งต้องนิ่งก่อนทีมเริ่มงาน หลังจากนั้นแต่ละทีมแตะแค่ `src/modules/<ของตัวเอง>/`

### 2. ติดตั้ง Storage เองใน test environment

Node 25 มี `localStorage` global แบบ experimental ที่ต้องใช้กับ flag `--localstorage-file` เมื่อไม่ระบุ path มันเป็น object เปล่าไม่มี method และ **บดทับ `window.localStorage` ของ jsdom** ทำให้ test ที่พึ่ง localStorage ใช้งานไม่ได้เลย (`localStorage.clear is not a function`)

แก้โดยติดตั้ง `MemoryStorage` ที่ทำตาม spec ของ Web Storage ทับลงไปใน `test-setup.ts` โค้ดแอปยังเรียก `localStorage` ตามปกติ และในเบราว์เซอร์จริงได้ตัวของเบราว์เซอร์เอง การแทนที่มีผลแค่ใน test

**นี่ไม่ใช่การ mock พฤติกรรมที่กำลังทดสอบ** — เรายังทดสอบ storage layer จริงกับ Storage ที่ทำงานตาม spec จริง ที่ถูกแทนคือสภาพแวดล้อมที่พังของ Node ไม่ใช่ตัวที่อยู่ใต้การทดสอบ

### 3. Validation อยู่ที่ repository ที่เดียว ไม่ทำซ้ำในฟอร์ม

ฟอร์มส่งค่าว่างต่อไปให้ repository ปฏิเสธ แล้วจับ `ValidationError` มาแสดงที่ field ที่ผิด (ผ่าน `error.field`) แทนการเขียนกฎซ้ำสองที่

ผลคือกฎบังคับของ requirements (FR1.2, FR1.3, FR2.2, FR2.3, FR3.2, FR3.3, FR3.4) มีที่มาที่เดียว และ **บังคับทั้งตอนสร้างและตอนแก้ไข** ไม่ใช่แค่ตอนสร้าง

### 4. Board จัดกลุ่มด้วย field ที่ต่างกันในแต่ละ module

ตามที่อนุมัติไว้ในแผน เพราะรอบนี้ไม่มี status workflow:

| Module | column | ผลพลอยได้ |
|--------|--------|-----------|
| Requirements | MoSCoW | เห็นสัดส่วนงานที่จำเป็นจริงเทียบกับที่อยากได้ |
| Tasks | ตำแหน่ง | ตัวเลขบนหัว column = ภาระงานของแต่ละตำแหน่ง |
| Defects | ประเภท 5 ค่า | **ตัวเลขบนหัว column คือคำตอบของ FR3.7 โดยตรง** |

### 5. ใช้ `<button>` จริงกับการ์ดและ tab ไม่ใช่ `<div onClick>`

ทำให้เข้าถึงด้วย keyboard ได้เองโดยไม่ต้องเพิ่ม `tabIndex` หรือ handler ของ Enter/Space และมี test ยืนยันว่า Tab แล้วโฟกัสได้ Enter แล้วทำงาน (NFR5)

### 6. `ignoreRestSiblings` ใน ESLint

`repository.update` ตัด `id` และ `createdAt` ออกจาก draft ด้วย rest destructuring ซึ่ง ESLint รายงานว่าตัวแปรไม่ถูกใช้ เปิด `ignoreRestSiblings: true` ซึ่งเป็น option ที่มีไว้สำหรับ pattern นี้โดยเฉพาะ แทนการเขียนโค้ดอ้อมให้ linter พอใจ

---

## การเบี่ยงจากแผน

| ที่เบี่ยง | เหตุผล |
|----------|--------|
| ใช้ `ModulePage` generic แทนหน้าจอ list/detail แยกต่อ module | ลดโค้ดซ้ำ ~600 บรรทัด — ดูข้อ 1 ข้างบน |
| ชื่อไฟล์หน้าจอเป็น `<Name>Board.tsx` แทน `<Name>List.tsx` | สะท้อนว่ามุมมองหลักคือ board ตาม design ที่อนุมัติ |
| เพิ่ม `Field.tsx`, `ModulePage.tsx`, `status-colors.ts`, `DataContext.tsx` ที่แผนไม่ได้ระบุ | จำเป็นเพื่อไม่ให้โค้ดซ้ำและให้ทั้ง 3 module เห็นข้อมูลข้ามกันตาม FR4 |
| ไม่มีไฟล์ `<Name>Detail.tsx` แยก | รายละเอียดถูก render ใน `ModulePage` จาก config ของแต่ละ module |
| test ได้ 56 ไม่ใช่ 43 ตามแผน | บาง FR ต้องมีมากกว่า 1 scenario จึงครอบได้จริง |
| แก้ไฟล์ test ตอน typecheck ล้ม (ลบ `@ts-expect-error` 8 จุด) | directive ไม่จำเป็นเพราะ draft helper คืนค่าแบบหลวมอยู่แล้ว |

---

## สิ่งที่ยังไม่ได้ตรวจ

| NFR | เหตุผล | ต้องทำในขั้นถัดไป |
|-----|-------|------------------|
| NFR1 (FCP ≤ 1.5s) | ต้องวัดจากเบราว์เซอร์จริง | รัน Lighthouse |
| NFR2 (ตอบสนอง ≤ 200ms ที่ 500 รายการ) | ต้องมีข้อมูลทดสอบ 500 รายการ | สร้างข้อมูลแล้ววัดด้วย Performance API |
| NFR3 (รองรับ 500 รายการ) | เหมือน NFR2 | เหมือน NFR2 |
| NFR4 (Chrome/Firefox/Safari) | ต้องเปิดในเบราว์เซอร์จริง | ทดสอบด้วยมือ 6 ชุด |

NFR5 (accessibility) มี automated test ครอบส่วนที่ทดสอบได้ — ชื่อสถานะเป็นตัวอักษรไม่ใช่แค่สี, keyboard navigation, label ผูกกับ input, dialog มีชื่อที่อ่านได้ ส่วน contrast ratio เลือกคู่สีให้ผ่านเกณฑ์ตั้งแต่ออกแบบแต่ยังไม่ได้วัดด้วยเครื่องมือ

---

## ความเสี่ยงที่ยังอยู่

| ความเสี่ยง | สภาพปัจจุบัน |
|-----------|-------------|
| **R1 ไม่มี auth** | ยังอยู่ตามเดิม — เขียนเตือนไว้ชัดใน README และในตัว UI ใต้ dropdown เลือกผู้ใช้ ห้ามนำข้อมูลไปคำนวณ KPI |
| **R2 localStorage** | บรรเทาแล้วบางส่วนด้วย export/import (FR6.2) แต่ทีมยังแชร์ข้อมูลกันไม่ได้ |
| **R3 ตัด evidence/NFR validation** | ยังอยู่ตามเดิม — เป็นงานรอบถัดไป |
| **R4 12 คนแก้ไฟล์ทับกัน** | บรรเทาด้วยโครงสร้าง `shared/` + `modules/<ทีม>/` แต่ `shared/` ยังเป็นคอขวดที่ต้องนิ่งก่อนทีมเริ่ม |
