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
 */
export function Field({ id, label, required, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-small text-neutral-400" htmlFor={id}>
        {label}
        {required === true && (
          <span aria-hidden="true" className="text-danger">
            {" *"}
          </span>
        )}
        {required === true && <span className="visually-hidden"> (จำเป็น)</span>}
      </label>
      {children}
      {hint !== undefined && (
        <span className="text-neutral-300 text-caption" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error !== undefined && (
        <span className="text-danger text-caption" id={`${id}-error`} role="alert">
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
