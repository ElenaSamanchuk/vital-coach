"use client";

import { apiClient } from "@/lib/api-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Droplets, Moon, Footprints, Scale, Tags, Leaf, Sparkles } from "lucide-react";
import type { DailyCoachPlan } from "@/lib/types";
import { MOOD_VISUAL } from "@/lib/visual-icons";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { TodayOptionsStrip } from "./visual/TodayOptionsStrip";
import { LifePulseCard } from "./visual/LifePulseCard";
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
import { CompletionRings, buildTodayRings } from "./visual/CompletionRings";
import { computeVitalityScore, vitalityLabel } from "@/lib/vitality-score";
import { TodayPersonalRecsCard } from "./visual/TodayPersonalRecsCard";
import { isSportLeisureId } from "@/lib/leisure";
import {
  parseLifePulseFromLog,
  emptyLifePulseDay,
  type LifePulseDay,
} from "@/lib/life-pulse";
import { leisureIdsFromPulse } from "@/lib/life-pulse-mood";
import { DayTrackerTags } from "./visual/DayTrackerTags";
import { parseDayTags, parseTrackingTags, type TrackingTag } from "@/lib/tracking-tags";
import {
  buildDayFlowBlocks,
  dayFlowProgress,
} from "@/lib/day-flow-status";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { UI } from "@/lib/product-copy";
import { StreakBadge } from "./visual/StreakBadge";

interface LogFields {
  energy: number;
  mood: number;
  stress: number;
  waterMl: number;
  sleepMinutes?: number;
  steps?: number;
  weightKg?: number;
  notes: string;
}

function DayFlowChecklist({ blocks }: { blocks: ReturnType<typeof buildDayFlowBlocks> }) {
  const { done, total, pct } = dayFlowProgress(blocks);
  return (
    <div className="vc-glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="vc-text-sm font-semibold">Прогресс дня</p>
          <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5">
            {done} из {total} · всё на одном экране
          </p>
        </div>
        <span className="text-xl font-bold tabular-nums text-[var(--accent)]">{pct}%</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {blocks.map((b) => (
          <div
            key={b.id}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] ${
              b.done ? "bg-[var(--success-soft)]" : "bg-[var(--bg-subtle)]"
            }`}
          >
            <CheckCircle2
              size={14}
              className={b.done ? "text-[var(--success)] shrink-0" : "text-[var(--text-tertiary)] shrink-0"}
            />
            <span className={`font-medium truncate ${b.done ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}`}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Один экран дня: настроение → еда → движение → баланс → вода/сон → одна кнопка «Сохранить» */
export function UnifiedDayScreen() {
  const [plan, setPlan] = useState<DailyCoachPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [mealChoices, setMealChoices] = useState<MealChoicesRaw>({});
  const [workoutChoice, setWorkoutChoice] = useState("");
  const [lifePulse, setLifePulse] = useState<LifePulseDay>(emptyLifePulseDay());
  const [trackingTags, setTrackingTags] = useState<TrackingTag[]>([]);
  const [dayTags, setDayTags] = useState<string[]>([]);
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
  const [softDay, setSoftDay] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const prevCompleteRef = useRef(false);

  const load = useCallback(() => {
    return Promise.all([apiClient("/api/coach"), apiClient("/api/journey")]).then(async ([c, j]) => {
      const d = await c.json();
      const journey = await j.json();
      setPlan(d.plan);
      setStreak(journey.streak ?? 0);
      if (d.todayLog?.mealChoices) {
        try {
          const parsed = JSON.parse(d.todayLog.mealChoices) as MealChoicesRaw;
          delete parsed._softDay;
          setMealChoices(parsed);
        } catch {
          setMealChoices({});
        }
      }
      setWorkoutChoice(d.todayLog?.workoutChoice ?? "");
      setSoftDay(d.todayLog?.softDay === true || d.plan?.softDay === true);
      setLifePulse(parseLifePulseFromLog(d.todayLog?.lifeActionsJson));
      setTrackingTags(parseTrackingTags(d.trackingTagsJson));
      setDayTags(parseDayTags(d.todayLog?.dayTagsJson));
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
      setSaved(Boolean(d.todayLog?.mood != null && d.todayLog?.waterMl != null));
    });
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const mealChoicesForSlots = useMemo(() => slotChoices(mealChoices), [mealChoices]);
  const leisureIds = useMemo(() => leisureChoices(mealChoices), [mealChoices]);
  const workoutIds = useMemo(() => parseWorkoutChoices(workoutChoice), [workoutChoice]);
  const mealSlots = plan?.mealPlan.map((m) => m.slot) ?? ["breakfast", "lunch", "snack", "dinner"];

  const diaryDone = saved || log.mood != null;
  const mealsDone = mealSlots.filter((s) => (mealChoicesForSlots[s]?.length ?? 0) > 0).length;
  const mealsTotal = mealSlots.length;
  const workoutPicked =
    workoutIds.length > 0 ||
    leisureIds.some((id) => isSportLeisureId(id)) ||
    (log.steps ?? 0) >= 5000;

  const wellbeingProgress = useMemo(() => {
    let p = 0;
    if (log.mood != null || diaryDone) p += 0.34;
    const balanceTouched =
      lifePulse.work.items.length +
        lifePulse.care.items.length +
        lifePulse.home.items.length +
        lifePulse.leisure.items.length >
      0;
    if (balanceTouched) p += 0.33;
    if (leisureIds.length > 0) p += 0.33;
    return Math.min(1, p);
  }, [log.mood, diaryDone, lifePulse, leisureIds]);

  const rings = useMemo(() => {
    if (!plan) return [];
    return buildTodayRings({
      mealSlots,
      mealChoices: mealChoicesForSlots,
      workoutChoice: workoutChoice || null,
      steps: log.steps,
      diaryDone,
      moodLogged: log.mood != null,
      wellbeingActionsDone: wellbeingProgress >= 0.67 ? 1 : 0,
      leisureChoice: leisureIds[0] ?? "",
    });
  }, [plan, mealSlots, mealChoicesForSlots, workoutChoice, log.steps, log.mood, diaryDone, wellbeingProgress, leisureIds]);

  const vitalityScore = useMemo(() => computeVitalityScore(rings), [rings]);
  const allComplete =
    mealsDone >= mealsTotal && workoutPicked && diaryDone && wellbeingProgress >= 1;

  useEffect(() => {
    if (allComplete && !prevCompleteRef.current) {
      setCelebrate(true);
      hapticSuccess();
      const t = setTimeout(() => setCelebrate(false), 800);
      prevCompleteRef.current = true;
      return () => clearTimeout(t);
    }
    if (!allComplete) prevCompleteRef.current = false;
  }, [allComplete]);

  const flowBlocks = buildDayFlowBlocks({
    mood: log.mood,
    energy: log.energy,
    mealChoices: mealChoicesForSlots,
    mealSlots,
    workoutIds,
    lifePulse,
    waterMl: log.waterMl,
    sleepMinutes: log.sleepMinutes,
    savedToday: saved,
  });

  const saveAll = async () => {
    setSaving(true);
    setSaveError(null);
    const date = format(new Date(), "yyyy-MM-dd");
    try {
      await apiClient("/api/choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, mealChoices, workoutChoice, softDay }),
      });

      const coachRes = await apiClient("/api/coach");
      const coach = await coachRes.json();
      const totals = coach.plan?.nutritionFramework?.totalsFromMeals;

      const leisureFromPulse = leisureIdsFromPulse(lifePulse);
      const leisureMerged = [...new Set([...leisureIds, ...leisureFromPulse])];

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
          calories: totals?.calories,
          proteinG: totals?.proteinG,
          lifeActions: { _pulse: lifePulse },
          dayTags,
          leisure: leisureMerged,
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

  const totals = plan.nutritionFramework.totalsFromMeals;
  const moodMatch = MOOD_VISUAL.find(
    (p) => p.energy === log.energy && p.mood === log.mood && p.stress === log.stress,
  );

  return (
    <div className="vc-page vc-stagger pb-28">
      {plan.suggestSoftDay && !softDay && !plan.softDay && (
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setSoftDay(true);
            markDirty();
          }}
          className="w-full rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning-soft)] p-4 text-left"
        >
          <p className="text-[13px] font-semibold text-[var(--text)]">Предлагаем мягкий день</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            Стресс или усталость — смягчим план без чувства вины
          </p>
        </button>
      )}

      <div className="vc-glass-card rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="vc-text-lg">{plan.greeting}</p>
            <p className="vc-subtitle vc-text-xs mt-1 leading-relaxed">{plan.summary}</p>
          </div>
          {allComplete && (
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[var(--success)] bg-[var(--success-soft)] px-2 py-1 rounded-full">
              <Sparkles size={12} />
              День собран
            </span>
          )}
        </div>

        <div className="mt-4">
          <CompletionRings
            rings={rings}
            centerLabel={String(vitalityScore)}
            centerSub={vitalityLabel(vitalityScore)}
            vitalityHint={UI.vitalityHint}
            celebrate={celebrate}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <StreakBadge days={streak} />
          <span className="vc-text-xs text-[var(--text-secondary)] self-center">
            {totals.calories} ккал · цель {plan.dayTargets.calorieTarget}
          </span>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setSoftDay((v) => !v);
              markDirty();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              softDay || plan.softDay
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
            }`}
          >
            <Leaf size={12} />
            {softDay || plan.softDay ? "Мягкий день" : "Мягкий день"}
          </button>
        </div>
      </div>

      {plan.personalizedRecs && <TodayPersonalRecsCard plan={plan.personalizedRecs} />}

      <DayFlowChecklist blocks={flowBlocks} />

      <section className="vc-glass-card rounded-2xl space-y-3">
        <p className="vc-text-sm font-semibold">1 · Как ты?</p>
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

      {plan.mealPlan && plan.todaySportExtras && plan.todayLeisure && (
        <section>
          <p className="vc-overline px-1 mb-2">2 · Еда · движение · досуг</p>
          <TodayOptionsStrip
            layout="stack"
            genericFoodLayout
            mealPlan={plan.mealPlan}
            mealChoices={mealChoicesForSlots}
            onMealSelect={(slot, id) => {
              hapticLight();
              setMealChoices(toggleSlotChoice(mealChoices, slot, id));
              markDirty();
            }}
            sportOptions={plan.todaySportExtras}
            selectedWorkoutIds={workoutIds}
            onWorkoutSelect={(id) => {
              hapticLight();
              setWorkoutChoice(serializeWorkoutChoices(toggleWorkoutChoice(workoutIds, id)));
              markDirty();
            }}
            leisure={plan.todayLeisure}
            selectedLeisureIds={leisureIds}
            onLeisureSelect={(id) => {
              hapticLight();
              setMealChoices(toggleLeisureChoice(mealChoices, id));
              markDirty();
            }}
            recommendedMeals={plan.personalizedRecs?.highlights.meals}
            recommendedWorkouts={plan.personalizedRecs?.highlights.workouts}
            recommendedLeisure={plan.personalizedRecs?.highlights.leisure}
          />
        </section>
      )}

      <section>
        <p className="vc-overline px-1 mb-2">3 · Баланс — что было · работа · уход · быт</p>
        <p className="vc-text-xs text-[var(--text-secondary)] px-1 mb-2 -mt-1">
          Досуг выше — план и мотивация; здесь — отметить, как прошёл день
        </p>
        <LifePulseCard
          pulse={lifePulse}
          moodContext={{ mood: log.mood, energy: log.energy, stress: log.stress }}
          onChange={(p) => {
            setLifePulse(p);
            markDirty();
          }}
        />
      </section>

      <section className="vc-glass-card rounded-2xl space-y-4">
        <p className="vc-text-sm font-semibold">4 · Вода · сон · вес · шаги</p>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="vc-text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <Droplets size={14} /> Вода
            </span>
            <span className="vc-text-sm font-semibold tabular-nums">
              {log.waterMl} / {plan.dayTargets.waterTargetMl} мл
            </span>
          </div>
          <div className="flex gap-2">
            {[250, 500].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => {
                  setLog((l) => ({ ...l, waterMl: l.waterMl + ml }));
                  markDirty();
                }}
                className="flex-1 py-2 rounded-xl bg-[var(--bg-subtle)] vc-text-sm font-semibold"
              >
                +{ml} мл
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="vc-text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-1">
            <Moon size={14} /> Сон, минут
          </label>
          <div className="flex gap-2 mb-2">
            {[360, 420, 480].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setLog((l) => ({ ...l, sleepMinutes: m }));
                  markDirty();
                }}
                className={`flex-1 py-2 rounded-xl vc-text-sm font-semibold ${
                  log.sleepMinutes === m ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-subtle)]"
                }`}
              >
                {m / 60} ч
              </button>
            ))}
          </div>
          <input
            type="number"
            className="apple-input apple-input--metric w-full"
            placeholder="420"
            value={log.sleepMinutes ?? ""}
            onChange={(e) => {
              setLog((l) => ({
                ...l,
                sleepMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
              }));
              markDirty();
            }}
          />
        </div>

        <div>
          <label className="vc-text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-1">
            <Scale size={14} /> Вес сегодня, кг (необязательно)
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

        <div>
          <label className="vc-text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-1">
            <Footprints size={14} /> Шаги
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
        </div>

        <div>
          <label className="vc-text-xs text-[var(--text-secondary)] mb-1 block">Заметка (необязательно)</label>
          <textarea
            className="apple-input min-h-[4rem] resize-none w-full"
            placeholder="Что запомнилось за день…"
            value={log.notes}
            onChange={(e) => {
              setLog((l) => ({ ...l, notes: e.target.value }));
              markDirty();
            }}
          />
        </div>
      </section>

      <section className="vc-glass-card rounded-2xl space-y-3">
        <p className="vc-text-sm font-semibold flex items-center gap-1.5">
          <Tags size={15} /> 5 · Плашки дня
        </p>
        <p className="vc-text-xs text-[var(--text-secondary)] -mt-1">
          Отметь, что было — список настраивается в профиле
        </p>
        <DayTrackerTags
          tags={trackingTags}
          selected={dayTags}
          onToggle={(id) => {
            hapticLight();
            setDayTags((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            );
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
          <p className="text-center vc-text-xs text-[var(--warning)] mb-2">
            Есть несохранённые изменения
          </p>
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
