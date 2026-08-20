import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardColumn } from "./BoardColumn";
import { BoardCard } from "./BoardCard";
import { UserPicker } from "./UserPicker";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { readCurrentUserId, writeCurrentUserId, USERS } from "../users";

describe("Component ที่ใช้ร่วมกัน", () => {
  describe("หัว column ต้องไม่สื่อความหมายด้วยสีเพียงอย่างเดียว (NFR5)", () => {
    it("ต้องแสดงชื่อสถานะเป็นตัวอักษร ไม่ใช่แค่จุดสี", () => {
      render(
        <BoardColumn label="SA Gap" color="green" count={3} testId="col">
          <div />
        </BoardColumn>,
      );

      // ชื่อสถานะเป็นข้อความที่อ่านได้จริง
      expect(screen.getByTestId("col-label")).toHaveTextContent("SA Gap");
      // และ region มีชื่อที่ screen reader อ่านได้ รวมจำนวนรายการ
      expect(
        screen.getByRole("region", { name: /SA Gap \(3 รายการ\)/ }),
      ).toBeInTheDocument();
    });

    it("ตัวเลขนับต้องแสดงค่าที่ส่งเข้ามา (FR3.7)", () => {
      render(
        <BoardColumn label="Code Bug" color="gray" count={7} testId="col">
          <div />
        </BoardColumn>,
      );
      expect(screen.getByTestId("col-count")).toHaveTextContent("7");
    });

    it("count เป็น 0 ต้องยังแสดง column และเลข 0 ไม่ใช่ซ่อนไป", () => {
      render(
        <BoardColumn label="Test Escape" color="blue" count={0} testId="col">
          <div />
        </BoardColumn>,
      );
      expect(screen.getByTestId("col-count")).toHaveTextContent("0");
    });
  });

  describe("การ์ดบน board", () => {
    it("เมื่อกดการ์ดต้องเรียก onOpen และเข้าถึงด้วย keyboard ได้ (NFR5)", async () => {
      const onOpen = vi.fn();
      render(<BoardCard title="รายการทดสอบ" onOpen={onOpen} testId="card-1" />);

      // เป็น button จริง จึงโฟกัสด้วย Tab และกดด้วย Enter ได้
      await userEvent.tab();
      expect(screen.getByTestId("card-1")).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("เมื่อมีข้อความเตือนต้องแสดงให้เห็น (FR4.3)", () => {
      render(
        <BoardCard title="ยังไม่มีงาน" warning="⚠ ยังไม่มี Task" onOpen={vi.fn()} />,
      );
      expect(screen.getByText("⚠ ยังไม่มี Task")).toBeVisible();
    });
  });

  describe("การเลือกผู้ใช้ปัจจุบัน (FR5.1, FR5.3)", () => {
    it("ต้องมี label ที่ผูกกับ select จริง และแสดงรายชื่อครบ", () => {
      render(<UserPicker value={USERS[0]!.id} onChange={vi.fn()} />);
      const select = screen.getByLabelText("ผู้ใช้ปัจจุบัน");
      expect(select).toBeInTheDocument();
      expect(select.querySelectorAll("option")).toHaveLength(USERS.length);
    });

    it("เมื่อเลือกผู้ใช้แล้ว ค่าที่จำไว้ต้องคงอยู่ข้าม session (FR5.3)", () => {
      const target = USERS[3]!;
      writeCurrentUserId(target.id);
      // อ่านใหม่เหมือนเปิดแอปรอบถัดไป
      expect(readCurrentUserId()).toBe(target.id);
    });

    it("เมื่อค่าที่จำไว้ชี้ไปยังผู้ใช้ที่ไม่มีอยู่ ต้องถอยไปใช้คนแรกแทนการล้ม", () => {
      writeCurrentUserId("ไม่มีคนนี้");
      expect(readCurrentUserId()).toBe(USERS[0]!.id);
    });
  });

  describe("กล่องยืนยันก่อนลบ (FR1.6, FR2.5, FR3.6)", () => {
    it("เมื่อกดยกเลิกต้องเรียก onCancel และไม่เรียก onConfirm", async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      render(
        <ConfirmDialog
          title="ยืนยันการลบ"
          message='"งานทดสอบ" มี 2 Defects ผูกอยู่'
          confirmLabel="ลบทั้งหมด"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );

      await userEvent.click(screen.getByTestId("confirm-cancel"));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("ต้องบอกจำนวนที่จะกำพร้าในข้อความ และเป็น dialog ที่ screen reader อ่านได้ (FR4.4)", () => {
      render(
        <ConfirmDialog
          title="ยืนยันการลบ"
          message='"Requirement A" มี 2 Tasks และ 3 Defects ผูกอยู่'
          confirmLabel="ลบทั้งหมด"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const dialog = screen.getByRole("dialog", { name: "ยืนยันการลบ" });
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/2 Tasks และ 3 Defects/)).toBeVisible();
    });
  });

  describe("สถานะยังไม่มีข้อมูล", () => {
    it("ต้องบอกสิ่งที่ทำได้ต่อ ไม่ใช่แค่บอกว่าว่าง", async () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          message="ยังไม่มี Requirement ในระบบ"
          actionLabel="สร้าง Requirement"
          onAction={onAction}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: "สร้าง Requirement" }));
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });
});
