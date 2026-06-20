"use client";

import { useState } from "react";
import { activeRoutinePhase } from "@/lib/day-routines";
import * as LucideIcons from "lucide-react";
import { Activity, Sparkles, Utensils, type LucideIcon } from "lucide-react";
import type { MealSlotPlan } from "@/lib/types";
import type { TodayLeisurePick } from "@/lib/today-picks";
import type { WorkoutOption } from "@/lib/fitness";
import { workoutIcon } from "@/lib/visual-icons";
import { hapticLight } from "@/lib/haptics";
import { ImpactLine } from "./ImpactLine";

type Tab = "food" | "sport" | "leisure";

const TABS: { id: Tab; label: string; icon: typeof Utensils }[] = [
  { id: "food", label: "Еда", icon: Utensils },
  { id: "sport", label: "Движение", icon: Activity },
  { id: "leisure", label: "Досуг", icon: Sparkles },
];

function LeisureIcon({ name, color }: { name: string; color: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (!Icon) return <Sparkles size={14} style={{ color }} />;
  return <Icon size={14} style={{ color }} />;
}

export function TodayOptionsStrip({
  mealPlan,
  mealChoices,
  onMealSelect,
  sportOptions,
  selectedWorkoutId,
  onWorkoutSelect,
  leisure,
}: {
  mealPlan: MealSlotPlan[];
  mealChoices: Record<string, string>;
  onMealSelect: (slot: string, id: string) => void;
  sportOptions: WorkoutOption[];
  selectedWorkoutId: string;
  onWorkoutSelect: (id: string) => void;
  leisure: TodayLeisurePick[];
}) {
  const defaultTab = (): Tab => {
    const phase = activeRoutinePhase(new Date().getHours());
    if (phase === "morning") return "food";
    if (phase === "midday") return "sport";
    return "leisure";
  };
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="vc-glass-card rounded-3xl p-4 space-y-3">
      <div>
        <p className="text-[15px] font-bold">Выбор на сегодня</p>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
          ↑ подпись — что получишь: нутриент, мышца, срок
        </p>
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-subtle)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
              tab === id
                ? "bg-[var(--elevated)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {tab === "food" && (
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {mealPlan.map((slot) => (
            <div key={slot.slot}>
              <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">
                {slot.slotLabel}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {slot.options.map((opt) => {
                  const id = (opt as { id?: string }).id ?? opt.title;
                  const selected = (mealChoices[slot.slot] ?? slot.selected?.id) === id;
                  const short = opt.title.split("+")[0].trim().slice(0, 28);
                  const impact = (opt as { impact?: string }).impact;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        hapticLight();
                        onMealSelect(slot.slot, id);
                      }}
                      className={`rounded-lg px-2.5 py-2 text-left min-w-[46%] flex-1 max-w-full ${
                        selected
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--elevated)] border border-[var(--border)]"
                      }`}
                    >
                      <p className="text-[11px] font-medium leading-tight line-clamp-2">{short}</p>
                      <p className={`text-[10px] mt-0.5 ${selected ? "text-white/80" : "text-[var(--accent)]"}`}>
                        {opt.calories} ккал · {opt.proteinG} г
                      </p>
                      {impact && <ImpactLine text={impact} inverted={selected} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "sport" && (
        <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
          {sportOptions.map((w) => {
            const id = w.id ?? w.title;
            const selected = selectedWorkoutId === id;
            const WIcon = workoutIcon(w.type);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  hapticLight();
                  onWorkoutSelect(id);
                }}
                className={`rounded-xl p-3 text-left border transition-all ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--elevated)]"
                }`}
              >
                <WIcon size={16} className="text-[var(--accent)] mb-1.5" />
                <p className="text-[12px] font-semibold leading-tight line-clamp-2">{w.title}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{w.durationMin} мин</p>
                {w.impact && <ImpactLine text={w.impact} />}
              </button>
            );
          })}
        </div>
      )}

      {tab === "leisure" && (
        <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto pr-1">
          {leisure.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 min-w-[46%] flex-1"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <LeisureIcon name={l.icon} color={l.color} />
                <span className="text-[12px] font-semibold">{l.label}</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] leading-snug">{l.why}</p>
              <ImpactLine text={l.impact} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
