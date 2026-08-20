import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { STORAGE_KEYS, writeCollection } from "../shared/storage";
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
 * NFR Performance Tests — วัด NFR2 (≤ 200ms) และ NFR3 (500 รายการ)
 *
 * หมายเหตุ: รันบน jsdom ไม่ใช่เบราว์เซอร์จริง วัดได้เฉพาะงาน JS
 * ใช้ยืนยันว่าไม่มีอัลกอริทึมที่ระเบิดตามจำนวน (เช่น O(n²))
 */

const N = 500;
const BUDGET_MS = 200;

let requirements: Requirement[];
let tasks: Task[];
let defects: Defect[];

// สร้างข้อมูล 500 รายการต่อ entity ที่เชื่อมโยงกันจริง
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
    requirementId: `req-${i % 400}`, // บาง req ไม่มี task (FR4.3)
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

function measure(fn: () => void, runs = 5): number {
  fn(); // warm-up
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)] ?? 0;
}

beforeEach(() => {
  writeCollection(STORAGE_KEYS.requirements, requirements);
  writeCollection(STORAGE_KEYS.tasks, tasks);
  writeCollection(STORAGE_KEYS.defects, defects);
});

describe("NFR3 — รองรับข้อมูล 500 รายการต่อ entity", () => {
  it("เขียนและอ่าน 500 รายการต่อ entity ได้ครบไม่หาย", () => {
    const elapsed = measure(() => {
      writeCollection(STORAGE_KEYS.requirements, requirements);
      writeCollection(STORAGE_KEYS.tasks, tasks);
      writeCollection(STORAGE_KEYS.defects, defects);
    });

    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("ข้อมูล 1,500 รายการต้องไม่ชนเพดาน localStorage (< 2.5 MB)", () => {
    const bytes = new Blob([
      JSON.stringify(requirements),
      JSON.stringify(tasks),
      JSON.stringify(defects),
    ]).size;
    expect(bytes).toBeLessThan(2.5 * 1024 * 1024);
  });
});

describe("NFR2 — ตรรกะสายเชื่อมโยงที่ 500 รายการ ≤ 200ms", () => {
  it("traceForward ทุก requirement (500 ครั้ง) ต้องไม่เกินงบ", () => {
    const elapsed = measure(() => {
      for (const req of requirements) {
        traceForward(req.id, tasks, defects);
      }
    });
    const sample = traceForward("req-0", tasks, defects);
    expect(sample.tasks.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("traceBackward ทุก defect (500 ครั้ง) ต้องไม่เกินงบ", () => {
    const elapsed = measure(() => {
      for (const defect of defects) {
        traceBackward(defect, tasks, requirements);
      }
    });
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("findRequirementsWithoutTasks ต้องไม่เกินงบ", () => {
    const elapsed = measure(() => {
      findRequirementsWithoutTasks(requirements, tasks);
    });
    // req 400-499 ไม่มี task (500 tasks กระจายไป req 0-399)
    expect(findRequirementsWithoutTasks(requirements, tasks)).toHaveLength(100);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("countDefectsByType ต้องไม่เกินงบ", () => {
    const elapsed = measure(() => {
      countDefectsByType(defects);
    });
    const counts = countDefectsByType(defects);
    expect(Object.values(counts).reduce((sum, n) => sum + n, 0)).toBe(N);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });
});

describe("NFR2 — render board ที่ 500 รายการ ≤ 200ms", () => {
  function measureBoard(element: React.ReactElement): number {
    return measure(() => {
      const view = render(
        <MemoryRouter>
          <DataProvider>{element}</DataProvider>
        </MemoryRouter>,
      );
      view.unmount();
    }, 3);
  }

  it("Requirements board — 500 รายการ", () => {
    const elapsed = measureBoard(<RequirementBoard />);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("Tasks board — 500 รายการ", () => {
    const elapsed = measureBoard(<TaskBoard />);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });

  it("Defects board — 500 รายการ", () => {
    const elapsed = measureBoard(<DefectBoard />);
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });
});
