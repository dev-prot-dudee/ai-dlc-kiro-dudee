import { readCollection, writeCollection, type StorageKey } from "./storage";
import { ValidationError } from "./types";

export interface Entity {
  id: string;
  createdAt: string;
}

export type Draft<T extends Entity> = Omit<T, "id" | "createdAt">;

/** สร้าง id ที่ไม่ซ้ำ — ใช้ crypto เมื่อมี ไม่งั้นถอยไปใช้เวลา+สุ่ม */
function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface Repository<T extends Entity> {
  list(): T[];
  find(id: string): T | null;
  create(draft: Draft<T>): T;
  update(id: string, changes: Partial<Draft<T>>): T;
  remove(id: string): void;
  removeWhere(predicate: (item: T) => boolean): void;
}

/**
 * Repository ทั่วไปบน localStorage
 *
 * validate ถูกเรียกก่อนเขียนทุกครั้ง ทั้งตอนสร้างและตอนแก้ไข เพื่อให้กฎบังคับ
 * ของ requirements (เช่น FR2.2 Task ต้องผูก Requirement) ใช้ได้ทั้งสองทาง
 * ไม่ใช่แค่ตอนสร้าง
 */
export function createRepository<T extends Entity>(
  key: StorageKey,
  validate: (draft: Draft<T>) => void,
): Repository<T> {
  function persist(items: T[]): void {
    writeCollection(key, items);
  }

  return {
    list(): T[] {
      return readCollection<T>(key);
    },

    find(id: string): T | null {
      return readCollection<T>(key).find((item) => item.id === id) ?? null;
    },

    create(draft: Draft<T>): T {
      validate(draft);
      const created = {
        ...draft,
        id: newId(),
        createdAt: new Date().toISOString(),
      } as T;
      persist([...readCollection<T>(key), created]);
      return created;
    },

    update(id: string, changes: Partial<Draft<T>>): T {
      const items = readCollection<T>(key);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new ValidationError(`ไม่พบรายการที่ต้องการแก้ไข (${id})`);
      }
      const current = items[index] as T;
      const next = { ...current, ...changes } as T;
      const { id: _id, createdAt: _createdAt, ...draft } = next;
      validate(draft as Draft<T>);
      const updated = [...items];
      updated[index] = next;
      persist(updated);
      return next;
    },

    remove(id: string): void {
      persist(readCollection<T>(key).filter((item) => item.id !== id));
    },

    removeWhere(predicate: (item: T) => boolean): void {
      persist(readCollection<T>(key).filter((item) => !predicate(item)));
    },
  };
}
