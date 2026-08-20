import { describe, it, expect } from "vitest";
import {
  USERS,
  findUser,
  userName,
  readCurrentUserId,
  writeCurrentUserId,
  usersByRole,
} from "./users";
import { STORAGE_KEYS } from "./storage";

describe("การเลือกผู้ใช้ (FR5.1–FR5.3)", () => {
  describe("รายชื่อผู้ใช้ที่กำหนดไว้ล่วงหน้า (FR5.1)", () => {
    it("ต้องมีผู้ใช้ 12 คนตามที่ระบุไว้", () => {
      expect(USERS).toHaveLength(12);
    });

    it("ทุกคนต้องมี id, name, role ครบ", () => {
      for (const user of USERS) {
        expect(user.id).not.toBe("");
        expect(user.name).not.toBe("");
        expect(["SA", "UX", "Dev", "Tester"]).toContain(user.role);
      }
    });

    it("findUser ต้องหาผู้ใช้จาก id ได้", () => {
      const user = findUser("u1");
      expect(user).not.toBeNull();
      expect(user?.name).toContain("สมชาย");
    });

    it("findUser ที่หา id ไม่เจอต้องคืน null", () => {
      expect(findUser("ไม่มีตัวตน")).toBeNull();
    });

    it("userName ต้องคืนชื่อเมื่อพบ และ 'ไม่ทราบ' เมื่อไม่พบ", () => {
      expect(userName("u1")).toContain("สมชาย");
      expect(userName("ไม่มี")).toBe("ไม่ทราบ");
    });

    it("usersByRole ต้องกรองตามตำแหน่งได้", () => {
      const sas = usersByRole("SA");
      expect(sas.length).toBeGreaterThanOrEqual(3);
      for (const sa of sas) {
        expect(sa.role).toBe("SA");
      }
    });
  });

  describe("ผู้ใช้ปัจจุบันเป็นค่าเริ่มต้นของ field (FR5.2)", () => {
    it("เมื่อเลือกผู้ใช้แล้วเขียนลง localStorage ต้องอ่านกลับได้เป็นคนเดิม", () => {
      writeCurrentUserId("u5");
      expect(readCurrentUserId()).toBe("u5");
    });

    it("เปลี่ยนผู้ใช้แล้วอ่านใหม่ต้องได้คนใหม่", () => {
      writeCurrentUserId("u5");
      writeCurrentUserId("u9");
      expect(readCurrentUserId()).toBe("u9");
    });
  });

  describe("จำผู้ใช้ข้าม session (FR5.3)", () => {
    it("เขียนผู้ใช้ลง localStorage แล้วอ่านกลับมาต้องได้คนเดิม", () => {
      writeCurrentUserId("u7");
      // จำลองการปิดเปิดใหม่ — อ่านจาก localStorage โดยตรง
      const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
      expect(stored).toBe("u7");
      expect(readCurrentUserId()).toBe("u7");
    });

    it("ถ้าค่าที่จำไว้ชี้ไปผู้ใช้ที่ไม่มีอยู่ ต้องถอยไปใช้คนแรก", () => {
      localStorage.setItem(STORAGE_KEYS.currentUser, "ไม่มีตัวตน");
      expect(readCurrentUserId()).toBe(USERS[0]?.id);
    });

    it("ถ้ายังไม่เคยเลือกผู้ใช้เลย ต้องได้คนแรกเป็นค่าเริ่มต้น", () => {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      expect(readCurrentUserId()).toBe(USERS[0]?.id);
    });
  });
});
