"use client";

import { apiClient } from "@/lib/api-client";
import { useMemo, useState } from "react";
import { Coffee, Moon, Sun } from "lucide-react";
import { format } from "date-fns";
import {
  activeRoutinePhase,
  getRoutineSteps,
  type RoutinePhase,
  type RoutineContext,
} from "@/lib/day-routines";
import { routineDone, type LifeActions } from "@/lib/life-actions";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { routineImpact } from "@/lib/impact-motivation";
import { ImpactLine } from "./ImpactLine";

const PHASE_META: Record<
  RoutinePhase,
  { label: string; icon: typeof Sun; sub: string }
> = {
  morning: { label: "Утро", icon: Sun, sub: "Запуск дня" },
  midday: { label: "Обед", icon: Coffee, sub: "Переключение с работы" },
  evening: { label: "Вечер", icon: Moon, sub: "Закрытие дня" },
};

const MOOD_PRESETS = [
  { id: "tired", label: "Устала", energy: 4, mood: 5, stress: 6 },
  { id: "ok", label: "Норм", energy: 7, mood: 7, stress: 5 },
  { id: "good", label: "Бодро", energy: 8, mood: 8, stress: 4 },
] as const;

export function DayRhythmCard({
  lifeActions,
  ctx,
  moodLogged,
  onToggleStep,
  onMoodSaved,
}: {
  lifeActions: LifeActions;
  ctx: RoutineContext;
  moodLogged: boolean;
  onToggleStep: (phase: RoutinePhase, stepId: string) => void;
  onMoodSaved: () => void;
}) {
  const defaultPhase = activeRoutinePhase(ctx.hour);
  const [phase, setPhase] = useState<RoutinePhase>(defaultPhase);
  const [savingMood, setSavingMood] = useState(false);

  const steps = useMemo(() => getRoutineSteps(phase, ctx), [phase, ctx]);
  const done = routineDone(lifeActions, phase);
  const progress = steps.filter((s) => done.includes(s.id)).length;
  const meta = PHASE_META[phase];
  const PhaseIcon = meta.icon;

  const saveMood = async (preset: (typeof MOOD_PRESETS)[number]) => {
    if (savingMood) return;
    setSavingMood(true);
    hapticLight();
    await apiClient("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        energy: preset.energy,
        mood: preset.mood,
        stress: preset.stress,
      }),
    });
    hapticSuccess();
    setSavingMood(false);
    onMoodSaved();
  };

  return (
    <div className="vc-glass-card rounded-3xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PhaseIcon size={16} className="text-[var(--accent)]" />
          <div>
            <p className="text-[15px] font-bold">Ритм дня</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{meta.sub}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[var(--accent)]">
          {progress}/{steps.length}
        </span>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-subtle)]">
        {(["morning", "midday", "evening"] as RoutinePhase[]).map((p) => {
          const PIcon = PHASE_META[p].icon;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                phase === p
                  ? "bg-[var(--elevated)] text-[var(--text)] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <PIcon size={11} />
              {PHASE_META[p].label}
            </button>
          );
        })}
      </div>

      {phase === "morning" && !moodLogged && (
        <div className="rounded-xl bg-[var(--accent-soft)] px-3 py-2.5">
          <p className="text-[11px] font-semibold mb-2">Как утро?</p>
          <div className="flex gap-2">
            {MOOD_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={savingMood}
                onClick={() => saveMood(p)}
                className="flex-1 rounded-lg bg-[var(--elevated)] py-2 text-[12px] font-medium disabled:opacity-60"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {steps.map((s) => {
          const active = done.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                hapticLight();
                onToggleStep(phase, s.id);
                if (!active) hapticSuccess();
              }}
              className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all ${
                active
                  ? "bg-[var(--accent-soft)] border-[var(--accent)]/35"
                  : "bg-[var(--elevated)] border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                    active
                      ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                      : "border-[var(--border)]"
                  }`}
                >
                  {active ? "✓" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] font-medium ${active ? "line-through opacity-75" : ""}`}
                  >
                    {s.label}
                    {s.minutes ? (
                      <span className="text-[var(--text-tertiary)] font-normal">
                        {" "}
                        · {s.minutes} мин
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-snug">{s.hint}</p>
                  {!active && <ImpactLine text={routineImpact(s.id)} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
