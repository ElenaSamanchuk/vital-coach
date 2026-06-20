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
    <div className={`vc-glass-card vc-animate-in ${className}`}>
      <div className="flex gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg, color: iconColor }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h3 className="vc-text-lg">{title}</h3>
          {subtitle && <p className="vc-subtitle mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
