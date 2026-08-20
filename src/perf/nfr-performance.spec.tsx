import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { STORAGE_KEYS, readCollection, writeCollection } from "../shared/storage";
import {
  countDefectsByType,
  findRequirementsWithoutTasks,
  traceBackward,
  traceForward,
} from "../shared/traceability";
import { makeDefect, makeRequirement, makeTask } from "../shared/test-factories";
import { DataProvider } from "../shared/DataContext";
import { RequirementBoard } from "../modules/requirements/RequirementBoard";
import { TaskBoard } from "../modules/tasks/TaskBoard";
import { DefectBoard } from "../modules/defects/DefectBoard";
import {
  DEFECT_TYPES,
  PRIORITIES,
  ROLES,
  SEVERITIES,
  type Defect,
  type Requirement,
  type Task,
} from "../shared/types";

/**
 * การวัดผล NFR2 (ตอบสนอง ≤ 200ms) และ NFR3 (รองรับ 500 รายการต่อ entity)
 *
 * ข้อจำกัดที่ต้องรู้ก่อนอ่านตัวเลข: การวัดนี้รันบน jsdom ไม่ใช่เบราว์เซอร์จริง
 * jsdom ไม่มี layout engine และไม่มี paint จึงวัด "งานฝั่ง JavaScript" ได้
 * แต่วัดเวลาที่ผู้ใช้เห็นภาพเปลี่ยนไม่ได้ ตัวเลขที่ได้จึงเป็นขอบล่างของเวลาจริง
 * ไม่ใช่ค่าที่ผู้ใช้จะเจอ ใช้ยืนยันว่าไม่มีอัลกอริทึมที่ระเบิดตามจำนวนข้อมูล
 * (เช่นการวนซ้อนที่กลายเป็น O(n²)) ซึ่งเป็นความเสี่ยงหลักที่ระดับ 500 รายการ
 *
 * เกณฑ์ที่ตั้งไว้ในการวัดนี้ผ่อนกว่า NFR จริงไม่ได้ แต่เข้มกว่าได้ เพราะถ้า
 * งาน JS ล้วนยังเกิน 200ms แล้ว ในเบราว์เซอร์จริงย่อมเกินแน่นอน
 */

const N = 500;
const BUDGET_MS = 200;

let requirements: Requirement[];
let tasks: Task[];
let defects: Defect[];

/** วัดเวลาโดยรันซ้ำแล้วเอาค่ากลาง เพื่อลดผลของ GC และ JIT warm-up */
function measure(label: string, fn: () => void, runs = 5): number {
  fn(); // warm-up ไม่นับผล
  const samples: number[] = [];
  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(samples.length / 2)] ?? 0;
  // eslint-disable-next-line no-console
  console.warn(`  [วัดผล] ${label}: ${median.toFixed(2)} ms (กลางจาก ${runs} ครั้ง)`);
  return median;
}

beforeAll(() => {
  // สร้างข้อมูล 500 รายการต่อ entity ที่เชื่อมโยงกันจริง ไม่ใช่ข้อมูลลอยๆ
  // เพื่อให้ตรรกะสายเชื่อมโยงต้องทำงานเต็มที่
  requirements = Array.from({ length: N }, (_, i) =>
    makeRequirement({
      id: `req-${i}`,
      title: `Requirement ลำดับที่ ${i}`,
      priority: PRIORITIES[i % PRIORITIES.length]!,
    }),
  );
  tasks = Array.from({ length: N }, (_, i) =>
    makeTask({
      id: `task-${i}`,
      title: `Task ลำดับที่ ${i}`,
      // กระจาย task ไปยัง requirement คนละตัว ยกเว้นบางส่วนที่กองที่ตัวเดียว
      // เพื่อให้มี requirement ที่ไม่มี task ด้วย (ทดสอบ FR4.3 ที่ปริมาณจริง)
      requirementId: `req-${i % 400}`,
      role: ROLES[i % ROLES.length]!,
    }),
  );
  defects = Array.from({ length: N }, (_, i) =>
    makeDefect({
      id: `defect-${i}`,
      title: `Defect ลำดับที่ ${i}`,
      taskId: `task-${i % 450}`,
      type: DEFECT_TYPES[i % DEFECT_TYPES.length]!,
      severity: SEVERITIES[i % SEVERITIES.length]!,
    }),
  );
});

/**
 * เขียนข้อมูลลงที่เก็บใน beforeEach ไม่ใช่ beforeAll
 *
 * `src/test-setup.ts` ล้าง localStorage ใน beforeEach ซึ่งลงทะเบียนไว้ก่อน hook
 * ของไฟล์นี้ จึงรันก่อนเสมอ ถ้าเขียนข้อมูลใน beforeAll ข้อมูลจะถูกล้างทิ้งก่อน
 * test เริ่ม แล้วการวัดจะกลายเป็นการวัด board ที่ว่างเปล่า — ผ่านทุกครั้งโดย
 * ไม่ได้วัดอะไร ซึ่งเป็นสิ่งที่ guardrail ของ Construction ห้ามไว้ตรงๆ
 */
beforeEach(() => {
  writeCollection(STORAGE_KEYS.requirements, requirements);
  writeCollection(STORAGE_KEYS.tasks, tasks);
  writeCollection(STORAGE_KEYS.defects, defects);
});

describe("NFR3 — รองรับข้อมูล 500 รายการต่อ entity", () => {
  it("เขียนและอ่าน 500 รายการต่อ entity ผ่าน localStorage ได้ครบไม่หาย", () => {
    const elapsed = measure("เขียน 1,500 รายการลง localStorage", () => {
      writeCollection(STORAGE_KEYS.requirements, requirements);
      writeCollection(STORAGE_KEYS.tasks, tasks);
      writeCollection(STORAGE_KEYS.defects, defects);
    });

    expect(readCollection<Requirement>(STORAGE_KEYS.requirements)).toHaveLength(N);
    expect(readCollection<Task>(STORAGE_KEYS.tasks)).toHaveLength(N);
    expect(readCollection<Defect>(STORAGE_KEYS.defects)).toHaveLength(N);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("ข้อมูล 1,500 รายการต้องไม่ชนเพดาน 5 MB ของ localStorage", () => {
    const bytes = new Blob([
      JSON.stringify(requirements),
      JSON.stringify(tasks),
      JSON.stringify(defects),
    ]).size;
    // eslint-disable-next-line no-console
    console.warn(`  [วัดผล] ขนาดข้อมูล 1,500 รายการ: ${(bytes / 1024).toFixed(1)} KB`);
    // เพดานจริงของเบราว์เซอร์อยู่ราว 5 MB ต่อ origin ตั้งเกณฑ์ที่ครึ่งหนึ่ง
    // เพื่อเหลือที่ให้ field ที่จะเพิ่มในรุ่นถัดไป
    expect(bytes).toBeLessThan(2.5 * 1024 * 1024);
  });
});

describe("NFR2 — ตรรกะสายเชื่อมโยงที่ 500 รายการต้องอยู่ในงบ 200 ms", () => {
  it("traceForward ทุก requirement (กรณีหนักสุด 500 ครั้ง) ต้องไม่เกินงบ", () => {
    const elapsed = measure("traceForward × 500", () => {
      for (const req of requirements) {
        traceForward(req.id, tasks, defects);
      }
    });
    // ยืนยันว่าค้นเจอจริง ไม่ใช่เร็วเพราะไม่ match อะไรเลย
    const sample = traceForward("req-0", tasks, defects);
    expect(sample.tasks.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("traceBackward ทุก defect (500 ครั้ง) ต้องไม่เกินงบ", () => {
    const elapsed = measure("traceBackward × 500", () => {
      for (const defect of defects) {
        traceBackward(defect, tasks, requirements);
      }
    });
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("การหา requirement ที่ยังไม่มี task ต้องไม่เกินงบ (FR4.3)", () => {
    const elapsed = measure("findRequirementsWithoutTasks", () => {
      findRequirementsWithoutTasks(requirements, tasks);
    });
    // ยืนยันว่าคำนวณถูกด้วย ไม่ใช่เร็วเพราะไม่ทำงาน
    expect(findRequirementsWithoutTasks(requirements, tasks)).toHaveLength(100);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("การนับ defect แยกตามประเภทต้องไม่เกินงบ (FR3.7)", () => {
    const elapsed = measure("countDefectsByType", () => {
      countDefectsByType(defects);
    });
    const counts = countDefectsByType(defects);
    expect(Object.values(counts).reduce((sum, n) => sum + n, 0)).toBe(N);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });
});

describe("NFR2 — การ render board ที่ 500 รายการ", () => {
  /**
   * วัดเวลา render พร้อมยืนยันจำนวนการ์ดที่ออกมาจริง
   *
   * การยืนยันจำนวนสำคัญกว่าตัวเลขเวลา เพราะ board ที่ render ศูนย์การ์ดจะเร็ว
   * เสมอและผ่านเกณฑ์เวลาทุกครั้งโดยไม่ได้พิสูจน์อะไร
   */
  function measureBoard(label: string, element: React.ReactElement): void {
    const first = render(
      <MemoryRouter>
        <DataProvider>{element}</DataProvider>
      </MemoryRouter>,
    );
    const cards = first.container.querySelectorAll(".board-card").length;
    // eslint-disable-next-line no-console
    console.warn(`  [ตรวจ] ${label} render การ์ดได้ ${cards} ใบ`);
    expect(cards).toBe(N);
    first.unmount();

    const elapsed = measure(
      label,
      () => {
        const view = render(
          <MemoryRouter>
            <DataProvider>{element}</DataProvider>
          </MemoryRouter>,
        );
        view.unmount();
      },
      3,
    );
    expect(elapsed).toBeLessThan(BUDGET_MS);
  }

  it("Requirements board ต้อง render การ์ดครบ 500 ใบ และอยู่ในงบ", () => {
    measureBoard("render RequirementBoard 500 รายการ", <RequirementBoard />);
  });

  it("Tasks board ต้อง render การ์ดครบ 500 ใบ และอยู่ในงบ", () => {
    measureBoard("render TaskBoard 500 รายการ", <TaskBoard />);
  });

  it("Defects board ต้อง render การ์ดครบ 500 ใบ และอยู่ในงบ", () => {
    measureBoard("render DefectBoard 500 รายการ", <DefectBoard />);
  });

  it("หัว column ต้องแสดงจำนวนรวมได้ครบ 500 รายการ (FR3.7 ที่ปริมาณจริง)", () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <DefectBoard />
        </DataProvider>
      </MemoryRouter>,
    );
    const counts = Array.from(document.querySelectorAll(".board-column__count")).map(
      (node) => Number(node.textContent),
    );
    expect(counts).toHaveLength(DEFECT_TYPES.length);
    expect(counts.reduce((sum, n) => sum + n, 0)).toBe(N);
  });
});
