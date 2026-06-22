"use client";

import {
  LIFE_PULSE_KEYS,
  LIFE_PULSE_META,
  weekPulseStats,
  weekBalanceInsight,
  type WeekPulseStat,
} from "@/lib/life-pulse";

function SphereBar({ stat }: { stat: WeekPulseStat }) {
  const meta = LIFE_PULSE_META[stat.key];
  const pct = Math.round((stat.daysActive / 7) * 100);
  const Icon = meta.icon;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={14} style={{ color: meta.color }} className="shrink-0" />
          <span className="vc-text-sm font-medium truncate">{meta.short}</span>
        </div>
        <span className="vc-text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
          {stat.daysActive}/7 · {stat.totalMinutes} мин
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--ring-track)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(4, pct)}%`, background: meta.color }}
        />
      </div>
    </div>
  );
}

export function LifePulseWeekCard({
  logs,
}: {
  logs: { lifeActionsJson?: string | null }[];
}) {
  const stats = weekPulseStats(logs);
  const insight = weekBalanceInsight(stats);
  const totalDays = Math.max(
    1,
    ...stats.map((s) => s.daysActive),
  );

  return (
    <div className="vc-glass-card rounded-2xl space-y-4">
      <div>
        <p className="vc-text-lg">Четыре опоры</p>
        <p className="vc-subtitle vc-text-xs mt-0.5">Сколько дней на неделе была каждая сфера</p>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => (
          <SphereBar key={stat.key} stat={stat} />
        ))}
      </div>

      <p className="vc-text-xs text-[var(--text-secondary)] leading-relaxed px-1 border-t border-[var(--border)] pt-3">
        {insight}
      </p>

      {totalDays === 0 && (
        <p className="vc-text-xs text-center text-[var(--text-tertiary)]">
          Отмечай сферы на «Сегодня» — здесь появится недельная картина
        </p>
      )}
    </div>
  );
}
