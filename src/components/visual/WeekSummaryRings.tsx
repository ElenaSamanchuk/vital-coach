"use client";

import { VC } from "@/lib/design-tokens";

export function WeekSummaryRings({
  mealsPct,
  movePct,
  logPct,
}: {
  mealsPct: number;
  movePct: number;
  logPct: number;
}) {
  const rings = [
    { label: "Питание", pct: mealsPct, color: VC.ringMeals },
    { label: "Движение", pct: movePct, color: VC.ringMove },
    { label: "Дневник", pct: logPct, color: VC.ringLog },
  ];

  return (
    <div className="flex justify-around gap-2">
      {rings.map((r) => {
        const size = 56;
        const r0 = 22;
        const circ = 2 * Math.PI * r0;
        const offset = circ - (Math.min(1, r.pct) * circ);
        return (
          <div key={r.label} className="flex flex-col items-center">
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={r0} fill="none" stroke="var(--ring-track)" strokeWidth={5} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r0}
                fill="none"
                stroke={r.color}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <p className="text-[10px] font-semibold mt-1">{Math.round(r.pct * 100)}%</p>
            <p className="text-[9px] text-[var(--text-secondary)]">{r.label}</p>
          </div>
        );
      })}
    </div>
  );
}
