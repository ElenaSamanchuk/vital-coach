"use client";

import { Moon } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

const PILLOW_HOURS = 1;
const PILLOW_MIN = PILLOW_HOURS * 60;

export function SleepPillowControl({
  sleepMinutes,
  targetMin,
  onChange,
}: {
  sleepMinutes: number;
  targetMin: number;
  onChange: (min: number) => void;
}) {
  const pillows = Math.ceil(targetMin / PILLOW_MIN);
  const filled = Math.min(pillows, Math.floor(sleepMinutes / PILLOW_MIN));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="vc-text-sm font-semibold flex items-center gap-1.5">
          <Moon size={16} className="text-[var(--purple)]" /> Сон
        </span>
        <span className="vc-text-sm font-semibold tabular-nums">
          {(sleepMinutes / 60).toFixed(1)} / {(targetMin / 60).toFixed(1)} ч
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: pillows }, (_, i) => {
          const active = i < filled;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${PILLOW_HOURS} ч сна`}
              onClick={() => {
                hapticLight();
                const next = i < filled ? i * PILLOW_MIN : (i + 1) * PILLOW_MIN;
                onChange(next);
              }}
              className={`px-3 py-2 rounded-xl transition-all ${
                active ? "bg-[var(--purple-soft)] scale-105" : "bg-[var(--bg-subtle)] opacity-50"
              }`}
            >
              <span className="text-2xl leading-none">{active ? "🛏️" : "▫️"}</span>
            </button>
          );
        })}
      </div>
      <p className="vc-text-xs text-center text-[var(--text-tertiary)]">Подушка = {PILLOW_HOURS} ч сна</p>
    </div>
  );
}
