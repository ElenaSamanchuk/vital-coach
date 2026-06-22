"use client";

import { VC } from "@/lib/design-tokens";

export interface MiniRingSpec {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  format?: (n: number) => string;
}

function MiniRing({ spec }: { spec: MiniRingSpec }) {
  const pct = spec.target > 0 ? Math.min(1, spec.current / spec.target) : 0;
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const fmt = spec.format ?? ((n: number) => String(Math.round(n)));

  return (
    <div className="flex flex-col items-center min-w-[4.5rem] flex-1">
      <svg width={64} height={64} viewBox="0 0 64 64" className="block">
        <circle cx={32} cy={32} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={5} />
        <circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke={spec.color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 32 32)"
          className="transition-all duration-500"
        />
        <text
          x={32}
          y={34}
          textAnchor="middle"
          className="fill-[var(--text)] text-[11px] font-bold"
          style={{ fontSize: 10 }}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <p className="vc-text-xs font-semibold mt-1 text-center leading-tight">{spec.label}</p>
      <p className="vc-text-xs text-[var(--text-secondary)] text-center tabular-nums leading-snug">
        {fmt(spec.current)}/{fmt(spec.target)} {spec.unit}
      </p>
    </div>
  );
}

export function DayMiniRings({ rings }: { rings: MiniRingSpec[] }) {
  return (
    <div className="flex justify-between gap-1 py-2">
      {rings.map((r) => (
        <MiniRing key={r.id} spec={r} />
      ))}
    </div>
  );
}

export const MINI_RING_COLORS = {
  food: VC.ringMeals,
  move: VC.ringMove,
  sleep: VC.ringWellbeing,
  water: VC.accent,
};
