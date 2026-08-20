# Build Instructions — PM Tool MVP

เอกสารนี้บอกวิธี build โปรเจกต์นี้จากเครื่องเปล่าให้ได้ไฟล์ที่ใช้งานจริง

ที่มา: `code-generation-plan.md` (ขั้นตอนและ config ที่ตกลงไว้), `code-summary.md` (ผลตรวจและขนาด bundle จริง), `unit-test-instructions.md` (คำสั่งรัน test ที่ build ต้องผ่านคู่กัน)

---

## ข้อกำหนดก่อนเริ่ม

| สิ่งที่ต้องมี | เวอร์ชัน | ตรวจด้วย |
|--------------|---------|---------|
| Node.js | 18 ขึ้นไป | `node --version` |
| npm | 9 ขึ้นไป | `npm --version` |

**ไม่ต้องมี:** ฐานข้อมูล, Docker, service ภายนอก, environment variable, ไฟล์ config ที่ต้องสร้างเอง, credential หรือ secret ใดๆ

โปรเจกต์นี้เป็น frontend ล้วน เก็บข้อมูลใน `localStorage` ของเบราว์เซอร์ (constraint C1) จึงไม่มีขั้นตอนตั้งค่าสภาพแวดล้อมเลย ถ้าเจอเอกสารที่บอกให้สร้าง `.env` แปลว่าเอกสารนั้นไม่ใช่ของรุ่นนี้

**หมายเหตุเรื่อง Node 25:** โปรเจกต์รันได้บน Node 25 แต่ Node 25 มี `localStorage` global แบบ experimental ที่บดทับของ jsdom ตอนรัน test `src/test-setup.ts` จัดการเรื่องนี้ไว้แล้ว จึงไม่ต้องทำอะไรเพิ่ม รายละเอียดอยู่ใน `code-summary.md` ข้อ 2

---

## ขั้นตอน build

### 1. ติดตั้ง dependency

```bash
npm install
```

เวอร์ชันของ dependency ทุกตัวถูก pin ไว้แบบเป๊ะใน `package.json` (ไม่มี `^` หรือ `~`) เพื่อให้ทุกคนใน 12 คนได้ของชุดเดียวกัน `package-lock.json` ต้อง commit เข้า repo ด้วย

ใน CI ใช้ `npm ci` แทนเพื่อบังคับให้ตรงกับ lock file:

```bash
npm ci
```

### 2. Build

```bash
npm run build
```

คำสั่งนี้ทำสองอย่างต่อกัน — `tsc --noEmit` ตรวจ type ก่อน แล้วจึง `vite build` ถ้า type ผิด build จะหยุดทันทีและไม่มีไฟล์ออกมา เจตนาคือไม่ให้โค้ดที่ type ไม่ผ่านหลุดไปถึงผู้ใช้

ผลลัพธ์ออกที่ `dist/`

### 3. ตรวจว่า build ใช้ได้จริง

```bash
npm run preview
```

เปิด URL ที่แสดง (ปกติ http://localhost:4173) แล้วตรวจด้วยตา:

- [ ] หน้าแรกเปิดขึ้นและ redirect ไปที่ `/requirements`
- [ ] sidebar แสดง 3 module พร้อมตัวเลขนับ
- [ ] สร้าง Requirement ได้ 1 ตัว
- [ ] refresh หน้าแล้วข้อมูลยังอยู่ (ยืนยันว่า localStorage ทำงาน)
- [ ] สลับไปหน้า Tasks แล้วสร้าง Task ที่ผูกกับ Requirement นั้นได้
- [ ] สลับไปหน้า Defects แล้วสร้าง Defect ที่ผูกกับ Task นั้นได้
- [ ] กด Export ได้ไฟล์ JSON ที่มีข้อมูลทั้ง 3 ตัว

---

## โหมดพัฒนา

```bash
npm run dev
```

เปิด http://localhost:5173 มี hot reload ให้ ไม่ต้อง build ใหม่ทุกครั้งที่แก้โค้ด

**ข้อควรระวังเมื่อ 3 ทีมทำงานพร้อมกัน:** dev server ใช้ port 5173 ถ้ารันหลายคนบนเครื่องเดียวกัน Vite จะเลื่อน port เอง แต่ **`localStorage` แยกตาม origin** ดังนั้น port ต่างกันคือข้อมูลแยกกัน ถ้าทดสอบแล้วข้อมูลหาย ให้ดูก่อนว่าเปิด port เดิมอยู่หรือไม่

---

## เกณฑ์ที่ build ต้องผ่าน

ทั้ง 4 คำสั่งต้องผ่านก่อน merge เข้า `main` ตาม trunk-based development ที่ org กำหนด

```bash
npm test        # 56 test ต้องผ่านทั้งหมด
npm run typecheck
npm run lint
npm run build
```

**ขนาดไฟล์ที่ส่งถึงผู้ใช้ (NFR7 — เกณฑ์ ≤ 300 KB gzip)**

วัดจากบรรทัดที่ `vite build` พิมพ์ออกมาช่อง gzip เอา JS + CSS + HTML รวมกัน ค่าที่วัดได้ล่าสุดคือ **67.09 KB** ถ้าตัวเลขนี้ขึ้นเกิน 300 KB ให้ถือว่า build ไม่ผ่านและหาสาเหตุก่อน merge สาเหตุที่พบบ่อยคือมีคนเพิ่ม library ใหญ่เข้ามา — ตรวจด้วย:

```bash
npx vite build 2>&1 | grep gzip
```

---

## ปัญหาที่เจอบ่อยและวิธีแก้

### `localStorage.clear is not a function` ตอนรัน test

Node 25 มี `localStorage` global ที่พังเมื่อไม่ระบุ `--localstorage-file` และมันบดทับของ jsdom

**แก้:** ตรวจว่า `vitest.config.ts` มี `setupFiles: ["./src/test-setup.ts"]` อยู่ และไฟล์นั้นยังมี `MemoryStorage` อยู่ครบ ห้ามลบออก

**อย่าแก้ด้วยการ** ตั้ง `NODE_OPTIONS=--localstorage-file=...` เพราะจะทำให้ test แต่ละตัวใช้ไฟล์ร่วมกันและปนกัน

### test เขียน spy บน `Storage.prototype` แล้วไม่ทำงาน

`MemoryStorage` ไม่ได้สืบทอดจาก `Storage.prototype` ต้อง spy บน object จริง:

```ts
vi.spyOn(localStorage, "setItem")     // ถูก
vi.spyOn(Storage.prototype, "setItem") // ไม่ทำงานในโปรเจกต์นี้
```

### `error TS2578: Unused '@ts-expect-error' directive`

`tsconfig` เปิด strict ครบทุก flag เมื่อโค้ดที่คาดว่าจะ error กลับไม่ error แล้ว TypeScript จะรายงาน directive ที่ไม่จำเป็น

**แก้:** ลบ `@ts-expect-error` บรรทัดนั้นออก ไม่ใช่ปิด flag

### `'_id' is assigned a value but never used`

เกิดจาก pattern การตัด field ออกด้วย rest destructuring ใน `repository.ts`

**แก้:** `.eslintrc.cjs` ต้องมี `ignoreRestSiblings: true` ในกฎ `@typescript-eslint/no-unused-vars` อยู่แล้ว ถ้าใครลบออกให้ใส่กลับ

### build ผ่านแต่หน้าขาวเมื่อเปิด

เปิด console ของเบราว์เซอร์ดูก่อน ถ้าเป็นข้อมูลใน localStorage เสียหาย `ErrorBoundary` ควรแสดงข้อความและปุ่มล้างข้อมูลให้ (FR6.3) ถ้าเห็นหน้าขาวเปล่าจริงๆ แปลว่า error เกิดก่อน React mount — ตรวจว่า `index.html` ยังมี `<div id="root">` อยู่

### `npm install` ล้มเพราะ peer dependency ขัดกัน

เวอร์ชันทุกตัว pin ไว้และทดสอบแล้วว่าเข้ากันได้ ถ้าเจอปัญหานี้แปลว่ามีคนแก้เวอร์ชันใน `package.json` ให้ `git diff package.json` ดูก่อน อย่าแก้ด้วย `--legacy-peer-deps` เพราะจะซ่อนปัญหาไว้
