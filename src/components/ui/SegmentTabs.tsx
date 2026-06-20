"use client";

import { cn } from "@/lib/cn";

export function SegmentTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-subtle)] mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 py-2 px-3 rounded-xl text-[13px] font-semibold transition-all",
            value === tab.id
              ? "bg-white text-[#1d1d1f] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
