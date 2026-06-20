"use client";

import { CORE_VALUES_OPTIONS } from "@/lib/psychology-frameworks";

const PYRAMID_LAYERS = [
  { level: 4, label: "Смысл / миссия", emoji: "🌟", width: 45 },
  { level: 3, label: "Ценности в действии", emoji: "🎯", width: 58 },
  { level: 2, label: "Выбранные ценности", emoji: "💎", width: 72 },
  { level: 1, label: "Ежедневные привычки", emoji: "🌱", width: 88 },
];

export function ValuesPyramidVisual({ selected }: { selected: string[] }) {
  const labels = selected
    .map((id) => CORE_VALUES_OPTIONS.find((v) => v.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-1">
        {PYRAMID_LAYERS.map((layer) => (
          <div
            key={layer.level}
            className="vc-glass-card rounded-xl py-2.5 px-3 text-center transition-all"
            style={{ width: `${layer.width}%` }}
          >
            <span className="text-[12px] font-semibold">
              {layer.emoji} {layer.label}
            </span>
          </div>
        ))}
      </div>
      {labels.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {labels.map((v) => (
            <span
              key={v!.id}
              className="vc-glass-card rounded-full px-3 py-1.5 text-[12px] font-medium"
            >
              {v!.emoji} {v!.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-center text-[12px] text-[var(--text-secondary)]">
          Выбери 3 ценности в профиле — пирамида наполнится
        </p>
      )}
      <p className="text-[10px] text-center text-[var(--text-tertiary)] italic">
        ACT (Hayes): действия снизу поддерживают смысл сверху
      </p>
    </div>
  );
}
