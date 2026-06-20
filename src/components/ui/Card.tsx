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
    <div className={`vc-glass-card vc-animate-in ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="vc-text-lg">{title}</h3>}
          {subtitle && <p className="vc-subtitle mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
