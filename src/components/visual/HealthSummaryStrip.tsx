"use client";

import { useState } from "react";
import { Droplets, Flame, Footprints, Moon } from "lucide-react";
import Link from "next/link";

/** Показатели дня: еда из выбора; вода/сон/шаги — только просмотр на «Сегодня», ввод в Дневнике */
export function HealthSummaryStrip({
  calories,
  calorieTarget,
  waterMl,
  waterTarget,
  sleepMin,
  sleepTargetMin,
  steps,
  diaryHref = "/log",
  readOnlyBodyMetrics = true,
  onWaterAdd,
  onSleepSet,
  onStepsSet,
}: {
  calories: number;
  calorieTarget: number;
  waterMl?: number;
  waterTarget: number;
  sleepMin?: number;
  sleepTargetMin: number;
  steps?: number;
  diaryHref?: string;
  /** В mass-market: вода/сон/шаги только в Дневнике */
  readOnlyBodyMetrics?: boolean;
  onWaterAdd?: (ml: number) => void;
  onSleepSet?: (minutes: number) => void;
  onStepsSet?: (steps: number) => void;
}) {
  const bodyReadOnly = readOnlyBodyMetrics;

  const items = [
    {
      id: "food",
      Icon: Flame,
      label: "Еда",
      value: `${calories}`,
      sub: ` / ${calorieTarget} ккал`,
      pct: calorieTarget > 0 ? calories / calorieTarget : 0,
      color: "var(--accent)",
      hint: "Из выбора ниже",
      actions: undefined as { label: string; onClick: () => void }[] | undefined,
    },
    {
      id: "water",
      Icon: Droplets,
      label: "Вода",
      value: `${waterMl ?? 0}`,
      sub: ` / ${waterTarget} мл`,
      pct: waterTarget > 0 ? (waterMl ?? 0) / waterTarget : 0,
      color: "var(--purple)",
      hint: bodyReadOnly ? "→ Дневник" : "Нажми +",
      actions:
        !bodyReadOnly && onWaterAdd
          ? [
              { label: "+250", onClick: () => onWaterAdd(250) },
              { label: "+500", onClick: () => onWaterAdd(500) },
            ]
          : undefined,
    },
    {
      id: "sleep",
      Icon: Moon,
      label: "Сон",
      value: sleepMin ? `${Math.round(sleepMin / 60)}ч` : "—",
      sub: ` / ${Math.round(sleepTargetMin / 60)}ч`,
      pct: sleepMin ? sleepMin / sleepTargetMin : 0,
      color: "var(--brown)",
      hint: bodyReadOnly ? "→ Дневник" : "Быстрый выбор",
      actions:
        !bodyReadOnly && onSleepSet
          ? [
              { label: "6ч", onClick: () => onSleepSet(360) },
              { label: "7ч", onClick: () => onSleepSet(420) },
              { label: "8ч", onClick: () => onSleepSet(480) },
            ]
          : undefined,
    },
    {
      id: "steps",
      Icon: Footprints,
      label: "Шаги",
      value: steps != null ? (steps >= 1000 ? `${Math.round(steps / 100) / 10}k` : String(steps)) : "—",
      sub: " / 8k",
      pct: steps != null ? steps / 8000 : 0,
      color: "var(--pink)",
      hint: bodyReadOnly ? "→ Дневник" : "Быстрый выбор",
      actions:
        !bodyReadOnly && onStepsSet
          ? [
              { label: "2k", onClick: () => onStepsSet(2000) },
              { label: "5k", onClick: () => onStepsSet(5000) },
              { label: "8k", onClick: () => onStepsSet(8000) },
            ]
          : undefined,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="vc-text-sm font-semibold text-[var(--text)]">Показатели дня</p>
        {bodyReadOnly ? (
          <Link href={diaryHref} className="vc-text-xs text-[var(--accent)] shrink-0">
            Вода · сон · шаги →
          </Link>
        ) : (
          <span className="vc-text-xs text-[var(--text-tertiary)]">листай →</span>
        )}
      </div>
      <div className="vc-pick-strip-wrap">
        <div className="vc-pick-strip vc-health-strip">
          {items.map((item) => (
            <div key={item.id} className="vc-health-chip">
              <div className="vc-health-chip-row">
                <item.Icon size={16} className="shrink-0" style={{ color: item.color }} />
                <span className="vc-text-sm font-semibold text-[var(--text)]">{item.label}</span>
                <span className="ml-auto vc-text-sm font-bold text-[var(--text)] whitespace-nowrap">
                  {item.value}
                  <span className="vc-text-xs font-normal text-[var(--text-tertiary)]">{item.sub}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--gray-soft)] mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, item.pct * 100)}%`,
                    background: item.color,
                  }}
                />
              </div>
              {item.actions ? (
                <div className="vc-health-chip-actions">
                  {item.actions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      className="vc-health-chip-btn"
                      onClick={() => a.onClick()}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5">{item.hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
