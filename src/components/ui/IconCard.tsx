import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function IconCard({
  icon: Icon,
  iconColor = "var(--accent)",
  iconBg,
  title,
  subtitle,
  children,
  className = "",
}: {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  const bg = iconBg ?? `${iconColor}18`;

  return (
    <div className={`vc-glass-card rounded-[var(--radius-md)] p-4 vc-animate-in ${className}`}>
      <div className="flex gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: bg, color: iconColor }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
