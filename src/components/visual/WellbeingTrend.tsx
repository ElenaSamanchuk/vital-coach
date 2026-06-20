"use client";

import { VC } from "@/lib/design-tokens";

export function WellbeingTrend({
  points,
}: {
  points: { label: string; energy: number; mood: number; stress: number }[];
}) {
  if (points.length < 2) {
    return (
      <p className="text-[12px] text-[var(--text-secondary)] text-center py-4">
        Отметь самочувствие в дневнике 2+ дня — появится динамика
      </p>
    );
  }

  const w = 280;
  const h = 72;
  const pad = 8;
  const max = 10;

  const series = [
    { key: "energy", label: "Энергия", color: VC.ringMove },
    { key: "mood", label: "Настроение", color: VC.ringMeals },
    { key: "stress", label: "Стресс", color: VC.warning },
  ] as const;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
        {series.map((s) => {
          const coords = points.map((p, i) => {
            const x = pad + (i / (points.length - 1)) * (w - pad * 2);
            const val = p[s.key];
            const y = pad + (1 - val / max) * (h - pad * 2);
            return `${x},${y}`;
          });
          return (
            <polyline
              key={s.key}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.key === "stress" ? 0.85 : 1}
              points={coords.join(" ")}
            />
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 mt-2">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
