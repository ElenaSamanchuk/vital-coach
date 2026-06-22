"use client";

import { useMemo, useState } from "react";
import {
  type LifePulseDay,
  type LifePulseKey,
  LIFE_PULSE_KEYS,
  LIFE_PULSE_META,
  LIFE_PULSE_ITEMS,
  sphereProgress,
  dayBalanceScore,
  spheresTouched,
  togglePulseItem,
  setPulseFeel,
  setPulseMinutes,
  addPulseMinutes,
} from "@/lib/life-pulse";
import {
  type MoodContext,
  moodBannerForPulse,
  suggestedPulseItems,
  pulseItemTip,
  leisureMoodBoostFromPulse,
} from "@/lib/life-pulse-mood";
import { hapticLight } from "@/lib/haptics";
import { PickChip } from "@/components/ui/PickChip";

const FEEL_OPTIONS = [
  { value: 1, label: "Тяжело", emoji: "😮‍💨" },
  { value: 2, label: "Норм", emoji: "🙂" },
  { value: 3, label: "Хорошо", emoji: "✨" },
] as const;

function PulseTile({
  pulseKey,
  pulse,
  selected,
  onSelect,
}: {
  pulseKey: LifePulseKey;
  pulse: LifePulseDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = LIFE_PULSE_META[pulseKey];
  const progress = sphereProgress(pulse[pulseKey]);
  const pct = Math.round(progress * 100);
  const Icon = meta.icon;
  const active = progress > 0.05;

  return (
    <button
      type="button"
      onClick={() => {
        hapticLight();
        onSelect();
      }}
      className={`relative overflow-hidden rounded-2xl p-3 text-left min-h-[88px] transition-all border ${
        selected
          ? "border-[var(--accent)] shadow-md scale-[1.01]"
          : "border-[var(--border)] hover:border-[var(--accent)]/40"
      }`}
      style={{
        background: active
          ? `linear-gradient(145deg, ${meta.color}18 0%, var(--elevated) 55%)`
          : "var(--elevated)",
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-1 origin-left transition-transform duration-500"
        style={{
          background: meta.color,
          transform: `scaleX(${Math.max(0.08, progress)})`,
        }}
      />
      <div className="flex items-start justify-between gap-1">
        <Icon size={16} style={{ color: meta.color }} className="shrink-0 mt-0.5" />
        <span className="vc-text-xs font-bold tabular-nums" style={{ color: meta.color }}>
          {pct}%
        </span>
      </div>
      <p className="vc-text-sm font-semibold mt-2 leading-tight">{meta.short}</p>
      <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
        {pulse[pulseKey].items.length > 0
          ? `${pulse[pulseKey].items.length} · ${pulse[pulseKey].minutes} мин`
          : meta.hint}
      </p>
    </button>
  );
}

function PulseChip({
  item,
  selected,
  recommended,
  onClick,
}: {
  item: (typeof LIFE_PULSE_ITEMS)[LifePulseKey][number];
  selected: boolean;
  recommended: boolean;
  onClick: () => void;
}) {
  const tip = item.tip;
  return (
    <PickChip selected={selected} recommended={recommended} onClick={onClick}>
      <div className="flex items-start justify-between gap-1">
        <p className="vc-pick-chip-title">{item.label}</p>
        {item.moodBoost != null && (
          <span className="vc-text-xs font-bold text-[var(--accent)] shrink-0">↑{item.moodBoost}</span>
        )}
      </div>
      {item.minutes != null && (
        <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5">~{item.minutes} мин</p>
      )}
      {selected && tip && (
        <p className="vc-text-xs text-[var(--accent)] mt-1 leading-snug">{tip}</p>
      )}
      {recommended && !selected && (
        <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5">под настроение</p>
      )}
    </PickChip>
  );
}

export function LifePulseCard({
  pulse,
  onChange,
  compact = false,
  moodContext,
}: {
  pulse: LifePulseDay;
  onChange: (next: LifePulseDay) => void;
  compact?: boolean;
  moodContext?: MoodContext;
}) {
  const [activeKey, setActiveKey] = useState<LifePulseKey>("leisure");
  const balance = dayBalanceScore(pulse);
  const touched = spheresTouched(pulse);
  const meta = LIFE_PULSE_META[activeKey];
  const sphere = pulse[activeKey];

  const suggested = useMemo(
    () => (moodContext ? suggestedPulseItems(moodContext, activeKey) : []),
    [moodContext, activeKey],
  );

  const suggestedSet = useMemo(() => new Set(suggested), [suggested]);
  const allItems = LIFE_PULSE_ITEMS[activeKey];
  const restItems = allItems.filter((i) => !suggestedSet.has(i.id));
  const leisureBoost = activeKey === "leisure" ? leisureMoodBoostFromPulse(pulse) : null;

  const patch = (next: LifePulseDay) => {
    onChange(next);
  };

  return (
    <div className="vc-glass-card rounded-2xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="vc-text-lg">Баланс дня</p>
          <p className="vc-subtitle vc-text-xs mt-0.5">
            Работа · уход · досуг · быт — отметь что было
          </p>
        </div>
        <div className="text-center shrink-0 px-3 py-2 rounded-xl bg-[var(--bg-subtle)]">
          <p className="text-[22px] font-bold leading-none tabular-nums text-[var(--accent)]">
            {balance}
          </p>
          <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5">{touched}/4</p>
        </div>
      </div>

      {moodContext && (
        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] bg-[var(--bg-subtle)] rounded-xl px-3 py-2">
          {moodBannerForPulse(moodContext)}
        </p>
      )}

      {leisureBoost != null && leisureBoost >= 7 && (
        <p className="text-[12px] text-[var(--accent)] font-medium px-1">
          Досуг сегодня · средний эффект на настроение ↑{leisureBoost}/10
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {LIFE_PULSE_KEYS.map((key) => (
          <PulseTile
            key={key}
            pulseKey={key}
            pulse={pulse}
            selected={activeKey === key}
            onSelect={() => setActiveKey(key)}
          />
        ))}
      </div>

      {!compact && (
        <div
          className="rounded-2xl border border-[var(--border)] p-3 space-y-3"
          style={{ background: `${meta.color}08` }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="vc-text-sm font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </p>
            <span className="vc-text-xs text-[var(--text-secondary)] tabular-nums">
              {sphere.minutes} мин
            </span>
          </div>

          {suggested.length > 0 && (
            <div>
              <p className="vc-overline mb-2">Под настроение</p>
              <div className="flex flex-wrap gap-2">
                {suggested.map((id) => {
                  const item = allItems.find((i) => i.id === id);
                  if (!item) return null;
                  return (
                    <PulseChip
                      key={item.id}
                      item={item}
                      selected={sphere.items.includes(item.id)}
                      recommended
                      onClick={() => patch(togglePulseItem(pulse, activeKey, item.id))}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="vc-overline mb-2">{suggested.length > 0 ? "Все плашки" : "Что было?"}</p>
            <div className="flex flex-wrap gap-2">
              {restItems.map((item) => (
                <PulseChip
                  key={item.id}
                  item={item}
                  selected={sphere.items.includes(item.id)}
                  recommended={false}
                  onClick={() => patch(togglePulseItem(pulse, activeKey, item.id))}
                />
              ))}
            </div>
          </div>

          {sphere.items.length > 0 && (
            <div className="rounded-xl bg-[var(--elevated)] px-3 py-2 space-y-1">
              <p className="vc-text-xs font-semibold text-[var(--text-secondary)]">Выбрано</p>
              {sphere.items.map((id) => {
                const tip = pulseItemTip(activeKey, id);
                const label = allItems.find((i) => i.id === id)?.label ?? id;
                return tip ? (
                  <p key={id} className="vc-text-xs text-[var(--text-secondary)] leading-snug">
                    <span className="font-semibold text-[var(--text)]">{label}</span> — {tip}
                  </p>
                ) : null;
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {[15, 30, 45, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => patch(addPulseMinutes(pulse, activeKey, m))}
                className="px-2.5 py-1 rounded-lg vc-text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface)]"
              >
                +{m} мин
              </button>
            ))}
            {sphere.minutes > 0 && (
              <button
                type="button"
                onClick={() => patch(setPulseMinutes(pulse, activeKey, 0))}
                className="px-2.5 py-1 rounded-lg vc-text-xs text-[var(--text-tertiary)]"
              >
                сброс мин
              </button>
            )}
          </div>

          <div>
            <p className="vc-overline mb-1.5">Как прошло?</p>
            <div className="flex gap-1.5">
              {FEEL_OPTIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    patch(setPulseFeel(pulse, activeKey, sphere.feel === value ? null : value))
                  }
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl min-h-[var(--touch-compact)] transition-all ${
                    sphere.feel === value
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="text-lg leading-none">{emoji}</span>
                  <span className="vc-text-xs font-semibold mt-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
