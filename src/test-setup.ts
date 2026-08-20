import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

/**
 * Node 25 มี `localStorage` global แบบ experimental ที่ต้องใช้ร่วมกับ flag
 * `--localstorage-file` เมื่อไม่ได้ระบุ path ตัวมันจะเป็น object เปล่าที่ไม่มี
 * method ใดๆ และมันบดทับ `window.localStorage` ของ jsdom ทำให้ test ที่พึ่ง
 * localStorage ใช้งานไม่ได้เลย
 *
 * ที่นี่จึงติดตั้ง Storage ที่ทำตาม spec ของ Web Storage ทับลงไป
 * โค้ดแอปยังเรียก `localStorage` ตามปกติ และในเบราว์เซอร์จริงจะได้ตัวของ
 * เบราว์เซอร์เอง การแทนที่นี้มีผลแค่ในสภาพแวดล้อมของ test
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(String(key), String(value));
  }
}

function installStorage(): void {
  const storage = new MemoryStorage();
  const descriptor: PropertyDescriptor = {
    value: storage,
    configurable: true,
    writable: true,
  };
  Object.defineProperty(globalThis, "localStorage", descriptor);
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", descriptor);
  }
}

installStorage();

beforeEach(() => {
  // ล้างก่อนทุก test เพราะ localStorage เป็นที่เก็บข้อมูลจริงของรอบนี้
  // ถ้าไม่ล้าง ผลจะเปลี่ยนตามลำดับการรัน ทำให้ test ไม่น่าเชื่อถือ
  installStorage();
});
