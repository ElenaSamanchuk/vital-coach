"use client";

import { useState } from "react";
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
import { hapticLight, hapticSuccess } from "@/lib/haptics";
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

export function LifePulseCard({
  pulse,
  onChange,
  compact = false,
}: {
  pulse: LifePulseDay;
  onChange: (next: LifePulseDay) => void;
  compact?: boolean;
}) {
  const [activeKey, setActiveKey] = useState<LifePulseKey>("work");
  const balance = dayBalanceScore(pulse);
  const touched = spheresTouched(pulse);
  const meta = LIFE_PULSE_META[activeKey];
  const sphere = pulse[activeKey];

  const patch = (next: LifePulseDay) => {
    hapticSuccess();
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
          <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5">
            {touched}/4
          </p>
        </div>
      </div>

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

          <div className="vc-pick-strip-wrap">
            <div className="vc-pick-strip">
              {LIFE_PULSE_ITEMS[activeKey].map((item) => {
                const selected = sphere.items.includes(item.id);
                return (
                  <PickChip
                    key={item.id}
                    selected={selected}
                    onClick={() => patch(togglePulseItem(pulse, activeKey, item.id))}
                  >
                    <p className="vc-pick-chip-title whitespace-nowrap">{item.label}</p>
                    {item.minutes != null && (
                      <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5">
                        ~{item.minutes} мин
                      </p>
                    )}
                  </PickChip>
                );
              })}
            </div>
          </div>

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
