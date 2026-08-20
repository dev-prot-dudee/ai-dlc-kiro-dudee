import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { requirementsRepo } from "../modules/requirements/requirements.repo";
import { tasksRepo } from "../modules/tasks/tasks.repo";
import { defectsRepo } from "../modules/defects/defects.repo";
import { readCurrentUserId, writeCurrentUserId } from "./users";
import type { Defect, Requirement, Task } from "./types";

export interface DataContextValue {
  requirements: Requirement[];
  tasks: Task[];
  defects: Defect[];
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  /** อ่านข้อมูลใหม่จากที่เก็บ เรียกหลังทุกการเขียน */
  refresh: () => void;
  /** ข้อผิดพลาดระดับหน้า เช่น import ล้มเหลว หรือที่เก็บเต็ม */
  error: string | null;
  setError: (message: string | null) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

/**
 * แหล่งข้อมูลกลางของแอป
 *
 * ทั้ง 3 module อ่านจากที่นี่เพราะสายเชื่อมโยง (FR4) ต้องเห็นข้อมูลข้าม module
 * เช่น หน้า Requirement ต้องนับ Task และ Defect ที่อยู่ใต้มัน
 *
 * การอ่านทำผ่าน refresh() หลังทุกการเขียน แทนการ subscribe เพราะ localStorage
 * ไม่มีกลไกแจ้งเตือนภายใน tab เดียวกัน
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [currentUserId, setCurrentUser] = useState(() => readCurrentUserId());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => setVersion((value) => value + 1), []);

  const setCurrentUserId = useCallback((id: string) => {
    writeCurrentUserId(id);
    setCurrentUser(id);
  }, []);

  const value = useMemo<DataContextValue>(() => {
    // version อยู่ใน dependency เพื่อให้อ่านใหม่หลังทุกการเขียน
    void version;
    return {
      requirements: requirementsRepo.list(),
      tasks: tasksRepo.list(),
      defects: defectsRepo.list(),
      currentUserId,
      setCurrentUserId,
      refresh,
      error,
      setError,
    };
  }, [version, currentUserId, setCurrentUserId, refresh, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error("useData ต้องใช้ภายใน DataProvider");
  }
  return context;
}
