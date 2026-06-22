"use client";

/** Горизонтальный слайдер — удобно свайпать на телефоне */
export function SwipeSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  formatValue,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (n: number) => string;
}) {
  const display = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <label className="block space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="vc-label">{label}</span>
        <span className="text-xl font-bold tabular-nums text-[var(--accent)]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 accent-[var(--accent)]"
      />
      <div className="flex justify-between vc-text-xs text-[var(--text-tertiary)]">
        <span>{min}{unit ? ` ${unit}` : ""}</span>
        <span>{max}{unit ? ` ${unit}` : ""}</span>
      </div>
    </label>
  );
}
