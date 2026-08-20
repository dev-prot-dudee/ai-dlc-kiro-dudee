export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSpec {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export interface FilterBarProps {
  filters: FilterSpec[];
}

/**
 * แถบตัวกรอง — ทุก select มี <label> ผูกกับ id จริงเพื่อให้ screen reader
 * อ่านได้ว่ากรองอะไร (NFR5)
 */
export function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-5">
      {filters.map((filter) => (
        <div className="flex flex-col gap-1" key={filter.id}>
          <label htmlFor={filter.id} className="text-caption text-neutral-300 font-semibold">
            {filter.label}
          </label>
          <select
            id={filter.id}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            data-testid={filter.id}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
