"use client";

export function MealSlotBars({
  slots,
}: {
  slots: { label: string; budget: number; actual: number; pct: number }[];
}) {
  return (
    <div className="space-y-2">
      {slots.map((s) => {
        const over = s.actual > s.budget;
        return (
          <div key={s.label}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-[var(--text-secondary)]">{s.label}</span>
              <span className={over ? "text-[var(--pink)] font-semibold" : "text-[var(--text)]"}>
                {s.actual}/{s.budget}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--gray-soft)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, s.pct * 100)}%`,
                  background: over ? "var(--pink)" : "var(--accent)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
