"use client";

import type { DiversitySphere } from "@/lib/day-diversity";

export function DayDiversityStrip({
  spheres,
  score,
  hint,
}: {
  spheres: DiversitySphere[];
  score: number;
  hint: string;
}) {
  return (
    <div className="vc-glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="vc-text-sm font-semibold">Баланс дня</p>
        <span className="vc-text-xs font-bold tabular-nums text-[var(--accent)]">{score}%</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {spheres.map((s) => (
          <span
            key={s.id}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-opacity ${
              s.active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] opacity-60"
            }`}
          >
            <span>{s.emoji}</span>
            {s.label}
          </span>
        ))}
      </div>
      <p className="vc-text-xs text-[var(--text-secondary)] leading-snug">{hint}</p>
    </div>
  );
}
