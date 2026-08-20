export interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
}

/** หัวหน้า — ไอคอนวงกลมพื้นเทาอ่อน + ชื่อตัวหนาขนาดใหญ่ ตามภาพต้นแบบ */
export function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-4 sm:gap-5 pt-6 sm:pt-12 pb-4 sm:pb-6">
      <div
        className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-[20px] sm:text-[24px]"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <h1 className="font-display text-h3 sm:text-display font-semibold leading-[32px] sm:leading-[44px] m-0 text-neutral-600">
          {title}
        </h1>
        {subtitle !== undefined && (
          <p className="text-neutral-300 text-caption sm:text-small leading-[16px] sm:leading-[18px] mt-1">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
