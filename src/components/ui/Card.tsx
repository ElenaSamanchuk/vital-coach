import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={`vc-glass-card rounded-[var(--radius-md)] p-4 vc-animate-in ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>}
          {subtitle && <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
