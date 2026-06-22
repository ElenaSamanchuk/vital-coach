"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { VC } from "@/lib/design-tokens";
import { GENERIC_MODE } from "@/lib/app-config";

export function WeightSparkline({
  points,
  target,
}: {
  points: { date: string; value: number }[];
  target?: number;
}) {
  if (points.length < 2) {
    return (
      <EmptyState
        icon={Scale}
        title="Пока мало данных"
        description={
          GENERIC_MODE
            ? "Запиши вес 2+ дня в «Мой день» — появится тренд и линия цели."
            : "Запиши вес 2+ дня в дневнике — появится тренд и линия цели."
        }
        action={
          <Link href={GENERIC_MODE ? "/" : "/log"} className="text-[13px] font-semibold text-[var(--accent)]">
            {GENERIC_MODE ? "Открыть «Мой день» →" : "Открыть дневник →"}
          </Link>
        }
      />
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values, target ?? Infinity) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min || 1;
  const w = 280;
  const h = 64;
  const pad = 4;

  const coords = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const last = values[values.length - 1];
  const first = values[0];
  const delta = last - first;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[22px] font-bold tracking-tight">{last} кг</span>
        <span
          className="text-[12px] font-semibold"
          style={{ color: delta <= 0 ? VC.success : VC.warning }}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)} за {points.length} дн.
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
        {target && (
          <line
            x1={pad}
            x2={w - pad}
            y1={pad + (1 - (target - min) / range) * (h - pad * 2)}
            y2={pad + (1 - (target - min) / range) * (h - pad * 2)}
            stroke={VC.accent}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
          />
        )}
        <polyline
          fill="none"
          stroke={VC.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(" ")}
        />
        {coords.length > 0 && (
          <circle
            cx={coords[coords.length - 1].split(",")[0]}
            cy={coords[coords.length - 1].split(",")[1]}
            r="4"
            fill={VC.accent}
          />
        )}
      </svg>
    </div>
  );
}
