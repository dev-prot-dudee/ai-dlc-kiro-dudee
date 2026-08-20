# Cross-Unit Traceability — PM Tool MVP

**คำตัดสิน: ผ่าน** — ทุก requirement ที่ระบุไว้มีโค้ดรองรับหรือมีแผนตรวจที่ชัดเจน ไม่มีข้อใดหลุด

ตรวจเมื่อ 2026-08-20 ที่ขั้น build-and-test

ที่มา: `requirements.md` (รายการ ID ต้นทาง), `code-generation/traceability.json` (การจับคู่ ID กับไฟล์), `code-summary.md` (สิ่งที่ code-generation ทำและไม่ได้ทำ), `build-test-results.md` (ผลรันจริง)

---

## วิธีตรวจ

รอบนี้เป็น **zero-Unit** (scope `express` ข้ามขั้น units-generation) จึงไม่มี Unit ย่อย มีเพียงไฟล์ระดับ stage ที่ `construction/code-generation/traceability.json` — ไม่ใช่ N ไฟล์ตาม Unit อย่างที่ scope ใหญ่กว่าจะมี

การตรวจทำด้วยสคริปต์ ไม่ใช่การอ่านด้วยตา ขั้นตอน:

1. ดึงทุก `FR<n>.<m>` และ `NFR<n>` ที่ปรากฏใน `requirements.md` → ได้ **40 ID**
2. ตรวจว่าขั้น user-stories รันหรือไม่ → **ไม่รัน** (`inception/user-stories/stories.md` ไม่มีอยู่) จึงไม่มี `AC` สามส่วนให้ตรวจ
3. จับคู่ทุก ID กับรายการใน `traceability.json`
4. สำหรับทุกรายการที่สถานะ `OK` ตรวจว่าไฟล์ target **มีอยู่จริงบนดิสก์**

## ผลการตรวจ

| การตรวจ | ผล |
|---------|-----|
| ID ใน `requirements.md` | 40 |
| ครอบด้วยสถานะ `OK` | **36** |
| ยกไปขั้นถัดไป (`Deferred`) | **4** |
| ID ที่ไม่ถูกครอบเลย | **0** |
| รายการ `OK` ที่ไฟล์ target หาย | **0** |
| รายการใน `traceability.json` ที่ไม่มีใน `requirements.md` | **0** |

ไม่มีข้อค้นพบที่ต้องแก้ ไม่มี ID กำพร้าทั้งสองทิศทาง — ไม่มี requirement ที่ไม่มีโค้ด และไม่มีรายการใน traceability ที่อ้าง requirement ที่ไม่มีจริง

---

## สี่ข้อที่ยกไปขั้นถัดไป และความคืบหน้าในขั้นนี้

`code-generation` ตั้งสถานะ NFR1–NFR4 เป็น `Deferred` เพราะวัดด้วยโค้ดไม่ได้ในขั้นนั้น ขั้นนี้ผลักไปได้สองข้อ

| ID | เกณฑ์ | สถานะหลังขั้นนี้ | หลักฐาน |
|----|------|----------------|---------|
| **NFR1** | FCP ≤ 1.5 วินาที | **ยังไม่มีหลักฐาน** | วัดใน jsdom ไม่ได้เลยเพราะไม่มี paint และยังไม่ได้ติดตั้ง Lighthouse · bundle 67 KB ทำให้มีโอกาสผ่านสูงแต่ยังไม่ใช่หลักฐาน |
| **NFR2** | ตอบสนอง ≤ 200 ms | **วัดแล้วบางส่วน — ผ่านในส่วนที่วัดได้** | งาน JS ทั้งหมดวัดจริง: ตรรกะ 0.04–8.14 ms, render board 500 การ์ด 67–87 ms · ยังไม่รวม layout กับ paint |
| **NFR3** | รองรับ 500 รายการต่อ entity | **วัดแล้ว — ผ่าน** | เขียนอ่าน 1,500 รายการครบไม่หาย ใช้ 276 KB จากเพดาน ~5 MB · board render การ์ดครบ 500 ใบทั้งสาม module |
| **NFR4** | Chrome, Firefox, Safari | **ยังไม่มีหลักฐาน** | ต้องเปิดเบราว์เซอร์จริง มีรายการตรวจ 7 ข้อเตรียมไว้ใน `build-instructions.md` |

**สิ่งที่ต้องพูดตรงๆ ที่ประตูอนุมัติ:** NFR1 และ NFR4 ยังไม่มีตัวเลขยืนยันแม้แต่ตัวเดียว ทั้งสองข้อต้องทำด้วยมือในเบราว์เซอร์ ผมทำแทนไม่ได้จากที่นี่ ถ้าจะ deploy รุ่นนี้ให้คนอื่นใช้ ควรทำสองข้อนี้ก่อน — โดยเฉพาะ NFR4 บน Safari เพราะ Safari จำกัด localStorage เข้มกว่าเบราว์เซอร์อื่นและระบบนี้พึ่ง localStorage ทั้งหมด

---

## ตารางเต็มทั้ง 40 ID

| ID | สถานะ | เจ้าของ | ไฟล์หรือแผนตรวจ |
|----|-------|--------|----------------|
| `FR1.1` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/RequirementForm.tsx` |
| `FR1.2` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/requirements.repo.ts` |
| `FR1.3` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/requirements.repo.ts` |
| `FR1.4` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/RequirementBoard.tsx` |
| `FR1.5` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/repository.ts` |
| `FR1.6` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/components/ConfirmDialog.tsx` |
| `FR1.7` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/traceability.ts` |
| `FR2.1` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/tasks/TaskForm.tsx` |
| `FR2.2` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/tasks/tasks.repo.ts` |
| `FR2.3` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/tasks/tasks.repo.ts` |
| `FR2.4` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/tasks/TaskBoard.tsx` |
| `FR2.5` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/repository.ts` |
| `FR2.6` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/tasks/TaskBoard.tsx` |
| `FR2.7` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/traceability.ts` |
| `FR3.1` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/defects/DefectForm.tsx` |
| `FR3.2` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/defects/defects.repo.ts` |
| `FR3.3` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/defects/defects.repo.ts` |
| `FR3.4` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/defects/defects.repo.ts` |
| `FR3.5` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/defects/DefectBoard.tsx` |
| `FR3.6` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/repository.ts` |
| `FR3.7` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/components/BoardColumn.tsx` |
| `FR4.1` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/traceability.ts` |
| `FR4.2` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/traceability.ts` |
| `FR4.3` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/RequirementBoard.tsx` |
| `FR4.4` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/RequirementBoard.tsx` |
| `FR4.5` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/tasks/TaskBoard.tsx` |
| `FR5.1` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/components/UserPicker.tsx` |
| `FR5.2` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/DataContext.tsx` |
| `FR5.3` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/users.ts` |
| `FR6.1` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/storage.ts` |
| `FR6.2` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/storage.ts` |
| `FR6.3` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/components/ErrorBoundary.tsx` |
| `FR6.4` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/storage.ts` |
| `NFR1` | ⏸️ ยกไปขั้นถัดไป | code-generation (stage-level, zero-Unit) | `วัดด้วย Lighthouse ในขั้น Build and Test — ยังไม่มี automated test` |
| `NFR2` | ⏸️ ยกไปขั้นถัดไป | code-generation (stage-level, zero-Unit) | `วัดด้วย Performance API ที่ข้อมูล 500 รายการ ในขั้น Build and Test` |
| `NFR3` | ⏸️ ยกไปขั้นถัดไป | code-generation (stage-level, zero-Unit) | `สร้างข้อมูลทดสอบ 500 รายการแล้ววัด ในขั้น Build and Test` |
| `NFR4` | ⏸️ ยกไปขั้นถัดไป | code-generation (stage-level, zero-Unit) | `ทดสอบข้ามเบราว์เซอร์ด้วยมือ ในขั้น Build and Test` |
| `NFR5` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/shared/components/components.spec.tsx` |
| `NFR6` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `src/modules/requirements/requirements.spec.ts` |
| `NFR7` | ✅ ผ่าน | code-generation (stage-level, zero-Unit) | `vite.config.ts` |

---

## ข้อสังเกตเรื่องคุณภาพของการจับคู่

ตารางข้างบนบอกว่า "ID นี้มีไฟล์ไหนรองรับ" ซึ่ง**ไม่เท่ากับ**ว่า "ID นี้ทำงานถูกต้อง" สองอย่างนี้ต่างกันและไม่ควรสับสน

หลักฐานที่หนักกว่าคือ 56 BDD scenario ที่ตั้งชื่ออ้าง FR id ไว้ในตัวชื่อ เช่น `การสร้าง Requirement (FR1.1)` ทำให้ตามรอยจาก test กลับไปหา requirement ได้ตรงๆ และ scenario เหล่านั้นรันผ่านทั้งหมด — นั่นคือหลักฐานเชิงพฤติกรรม ส่วนตารางนี้เป็นหลักฐานเชิงโครงสร้าง

จุดที่ตารางนี้อ่อนที่สุดคือรายการที่ target ชี้ไปยังไฟล์ที่ครอบหลาย ID เช่น `src/shared/repository.ts` รองรับ FR1.5, FR2.5 และ FR3.6 พร้อมกัน (การยืนยันก่อนลบของทั้งสาม entity) การที่ไฟล์มีอยู่จึงยืนยันแค่ว่ากลไกกลางมีอยู่ ไม่ได้ยืนยันว่าทั้งสาม module ต่อกับมันถูก — สิ่งที่ยืนยันเรื่องนั้นคือ scenario ในแต่ละ module ที่รันผ่าน
