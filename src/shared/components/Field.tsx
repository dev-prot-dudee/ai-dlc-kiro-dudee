import type { ReactNode } from "react";

export interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/**
 * ห่อ input หนึ่งช่องพร้อม label ที่ผูกกับ id จริง (NFR5)
 *
 * ข้อความ error ผูกกับ input ด้วย aria-describedby ผ่าน id ที่ตั้งชื่อไว้แน่นอน
 * เพื่อให้ screen reader อ่านเหตุผลที่ถูกปฏิเสธ ไม่ใช่แค่รู้ว่าผิด
 */
export function Field({ id, label, required, hint, error, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required === true && (
          <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>
            {" *"}
          </span>
        )}
        {required === true && <span className="visually-hidden"> (จำเป็น)</span>}
      </label>
      {children}
      {hint !== undefined && (
        <span className="field__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error !== undefined && (
        <span className="field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PlainSelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export function PlainSelect({
  id,
  value,
  options,
  onChange,
  placeholder,
  hasError,
}: PlainSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={hasError === true}
      aria-describedby={hasError === true ? `${id}-error` : undefined}
      data-testid={id}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
