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
    <div className="vc-segment-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "vc-segment-tab",
            value === tab.id ? "vc-segment-tab--active" : "vc-segment-tab--idle",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
