export type ViewMode = "board" | "list";

export interface ViewTabsProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const TABS: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: "board", icon: "▦", label: "Board" },
  { mode: "list", icon: "☰", label: "List" },
];

/** แถบสลับมุมมอง — tab ที่เลือกมีพื้นหลังน้ำเงินอ่อน */
export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return (
    <div className="flex gap-1" role="tablist" aria-label="เลือกมุมมอง">
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          role="tab"
          aria-selected={value === tab.mode}
          className={`inline-flex items-center gap-2 px-4 py-2 border-none rounded text-small min-h-[36px] transition-all duration-fast ${
            value === tab.mode
              ? "bg-primary/[.08] text-primary font-semibold"
              : "bg-transparent text-neutral-300 font-normal hover:bg-black/[.03] hover:text-neutral-600"
          }`}
          onClick={() => onChange(tab.mode)}
          data-testid={`view-tab-${tab.mode}`}
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
