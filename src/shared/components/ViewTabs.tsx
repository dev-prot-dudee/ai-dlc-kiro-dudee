export type ViewMode = "board" | "list";

export interface ViewTabsProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const TABS: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: "board", icon: "▦", label: "Board" },
  { mode: "list", icon: "☰", label: "List" },
];

/** แถบสลับมุมมอง — tab ที่เลือกมีพื้นหลังเทาอ่อน ตามภาพต้นแบบ */
export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return (
    <div className="view-tabs" role="tablist" aria-label="เลือกมุมมอง">
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          role="tab"
          aria-selected={value === tab.mode}
          className={value === tab.mode ? "view-tab view-tab--active" : "view-tab"}
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
