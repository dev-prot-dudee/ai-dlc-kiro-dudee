# Build and Test Results — PM Tool MVP

รันเมื่อ 2026-08-20 บน macOS, Node 25.9.0, npm

ที่มาของคำสั่งที่รัน: `unit-test-instructions.md` (คำสั่ง test), `build-instructions.md` (คำสั่ง build), `code-generation-plan.md` (เกณฑ์ที่ต้องผ่าน)

---

## สรุปผล

| ขั้นตอน | คำสั่ง | ผล |
|--------|-------|-----|
| Build | `npx vite build` | **สำเร็จ** |
| Type check | `npx tsc --noEmit` | **ผ่าน ไม่มี error** |
| Lint | `npx eslint src` | **ผ่าน ไม่มี error** |
| Unit / BDD scenario | `npx vitest run src/shared src/modules` | **56 ผ่าน / 56** |
| การวัด NFR | `npx vitest run src/perf` | **10 ผ่าน / 10** |
| **รวม test** | | **66 ผ่าน / 66 · ไม่มีตัวใดล้ม ไม่มีตัวใดถูกข้าม** |

ไม่มีขั้นตอนใดล้ม จึงไม่มีการวินิจฉัยและแก้ไขในรอบนี้

---

## รายละเอียด Build

```
vite v5.4.6 building for production...
✓ 65 modules transformed.
dist/index.html                   0.43 kB │ gzip:  0.33 kB
dist/assets/index-apsPfWGr.css    9.65 kB │ gzip:  2.25 kB
dist/assets/index-S9cq3WyE.js   202.56 kB │ gzip: 64.51 kB
✓ built in 629ms
```

**NFR7 — ขนาดที่ส่งถึงผู้ใช้ ≤ 300 KB gzip**

| ไฟล์ | gzip |
|------|------|
| JS | 64.51 KB |
| CSS | 2.25 KB |
| HTML | 0.33 KB |
| **รวม** | **67.09 KB** |

ผ่านโดยใช้ 22.4% ของงบ เหลือที่ให้ฟีเจอร์รุ่นถัดไปอีกราว 233 KB

---

## รายละเอียด Test

### BDD scenario (56)

| ไฟล์ | จำนวน | ครอบอะไร |
|------|-------|----------|
| `src/shared/storage.spec.ts` | 7 | การอ่านเขียน localStorage, ข้อมูลเสียหาย, ที่เก็บเต็ม, export/import (FR6.1–FR6.4) |
| `src/shared/traceability.spec.ts` | 8 | สายเชื่อมโยงสองทิศทาง, การนับ, การหาของกำพร้า (FR4.1–FR4.5) |
| `src/shared/components/components.spec.tsx` | 11 | หัว column แสดงตัวอักษรไม่ใช่แค่สี, keyboard, label, dialog (NFR5, FR5.1, FR5.3) |
| `src/modules/requirements/requirements.spec.ts` | 12 | CRUD + กฎบังคับของ Requirement (FR1.1–FR1.7) |
| `src/modules/tasks/tasks.spec.ts` | 9 | CRUD + การบังคับผูก Requirement (FR2.1–FR2.7) |
| `src/modules/defects/defects.spec.ts` | 9 | CRUD + การบังคับประเภทและผูก Task (FR3.1–FR3.7) |

### การวัด NFR (10)

รายละเอียดวิธีวัดและข้อจำกัดอยู่ใน `performance-test-instructions.md`

| สิ่งที่วัด | งบ | วัดได้ |
|-----------|-----|-------|
| เขียน 1,500 รายการลง localStorage | 200 ms | 0.88 ms |
| ขนาดข้อมูล 1,500 รายการ | < 2.5 MB | 276.4 KB |
| `traceForward` × 500 | 200 ms | 8.14 ms |
| `traceBackward` × 500 | 200 ms | 2.03 ms |
| `findRequirementsWithoutTasks` | 200 ms | 0.05 ms |
| `countDefectsByType` | 200 ms | 0.04 ms |
| render Requirements board 500 การ์ด | 200 ms | 87.15 ms |
| render Tasks board 500 การ์ด | 200 ms | 67.64 ms |
| render Defects board 500 การ์ด | 200 ms | 69.16 ms |
| หัว column รวมนับได้ 500 รายการ | ครบ | ครบ |

ทุกการวัดยืนยันจำนวน element ที่ render จริงคู่กับตัวเลขเวลา — board ทั้งสาม render การ์ดครบ 500 ใบ

---

## ข้อผิดพลาดที่พบและแก้ในขั้นนี้

### 1. การวัดผลชุดแรกไม่มีความหมาย — render ได้ 0 การ์ด

**อาการ:** วัด render board 500 รายการได้ 2.43 ms ซึ่งเร็วเกินกว่าที่จะเป็นไปได้

**สาเหตุ:** เขียนข้อมูลทดสอบใน `beforeAll` แต่ `src/test-setup.ts` ล้าง localStorage ใน `beforeEach` ซึ่งลงทะเบียนไว้ก่อน จึงรันหลัง `beforeAll` และล้างข้อมูลทิ้งก่อน test เริ่ม board จึงว่างเปล่า

**ผลถ้าปล่อยไว้:** test ผ่านทุกข้อโดยไม่ได้วัดอะไรเลย ซึ่งผิด guardrail ของ Construction ที่ห้ามสร้าง test ที่ผ่านโดยไม่สนใจ implementation

**วิธีที่จับได้:** เอะใจกับตัวเลขที่เร็วเกินจริง แล้วเขียน probe นับ `.board-card` ที่ออกมาจริง ได้ 0

**แก้:** ย้ายการเขียนข้อมูลไป `beforeEach` และ **เพิ่ม assertion `expect(cards).toBe(500)` ในทุกการวัด** เพื่อให้การวัดที่ว่างเปล่าล้มทันทีในอนาคต ตัวเลขที่ถูกต้องหลังแก้คือ 67–87 ms

### 2. `traceForward` ถูกเรียกด้วย object แทน id

**อาการ:** `tsc --noEmit` รายงาน `TS2345: Argument of type 'Requirement' is not assignable to parameter of type 'string'` ที่ไฟล์วัดผล

**สาเหตุ:** signature รับ `requirementId: string` แต่ส่ง `Requirement` เข้าไป ตอน runtime ไม่ error เพราะ JavaScript เทียบ `task.requirementId === <object>` ได้เป็น false เฉยๆ การวัดจึงได้ตัวเลขที่ดูปกติแต่ไม่เคย match อะไรเลย

**แก้:** เปลี่ยนเป็น `traceForward(req.id, ...)` และเพิ่ม assertion ว่าค้นเจอจริง (`expect(sample.tasks.length).toBeGreaterThan(0)`) ตัวเลขที่ถูกต้องหลังแก้คือ 8.14 ms

**บทเรียนที่ตรงกันของทั้งสองข้อ:** ตัวเลขที่ดูดีเกินคาดคือสัญญาณให้ตรวจ ไม่ใช่ผลที่ควรรับไว้ ทั้งสองกรณีล้วนเป็นการวัดที่ผ่านเกณฑ์โดยไม่ได้ทำงานที่อ้างว่าวัด

---

## สิ่งที่ยังไม่ได้ตรวจในขั้นนี้

| NFR | สถานะ | ทำไม | ต้องทำอะไร |
|-----|-------|------|-----------|
| NFR1 (FCP ≤ 1.5s) | **ยังไม่วัด** | FCP เป็นเหตุการณ์ paint ที่ jsdom ไม่มี และยังไม่ได้ติดตั้ง Lighthouse | รัน Lighthouse ตาม `performance-test-instructions.md` |
| NFR2 ในเบราว์เซอร์จริง | **วัดบางส่วน** | วัดงาน JS แล้ว แต่ไม่รวม layout กับ paint | บันทึก Performance profile ใน DevTools |
| NFR4 (3 เบราว์เซอร์) | **ยังไม่วัด** | ต้องเปิดเบราว์เซอร์จริง | ทำรายการตรวจ 7 ข้อใน Chrome, Firefox, Safari |
| NFR5 contrast ratio | **วัดบางส่วน** | ส่วนที่ทดสอบด้วยโค้ดได้ผ่านแล้ว 11 scenario แต่ค่า contrast ยังไม่ได้วัดด้วยเครื่องมือ | ตรวจด้วย axe DevTools |

**ข้อควรระวังก่อนตัดสินใจ:** สี่ข้อนี้เป็น NFR ที่ยังไม่มีตัวเลขยืนยัน ไม่ควรถือว่าผ่านเพราะ "น่าจะผ่าน" — bundle 67 KB ทำให้ NFR1 มีโอกาสผ่านสูง แต่โอกาสสูงไม่ใช่หลักฐาน

---

## ไม่มี security test ในขั้นนี้ — เหตุผล

Test Strategy เป็น Minimal และไม่มี NFR ด้านความปลอดภัยใน `requirements.md` เลย เพราะรุ่นนี้**ตัดระบบยืนยันตัวตนออกโดยเจตนา** (ตัดสินใจไว้ที่ requirements-analysis คำถามข้อ 4) จึงไม่มี auth ที่จะทดสอบ ไม่มี endpoint ไม่มี input จากภายนอกระบบ และไม่มี secret ในโค้ด

ตรวจแล้วว่าไม่มี credential ฝังในโค้ด: ไม่มีไฟล์ `.env` ไม่มี API key และ dependency ทุกตัว pin เวอร์ชันเป๊ะ

**แต่สิ่งนี้ไม่ได้แปลว่าปลอดภัย — แปลว่าไม่มีการควบคุมการเข้าถึงเลย** ใครเปิดหน้าเว็บได้ก็แก้ลบข้อมูลของใครก็ได้ และกรอกชื่อคนอื่นเป็นผู้รับผิดชอบได้ (ความเสี่ยง R1) ข้อจำกัดนี้เขียนเตือนไว้ใน `README.md` และในตัว UI แล้ว **และเป็นเหตุผลที่ห้ามนำข้อมูลจากรุ่นนี้ไปคำนวณ KPI รายคน**

ถ้ารุ่นถัดไปเพิ่ม backend หรือ auth ขั้นนี้ต้องมี `security-test-instructions.md` จริง
