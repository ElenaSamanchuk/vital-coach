"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function TodayDetailsPanel({
  title = "Подробнее",
  subtitle,
  defaultOpen = false,
  children,
}: {
  title?: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold">{title}</p>
          {subtitle && (
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">{children}</div>}
    </div>
  );
}
