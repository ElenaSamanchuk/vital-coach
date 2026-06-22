"use client";

import { Droplets } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

const ADD_ML = [250, 500, 750] as const;

export function WaterDropControl({
  valueMl,
  targetMl,
  onChange,
}: {
  valueMl: number;
  targetMl: number;
  onChange: (ml: number) => void;
}) {
  const pct = targetMl > 0 ? Math.min(100, Math.round((valueMl / targetMl) * 100)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="vc-text-sm font-semibold flex items-center gap-1.5">
          <Droplets size={16} className="text-[var(--accent)]" strokeWidth={1.75} /> Вода
        </span>
        <span className="vc-text-sm font-semibold tabular-nums">
          {valueMl} / {targetMl} мл
        </span>
      </div>

      <div className="flex gap-2 justify-center">
        {ADD_ML.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => {
              hapticLight();
              onChange(valueMl + ml);
            }}
            className="flex flex-col items-center justify-center flex-1 max-w-[5.5rem] rounded-2xl px-2 py-3 bg-[var(--accent-soft)] hover:bg-[var(--accent)]/15 active:scale-95 transition-all border border-[var(--accent)]/10"
          >
            <Droplets size={22} className="text-[var(--accent)]" strokeWidth={1.75} />
            <span className="vc-text-sm font-bold mt-1 text-[var(--accent)]">+{ml}</span>
          </button>
        ))}
      </div>

      <div className="h-2 rounded-full bg-[var(--ring-track)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#5AC8FA] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onChange(Math.max(0, valueMl - 250));
          }}
          className="vc-text-xs text-[var(--text-tertiary)] px-2 py-1"
        >
          −250
        </button>
        <p className="vc-text-xs text-[var(--text-tertiary)]">{pct}% от цели</p>
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onChange(0);
          }}
          className="vc-text-xs text-[var(--text-tertiary)] px-2 py-1"
        >
          сброс
        </button>
      </div>
    </div>
  );
}
