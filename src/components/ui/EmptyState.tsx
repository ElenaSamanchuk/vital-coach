import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { VC } from "@/lib/design-tokens";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: VC.accentSoft }}
      >
        <Icon size={22} style={{ color: VC.accent }} />
      </div>
      <p className="text-[14px] font-semibold text-[var(--text)]">{title}</p>
      <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-[260px] leading-snug">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
