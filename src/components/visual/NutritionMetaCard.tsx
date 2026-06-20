import type { NutritionMeta } from "@/lib/profile-derivation";
import { Scale, Target } from "lucide-react";

export function NutritionMetaCard({
  meta,
  compact = false,
}: {
  meta: NutritionMeta;
  compact?: boolean;
}) {
  if (compact) {
    const deficit = meta.tdee - meta.calorieTarget;
    return (
      <details className="rounded-xl bg-[var(--bg-subtle)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
        <summary className="cursor-pointer font-medium text-[var(--text)] list-none flex items-center gap-1">
          <Scale size={12} className="text-[var(--accent)]" />
          Цель {meta.calorieTarget} ккал · дефицит ~{deficit}
        </summary>
        <p className="mt-2 leading-snug">{meta.explanation}</p>
      </details>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Scale size={16} className="text-[var(--accent)]" />
        <span className="text-[13px] font-semibold">Расчёт калорий</span>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
          {meta.bodyGoalLabelRu}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[var(--bg-subtle)] p-2">
          <p className="text-[10px] text-[var(--text-secondary)]">ИМТ</p>
          <p className="text-[15px] font-bold">{meta.bmi}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-subtle)] p-2">
          <p className="text-[10px] text-[var(--text-secondary)]">
            {meta.bodyGoal === "lose" ? "Расход" : "TDEE"}
          </p>
          <p className="text-[15px] font-bold">{meta.tdee}</p>
          {meta.bodyGoal === "lose" && (
            <p className="text-[9px] text-[var(--text-tertiary)]">еда от {meta.dietBase}</p>
          )}
        </div>
        <div className="rounded-xl bg-[var(--accent-soft)] p-2">
          <p className="text-[10px] text-[var(--text-secondary)]">Цель</p>
          <p className="text-[15px] font-bold text-[var(--accent)]">{meta.calorieTarget}</p>
        </div>
      </div>
      <p className="text-[11px] leading-snug text-[var(--text-secondary)] flex gap-1.5">
        <Target size={12} className="shrink-0 mt-0.5 text-[var(--accent)]" />
        {meta.explanation}
      </p>
    </div>
  );
}
