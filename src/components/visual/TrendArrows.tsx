"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export function TrendArrows({
  items,
}: {
  items: { label: string; value: string; trend: "up" | "down" | "stable"; good: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon =
          item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : Minus;
        const color = item.trend === "stable"
          ? "var(--gray)"
          : item.good
            ? "var(--accent)"
            : "var(--pink)";
        return (
          <div
            key={item.label}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-subtle)] px-3 py-2 border border-[var(--border)]"
          >
            <Icon size={14} style={{ color }} />
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)]">{item.label}</p>
              <p className="text-[12px] font-semibold">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
