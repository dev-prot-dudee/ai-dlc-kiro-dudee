import { render, screen, within, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
import { DataProvider } from "../shared/DataContext";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";
import type {
  DefectType,
  Priority,
  RequirementCategory,
  Role,
  Severity,
} from "../shared/types";

/**
 * ชุดเครื่องมือสำหรับ E2E test
 *
 * E2E ในโครงนี้หมายถึงการประกอบแอปทั้งก้อนตามที่ main.tsx ประกอบจริง
 * (ErrorBoundary → Router → DataProvider → App) แล้วขับผ่านสิ่งที่ผู้ใช้เห็น
 * และกดได้เท่านั้น ไม่แตะ repository หรือ localStorage โดยตรง
 *
 * เหตุที่ไม่ใช้ Playwright: กฎธุรกิจทั้งหมดอยู่ในเบราว์เซอร์และเก็บลง
 * localStorage ไม่มี backend ให้ทดสอบข้าม process การรันบน jsdom จึงครอบ
 * เส้นทางเดียวกันได้โดยไม่ต้องเพิ่ม dependency และ browser binary
 *
 * ตัวเดียวที่ยอมแตะตรง ๆ คือการ unmount แล้ว render ใหม่ ซึ่งแทนการปิดแท็บ
 * แล้วเปิดใหม่ (FR6.1)
 */

export type Ui = ReturnType<typeof userEvent.setup>;

export interface AppHarness {
  user: Ui;
  view: RenderResult;
  /** ปิดแอปแล้วเปิดใหม่ที่ route เดิมหรือ route ใหม่ — ใช้ตรวจ FR6.1 */
  reopen: (route?: string) => void;
}

export type ModuleName = "requirements" | "tasks" | "defects";

function tree(route: string) {
  return (
    <ErrorBoundary>
      <MemoryRouter initialEntries={[route]}>
        <DataProvider>
          <App />
        </DataProvider>
      </MemoryRouter>
    </ErrorBoundary>
  );
}

/** เปิดแอปทั้งก้อนที่ route ที่ระบุ */
export function renderApp(route = "/requirements"): AppHarness {
  const user = userEvent.setup();
  const view = render(tree(route));

  return {
    user,
    view,
    reopen: (next = route) => {
      view.unmount();
      render(tree(next));
    },
  };
}

/** เดินเมนูซ้ายไปอีก module เหมือนผู้ใช้กดลิงก์ */
export async function goto(user: Ui, module: ModuleName): Promise<void> {
  await user.click(screen.getByTestId(`nav-${module}`));
}

/**
 * เลือก option จากข้อความที่ผู้ใช้เห็น ไม่ใช่จาก id ที่ผู้ใช้ไม่เคยเห็น
 *
 * จำเป็นเพราะ dropdown ของ Requirement และ Task ต้นทางใช้ id ที่สุ่มตอนสร้าง
 * ซึ่ง test ไม่ควรรู้ล่วงหน้า
 */
export async function selectByText(
  user: Ui,
  select: HTMLElement,
  optionText: string,
): Promise<void> {
  const option = within(select)
    .getAllByRole("option")
    .find((candidate) => (candidate.textContent ?? "").includes(optionText));
  if (option === undefined) {
    throw new Error(`ไม่พบตัวเลือกที่มีข้อความ "${optionText}" ใน dropdown`);
  }
  await user.selectOptions(select, option as HTMLOptionElement);
}

export interface RequirementInput {
  title: string;
  category?: RequirementCategory | "";
  priority?: Priority;
  description?: string;
}

/**
 * กรอกฟอร์ม Requirement แล้วกดบันทึก
 *
 * `category` รับค่าว่างได้เพื่อให้ test ที่ตรวจการบังคับเลือกประเภท (FR1.2)
 * เดินเส้นทางเดียวกันกับ test ที่กรอกครบ
 */
export async function fillRequirementForm(
  user: Ui,
  input: RequirementInput,
): Promise<void> {
  await user.clear(screen.getByTestId("req-title"));
  if (input.title !== "") {
    await user.type(screen.getByTestId("req-title"), input.title);
  }
  if (input.description !== undefined) {
    await user.type(screen.getByTestId("req-description"), input.description);
  }
  if (input.category !== undefined && input.category !== "") {
    await user.selectOptions(screen.getByTestId("req-category"), input.category);
  }
  if (input.priority !== undefined) {
    await user.selectOptions(screen.getByTestId("req-priority"), input.priority);
  }
  await user.click(screen.getByTestId("req-submit"));
}

/** สร้าง Requirement ครบวงจรจากปุ่ม New บนแถบเครื่องมือ */
export async function createRequirement(
  user: Ui,
  input: RequirementInput,
): Promise<void> {
  await user.click(screen.getByTestId("toolbar-new"));
  await fillRequirementForm(user, { category: "Functional", ...input });
}

export interface TaskInput {
  title: string;
  /** ข้อความบางส่วนของ Requirement ต้นทางที่จะเลือก */
  requirementText?: string;
  role?: Role | "";
  description?: string;
}

export async function fillTaskForm(user: Ui, input: TaskInput): Promise<void> {
  await user.clear(screen.getByTestId("task-title"));
  if (input.title !== "") {
    await user.type(screen.getByTestId("task-title"), input.title);
  }
  if (input.description !== undefined) {
    await user.type(screen.getByTestId("task-description"), input.description);
  }
  if (input.requirementText !== undefined) {
    await selectByText(
      user,
      screen.getByTestId("task-requirement"),
      input.requirementText,
    );
  }
  if (input.role !== undefined && input.role !== "") {
    await user.selectOptions(screen.getByTestId("task-role"), input.role);
  }
  await user.click(screen.getByTestId("task-submit"));
}

export async function createTask(user: Ui, input: TaskInput): Promise<void> {
  await user.click(screen.getByTestId("toolbar-new"));
  await fillTaskForm(user, { role: "Dev", ...input });
}

export interface DefectInput {
  title: string;
  /** ข้อความบางส่วนของ Task ต้นทางที่จะเลือก */
  taskText?: string;
  type?: DefectType | "";
  severity?: Severity | "";
  description?: string;
}

export async function fillDefectForm(user: Ui, input: DefectInput): Promise<void> {
  await user.clear(screen.getByTestId("defect-title"));
  if (input.title !== "") {
    await user.type(screen.getByTestId("defect-title"), input.title);
  }
  if (input.description !== undefined) {
    await user.type(screen.getByTestId("defect-description"), input.description);
  }
  if (input.taskText !== undefined) {
    await selectByText(user, screen.getByTestId("defect-task"), input.taskText);
  }
  if (input.type !== undefined && input.type !== "") {
    await user.selectOptions(screen.getByTestId("defect-type"), input.type);
  }
  if (input.severity !== undefined && input.severity !== "") {
    await user.selectOptions(screen.getByTestId("defect-severity"), input.severity);
  }
  await user.click(screen.getByTestId("defect-submit"));
}

export async function createDefect(user: Ui, input: DefectInput): Promise<void> {
  await user.click(screen.getByTestId("toolbar-new"));
  await fillDefectForm(user, { type: "Code Bug", severity: "Medium", ...input });
}

/** เปิดรายละเอียดของการ์ดจากหัวข้อที่แสดงบน board */
export async function openCard(user: Ui, title: string): Promise<void> {
  await user.click(cardTitle(title));
}

/** หัวข้อของการ์ดบน board — คืน element เพื่อให้ test เช็คว่ามีอยู่หรือไม่ได้ */
export function cardTitle(title: string): HTMLElement {
  return screen.getByText(title, { selector: ".board-card__title" });
}

export function queryCardTitle(title: string): HTMLElement | null {
  return screen.queryByText(title, { selector: ".board-card__title" });
}

/** การ์ดทั้งหมดใน column ที่ระบุ (groupKey คือค่าของ field ที่ใช้จัดกลุ่ม) */
export function cardsInColumn(groupKey: string): string[] {
  const column = screen.getByTestId(`board-${groupKey}-label`).closest("section");
  if (column === null) throw new Error(`ไม่พบ column "${groupKey}"`);
  return within(column)
    .queryAllByTestId(/^card-/)
    .map((card) => card.querySelector(".board-card__title")?.textContent ?? "");
}

/** ตัวเลขบนหัว column — สำหรับ Defect board นี่คือคำตอบของ FR3.7 */
export function columnCount(groupKey: string): number {
  return Number(screen.getByTestId(`board-${groupKey}-count`).textContent);
}

/** สลับไปมุมมองตาราง ซึ่งเป็นที่เดียวที่แถบตัวกรองปรากฏ */
export async function switchToList(user: Ui): Promise<void> {
  await user.click(screen.getByTestId("view-tab-list"));
}

/** ชื่อรายการในตาราง เรียงตามลำดับที่แสดง */
export function listTitles(): string[] {
  const rows = within(screen.getByTestId("list")).getAllByRole("row");
  // แถวแรกคือหัวตาราง
  return rows.slice(1).map((row) => row.querySelectorAll("td")[0]?.textContent ?? "");
}

/** จำนวนที่แสดงข้างชื่อ module ในเมนูซ้าย */
export function navCount(module: ModuleName): number {
  const link = screen.getByTestId(`nav-${module}`);
  return Number(link.querySelector(".sidebar__count")?.textContent);
}
