"use client";

import type { WeeklyInsights } from "@/lib/types";
import { VC } from "@/lib/design-tokens";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export function WeeklyDigest({ insights }: { insights: WeeklyInsights | null }) {
  if (!insights) return null;

  const trendIcon = (t: string) => {
    if (t === "down") return <TrendingDown size={14} className="text-[var(--success)]" />;
    if (t === "up") return <TrendingUp size={14} className="text-[var(--warning)]" />;
    return <Minus size={14} className="text-[var(--text-tertiary)]" />;
  };

  return (
    <div className="space-y-3">
      {insights.wins[0] && (
        <p className="text-[13px] flex gap-2">
          <span className="text-[var(--success)] font-semibold shrink-0">+</span>
          {insights.wins[0]}
        </p>
      )}
      {insights.slipping[0] && (
        <p className="text-[13px] flex gap-2 text-[var(--text-secondary)]">
          {trendIcon(insights.slipping[0].trend)}
          {insights.slipping[0].message}
        </p>
      )}
      {insights.avgWeight != null && (
        <p className="text-[12px] text-[var(--text-secondary)]">
          Средний вес: <strong>{insights.avgWeight.toFixed(1)} кг</strong>
          {insights.weightChange != null && (
            <span style={{ color: insights.weightChange <= 0 ? VC.success : VC.warning }}>
              {" "}
              ({insights.weightChange > 0 ? "+" : ""}
              {insights.weightChange.toFixed(1)})
            </span>
          )}
        </p>
      )}
    </div>
  );
}
