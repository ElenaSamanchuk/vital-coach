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
}) {
  const defaultTab = (): Tab => {
    const phase = activeRoutinePhase(new Date().getHours());
    if (phase === "morning") return "food";
    if (phase === "midday") return "sport";
    return "leisure";
  };
  const [tab, setTab] = useState<Tab>(defaultTab);

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
          Можно выбрать несколько · листай влево · повторное нажатие снимает выбор
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
          {mealPlan.map((slot) => (
            <PickStripSection key={slot.slot} label={slot.slotLabel} count={slot.options.length}>
              {slot.options.map((opt) => {
                const id = (opt as { id?: string }).id ?? opt.title;
                const selected = (mealChoices[slot.slot] ?? []).includes(id);
                const short = opt.title.split("+")[0].trim().slice(0, 40);
                const impact = (opt as { impact?: string }).impact;
                return (
                  <PickChip
                    key={id}
                    selected={selected}
                    onClick={() => {
                      hapticLight();
                      onMealSelect(slot.slot, id);
                    }}
                  >
                    <p className="vc-pick-chip-title line-clamp-2">{short}</p>
                    <p className="vc-text-xs mt-0.5 text-[var(--text-secondary)]">
                      {opt.calories} ккал · {opt.proteinG} г
                    </p>
                    {impact && <ImpactLine text={impact} />}
                  </PickChip>
                );
              })}
            </PickStripSection>
          ))}
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
              const WIcon = workoutIcon(w.type);
              return (
                <PickChip
                  key={id}
                  selected={selected}
                  onClick={() => {
                    hapticLight();
                    onWorkoutSelect(id);
                  }}
                >
                  <div className="vc-pick-chip-row">
                    <WIcon size={16} className="text-[var(--accent)] shrink-0" />
                    <p className="vc-pick-chip-title line-clamp-2">{w.title}</p>
                  </div>
                  <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5">{w.durationMin} мин</p>
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
                  return (
                    <PickChip
                      key={l.id}
                      selected={selected}
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
