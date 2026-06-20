"use client";

/** Lifesum-style макро-полоски */

export function MacroBars({
  protein,
  proteinTarget,
  fat,
  fatTarget,
  carbs,
  carbTarget,
}: {
  protein: number;
  proteinTarget: number;
  fat: number;
  fatTarget: number;
  carbs: number;
  carbTarget: number;
}) {
  const rows = [
    { label: "Белок", val: protein, target: proteinTarget, color: "var(--purple)" },
    { label: "Жиры", val: fat, target: fatTarget, color: "var(--brown)" },
    { label: "Углеводы", val: carbs, target: carbTarget, color: "var(--pink)" },
  ];

  return (
    <div className="space-y-2.5 mt-3 pt-3 border-t border-[var(--border)]">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-1">
            <span>{r.label}</span>
            <span>
              {Math.round(r.val)}/{r.target} г
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--gray-soft)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, r.target > 0 ? (r.val / r.target) * 100 : 0)}%`,
                background: r.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
