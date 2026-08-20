export interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
}

/** หัวหน้า — ไอคอนวงกลมพื้นเทาอ่อน + ชื่อตัวหนาขนาดใหญ่ ตามภาพต้นแบบ */
export function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle !== undefined && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
