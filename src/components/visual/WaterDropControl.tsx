"use client";

import { Droplets } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

const DROP_ML = 250;

export function WaterDropControl({
  valueMl,
  targetMl,
  onChange,
}: {
  valueMl: number;
  targetMl: number;
  onChange: (ml: number) => void;
}) {
  const drops = Math.ceil(targetMl / DROP_ML);
  const filled = Math.min(drops, Math.floor(valueMl / DROP_ML));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="vc-text-sm font-semibold flex items-center gap-1.5">
          <Droplets size={16} className="text-[var(--accent)]" /> Вода
        </span>
        <span className="vc-text-sm font-semibold tabular-nums">
          {valueMl} / {targetMl} мл
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: drops }, (_, i) => {
          const active = i < filled;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${DROP_ML} мл`}
              onClick={() => {
                hapticLight();
                const next = i < filled ? i * DROP_ML : (i + 1) * DROP_ML;
                onChange(next);
              }}
              className={`p-2 rounded-xl transition-all ${
                active ? "bg-[var(--accent-soft)] scale-105" : "bg-[var(--bg-subtle)] opacity-50"
              }`}
            >
              <Droplets
                size={28}
                className={active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}
                fill={active ? "var(--accent-soft)" : "none"}
              />
            </button>
          );
        })}
      </div>
      <p className="vc-text-xs text-center text-[var(--text-tertiary)]">Нажми на каплю · +{DROP_ML} мл</p>
    </div>
  );
}
