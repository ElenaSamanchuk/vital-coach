"use client";

import { apiClient } from "@/lib/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Footprints, Scale, Plus } from "lucide-react";
import type { DailyCoachPlan } from "@/lib/types";
import type { WorkoutOption } from "@/lib/fitness";
import { MOOD_VISUAL } from "@/lib/visual-icons";
import { PageSkeleton } from "@/components/ui/Skeleton";
import {
  type MealChoicesRaw,
  slotChoices,
  leisureChoices,
  toggleSlotChoice,
  toggleLeisureChoice,
  toggleWorkoutChoice,
  parseWorkoutChoices,
  serializeWorkoutChoices,
} from "@/lib/today-choices";
import { DayMiniRings, MINI_RING_COLORS } from "./visual/DayMiniRings";
import {
  parseLifePulseFromLog,
  emptyLifePulseDay,
  togglePulseItem,
  LIFE_PULSE_ITEMS,
  LIFE_PULSE_META,
  type LifePulseDay,
  type LifePulseKey,
} from "@/lib/life-pulse";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { WaterDropControl } from "./visual/WaterDropControl";
import { SleepPillowControl } from "./visual/SleepPillowControl";
import { MealEditorSection, sumMealCalories } from "./day/MealEditorSection";
import { ActivityCardSection } from "./day/ActivityCardSection";
import { workoutImpact } from "@/lib/impact-motivation";
import { genericLeisureCards, genericWorkoutOptions } from "@/lib/generic-day-catalogs";
import { CycleDayCard } from "./visual/CycleDayCard";
import { DayMemoryCard } from "./visual/DayMemoryCard";
import { DayDiversityStrip } from "./visual/DayDiversityStrip";
import { DayPhotoUpload } from "./visual/DayPhotoUpload";
import { computeDayDiversity } from "@/lib/day-diversity";
import { findDayMemories } from "@/lib/day-memories";

interface LogFields {
  mood: number;
  energy: number;
  stress: number;
  waterMl: number;
  sleepMinutes?: number;
  steps?: number;
  weightKg?: number;
  notes: string;
}

const DEFAULT_MEAL_SLOTS = ["breakfast", "lunch", "dinner"];

function movementBurnTarget(calorieTarget: number): number {
  return Math.max(200, Math.round(calorieTarget * 0.2));
}

function WorkoutCard({
  w,
  onRemove,
}: {
  w: WorkoutOption;
  onRemove: () => void;
}) {
  const icons: Record<string, string> = {
    walk: "🚶",
    bike: "🚴",
    pool: "🏊",
    strength: "💪",
    yoga: "🧘",
    dance: "💃",
    rest: "🌿",
  };
  return (
    <button
      type="button"
      onClick={onRemove}
      className="w-full text-left vc-glass-card rounded-2xl p-3 flex gap-3"
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center text-xl">
        {icons[w.type] ?? "🏃"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="vc-text-sm font-semibold">{w.title}</p>
        <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
          {w.durationMin} мин · ~{w.caloriesBurned ?? "—"} ккал
        </p>
        <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5 leading-snug">
          {w.impact ?? workoutImpact(w.id, w.type)}
        </p>
      </div>
    </button>
  );
}

export function UnifiedDayScreen() {
  const [plan, setPlan] = useState<DailyCoachPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealChoices, setMealChoices] = useState<MealChoicesRaw>({});
  const [mealSlots, setMealSlots] = useState<string[]>(DEFAULT_MEAL_SLOTS);
  const [workoutChoice, setWorkoutChoice] = useState("");
  const [lifePulse, setLifePulse] = useState<LifePulseDay>(emptyLifePulseDay());
  const [log, setLog] = useState<LogFields>({
    energy: 7,
    mood: 7,
    stress: 5,
    waterMl: 0,
    notes: "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [workoutPickerOpen, setWorkoutPickerOpen] = useState(false);
  const [sleepTargetMin, setSleepTargetMin] = useState(480);
  const [weightKg, setWeightKg] = useState(70);
  const [dayPhoto, setDayPhoto] = useState("");
  const [lastPeriodStart, setLastPeriodStart] = useState<string | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [memories, setMemories] = useState<ReturnType<typeof findDayMemories>>([]);

  const load = useCallback(() => {
    return Promise.all([apiClient("/api/coach"), apiClient("/api/profile")]).then(async ([c, p]) => {
      const d = await c.json();
      const profile = await p.json();
      setSleepTargetMin(profile.sleepTargetMin ?? 480);
      setWeightKg(profile.currentWeightKg ?? 70);
      setLastPeriodStart(profile.lastPeriodStart ?? null);
      setCycleLength(profile.cycleLength ?? 28);
      setPlan(d.plan);
      if (d.todayLog?.mealChoices) {
        try {
          const parsed = JSON.parse(d.todayLog.mealChoices) as MealChoicesRaw;
          delete parsed._softDay;
          setMealChoices(parsed);
          const slots = Object.keys(parsed).filter((k) => !k.startsWith("_"));
          if (slots.length) setMealSlots([...new Set([...DEFAULT_MEAL_SLOTS, ...slots])]);
        } catch {
          setMealChoices({});
        }
      }
      setWorkoutChoice(d.todayLog?.workoutChoice ?? "");
      setDayPhoto(d.todayLog?.dayPhoto ?? "");
      setLifePulse(parseLifePulseFromLog(d.todayLog?.lifeActionsJson));
      setLog({
        energy: d.todayLog?.energy ?? 7,
        mood: d.todayLog?.mood ?? 7,
        stress: d.todayLog?.stress ?? 5,
        waterMl: d.todayLog?.waterMl ?? 0,
        sleepMinutes: d.todayLog?.sleepMinutes ?? undefined,
        steps: d.todayLog?.steps ?? undefined,
        weightKg: d.todayLog?.weightKg ?? undefined,
        notes: d.todayLog?.notes ?? "",
      });
      setDirty(false);
      setSaved(Boolean(d.todayLog?.mood != null));
    });
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    apiClient("/api/analytics?days=400")
      .then((r) => r.json())
      .then((d) => setMemories(findDayMemories(d.logs ?? [])))
      .catch(() => setMemories([]));
  }, [saved]);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const mealChoicesForSlots = useMemo(() => slotChoices(mealChoices), [mealChoices]);
  const leisureIds = useMemo(() => leisureChoices(mealChoices), [mealChoices]);
  const workoutIds = useMemo(() => parseWorkoutChoices(workoutChoice), [workoutChoice]);

  const consumedKcal = useMemo(() => sumMealCalories(mealChoicesForSlots), [mealChoicesForSlots]);

  const allWorkouts = useMemo(() => genericWorkoutOptions(weightKg), [weightKg]);

  const burnedKcal = useMemo(() => {
    return workoutIds.reduce((sum, id) => {
      const w = allWorkouts.find((o) => o.id === id);
      return sum + (w?.caloriesBurned ?? 0);
    }, 0);
  }, [allWorkouts, workoutIds]);

  const selectedWorkouts = useMemo(() => {
    return workoutIds
      .map((id) => allWorkouts.find((o) => o.id === id))
      .filter((w): w is WorkoutOption => Boolean(w));
  }, [allWorkouts, workoutIds]);

  const miniRings = useMemo(() => {
    if (!plan) return [];
    const moveTarget = movementBurnTarget(plan.dayTargets.calorieTarget);
    return [
      {
        id: "food",
        label: "Питание",
        current: consumedKcal,
        target: plan.dayTargets.calorieTarget,
        unit: "ккал",
        color: MINI_RING_COLORS.food,
      },
      {
        id: "move",
        label: "Движение",
        current: burnedKcal,
        target: moveTarget,
        unit: "ккал",
        color: MINI_RING_COLORS.move,
      },
      {
        id: "sleep",
        label: "Сон",
        current: (log.sleepMinutes ?? 0) / 60,
        target: sleepTargetMin / 60,
        unit: "ч",
        color: MINI_RING_COLORS.sleep,
        format: (n: number) => n.toFixed(1),
      },
      {
        id: "water",
        label: "Вода",
        current: log.waterMl,
        target: plan.dayTargets.waterTargetMl,
        unit: "мл",
        color: MINI_RING_COLORS.water,
      },
    ];
  }, [plan, consumedKcal, burnedKcal, log.sleepMinutes, log.waterMl, sleepTargetMin]);

  const pulseItems = (key: LifePulseKey) =>
    LIFE_PULSE_ITEMS[key].map((item) => ({
      id: item.id,
      label: item.label,
      icon: LIFE_PULSE_META[key].icon,
      minutes: item.minutes,
      impact: item.tip,
      impactLabel: item.moodBoost ? `настроение +${item.moodBoost}` : undefined,
    }));

  const leisureItems = useMemo(() => genericLeisureCards(), []);

  const diversity = useMemo(
    () =>
      computeDayDiversity({
        lifePulse,
        leisureIds,
        workoutIds,
        steps: log.steps,
      }),
    [lifePulse, leisureIds, workoutIds, log.steps],
  );

  const saveAll = async () => {
    setSaving(true);
    setSaveError(null);
    const date = format(new Date(), "yyyy-MM-dd");
    try {
      await apiClient("/api/choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, mealChoices, workoutChoice, softDay: false }),
      });

      const coachRes = await apiClient("/api/coach");
      const coach = await coachRes.json();
      const totals = coach.plan?.nutritionFramework?.totalsFromMeals;

      const dailyRes = await apiClient("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          energy: log.energy,
          mood: log.mood,
          stress: log.stress,
          waterMl: log.waterMl,
          sleepMinutes: log.sleepMinutes,
          steps: log.steps,
          weightKg: log.weightKg,
          notes: log.notes,
          dayPhoto,
          calories: totals?.calories ?? consumedKcal,
          proteinG: totals?.proteinG,
          lifeActions: { _pulse: lifePulse },
          leisure: leisureIds,
        }),
      });
      const result = await dailyRes.json().catch(() => ({}));
      if (!dailyRes.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Не удалось сохранить");
      }

      hapticSuccess();
      setSaved(true);
      setDirty(false);
      await load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !plan) {
    return <PageSkeleton cards={4} />;
  }

  const moodMatch = MOOD_VISUAL.find(
    (p) => p.energy === log.energy && p.mood === log.mood && p.stress === log.stress,
  );

  return (
    <div className="vc-page vc-stagger pb-28 space-y-5">
      <div className="vc-glass-card rounded-2xl px-2">
        <DayMiniRings rings={miniRings} />
      </div>

      <CycleDayCard
        lastPeriodStart={lastPeriodStart}
        cycleLength={cycleLength}
        onUpdated={() => {
          void load();
          apiClient("/api/profile")
            .then((r) => r.json())
            .then((p) => setLastPeriodStart(p.lastPeriodStart ?? null));
        }}
      />

      <DayMemoryCard memories={memories} />

      <section className="vc-glass-card rounded-2xl space-y-3">
        <p className="vc-text-sm font-semibold">Настроение</p>
        <div className="flex justify-between gap-1">
          {MOOD_VISUAL.map((preset) => {
            const active = moodMatch?.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  hapticLight();
                  setLog((l) => ({
                    ...l,
                    energy: preset.energy,
                    mood: preset.mood,
                    stress: preset.stress,
                  }));
                  markDirty();
                }}
                className={`flex-1 flex flex-col items-center py-2 min-h-[var(--touch-compact)] rounded-xl transition-all ${
                  active
                    ? "bg-[var(--accent)] shadow-md"
                    : "bg-[var(--bg-subtle)] hover:bg-[var(--surface)]"
                }`}
              >
                <span className="text-2xl leading-none">{preset.emoji}</span>
                <span
                  className={`vc-text-xs font-semibold mt-1 ${active ? "text-white" : "text-[var(--text-secondary)]"}`}
                >
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <MealEditorSection
        slots={mealSlots}
        choices={mealChoicesForSlots}
        onSlotsChange={(s) => {
          setMealSlots(s);
          markDirty();
        }}
        onChoiceToggle={(slot, id) => {
          setMealChoices(toggleSlotChoice(mealChoices, slot, id));
          markDirty();
        }}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="vc-text-sm font-semibold">Движение</p>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setWorkoutPickerOpen((v) => !v);
            }}
            className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]"
            aria-label="Добавить движение"
          >
            <Plus size={18} />
          </button>
        </div>
        {selectedWorkouts.length > 0 && (
          <div className="space-y-2">
            {selectedWorkouts.map((w) => (
              <WorkoutCard
                key={w.id}
                w={w}
                onRemove={() => {
                  hapticLight();
                  setWorkoutChoice(serializeWorkoutChoices(toggleWorkoutChoice(workoutIds, w.id)));
                  markDirty();
                }}
              />
            ))}
          </div>
        )}
        {workoutPickerOpen && (
          <div className="grid grid-cols-2 gap-2">
            {(allWorkouts)
              .filter((w) => !workoutIds.includes(w.id))
              .map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setWorkoutChoice(serializeWorkoutChoices(toggleWorkoutChoice(workoutIds, w.id)));
                    markDirty();
                  }}
                  className="text-left rounded-xl border border-[var(--border)] bg-[var(--elevated)] p-2.5"
                >
                  <p className="vc-text-xs font-semibold">{w.title}</p>
                  <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5">
                    {w.durationMin} мин · ~{w.caloriesBurned} ккал
                  </p>
                </button>
              ))}
          </div>
        )}
      </section>

      <ActivityCardSection
        title="Досуг"
        items={leisureItems}
        selectedIds={leisureIds}
        onToggle={(id) => {
          setMealChoices(toggleLeisureChoice(mealChoices, id));
          markDirty();
        }}
      />

      <ActivityCardSection
        title="Быт"
        items={pulseItems("home")}
        selectedIds={lifePulse.home.items}
        onToggle={(id) => {
          setLifePulse(togglePulseItem(lifePulse, "home", id));
          markDirty();
        }}
      />

      <ActivityCardSection
        title="Уход за собой"
        items={pulseItems("care")}
        selectedIds={lifePulse.care.items}
        onToggle={(id) => {
          setLifePulse(togglePulseItem(lifePulse, "care", id));
          markDirty();
        }}
      />

      <ActivityCardSection
        title="Работа"
        items={pulseItems("work")}
        selectedIds={lifePulse.work.items}
        onToggle={(id) => {
          setLifePulse(togglePulseItem(lifePulse, "work", id));
          markDirty();
        }}
      />

      <DayDiversityStrip
        spheres={diversity.spheres}
        score={diversity.score}
        hint={diversity.hint}
      />

      <div className="vc-glass-card rounded-2xl space-y-5">
        <WaterDropControl
          valueMl={log.waterMl}
          targetMl={plan.dayTargets.waterTargetMl}
          onChange={(ml) => {
            setLog((l) => ({ ...l, waterMl: ml }));
            markDirty();
          }}
        />
        <SleepPillowControl
          sleepMinutes={log.sleepMinutes ?? 0}
          targetMin={sleepTargetMin}
          onChange={(min) => {
            setLog((l) => ({ ...l, sleepMinutes: min }));
            markDirty();
          }}
        />

        <div>
          <label className="vc-text-sm font-semibold flex items-center gap-1.5 mb-2">
            <Footprints size={16} className="text-[var(--accent)]" /> Шаги
          </label>
          <input
            type="number"
            className="apple-input apple-input--metric w-full"
            placeholder="8000"
            value={log.steps ?? ""}
            onChange={(e) => {
              setLog((l) => ({
                ...l,
                steps: e.target.value ? parseInt(e.target.value, 10) : undefined,
              }));
              markDirty();
            }}
          />
          <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5">
            Автоматически — только в установленном приложении на Android. На iPhone введи вручную или из «Здоровья»
          </p>
        </div>

        <div>
          <label className="vc-text-sm font-semibold flex items-center gap-1.5 mb-2">
            <Scale size={16} /> Вес сегодня, кг
          </label>
          <input
            type="number"
            step="0.1"
            className="apple-input apple-input--metric w-full"
            placeholder="70.0"
            value={log.weightKg ?? ""}
            onChange={(e) => {
              setLog((l) => ({
                ...l,
                weightKg: e.target.value ? parseFloat(e.target.value) : undefined,
              }));
              markDirty();
            }}
          />
        </div>
      </div>

      <section className="vc-glass-card rounded-2xl space-y-3">
        <p className="vc-text-sm font-semibold">Заметка и фото дня</p>
        <textarea
          className="apple-input min-h-[5rem] resize-none w-full"
          placeholder="Коротко — что запомнилось…"
          value={log.notes}
          onChange={(e) => {
            setLog((l) => ({ ...l, notes: e.target.value }));
            markDirty();
          }}
        />
        <DayPhotoUpload
          photo={dayPhoto}
          onChange={(p) => {
            setDayPhoto(p);
            markDirty();
          }}
        />
      </section>

      <div className="vc-sticky-save">
        {saveError && (
          <p className="text-[13px] text-[var(--danger)] bg-[var(--danger-soft)] p-3 rounded-xl mb-2">
            {saveError}
          </p>
        )}
        {!dirty && saved && (
          <p className="text-center vc-text-xs text-[var(--success)] mb-2 flex items-center justify-center gap-1">
            <CheckCircle2 size={14} /> День сохранён
          </p>
        )}
        {dirty && (
          <p className="text-center vc-text-xs text-[var(--warning)] mb-2">Есть несохранённые изменения</p>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={saveAll}
          className="apple-btn apple-btn-primary w-full"
        >
          {saving ? "Сохраняю…" : saved && !dirty ? "Сохранить ещё раз" : "Сохранить день"}
        </button>
      </div>
    </div>
  );
}
