"use client";

import { BedDouble, CloudMoon, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

const PRESETS: { hours: number; label: string; Icon: LucideIcon }[] = [
  { hours: 6, label: "6 ч", Icon: Moon },
  { hours: 7, label: "7 ч", Icon: CloudMoon },
  { hours: 8, label: "8 ч", Icon: BedDouble },
];

export function SleepPillowControl({
  sleepMinutes,
  targetMin,
  onChange,
}: {
  sleepMinutes: number;
  targetMin: number;
  onChange: (min: number) => void;
}) {
  const currentHours = sleepMinutes / 60;
  const targetHours = targetMin / 60;
  const activePreset = PRESETS.find((p) => Math.abs(currentHours - p.hours) < 0.25)?.hours;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="vc-text-sm font-semibold flex items-center gap-1.5">
          <Moon size={16} className="text-[var(--purple,#8E7CC3)]" strokeWidth={1.75} /> Сон
        </span>
        <span className="vc-text-sm font-semibold tabular-nums">
          {currentHours > 0 ? currentHours.toFixed(1) : "—"} / {targetHours.toFixed(0)} ч
        </span>
      </div>

      <div className="flex gap-2 justify-center">
        {PRESETS.map(({ hours, label, Icon }) => {
          const active = activePreset === hours;
          return (
            <button
              key={hours}
              type="button"
              onClick={() => {
                hapticLight();
                onChange(active ? 0 : hours * 60);
              }}
              className={`flex flex-col items-center justify-center flex-1 max-w-[5.5rem] rounded-2xl px-2 py-3 transition-all border active:scale-95 ${
                active
                  ? "bg-[var(--purple-soft,#ede9fe)] border-[var(--purple,#8E7CC3)]/40 shadow-sm"
                  : "bg-[var(--bg-subtle)] border-transparent hover:border-[var(--purple,#8E7CC3)]/20"
              }`}
            >
              <Icon
                size={22}
                className={active ? "text-[var(--purple,#8E7CC3)]" : "text-[var(--text-tertiary)]"}
                strokeWidth={1.75}
              />
              <span
                className={`vc-text-sm font-bold mt-1 ${active ? "text-[var(--purple,#8E7CC3)]" : "text-[var(--text-secondary)]"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="vc-text-xs text-center text-[var(--text-tertiary)]">
        Нажми 6 / 7 / 8 ч · повтор — сброс
      </p>
    </div>
  );
}
