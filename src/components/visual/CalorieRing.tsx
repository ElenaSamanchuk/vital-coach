"use client";

/** Lifesum-style кольцо калорий */

export function CalorieRing({
  consumed,
  target,
  protein,
  proteinTarget,
}: {
  consumed: number;
  target: number;
  protein?: number;
  proteinTarget?: number;
}) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0 w-[104px] h-[104px]">
        <svg width="104" height="104" className="-rotate-90">
          <circle cx="52" cy="52" r={r} fill="none" stroke="var(--ring-track)" strokeWidth="10" />
          <circle
            cx="52"
            cy="52"
            r={r}
            fill="none"
            stroke={over ? "var(--pink)" : "var(--accent)"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] font-bold leading-none">{consumed}</span>
          <span className="text-[9px] text-[var(--text-secondary)] mt-0.5">ккал</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <p className="text-[11px] text-[var(--text-secondary)]">Цель дня</p>
          <p className="text-[15px] font-semibold">
            {over ? (
              <span className="text-[var(--pink)]">+{consumed - target} сверх</span>
            ) : (
              <span className="text-[var(--accent)]">{remaining} осталось</span>
            )}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)]">из {target} ккал</p>
        </div>
        {protein != null && proteinTarget != null && (
          <div>
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-1">
              <span>Белок</span>
              <span>
                {protein}/{proteinTarget} г
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--gray-soft)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--purple)] transition-all duration-500"
                style={{ width: `${Math.min(100, (protein / proteinTarget) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
