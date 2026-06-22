"use client";

import { useState, type ReactNode } from "react";
import { activeRoutinePhase } from "@/lib/day-routines";
import * as LucideIcons from "lucide-react";
import { Activity, Sparkles, Utensils, type LucideIcon } from "lucide-react";
import type { MealSlotPlan } from "@/lib/types";
import type { TodayLeisurePick } from "@/lib/today-picks";
import type { WorkoutOption } from "@/lib/fitness";
import { workoutIcon } from "@/lib/visual-icons";
import { hapticLight } from "@/lib/haptics";
import { ImpactLine } from "./ImpactLine";
import { PickChip } from "@/components/ui/PickChip";

type Tab = "food" | "sport" | "leisure";
type FoodKindTab = "product" | "dish";

const TABS: { id: Tab; label: string; icon: typeof Utensils }[] = [
  { id: "food", label: "Еда", icon: Utensils },
  { id: "sport", label: "Движение", icon: Activity },
  { id: "leisure", label: "Досуг", icon: Sparkles },
];

function LeisureIcon({ name, color }: { name: string; color: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (!Icon) return <Sparkles size={16} style={{ color }} className="shrink-0" />;
  return <Icon size={16} style={{ color }} className="shrink-0" />;
}

function PickStripSection({
  label,
  count,
  children,
}: {
  label?: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      {(label || count > 1) && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {label ? <p className="vc-overline">{label}</p> : <span />}
          {count > 1 && (
            <span className="vc-text-xs text-[var(--text-tertiary)] shrink-0">
              {count} · листай →
            </span>
          )}
        </div>
      )}
      <div className="vc-pick-strip-wrap">
        <div className="vc-pick-strip">{children}</div>
      </div>
    </div>
  );
}

function formatGenericNutrition(opt: MealSlotPlan["options"][number]): string {
  if (opt.description?.includes("ккал")) return opt.description;
  const portionTag = (opt as { tags?: string[] }).tags?.find((t) => t.startsWith("portion:"));
  const portion = portionTag?.slice("portion:".length);
  const proteinPart = opt.proteinG > 0 ? ` · белок ${opt.proteinG} г` : "";
  return portion
    ? `${portion} · ${opt.calories} ккал${proteinPart}`
    : `${opt.calories} ккал · белок ${opt.proteinG} г`;
}

export function TodayOptionsStrip({
  mealPlan,
  mealChoices,
  onMealSelect,
  sportOptions,
  selectedWorkoutIds,
  onWorkoutSelect,
  leisure,
  selectedLeisureIds,
  onLeisureSelect,
  recommendedMeals,
  recommendedWorkouts,
  recommendedLeisure,
  genericFoodLayout = false,
}: {
  mealPlan: MealSlotPlan[];
  mealChoices: Record<string, string[]>;
  onMealSelect: (slot: string, id: string) => void;
  sportOptions: WorkoutOption[];
  selectedWorkoutIds: string[];
  onWorkoutSelect: (id: string) => void;
  leisure: TodayLeisurePick[];
  selectedLeisureIds: string[];
  onLeisureSelect: (id: string) => void;
  recommendedMeals?: Record<string, string[]>;
  recommendedWorkouts?: string[];
  recommendedLeisure?: string[];
  /** Поток: продукты и блюда — один пул на любой приём */
  genericFoodLayout?: boolean;
}) {
  const defaultTab = (): Tab => {
    const phase = activeRoutinePhase(new Date().getHours());
    if (phase === "morning") return "food";
    if (phase === "midday") return "sport";
    return "leisure";
  };
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [foodKind, setFoodKind] = useState<FoodKindTab>("dish");

  const filterByKind = (options: MealSlotPlan["options"], kind: FoodKindTab) =>
    options.filter((o) => (o as { tags?: string[] }).tags?.includes(kind));

  const mealCount = mealPlan.reduce((n, s) => n + s.options.length, 0);
  const selectedMeals = mealPlan.reduce(
    (n, s) => n + (mealChoices[s.slot]?.length ?? 0),
    0,
  );
  const selectedSport = selectedWorkoutIds.length;
  const selectedLeisure = selectedLeisureIds.length;

  return (
    <div className="vc-glass-card rounded-2xl space-y-3">
      <div>
        <p className="vc-text-lg">Выбор на сегодня</p>
        <p className="vc-subtitle vc-text-xs mt-0.5">
          {genericFoodLayout
            ? "Продукты и блюда — в любой приём · несколько пунктов · листай →"
            : "Можно выбрать несколько · листай влево · повторное нажатие снимает выбор"}
        </p>
      </div>
      <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--bg-subtle)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 min-h-[var(--touch-compact)] py-1.5 rounded-lg vc-text-sm font-semibold transition-colors ${
              tab === id
                ? "bg-[var(--elevated)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "food" && (
        <div className="space-y-4">
          {genericFoodLayout && (
            <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--bg-subtle)]">
              {(
                [
                  { id: "dish" as const, label: "Блюда" },
                  { id: "product" as const, label: "Продукты" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFoodKind(id)}
                  className={`flex-1 py-1.5 rounded-md vc-text-xs font-semibold transition-colors ${
                    foodKind === id
                      ? "bg-[var(--elevated)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {mealPlan.map((slot) => {
            const options = genericFoodLayout
              ? filterByKind(slot.options, foodKind)
              : slot.options;
            if (genericFoodLayout && options.length === 0) return null;
            const slotLabel = genericFoodLayout
              ? `${slot.slotLabel} · что угодно`
              : slot.slotLabel;
            return (
            <PickStripSection key={slot.slot} label={slotLabel} count={options.length}>
              {options.map((opt) => {
                const id = (opt as { id?: string }).id ?? opt.title;
                const selected = (mealChoices[slot.slot] ?? []).includes(id);
                const recommended = (recommendedMeals?.[slot.slot] ?? []).includes(id);
                const short = opt.title.split("+")[0].trim().slice(0, 40);
                const impact = (opt as { impact?: string }).impact;
                const nutritionLine = genericFoodLayout
                  ? (opt.description || formatGenericNutrition(opt))
                  : `${opt.calories} ккал · белок ${opt.proteinG} г`;
                return (
                  <PickChip
                    key={`${slot.slot}-${id}`}
                    selected={selected}
                    recommended={recommended}
                    onClick={() => {
                      hapticLight();
                      onMealSelect(slot.slot, id);
                    }}
                  >
                    <p className="vc-pick-chip-title line-clamp-2">{short}</p>
                    <p className="vc-text-xs mt-0.5 text-[var(--text-secondary)]">
                      {nutritionLine}
                    </p>
                    {impact && <ImpactLine text={impact} />}
                  </PickChip>
                );
              })}
            </PickStripSection>
            );
          })}
          {selectedMeals > 0 && (
            <p className="vc-text-xs text-center text-[var(--text-tertiary)]">
              Выбрано {selectedMeals} · всего {mealCount} вариантов
            </p>
          )}
        </div>
      )}

      {tab === "sport" && (
        <>
          <PickStripSection count={sportOptions.length}>
            {sportOptions.map((w) => {
              const id = w.id ?? w.title;
              const selected = selectedWorkoutIds.includes(id);
            const recommended = (recommendedWorkouts ?? []).includes(id);
              const WIcon = workoutIcon(w.type);
              return (
              <PickChip
                key={id}
                selected={selected}
                recommended={recommended}
                onClick={() => {
                    hapticLight();
                    onWorkoutSelect(id);
                  }}
                >
                  <div className="vc-pick-chip-row">
                    <WIcon size={16} className="text-[var(--accent)] shrink-0" />
                    <p className="vc-pick-chip-title line-clamp-2">{w.title}</p>
                  </div>
                  <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5">
                    {w.durationMin} мин
                    {w.caloriesBurned != null ? ` · ~${w.caloriesBurned} ккал` : ""}
                  </p>
                  {w.impact && <ImpactLine text={w.impact} />}
                </PickChip>
              );
            })}
          </PickStripSection>
          {selectedSport > 0 && (
            <p className="vc-text-xs text-center text-[var(--text-tertiary)]">
              Выбрано тренировок: {selectedSport}
            </p>
          )}
        </>
      )}

      {tab === "leisure" && (
        <>
          {leisure.length === 0 ? (
            <p className="vc-text-sm py-4 text-center text-[var(--text-secondary)]">
              Подборка появится после загрузки плана
            </p>
          ) : (
            <>
              <PickStripSection count={leisure.length}>
                {leisure.map((l) => {
                  const selected = selectedLeisureIds.includes(l.id);
                const recommended = (recommendedLeisure ?? []).includes(l.id);
                  return (
                  <PickChip
                    key={l.id}
                    selected={selected}
                    recommended={recommended}
                    onClick={() => {
                        hapticLight();
                        onLeisureSelect(l.id);
                      }}
                    >
                      <div className="vc-pick-chip-row">
                        <LeisureIcon name={l.icon} color={l.color} />
                        <span className="vc-pick-chip-title line-clamp-2">{l.label}</span>
                      </div>
                      <p className="vc-text-xs text-[var(--text-secondary)] leading-snug line-clamp-2 mt-0.5">
                        {l.why}
                      </p>
                      <ImpactLine text={l.impact} />
                    </PickChip>
                  );
                })}
              </PickStripSection>
              {selectedLeisure > 0 && (
                <p className="vc-text-xs text-center text-[var(--text-tertiary)]">
                  Выбрано: {selectedLeisure}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
