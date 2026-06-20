"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function IconSegmentTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; Icon: LucideIcon; color: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-subtle)] mb-4">
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all",
              active ? "bg-white shadow-sm" : "opacity-70 hover:opacity-100",
            )}
          >
            <tab.Icon
              size={18}
              className={active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}
              strokeWidth={active ? 2.5 : 2}
            />
            <span
              className={cn(
                "text-[10px] font-semibold",
                active ? "text-[var(--text)]" : "text-[var(--text-secondary)]",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
