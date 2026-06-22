"use client";

import { apiClient } from "@/lib/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isSameDay, startOfDay } from "date-fns";
import { CheckCircle2, Footprints, Scale, RefreshCw } from "lucide-react";
import type { DailyCoachPlan } from "@/lib/types";
import { MOOD_VISUAL } from "@/lib/visual-icons";
import { workoutIcon } from "@/lib/visual-icons";
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
import { HorizontalPickSection, type HorizontalPickItem } from "./ui/HorizontalPickSection";
import { workoutImpact } from "@/lib/impact-motivation";
import { genericLeisureCards, genericWorkoutOptions } from "@/lib/generic-day-catalogs";
import { CycleDayCard } from "./visual/CycleDayCard";
import { DayMemoryCard } from "./visual/DayMemoryCard";
import { DayDiversityStrip } from "./visual/DayDiversityStrip";
import { DayPhotoUpload } from "./visual/DayPhotoUpload";
import { DayDateNav, readInitialDayFromUrl } from "./visual/DayDateNav";
import { JournalCalendar } from "./visual/JournalCalendar";
import { computeDayDiversity } from "@/lib/day-diversity";
import { findDayMemories } from "@/lib/day-memories";
import { syncAndroidSteps, isAndroidNative } from "@/lib/android-steps";
import { parsePeriodMeta } from "@/lib/period-tracking";

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

export function UnifiedDayScreen() {
  const [viewDate, setViewDate] = useState(readInitialDayFromUrl);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [journalLogs, setJournalLogs] = useState<
    { date: string; mood?: number; notes?: string; dayPhoto?: string; mealChoices?: string; calories?: number }[]
  >([]);
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
  const [stepsSyncing, setStepsSyncing] = useState(false);
  const [stepsSyncNote, setStepsSyncNote] = useState<string | null>(null);
  const [sleepTargetMin, setSleepTargetMin] = useState(480);
  const [weightKg, setWeightKg] = useState(70);
  const [dayPhoto, setDayPhoto] = useState("");
  const [lastPeriodStart, setLastPeriodStart] = useState<string | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDays, setPeriodDays] = useState(5);
  const [memories, setMemories] = useState<ReturnType<typeof findDayMemories>>([]);

  const dateIso = format(viewDate, "yyyy-MM-dd");
  const isToday = isSameDay(viewDate, startOfDay(new Date()));

  const load = useCallback(() => {
    return Promise.all([
      apiClient(`/api/coach?date=${dateIso}`),
      apiClient("/api/profile"),
    ]).then(async ([c, p]) => {
      const d = await c.json();
      const profile = await p.json();
      setSleepTargetMin(profile.sleepTargetMin ?? 480);
      setWeightKg(profile.currentWeightKg ?? 70);
      setLastPeriodStart(profile.lastPeriodStart ?? null);
      setCycleLength(profile.cycleLength ?? 28);
      setPeriodDays(parsePeriodMeta(profile.assessmentJson).periodDays);
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
      } else {
        setMealChoices({});
        setMealSlots(DEFAULT_MEAL_SLOTS);
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
  }, [dateIso]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    apiClient("/api/analytics?days=400")
      .then((r) => r.json())
      .then((d) => {
        setJournalLogs(d.logs ?? []);
        setMemories(findDayMemories(d.logs ?? []));
      })
      .catch(() => {
        setJournalLogs([]);
        setMemories([]);
      });
  }, [saved]);

  useEffect(() => {
    if (!isToday || !isAndroidNative()) return;
    void syncAndroidSteps().then((steps) => {
      if (steps != null && steps > 0) {
        setLog((l) => ({ ...l, steps: l.steps ?? steps }));
      }
    });
  }, [isToday]);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const mealChoicesForSlots = useMemo(() => slotChoices(mealChoices), [mealChoices]);
  const leisureIds = useMemo(() => leisureChoices(mealChoices), [mealChoices]);
  const workoutIds = useMemo(() => parseWorkoutChoices(workoutChoice), [workoutChoice]);

  const consumedKcal = useMemo(() => sumMealCalories(mealChoicesForSlots), [mealChoicesForSlots]);

  const allWorkouts = useMemo(() => genericWorkoutOptions(weightKg), [weightKg]);

  const workoutPickItems = useMemo(
    (): HorizontalPickItem[] =>
      allWorkouts.map((w) => ({
        id: w.id,
        title: w.title,
        subtitle: `${w.durationMin} мин · ~${w.caloriesBurned ?? "—"} ккал`,
        impact: w.impact ?? workoutImpact(w.id, w.type),
        icon: workoutIcon(w.type),
      })),
    [allWorkouts],
  );

  const leisurePickItems = useMemo(
    (): HorizontalPickItem[] =>
      genericLeisureCards().map((l) => ({
        id: l.id,
        title: l.label,
        subtitle: `${l.minutes} мин · ${l.impactLabel}`,
        impact: l.impact,
        iconName: l.iconName,
      })),
    [],
  );

  const pulsePickItems = (key: LifePulseKey): HorizontalPickItem[] => {
    const SphereIcon = LIFE_PULSE_META[key].icon;
    return LIFE_PULSE_ITEMS[key].map((item) => ({
      id: item.id,
      title: item.label,
      subtitle: item.minutes != null ? `${item.minutes} мин` : undefined,
      impact: item.tip,
      icon: SphereIcon,
    }));
  };

  const burnedKcal = useMemo(() => {
    return workoutIds.reduce((sum, id) => {
      const w = allWorkouts.find((o) => o.id === id);
      return sum + (w?.caloriesBurned ?? 0);
    }, 0);
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

  const syncSteps = async () => {
    setStepsSyncing(true);
    setStepsSyncNote(null);
    try {
      const steps = await syncAndroidSteps();
      if (steps != null && steps > 0) {
        setLog((l) => ({ ...l, steps }));
        markDirty();
        setStepsSyncNote(`Подтянуто из Health Connect: ${steps.toLocaleString("ru-RU")} шагов`);
      } else if (steps === 0) {
        setStepsSyncNote("Разреши доступ к шагам в Health Connect или введи вручную");
      } else {
        setStepsSyncNote("Health Connect недоступен — введи шаги вручную");
      }
    } catch {
      setStepsSyncNote("Не удалось прочитать шаги — проверь разрешения Health Connect");
    } finally {
      setStepsSyncing(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await apiClient("/api/choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateIso, mealChoices, workoutChoice, softDay: false }),
      });

      const coachRes = await apiClient(`/api/coach?date=${dateIso}`);
      const coach = await coachRes.json();
      const totals = coach.plan?.nutritionFramework?.totalsFromMeals;

      const dailyRes = await apiClient("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateIso,
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
      <DayDateNav
        date={viewDate}
        onDateChange={(d) => {
          setViewDate(d);
          setCalendarOpen(false);
        }}
        onOpenCalendar={() => setCalendarOpen((v) => !v)}
      />

      {calendarOpen && (
        <JournalCalendar
          logs={journalLogs}
          selectedDate={viewDate}
          onSelectDate={(d) => {
            setViewDate(d);
            setCalendarOpen(false);
          }}
          compact
        />
      )}

      {!isToday && (
        <p className="vc-text-xs text-center text-[var(--accent)] bg-[var(--accent-soft)] rounded-xl py-2 px-3">
          Редактируешь прошлый день — изменения сохранятся на {format(viewDate, "d.MM.yyyy")}
        </p>
      )}

      <div className="vc-glass-card rounded-2xl px-2">
        <DayMiniRings rings={miniRings} />
      </div>

      {isToday && (
        <CycleDayCard
          lastPeriodStart={lastPeriodStart}
          cycleLength={cycleLength}
          periodDays={periodDays}
          onUpdated={() => {
            void load();
            apiClient("/api/profile")
              .then((r) => r.json())
              .then((p) => setLastPeriodStart(p.lastPeriodStart ?? null));
          }}
        />
      )}

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
          setMealChoices((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
              if (!s.includes(key) && !key.startsWith("_")) delete next[key];
            }
            return next;
          });
          markDirty();
        }}
        onChoiceToggle={(slot, id) => {
          setMealChoices(toggleSlotChoice(mealChoices, slot, id));
          markDirty();
        }}
      />

      <HorizontalPickSection
        title="Движение"
        items={workoutPickItems}
        selectedIds={workoutIds}
        onToggle={(id) => {
          setWorkoutChoice(serializeWorkoutChoices(toggleWorkoutChoice(workoutIds, id)));
          markDirty();
        }}
        searchPlaceholder="Поиск: йога, прогулка, бассейн…"
      />

      <HorizontalPickSection
        title="Досуг"
        items={leisurePickItems}
        selectedIds={leisureIds}
        onToggle={(id) => {
          setMealChoices(toggleLeisureChoice(mealChoices, id));
          markDirty();
        }}
        searchPlaceholder="Поиск: книги, кино, прогулка…"
      />

      <HorizontalPickSection
        title="Быт"
        items={pulsePickItems("home")}
        selectedIds={lifePulse.home.items}
        onToggle={(id) => {
          setLifePulse(togglePulseItem(lifePulse, "home", id));
          markDirty();
        }}
        searchPlaceholder="Поиск: уборка, готовка…"
      />

      <HorizontalPickSection
        title="Уход за собой"
        items={pulsePickItems("care")}
        selectedIds={lifePulse.care.items}
        onToggle={(id) => {
          setLifePulse(togglePulseItem(lifePulse, "care", id));
          markDirty();
        }}
        searchPlaceholder="Поиск: маска, медитация…"
      />

      <HorizontalPickSection
        title="Работа"
        items={pulsePickItems("work")}
        selectedIds={lifePulse.work.items}
        onToggle={(id) => {
          setLifePulse(togglePulseItem(lifePulse, "work", id));
          markDirty();
        }}
        searchPlaceholder="Поиск: фокус, встречи…"
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
          <div className="flex items-center justify-between mb-2">
            <label className="vc-text-sm font-semibold flex items-center gap-1.5">
              <Footprints size={16} className="text-[var(--accent)]" /> Шаги
            </label>
            {isAndroidNative() && (
              <button
                type="button"
                onClick={() => void syncSteps()}
                disabled={stepsSyncing}
                className="flex items-center gap-1 vc-text-xs font-semibold text-[var(--accent)] px-2 py-1 rounded-lg bg-[var(--accent-soft)]"
              >
                <RefreshCw size={12} className={stepsSyncing ? "animate-spin" : ""} />
                Health Connect
              </button>
            )}
          </div>
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
          {stepsSyncNote && (
            <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5">{stepsSyncNote}</p>
          )}
          {!isAndroidNative() && (
            <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5">
              Автошаги — в APK на Android через Health Connect. На iPhone — вручную или из «Здоровья»
            </p>
          )}
        </div>

        <div>
          <label className="vc-text-sm font-semibold flex items-center gap-1.5 mb-2">
            <Scale size={16} /> Вес, кг
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
