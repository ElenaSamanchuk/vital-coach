"use client";

import { Droplets, Flame, Footprints, Moon } from "lucide-react";

/** Полоска метрик в духе Apple Health / Samsung Health — 4 плитки */
export function HealthSummaryStrip({
  calories,
  calorieTarget,
  waterMl,
  waterTarget,
  sleepMin,
  sleepTargetMin,
  steps,
}: {
  calories: number;
  calorieTarget: number;
  waterMl?: number;
  waterTarget: number;
  sleepMin?: number;
  sleepTargetMin: number;
  steps?: number;
}) {
  const items = [
    {
      Icon: Flame,
      label: "Еда",
      value: `${calories}`,
      sub: `/${calorieTarget}`,
      pct: calorieTarget > 0 ? calories / calorieTarget : 0,
      color: "var(--accent)",
    },
    {
      Icon: Droplets,
      label: "Вода",
      value: `${waterMl ?? 0}`,
      sub: `/${waterTarget}`,
      pct: waterTarget > 0 ? (waterMl ?? 0) / waterTarget : 0,
      color: "var(--purple)",
    },
    {
      Icon: Moon,
      label: "Сон",
      value: sleepMin ? `${Math.round(sleepMin / 60)}ч` : "—",
      sub: `/${Math.round(sleepTargetMin / 60)}ч`,
      pct: sleepMin ? sleepMin / sleepTargetMin : 0,
      color: "var(--brown)",
    },
    {
      Icon: Footprints,
      label: "Шаги",
      value: steps != null ? String(steps) : "—",
      sub: "/8k",
      pct: steps != null ? steps / 8000 : 0,
      color: "var(--pink)",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-[var(--bg-subtle)] p-2 text-center border border-[var(--border)]"
        >
          <item.Icon size={14} className="mx-auto mb-1" style={{ color: item.color }} />
          <p className="text-[9px] text-[var(--text-tertiary)]">{item.label}</p>
          <p className="text-[12px] font-bold leading-tight">
            {item.value}
            <span className="text-[8px] font-normal text-[var(--text-tertiary)]">{item.sub}</span>
          </p>
          <div className="h-1 rounded-full bg-[var(--gray-soft)] mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, item.pct * 100)}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
