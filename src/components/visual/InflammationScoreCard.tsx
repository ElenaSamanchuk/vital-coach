"use client";

import { Flame } from "lucide-react";
import type { InflammationLoad } from "@/lib/inflammation-score";

const LEVEL_COLOR = {
  low: "var(--accent)",
  moderate: "var(--brown)",
  high: "var(--pink)",
};

export function InflammationScoreCard({ load }: { load: InflammationLoad }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame size={16} style={{ color: LEVEL_COLOR[load.level] }} />
        <span className="text-[12px] font-semibold">Нагрузка на тело</span>
        <span className="ml-auto text-[18px] font-bold" style={{ color: LEVEL_COLOR[load.level] }}>
          {load.score}
        </span>
      </div>
      <p className="text-[13px] font-medium">{load.labelRu}</p>
      {load.factors.length > 0 && (
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
          {load.factors.join(" · ")}
        </p>
      )}
      <div className="h-2 rounded-full bg-[var(--gray-soft)] mt-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${load.score}%`, background: LEVEL_COLOR[load.level] }}
        />
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-snug">{load.tip}</p>
    </div>
  );
}
