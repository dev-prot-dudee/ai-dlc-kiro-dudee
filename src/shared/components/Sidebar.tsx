import { NavLink } from "react-router-dom";
import { UserPicker } from "./UserPicker";

export interface SidebarCounts {
  requirements: number;
  tasks: number;
  defects: number;
}

export interface SidebarProps {
  counts: SidebarCounts;
  currentUserId: string;
  onChangeUser: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
  count: number;
}

/**
 * Sidebar — ซ่อนบน mobile (< 600px) แสดงเป็น overlay เมื่อเปิด
 * Desktop แสดงคงที่ตลอด
 */
export function Sidebar({ counts, currentUserId, onChangeUser, isOpen, onClose }: SidebarProps) {
  const items: NavItem[] = [
    { to: "/requirements", icon: "◎", label: "Requirements", count: counts.requirements },
    { to: "/tasks", icon: "✓", label: "Tasks", count: counts.tasks },
    { to: "/defects", icon: "◆", label: "Defects", count: counts.defects },
  ];

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-full z-40 w-[260px] bg-neutral-50 border-r border-neutral-100
          p-5 flex flex-col gap-8 overflow-y-auto
          transform transition-transform duration-normal ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:flex-shrink-0
        `}
        aria-label="เมนูหลัก"
      >
        {/* Close button — mobile only */}
        <button
          type="button"
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded text-neutral-300 hover:text-neutral-600 hover:bg-black/5"
          onClick={onClose}
          aria-label="ปิดเมนู"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 font-display font-semibold text-subheading px-3 text-neutral-600">
          <span aria-hidden="true">▣</span>
          <span>PM Tool</span>
        </div>

        <div>
          <div
            className="text-caption font-semibold text-neutral-300 uppercase tracking-wider px-3 pb-2"
            id="nav-modules-label"
          >
            Modules
          </div>
          <div className="flex flex-col gap-0.5" aria-labelledby="nav-modules-label">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded text-small min-h-touch transition-all duration-fast no-underline ${
                    isActive
                      ? "bg-primary/[.08] text-primary font-semibold"
                      : "text-neutral-400 font-normal hover:bg-black/[.03] hover:text-neutral-600"
                  }`
                }
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <span className="w-5 text-center flex-shrink-0 text-[16px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <span className="ml-auto text-caption text-neutral-300 bg-neutral-100 px-2 py-0.5 rounded min-w-[24px] text-center">
                  {item.count}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-neutral-100 pt-5">
          <div className="text-caption font-semibold text-neutral-300 uppercase tracking-wider px-3 pb-2">
            ผู้ใช้ปัจจุบัน
          </div>
          <UserPicker value={currentUserId} onChange={onChangeUser} />
        </div>
      </nav>
    </>
  );
}
