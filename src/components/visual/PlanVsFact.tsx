import { Utensils, Moon, Droplets } from "lucide-react";

export function PlanVsFact({
  planCalories,
  planProtein,
  targetCalories,
  targetProtein,
  sleepMin,
  sleepTargetMin,
  waterMl,
  waterTarget,
}: {
  planCalories?: number;
  planProtein?: number;
  targetCalories: number;
  targetProtein: number;
  sleepMin?: number;
  sleepTargetMin: number;
  waterMl?: number;
  waterTarget: number;
}) {
  const rows = [
    {
      Icon: Utensils,
      label: "Питание",
      plan: planCalories ? `${planCalories} ккал · ${planProtein ?? "—"} г белка` : "Выбери на Сегодня",
      target: `${targetCalories} ккал · ${targetProtein} г`,
      ok: planCalories != null && planCalories <= targetCalories * 1.08,
    },
    {
      Icon: Moon,
      label: "Сон",
      plan: sleepMin ? `${Math.round(sleepMin / 60)} ч` : "Не записан",
      target: `${Math.round(sleepTargetMin / 60)} ч`,
      ok: sleepMin != null && sleepMin >= sleepTargetMin * 0.85,
    },
    {
      Icon: Droplets,
      label: "Вода",
      plan: waterMl ? `${waterMl} мл` : "0 мл",
      target: `${waterTarget} мл`,
      ok: (waterMl ?? 0) >= waterTarget * 0.7,
    },
  ];

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center gap-3 rounded-xl bg-[var(--bg-subtle)] px-3 py-2.5"
        >
          <r.Icon size={16} className="text-[var(--accent)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium">{r.label}</p>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">{r.plan}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[var(--text-tertiary)]">цель</p>
            <p className={`text-[11px] font-semibold ${r.ok ? "text-[var(--success)]" : "text-[var(--text-secondary)]"}`}>
              {r.target}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
