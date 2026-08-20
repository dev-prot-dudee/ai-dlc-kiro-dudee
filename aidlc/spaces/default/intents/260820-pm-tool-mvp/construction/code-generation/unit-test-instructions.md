# Unit Test Instructions — PM Tool MVP

**Stage:** code-generation · **Test Strategy:** Minimal · **Methodology:** BDD (scenario-first)
**Unit:** ไม่มี (zero-Unit — express scope)

---

## Test framework และการตั้งค่า

| ส่วนประกอบ | เครื่องมือ | เหตุผล |
|-----------|----------|--------|
| Test runner | **Vitest** | ใช้ config และ transform เดียวกับ Vite ไม่ต้องตั้ง build pipeline ซ้ำ |
| DOM environment | **jsdom** | จำเป็นเพราะทดสอบ React component และ localStorage |
| Component testing | **@testing-library/react** | ทดสอบจากมุมผู้ใช้ ไม่ผูกกับ implementation ภายใน |
| User interaction | **@testing-library/user-event** | จำลองการกด/พิมพ์ที่ใกล้เคียงผู้ใช้จริงกว่า fireEvent |
| Assertion เสริม | **@testing-library/jest-dom** | matcher อย่าง `toBeVisible`, `toHaveAccessibleName` |

ไฟล์ตั้งค่าที่ต้องมี:
- `vitest.config.ts` — `environment: "jsdom"`, `setupFiles: ["./src/test-setup.ts"]`
- `src/test-setup.ts` — import `@testing-library/jest-dom`, และล้าง `localStorage` ก่อนทุก test

```ts
// src/test-setup.ts
import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

beforeEach(() => {
  localStorage.clear();
});
```

การล้าง `localStorage` ก่อนทุก test เป็นเรื่องบังคับ ไม่ใช่ทางเลือก — รอบนี้ localStorage เป็นที่เก็บข้อมูลจริง ถ้าไม่ล้าง test จะรบกวนกันเองและผลจะเปลี่ยนตามลำดับการรัน

---

## คำสั่งรัน test

**คำสั่งที่ต้องยืนยันว่ารันได้ก่อนเขียน scenario แรก** (Step 2 ของแผน):

```bash
npx vitest run src/shared src/modules
```

คำสั่งนี้ระบุ path ชัดเจนตามข้อกำหนดของ stage ที่ห้ามใช้คำสั่งกว้างอย่าง `npm test` เปล่าๆ

คำสั่งย่อยระหว่างพัฒนา:

```bash
# เฉพาะ shared layer
npx vitest run src/shared

# เฉพาะ module ของทีมตัวเอง
npx vitest run src/modules/requirements
npx vitest run src/modules/tasks
npx vitest run src/modules/defects

# โหมด watch ระหว่างเขียน scenario (BDD loop)
npx vitest watch src/modules/requirements

# ดู coverage
npx vitest run src/shared src/modules --coverage
```

---

## ลำดับการทำงานตาม BDD

Testing Contract กำหนด methodology เป็น `bdd` โดย ordering ระบุว่า *"Define executable behavior scenarios before implementing each observable feature slice."*

ในทางปฏิบัติของรอบนี้ แต่ละ slice ทำตามลำดับนี้:

1. **เขียน scenario ที่รันได้** ในไฟล์ `.spec.ts` ของ slice นั้น โดยเขียนจากมุมผู้ใช้ ไม่ใช่จากมุมโครงสร้างภายใน
2. **รัน scenario แล้วต้องเห็นว่าไม่ผ่าน** — ถ้าผ่านตั้งแต่ยังไม่ implement แปลว่า scenario ไม่ได้ทดสอบอะไรจริง ต้องเขียนใหม่
3. **implement ครบทุก layer ที่ slice นั้นต้องใช้** (data → repository → business → UI) ไม่ใช่ทำทีละ layer แล้วเขียน test ต่อ layer
4. **รัน scenario จนผ่าน**
5. **refactor ขณะที่ scenario ยังเขียว**

**ข้อสำคัญ:** BDD ในที่นี้คือ scenario-first ระดับ feature slice ไม่ใช่ TDD ระดับ layer อย่าแตก scenario ออกเป็น unit test ต่อ layer เพราะจะกลายเป็น TDD ซึ่งไม่ตรงกับ contract ที่อนุมัติไว้

### รูปแบบการตั้งชื่อ scenario

เขียนชื่อให้อ่านเป็นพฤติกรรม และอ้าง FR ID เพื่อ traceability:

```ts
describe("Requirement Management", () => {
  describe("การสร้าง Requirement (FR1.1)", () => {
    it("เมื่อกรอกข้อมูลครบและกดบันทึก Requirement ใหม่ต้องปรากฏในรายการ", async () => {
      // Given — ยังไม่มี Requirement ในระบบ
      // When  — กรอกฟอร์มและกดบันทึก
      // Then  — เห็นรายการใหม่พร้อมข้อมูลที่กรอก
    });
  });

  describe("การบังคับระบุประเภท (FR1.2)", () => {
    it("เมื่อกดบันทึกโดยไม่เลือกประเภท ระบบต้องปฏิเสธและแจ้งเหตุผล", async () => {
      // ...
    });
  });
});
```

---

## เป้าหมายความครอบคลุม

Minimal strategy — ไม่มีเกณฑ์ coverage เป็นเปอร์เซ็นต์ (เกณฑ์ 80% เป็นของ scope `mvp`/`feature`/`enterprise` ไม่ใช่ `express`) แต่มีเกณฑ์เชิงจำนวนที่ต้องผ่าน:

| เกณฑ์ | เป้าหมาย |
|-------|---------|
| test ต่อ requirement | อย่างน้อย 1 scenario ต่อ 1 FR ที่ทดสอบได้ |
| happy-path floor | อย่างน้อย 1 test ต่อ 1 component |
| จำนวนรวมที่วางแผนไว้ | 41 scenario |
| suite เดิม | ต้องเขียวทั้งหมด (รอบนี้เป็น greenfield จึงยังไม่มี suite เดิม) |

FR ที่ต้องมี scenario ครอบทุกข้อ: FR1.1–FR1.7, FR2.1–FR2.7, FR3.1–FR3.7, FR4.1–FR4.5, FR5.1–FR5.3, FR6.1–FR6.4

---

## แนวทาง mocking และ stubbing

**หลักการ: mock ให้น้อยที่สุด** รอบนี้ไม่มี network call ไม่มี API ไม่มี service ภายนอก ดังนั้นแทบไม่มีอะไรต้อง mock

| สิ่งที่ทดสอบ | วิธี | เหตุผล |
|-------------|-----|--------|
| `localStorage` ปกติ | **ใช้ของจริง** ที่ jsdom ให้มา ไม่ต้อง mock | jsdom มี localStorage ที่ทำงานจริง การ mock จะทำให้ test ไม่ได้ทดสอบพฤติกรรมจริง |
| `localStorage` โควตาเต็ม (FR6.4) | mock `Storage.prototype.setItem` ให้ throw `QuotaExceededError` เฉพาะ test นั้น | เขียนข้อมูลจนเต็มจริงช้าและไม่แน่นอนข้ามเบราว์เซอร์ |
| `localStorage` ข้อมูลเสียหาย (FR6.3) | เขียน string ที่ parse ไม่ได้ลงไปตรงๆ ด้วย `localStorage.setItem` | ไม่ต้อง mock — สร้างสภาพเสียหายจริงได้เลย |
| การสร้าง id | inject function สร้าง id เข้า repository หรือ mock `crypto.randomUUID` | ให้ test ตรวจค่าที่แน่นอนได้ ไม่ต้องเดา |
| วันเวลา | inject clock หรือใช้ `vi.setSystemTime` | ให้ test ที่เกี่ยวกับ timestamp ได้ผลเดิมทุกครั้ง |

**สิ่งที่ห้าม mock:** repository ของตัวเองเมื่อทดสอบ component — ให้ใช้ repository จริงที่คุยกับ localStorage ของ jsdom เพราะการ mock repository จะทำให้ test ผ่านแม้ repository พัง

---

## การจัดการข้อมูลทดสอบ

สร้าง factory function ไว้ที่ `src/shared/test-factories.ts` เพื่อไม่ให้แต่ละ test เขียนข้อมูลตั้งต้นซ้ำกัน:

```ts
export function makeRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: "req-1",
    title: "ผู้ใช้ต้องเข้าสู่ระบบได้",
    description: "",
    category: "Functional",
    priority: "Should",
    ownerId: "user-1",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
```

กฎการใช้: ทุก test ระบุเฉพาะ field ที่เกี่ยวกับสิ่งที่ตัวเองทดสอบ ผ่าน `overrides` ที่เหลือให้ factory เติม เพื่อให้อ่าน test แล้วเห็นทันทีว่าอะไรคือตัวแปรของ test นั้น

**ห้ามแชร์ข้อมูลระหว่าง test** — `beforeEach` ล้าง localStorage อยู่แล้ว แต่ห้ามใช้ตัวแปร module-level ที่ test หนึ่งแก้แล้วอีก test เห็นค่าที่แก้

---

## เกณฑ์ผ่านของขั้นนี้

- [ ] คำสั่ง `npx vitest run src/shared src/modules` รันได้และผ่านทั้งหมด
- [ ] มี scenario ครอบทุก FR ที่ระบุไว้ข้างบน
- [ ] `npx tsc --noEmit` ไม่มี error
- [ ] `npx eslint src` ไม่มี error
- [ ] ไม่มี test ที่ผ่านโดยไม่ตรวจอะไร (เช่น `expect(true).toBe(true)`)
