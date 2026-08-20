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
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
  count: number;
}

/**
 * นำทางซ้าย 240px คงที่ ตามภาพต้นแบบ
 *
 * ใช้ NavLink ของ react-router เพื่อให้ได้สถานะ active มาเอง และเป็น <a>
 * จริงซึ่งเข้าถึงด้วย keyboard ได้โดยไม่ต้องเพิ่มอะไร (NFR5)
 */
export function Sidebar({ counts, currentUserId, onChangeUser }: SidebarProps) {
  const items: NavItem[] = [
    { to: "/requirements", icon: "◎", label: "Requirements", count: counts.requirements },
    { to: "/tasks", icon: "✓", label: "Tasks", count: counts.tasks },
    { to: "/defects", icon: "◆", label: "Defects", count: counts.defects },
  ];

  return (
    <nav className="sidebar" aria-label="เมนูหลัก">
      <div className="sidebar__brand">
        <span aria-hidden="true">▣</span>
        <span>PM Tool</span>
      </div>

      <div>
        <div className="sidebar__group-label" id="nav-modules-label">
          Modules
        </div>
        <div className="sidebar__nav" aria-labelledby="nav-modules-label">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
              }
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <span className="sidebar__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
              <span className="sidebar__count">{item.count}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__group-label">ผู้ใช้ปัจจุบัน</div>
        <UserPicker value={currentUserId} onChange={onChangeUser} />
      </div>
    </nav>
  );
}
