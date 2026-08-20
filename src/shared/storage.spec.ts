import { describe, it, expect, vi, afterEach } from "vitest";
import {
  readCollection,
  writeCollection,
  exportAll,
  importAll,
  STORAGE_KEYS,
} from "./storage";
import { StorageCorruptError, StorageFullError, type Requirement } from "./types";
import { makeRequirement, makeTask, makeDefect } from "./test-factories";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("การเก็บข้อมูลใน localStorage", () => {
  describe("ข้อมูลคงอยู่ข้าม session (FR6.1)", () => {
    it("เมื่อเขียนข้อมูลแล้วอ่านใหม่ ต้องได้ข้อมูลเดิมครบ", () => {
      // Given — มี Requirement 3 รายการ
      const items: Requirement[] = [
        makeRequirement({ id: "r1", title: "หนึ่ง" }),
        makeRequirement({ id: "r2", title: "สอง" }),
        makeRequirement({ id: "r3", title: "สาม" }),
      ];

      // When — เขียนลง localStorage แล้วอ่านกลับ (จำลองการเปิดแอปใหม่)
      writeCollection(STORAGE_KEYS.requirements, items);
      const readBack = readCollection<Requirement>(STORAGE_KEYS.requirements);

      // Then — ได้ข้อมูลครบทั้ง 3 รายการ ค่าตรงกับที่เขียนไป
      expect(readBack).toHaveLength(3);
      expect(readBack.map((r) => r.title)).toEqual(["หนึ่ง", "สอง", "สาม"]);
    });

    it("เมื่อยังไม่เคยเขียนอะไร การอ่านต้องได้รายการว่าง ไม่ใช่ error", () => {
      expect(readCollection<Requirement>(STORAGE_KEYS.requirements)).toEqual([]);
    });
  });

  describe("ข้อมูลเสียหายต้องไม่ทำให้ระบบล้ม (FR6.3)", () => {
    it("เมื่อข้อมูลใน localStorage parse ไม่ได้ ต้องโยน StorageCorruptError ที่ระบุ key", () => {
      // Given — มีข้อมูลผิดรูปแบบค้างอยู่
      localStorage.setItem(STORAGE_KEYS.requirements, "{ นี่ไม่ใช่ JSON");

      // When / Then — ต้องได้ error ที่บอกได้ว่าเสียหายที่ไหน ไม่ใช่ error ดิบของ JSON.parse
      expect(() => readCollection<Requirement>(STORAGE_KEYS.requirements)).toThrow(
        StorageCorruptError,
      );
      try {
        readCollection<Requirement>(STORAGE_KEYS.requirements);
      } catch (error) {
        expect((error as StorageCorruptError).key).toBe(STORAGE_KEYS.requirements);
      }
    });

    it("เมื่อข้อมูล parse ได้แต่ไม่ใช่ array ต้องโยน StorageCorruptError", () => {
      localStorage.setItem(STORAGE_KEYS.requirements, JSON.stringify({ ไม่ใช่: "array" }));
      expect(() => readCollection<Requirement>(STORAGE_KEYS.requirements)).toThrow(
        StorageCorruptError,
      );
    });
  });

  describe("โควตาเต็มต้องแจ้งเตือนและข้อมูลเดิมไม่หาย (FR6.4)", () => {
    it("เมื่อเขียนไม่ได้เพราะเต็ม ต้องโยน StorageFullError และข้อมูลเดิมยังอยู่", () => {
      // Given — มีข้อมูลเดิมอยู่แล้ว 1 รายการ
      const existing = [makeRequirement({ id: "เดิม" })];
      writeCollection(STORAGE_KEYS.requirements, existing);

      // When — การเขียนครั้งถัดไปล้มเหลวเพราะโควตาเต็ม
      // spy ที่ตัว localStorage เอง ไม่ใช่ Storage.prototype เพราะสิ่งที่โค้ดเรียก
      // คือ instance ตัวนี้โดยตรง
      const quotaError = new DOMException("quota", "QuotaExceededError");
      const setItemSpy = vi
        .spyOn(localStorage, "setItem")
        .mockImplementation(() => {
          throw quotaError;
        });

      // Then — ได้ StorageFullError ไม่ใช่ error ดิบ
      expect(() =>
        writeCollection(STORAGE_KEYS.requirements, [
          ...existing,
          makeRequirement({ id: "ใหม่" }),
        ]),
      ).toThrow(StorageFullError);

      // และข้อมูลเดิมยังอ่านได้ครบ ไม่ถูกทำลาย
      setItemSpy.mockRestore();
      const survived = readCollection<Requirement>(STORAGE_KEYS.requirements);
      expect(survived).toHaveLength(1);
      expect(survived[0]?.id).toBe("เดิม");
    });
  });

  describe("Export และ Import (FR6.2)", () => {
    it("เมื่อ export แล้วลบข้อมูลทั้งหมดและ import กลับ ต้องได้ข้อมูลครบเท่าเดิม", () => {
      // Given — มีข้อมูลทั้ง 3 ชนิด
      writeCollection(STORAGE_KEYS.requirements, [makeRequirement({ id: "r1" })]);
      writeCollection(STORAGE_KEYS.tasks, [makeTask({ id: "t1", requirementId: "r1" })]);
      writeCollection(STORAGE_KEYS.defects, [makeDefect({ id: "d1", taskId: "t1" })]);

      // When — export ออกมา ล้างทิ้ง แล้ว import กลับ
      const bundle = exportAll();
      localStorage.clear();
      expect(readCollection(STORAGE_KEYS.requirements)).toEqual([]);
      importAll(JSON.stringify(bundle));

      // Then — ข้อมูลกลับมาครบทั้ง 3 ชนิด
      expect(readCollection(STORAGE_KEYS.requirements)).toHaveLength(1);
      expect(readCollection(STORAGE_KEYS.tasks)).toHaveLength(1);
      expect(readCollection(STORAGE_KEYS.defects)).toHaveLength(1);
    });

    it("เมื่อ import ไฟล์ที่รูปแบบไม่ถูกต้อง ต้องปฏิเสธและข้อมูลเดิมไม่ถูกเขียนทับ", () => {
      // Given — มีข้อมูลเดิมอยู่
      writeCollection(STORAGE_KEYS.requirements, [makeRequirement({ id: "เดิม" })]);

      // When / Then — import ข้อมูลที่ไม่ใช่ bundle ต้องถูกปฏิเสธ
      expect(() => importAll("[]")).toThrow();
      expect(() => importAll(JSON.stringify({ version: 99 }))).toThrow();

      // ข้อมูลเดิมยังอยู่ครบ
      const survived = readCollection<Requirement>(STORAGE_KEYS.requirements);
      expect(survived).toHaveLength(1);
      expect(survived[0]?.id).toBe("เดิม");
    });
  });
});
