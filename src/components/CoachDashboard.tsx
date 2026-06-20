"use client";

import { apiClient } from "@/lib/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Target,
  Leaf,
} from "lucide-react";
import { NutritionMetaCard } from "./visual/NutritionMetaCard";
import { DayRhythmCard } from "./visual/DayRhythmCard";
import { WellbeingPainCard } from "./visual/WellbeingPainCard";
import { TodayDetailsPanel } from "./visual/TodayDetailsPanel";
import { HealthSummaryStrip } from "./visual/HealthSummaryStrip";
import { QuickDayTags } from "./visual/QuickDayTags";
import { parseDayTags, parseTrackingTags } from "@/lib/tracking-tags";
import type { TrackingTag } from "@/lib/tracking-tags";
import { format } from "date-fns";
import Link from "next/link";
import { IconCard } from "./ui/IconCard";
import { PlanWhyCard } from "./ui/PlanWhyCard";
import { WellbeingCoachCard } from "./visual/WellbeingCoachCard";
import { CyclePhaseBar } from "./visual/CyclePhaseBar";
import { StreakBadge } from "./visual/StreakBadge";
import { CompletionRings, buildTodayRings } from "./visual/CompletionRings";
import { BodyBudgetCard } from "./visual/BodyBudgetCard";
import { SyndromeCoachCard } from "./visual/SyndromeCoachCard";
import { WeeklyExperimentCard } from "./visual/WeeklyExperimentCard";
import { CalorieExplainerCard } from "./visual/CalorieExplainerCard";
import { InflammationScoreCard } from "./visual/InflammationScoreCard";
import { HealthBriefingCard } from "./visual/HealthBriefingCard";
import { HorizonPlanCard } from "./visual/HorizonPlanCard";
import { TimeHorizonRings } from "./visual/TimeHorizonRings";
import { TodayOptionsStrip } from "./visual/TodayOptionsStrip";
import { CompensationCard } from "./visual/CompensationCard";
import { TaskTrackerPanel } from "./visual/TaskTrackerPanel";
import { parseLifeActions, type LifeActions } from "@/lib/life-actions";
import type { DayTask } from "@/lib/day-tasks";
import { LifeDiscoverPanel } from "./visual/LifeDiscoverPanel";
import { MediaPicksCard } from "./visual/MediaPicksCard";
import { LeisureQuizCard } from "./visual/LeisureQuizCard";
import { RecipesCard } from "./visual/RecipesCard";
import { PlacesCard } from "./visual/PlacesCard";
import { ReminderBoot } from "./ReminderBoot";
import { parseLeisureQuiz } from "@/lib/leisure-quiz";
import { BreathingTimer } from "./visual/BreathingTimer";
import { computeVitalityScore, vitalityLabel } from "@/lib/vitality-score";
import { CARD_ICON } from "@/lib/design-tokens";
import {
  getHealthContextTip,
  getWorkoutEvidence,
  getLabEvidence,
  getNutritionDayEvidence,
} from "@/lib/evidence-why";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import type { DailyCoachPlan, WeeklyInsights } from "@/lib/types";
import { AnalyticsRecommendationsCard } from "./visual/AnalyticsRecommendationsCard";
import { GENERIC_FEATURES } from "@/lib/generic-ui";
import { PageSkeleton } from "@/components/ui/Skeleton";
import type { ReactNode } from "react";

interface ProfileFlags {
  pcosSuspected: boolean;
  hypothyroidism: boolean;
  endometriosis: boolean;
  insulinResistance: boolean;
  cortisolIssues: boolean;
  birthYear?: number;
}

export function CoachDashboard({
  renderDock,
}: {
  /** Кнопка в доке над навигацией — только на «Сегодня» */
  renderDock?: (dock: { diaryDone: boolean; isEvening: boolean }) => ReactNode;
}) {
  const [plan, setPlan] = useState<DailyCoachPlan | null>(null);
  const [profile, setProfile] = useState<ProfileFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealChoices, setMealChoices] = useState<Record<string, string>>({});
  const [workoutChoice, setWorkoutChoice] = useState<string>("");
  const [diaryDone, setDiaryDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [prevComplete, setPrevComplete] = useState(false);
  const [journeyNext, setJourneyNext] = useState<{
    title: string;
    href: string;
    hrefLabel: string;
  } | null>(null);
  const [softDay, setSoftDay] = useState(false);
  const [trackingTags, setTrackingTags] = useState<TrackingTag[]>([]);
  const [dayTags, setDayTags] = useState<string[]>([]);
  const [todayWater, setTodayWater] = useState(0);
  const [todaySleep, setTodaySleep] = useState<number | undefined>();
  const [todaySteps, setTodaySteps] = useState<number | undefined>();
  const [dayTasks, setDayTasks] = useState<DayTask[]>([]);
  const [lifeActions, setLifeActions] = useState<LifeActions>({});
  const [painLevel, setPainLevel] = useState(0);
  const [painZones, setPainZones] = useState<string[]>([]);
  const [todayEnergy, setTodayEnergy] = useState<number | undefined>();
  const [todayMood, setTodayMood] = useState<number | undefined>();
  const [todayStress, setTodayStress] = useState<number | undefined>();
  const [notificationPrefsJson, setNotificationPrefsJson] = useState<string>("{}");
  const [leisureQuizJson, setLeisureQuizJson] = useState<string>("{}");
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsights | null>(null);
  const [weekRecLogs, setWeekRecLogs] = useState<
    {
      mealChoices?: string | null;
      leisureJson?: string | null;
      workoutChoice?: string | null;
      mood?: number | null;
      weightKg?: number | null;
      steps?: number | null;
      waterMl?: number | null;
      sleepMinutes?: number | null;
      postMealWalks?: number | null;
    }[]
  >([]);

  const load = useCallback(() => {
    Promise.all([
      apiClient("/api/coach"),
      apiClient("/api/journey"),
      apiClient("/api/analytics?days=7"),
    ]).then(async ([c, j, a]) => {
      const d = await c.json();
      const journey = await j.json();
      setPlan(d.plan);
      setProfile(d.profile);
      setNotificationPrefsJson(d.profile?.notificationPrefsJson ?? "{}");
      setLeisureQuizJson(d.profile?.leisureQuizJson ?? "{}");
      setStreak(journey.streak ?? 0);
      setFreezeUsed(journey.freezeUsed ?? false);
      setJourneyNext(journey.progress?.percent >= 80 ? null : journey.next ?? null);
      setDiaryDone(Boolean(d.todayLog?.weightKg != null || d.todayLog?.mood != null));
      setTrackingTags(parseTrackingTags(d.trackingTagsJson));
      setDayTags(parseDayTags(d.todayLog?.dayTagsJson));
      setTodayWater(d.todayLog?.waterMl ?? 0);
      setTodaySleep(d.todayLog?.sleepMinutes ?? undefined);
      setTodaySteps(d.todayLog?.steps ?? undefined);
      setSoftDay(d.todayLog?.softDay === true);
      setDayTasks(d.plan?.dayTasks ?? []);
      const la = parseLifeActions(d.todayLog?.lifeActionsJson);
      setLifeActions(la);
      setPainLevel(la.painLevel ?? 0);
      setPainZones(la.painZones ?? []);
      setTodayEnergy(d.todayLog?.energy ?? undefined);
      setTodayMood(d.todayLog?.mood ?? undefined);
      setTodayStress(d.todayLog?.stress ?? undefined);
      if (d.todayLog?.mealChoices) {
        try {
          const parsed = JSON.parse(d.todayLog.mealChoices) as Record<string, string>;
          delete parsed._softDay;
          setMealChoices(parsed);
        } catch {
          setMealChoices({});
        }
      }
      setWorkoutChoice(d.todayLog?.workoutChoice ?? "");
      if (a.ok) {
        const analytics = await a.json();
        setWeeklyInsights(analytics.insights ?? null);
        setWeekRecLogs((analytics.logs ?? []).slice(-7));
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveMealChoice = async (slot: string, optionId: string) => {
    hapticLight();
    const next = { ...mealChoices, [slot]: optionId };
    setMealChoices(next);
    await apiClient("/api/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: format(new Date(), "yyyy-MM-dd"), mealChoices: next }),
    });
    load();
  };

  const toggleSoftDay = async () => {
    hapticLight();
    const next = !softDay;
    setSoftDay(next);
    await apiClient("/api/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        mealChoices,
        softDay: next,
      }),
    });
    load();
  };

  const toggleWellbeingAction = async (actionId: string) => {
    await apiClient("/api/wellbeing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, date: format(new Date(), "yyyy-MM-dd") }),
    });
    load();
  };

  const saveTasks = async (tasks: DayTask[]) => {
    setDayTasks(tasks);
    await apiClient("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        partial: true,
        tasks,
      }),
    });
    load();
  };

  const saveLifeActions = async (la: LifeActions) => {
    setLifeActions(la);
    await apiClient("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        partial: true,
        lifeActions: la,
      }),
    });
  };

  const patchTodayLog = async (patch: Record<string, unknown>) => {
    hapticLight();
    await apiClient("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        partial: true,
        ...patch,
      }),
    });
  };

  const addWater = (ml: number) => {
    const next = todayWater + ml;
    setTodayWater(next);
    void patchTodayLog({ waterMl: next });
  };

  const setSleepMinutes = (minutes: number) => {
    setTodaySleep(minutes);
    void patchTodayLog({ sleepMinutes: minutes });
  };

  const setStepsCount = (n: number) => {
    setTodaySteps(n);
    void patchTodayLog({ steps: n });
  };

  const toggleRoutineStep = async (
    phase: import("@/lib/day-routines").RoutinePhase,
    stepId: string,
  ) => {
    const key = phase === "evening" ? "evening" : phase;
    const current = lifeActions[key] ?? (phase === "evening" ? lifeActions.ritual : undefined) ?? [];
    const next = current.includes(stepId)
      ? current.filter((x) => x !== stepId)
      : [...current, stepId];
    const la: LifeActions = { ...lifeActions, [key]: next };
    if (phase === "evening") la.ritual = next;
    await saveLifeActions(la);
  };

  const savePain = async (level: number, zones: string[]) => {
    setPainLevel(level);
    setPainZones(zones);
    const la: LifeActions = { ...lifeActions, painLevel: level, painZones: zones };
    await saveLifeActions(la);
    if (level >= 6 && !softDay) {
      await apiClient("/api/choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(new Date(), "yyyy-MM-dd"),
          mealChoices,
          softDay: true,
        }),
      });
      setSoftDay(true);
      load();
    }
  };

  const saveWorkoutChoice = async (id: string) => {
    hapticLight();
    setWorkoutChoice(id);
    await apiClient("/api/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: format(new Date(), "yyyy-MM-dd"), workoutChoice: id }),
    });
    load();
  };

  const saveLeisureChoice = async (id: string) => {
    hapticLight();
    const next = { ...mealChoices };
    if (next._leisure === id) {
      delete next._leisure;
    } else {
      next._leisure = id;
    }
    setMealChoices(next);
    await apiClient("/api/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: format(new Date(), "yyyy-MM-dd"), mealChoices: next }),
    });
    load();
  };

  const mealChoicesForSlots = useMemo(() => {
    const { _leisure: _, ...slots } = mealChoices;
    return slots;
  }, [mealChoices]);

  const leisureChoice = mealChoices._leisure ?? "";

  const mealsDone = useMemo(() => {
    if (!plan) return 0;
    return plan.mealPlan.filter((s) => Boolean(mealChoicesForSlots[s.slot])).length;
  }, [plan, mealChoicesForSlots]);

  const mealsTotal = plan?.mealPlan.length ?? 4;
  const workoutPicked = Boolean(workoutChoice);
  const wellbeingProgress = useMemo(() => {
    if (!plan) return 0;
    let p = 0;
    if (plan.wellbeing.moodLogged || diaryDone) p += 0.34;
    if (plan.wellbeing.actionsDone.length > 0) p += 0.33;
    if (leisureChoice) p += 0.33;
    return Math.min(1, p);
  }, [plan, diaryDone, leisureChoice]);
  const allComplete =
    mealsDone >= mealsTotal &&
    workoutPicked &&
    diaryDone &&
    wellbeingProgress >= 1;

  useEffect(() => {
    if (allComplete && !prevComplete) {
      setCelebrate(true);
      hapticSuccess();
      const t = setTimeout(() => setCelebrate(false), 800);
      return () => clearTimeout(t);
    }
    setPrevComplete(allComplete);
  }, [allComplete, prevComplete]);

  if (loading) {
    const isEveningLoad = new Date().getHours() >= 18;
    return (
      <>
        {renderDock?.({ diaryDone: false, isEvening: isEveningLoad })}
        <PageSkeleton cards={3} />
      </>
    );
  }
  if (!plan || !profile) return null;

  const rings = buildTodayRings({
    mealSlots: plan.mealPlan.map((m) => m.slot),
    mealChoices: mealChoicesForSlots,
    workoutChoice: workoutChoice || null,
    diaryDone,
    moodLogged: plan.wellbeing.moodLogged,
    wellbeingActionsDone: plan.wellbeing.actionsDone.length,
    leisureChoice,
  });
  const vitalityScore = computeVitalityScore(rings);

  const healthTip = getHealthContextTip({
    ...profile,
    cyclePhase: plan.cyclePhase,
  });

  const nutritionEvidence = getNutritionDayEvidence(
    plan.nutritionFramework.principles,
    plan.nutritionFramework.calorieNote,
  );

  const selectedWorkoutId = workoutChoice || plan.workout.recommended.id;
  const selectedWorkoutType =
    [plan.workout.recommended, ...plan.workout.alternatives].find(
      (w) => (w.id ?? w.title) === selectedWorkoutId,
    )?.type ?? plan.workout.recommended.type;
  const workoutEvidence = getWorkoutEvidence(selectedWorkoutType);

  const overdueLab = plan.labsDue.find((l) => l.urgency === "overdue") ?? plan.labsDue[0];
  const labEvidence = overdueLab ? getLabEvidence(overdueLab.label, overdueLab.urgency) : null;

  const totals = plan.nutritionFramework.totalsFromMeals;
  const hour = new Date().getHours();
  const isEvening = hour >= 18;
  const routineCtx = {
    hypothyroidism: profile.hypothyroidism,
    insulinResistance: profile.insulinResistance,
    endometriosis: profile.endometriosis,
    cortisolIssues: profile.cortisolIssues,
    softDay: softDay || plan.softDay,
    stress: todayStress ?? 5,
    hour,
  };

  const saveLeisureQuiz = async (answers: import("@/lib/leisure-quiz").LeisureQuizAnswers) => {
    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leisureQuizJson: JSON.stringify(answers) }),
    });
    load();
  };

  const taskLabels = dayTasks.filter((t) => !t.done).map((t) => t.label);
  const briefingLine = plan.healthBriefing?.[0]?.title;

  const inner = (
    <div className="vc-page vc-stagger">
      <ReminderBoot
        prefsJson={notificationPrefsJson}
        taskLabels={taskLabels}
        briefing={briefingLine}
      />
      {GENERIC_FEATURES.medical && plan.healthBriefing?.length > 0 && (
        <HealthBriefingCard briefs={plan.healthBriefing} />
      )}

      {GENERIC_FEATURES.timeRings && <TimeHorizonRings birthYear={profile.birthYear} />}

      {plan.suggestSoftDay && !softDay && !plan.softDay && (
        <button
          type="button"
          onClick={toggleSoftDay}
          className="w-full rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning-soft)] p-4 text-left"
        >
          <p className="text-[13px] font-semibold text-[var(--text)]">Предлагаем мягкий день</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            Стресс или усталость — нажми, чтобы смягчить план без чувства вины
          </p>
        </button>
      )}

      {GENERIC_FEATURES.journeyBanner && journeyNext && (
        <Link href={journeyNext.href} className="block">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 flex items-center gap-3">
            <Target size={18} className="text-[var(--accent)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[var(--text-secondary)]">{journeyNext.hrefLabel}</p>
              <p className="text-[14px] font-semibold truncate">{journeyNext.title}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
          </div>
        </Link>
      )}

      <div className="vc-glass-card rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="vc-text-xl">{plan.greeting}</p>
            <p className="vc-subtitle mt-1 leading-snug">{plan.summary}</p>
          </div>
          {allComplete && (
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[var(--success)] bg-[var(--success-soft)] px-2 py-1 rounded-full">
              <Sparkles size={12} />
              День закрыт
            </span>
          )}
        </div>

        <div className="mt-5">
          <CompletionRings
            rings={rings}
            centerLabel={String(vitalityScore)}
            centerSub={vitalityLabel(vitalityScore)}
            celebrate={celebrate}
          />
        </div>

        {GENERIC_FEATURES.bodyAnalytics && plan.bodyBudget && (
          <BodyBudgetCard budget={plan.bodyBudget} />
        )}

        {GENERIC_FEATURES.bodyAnalytics && plan.compensation && (
          <CompensationCard plan={plan.compensation} />
        )}

        {GENERIC_FEATURES.cycle && (
          <CyclePhaseBar phase={plan.cyclePhase} day={plan.cycleDay} />
        )}

        {plan.nutritionMeta && (
          <div className="mt-3">
            <NutritionMetaCard meta={plan.nutritionMeta} compact />
          </div>
        )}
        {plan.labCalorieNote && GENERIC_FEATURES.medical && (
          <p className="text-[11px] text-[var(--text-secondary)] mt-2">{plan.labCalorieNote}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <StreakBadge days={streak} freezeUsed={freezeUsed} />
          <span className="text-[11px] text-[var(--text-secondary)] self-center">
            {totals.calories} ккал · {totals.proteinG} г белка
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={toggleSoftDay}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              softDay || plan.softDay
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
            }`}
          >
            <Leaf size={12} />
            {softDay || plan.softDay ? "Мягкий день вкл." : "Мягкий день"}
          </button>
        </div>

        {plan.warnings[0] && (
          <p className="text-[12px] text-[var(--warning)] mt-3 flex gap-1.5 items-start">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            {plan.warnings[0]}
          </p>
        )}
      </div>

      <div className="vc-glass-card rounded-2xl">
        <HealthSummaryStrip
          calories={totals.calories}
          calorieTarget={plan.dayTargets.calorieTarget}
          waterMl={todayWater}
          waterTarget={plan.dayTargets.waterTargetMl}
          sleepMin={todaySleep}
          sleepTargetMin={480}
          steps={todaySteps}
          onWaterAdd={addWater}
          onSleepSet={setSleepMinutes}
          onStepsSet={setStepsCount}
        />
      </div>

      {(weeklyInsights || weekRecLogs.length > 0) && (
        <IconCard
          icon={Sparkles}
          iconColor={CARD_ICON}
          title="Рекомендации"
          subtitle="Из аналитики за неделю"
        >
          <AnalyticsRecommendationsCard
            insights={weeklyInsights}
            logs={weekRecLogs}
            waterTargetMl={plan.dayTargets.waterTargetMl}
            sleepTargetMin={480}
            proteinTargetG={plan.dayTargets.proteinTargetG}
            compact
          />
        </IconCard>
      )}

      {!GENERIC_FEATURES.dayRhythm ? null : (
      <DayRhythmCard
        lifeActions={lifeActions}
        ctx={routineCtx}
        moodLogged={plan.wellbeing.moodLogged || diaryDone}
        onToggleStep={toggleRoutineStep}
        onMoodSaved={load}
      />
      )}

      {GENERIC_FEATURES.wellbeingPain && (
      <WellbeingPainCard
        painLevel={painLevel}
        painZones={painZones}
        endometriosis={GENERIC_FEATURES.cycle && profile.endometriosis}
        wellbeing={plan.wellbeing}
        energy={todayEnergy}
        mood={todayMood}
        stress={todayStress}
        onPainChange={savePain}
        onToggleAction={toggleWellbeingAction}
      />
      )}

      {GENERIC_FEATURES.horizonPlan && plan.horizonPlan && (
        <HorizonPlanCard plan={plan.horizonPlan} compact />
      )}

      {plan.mealPlan && plan.todayLeisure && plan.todaySportExtras && (
        <TodayOptionsStrip
          mealPlan={plan.mealPlan}
          mealChoices={mealChoicesForSlots}
          onMealSelect={saveMealChoice}
          sportOptions={plan.todaySportExtras}
          selectedWorkoutId={selectedWorkoutId ?? ""}
          onWorkoutSelect={saveWorkoutChoice}
          leisure={plan.todayLeisure}
          selectedLeisureId={leisureChoice}
          onLeisureSelect={saveLeisureChoice}
        />
      )}

      <IconCard
        icon={Target}
        iconColor={CARD_ICON}
        title="Дела дня"
        subtitle="Список · канбан в дневнике"
      >
        <TaskTrackerPanel tasks={dayTasks} onChange={saveTasks} compact />
        <Link href="/log" className="text-[11px] text-[var(--accent)] mt-2 inline-block">
          {GENERIC_FEATURES.lifeCatalog ? "Канбан и каталог жизни →" : "Открыть канбан в дневнике →"}
        </Link>
      </IconCard>

      {GENERIC_FEATURES.lifeCatalog ? (
        <TodayDetailsPanel subtitle="Аналитика · идеи · культура · плашки дня">
          {plan.lifeSuggestions?.length > 0 && (
            <LifeDiscoverPanel
              suggestions={plan.lifeSuggestions.slice(0, 4)}
              onAddTask={(task) => saveTasks([...dayTasks, task])}
            />
          )}
          <LeisureQuizCard
            initial={parseLeisureQuiz(leisureQuizJson)}
            onSave={saveLeisureQuiz}
          />
          {plan.mediaPicks && <MediaPicksCard media={plan.mediaPicks} />}
          {plan.placePicks?.length > 0 && <PlacesCard places={plan.placePicks} />}
          {plan.recipePicks?.length > 0 && <RecipesCard recipes={plan.recipePicks} />}
          {trackingTags.length > 0 && (
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] mb-2 uppercase">Сегодня было</p>
              <QuickDayTags tags={trackingTags} selected={dayTags} onChange={setDayTags} />
            </div>
          )}
          {(plan.wellbeing.focus === "stress" || plan.warnings.some((w) => w.includes("стресс"))) && (
            <BreathingTimer />
          )}
          {plan.syndromeInsight && (
            <SyndromeCoachCard headline={plan.syndromeInsight.headline} tip={plan.syndromeInsight.tip} />
          )}
          {plan.calorieExplainer && <CalorieExplainerCard explainer={plan.calorieExplainer} />}
          {plan.inflammationLoad && <InflammationScoreCard load={plan.inflammationLoad} />}
          {plan.weeklyExperiment && <WeeklyExperimentCard exp={plan.weeklyExperiment} />}
          {plan.labMealHints.length > 0 && (
            <p className="text-[11px] text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--accent)]">Чекап → тарелка: </span>
              {plan.labMealHints[0].message}
            </p>
          )}
          <PlanWhyCard
            blocks={[healthTip, nutritionEvidence, workoutEvidence, plan.wellbeing.evidence].filter(
              (b): b is NonNullable<typeof b> => Boolean(b),
            )}
          />
          <WellbeingCoachCard plan={plan.wellbeing} onToggleAction={toggleWellbeingAction} />
          {profile.hypothyroidism && plan.warnings.some((w) => w.includes("тироксин")) && (
            <Link href="/log" className="text-[12px] font-semibold text-[var(--purple)] block">
              Отметить тироксин в дневнике →
            </Link>
          )}
          {overdueLab && labEvidence && (
            <Link href="/settings?tab=health" className="block text-[11px] text-[var(--warning)]">
              {overdueLab.label} · {overdueLab.dueText} →
            </Link>
          )}
        </TodayDetailsPanel>
      ) : (
        plan.warnings[0] && (
          <p className="text-[12px] text-[var(--text-secondary)] px-1">{plan.warnings[0]}</p>
        )
      )}

      <p className="text-[12px] text-[var(--text-secondary)] px-1 leading-relaxed">
        {plan.encouragement}
      </p>
    </div>
  );

  return (
    <>
      {renderDock?.({ diaryDone, isEvening })}
      {inner}
    </>
  );
}
