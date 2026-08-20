import { USERS } from "../users";

export interface UserPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * FR5.1 — เลือกว่ากำลังใช้งานในฐานะใคร
 *
 * นี่ไม่ใช่การยืนยันตัวตน (constraint C3)
 */
export function UserPicker({ value, onChange }: UserPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="visually-hidden" htmlFor="user-picker">
        ผู้ใช้ปัจจุบัน
      </label>
      <select
        id="user-picker"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid="user-picker"
      >
        {USERS.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <span className="text-neutral-300 text-caption">
        ไม่ใช่การยืนยันตัวตน — ใช้ระบุผู้รายงานและผู้รับผิดชอบเท่านั้น
      </span>
    </div>
  );
}
