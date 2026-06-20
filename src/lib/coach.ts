import { format, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import type { DailyLog, HabitCheck, LabResult, Meal, Profile, Workout } from "@prisma/client";
import { getActiveHabits } from "./habits";
import {
  getCycleDay,
  getCyclePhase,
  getCycleNote,
  isWeighDay,
  estimateNextPeriod,
} from "./cycle";
import {
  getDailyMealPlan,
  getNutritionFramework,
  sumSelectedMeals,
} from "./nutrition";
import { getWorkoutOptions } from "./fitness";
import { buildHorizonPlan } from "./horizon-plan";
import { pickTodayLeisure, pickTodaySportExtras } from "./today-picks";
import { getPsychologyCoach } from "./psychology";
import { buildDynamicAdjustments, computeStreak, analyzeWeek } from "./insights";
import { deriveNutritionMeta, profileToDerivationInput } from "./profile-derivation";
import { who5NeedsAttention, who5RawTotal, type Who5Score } from "./psychology-frameworks";
import {
  buildWellbeingPlan,
  computeWellbeingTrends,
  parseWellbeingDone,
} from "./wellbeing-coach";
import { buildLabSchedule, formatLabDue, getNextBundleForCycle } from "./labs-schedule";
import { computeBodyBudget } from "./body-budget";
import { buildCalorieExplainer } from "./calorie-explainer";
import { computeInflammationLoad } from "./inflammation-score";
import { parseDayTags } from "./tracking-tags";
import { computeCompensation } from "./compensation-plan";
import { buildHealthBriefing } from "./health-briefing";
import { CHECKUP, checkupReminderTitle } from "./product-copy";
import { GENERIC_MODE } from "./app-config";
import { parseDayTasks, taskStats } from "./day-tasks";
import { parseLifeActions } from "./life-actions";
import { mealImpact, workoutImpact } from "./impact-motivation";
import { pickLifeSuggestions } from "./life-recommendations";
import { pickMedia } from "./media-picks";
import { parseLeisureQuiz } from "./leisure-quiz";
import { recipesForConditions } from "./recipes-catalog";
import { placesForQuiz } from "./places-catalog";
import { parseStyleProfile } from "./style-guide";
import type { WheelScores } from "./life-spheres";
import { labMealHints, mealMatchesLabHint } from "./lab-meal-bridge";
import { syndromeInsight } from "./syndrome-coach";
import { currentExperiment } from "./weekly-experiment";
import { defaultDayRings } from "./day-rings";
import { computeVitalityScore } from "./vitality-score";
import type {
  CoachTask,
  CyclePhase,
  DailyCoachPlan,
  HealthConditions,
  MealSlotPlan,
} from "./types";

type DailyLogWithRelations = DailyLog & {
  habits?: HabitCheck[];
  workouts?: Workout[];
  meals?: Meal[];
};

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  snack: "Перекус",
  dinner: "Ужин",
};

function profileConditions(p: Profile): HealthConditions {
  return {
    insulinResistance: p.insulinResistance,
    hypothyroidism: p.hypothyroidism,
    cortisolIssues: p.cortisolIssues,
    vitaminDDeficiency: p.vitaminDDeficiency,
    b12Deficiency: p.b12Deficiency,
    hormoneIssues: p.hormoneIssues,
    pcosSuspected: p.pcosSuspected,
    endometriosis: p.endometriosis,
    vitaminAbsorption: p.vitaminAbsorption,
    surgeryRecovery: p.surgeryRecovery,
  };
}

function parseMealChoices(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function toWorkoutSuggestion(w: {
  id: string;
  type: string;
  title: string;
  durationMin: number;
  intensity: string;
  moodBoost?: string;
  leisureNote?: string;
}) {
  return {
    id: w.id,
    type: w.type,
    title: w.title,
    durationMin: w.durationMin,
    intensity: w.intensity,
    notes: [w.moodBoost, w.leisureNote].filter(Boolean).join(" · "),
    moodBoost: w.moodBoost,
    leisureNote: w.leisureNote,
    impact: workoutImpact(w.id, w.type),
  };
}

export function generateDailyPlan(
  profile: Profile,
  todayLog: DailyLogWithRelations | null,
  recentLogs: DailyLogWithRelations[],
  labs: LabResult[] = [],
): DailyCoachPlan {
  const conditions = profileConditions(profile);
  const today = new Date();
  const cycleDay = getCycleDay(profile.lastPeriodStart, profile.cycleLength, today);
  const phase = getCyclePhase(cycleDay, profile.cycleLength);
  const cycleNote = getCycleNote(phase, cycleDay);

  const nextPeriodEstimate = profile.lastPeriodStart
    ? format(estimateNextPeriod(profile.lastPeriodStart, profile.cycleLength), "d MMMM", { locale: ru })
    : null;

  const insights = analyzeWeek(recentLogs, profile);
  const recentEnergy = recentLogs.map((l) => l.energy).filter((e): e is number => e != null);
  const recentStress = recentLogs.map((l) => l.stress).filter((s): s is number => s != null);
  const dynamic = buildDynamicAdjustments(insights, labs, profile, recentEnergy, recentStress);

  const energy = todayLog?.energy ?? recentEnergy[0] ?? 6;
  const mood = todayLog?.mood ?? 6;
  const stress = todayLog?.stress ?? recentStress[0] ?? 5;
  const cortisolFeeling = todayLog?.cortisolFeeling ?? 5;

  const streak = computeStreak(recentLogs.map((l) => l.date));
  const nutritionMeta = deriveNutritionMeta(profileToDerivationInput(profile));

  const mealChoices = parseMealChoices(todayLog?.mealChoices);
  const softDay = todayLog?.softDay === true;
  delete mealChoices._softDay;

  let psychology = getPsychologyCoach(
    { energy, mood, stress, cortisolFeeling },
    insights,
    phase,
    streak,
  );
  if (softDay) {
    psychology = {
      ...psychology,
      minimumDay: true,
      headline: "Мягкий день",
      message: "Ты включила мягкий режим — без жёсткого дефицита, приоритет сну и лёгкому движению.",
      reframe: "Один спокойный день не отменяет прогресс. Завтра вернёмся к плану.",
    };
  }

  let calorieTarget = nutritionMeta.calorieTarget + dynamic.calorieAdjustment;
  if (dynamic.calorieAdjustment > 0 && nutritionMeta.bodyGoal === "lose") {
    calorieTarget = Math.min(calorieTarget, nutritionMeta.calorieTarget + 80);
  }
  if (softDay) {
    calorieTarget = Math.min(calorieTarget + 80, nutritionMeta.tdee - 300);
  }

  const baseCalorieTarget = calorieTarget;

  const compensation = computeCompensation(
    recentLogs,
    baseCalorieTarget,
    nutritionMeta.waterTargetMl,
    profile.sleepTargetMin,
    conditions,
    softDay,
    stress,
  );

  if (compensation.netCalorieAdjust < 0 && nutritionMeta.bodyGoal === "lose") {
    const floor = conditions.hypothyroidism ? 1400 : baseCalorieTarget - 200;
    calorieTarget = Math.max(floor, baseCalorieTarget + compensation.netCalorieAdjust);
  }

  const recentStressHigh =
    recentLogs.slice(0, 3).filter((l) => (l.stress ?? 0) >= 7).length >= 3;

  let who5Total: number | null = null;
  try {
    const who5 = JSON.parse(profile.who5Scores || "{}") as Partial<Who5Score>;
    if (who5.cheerful != null) who5Total = who5RawTotal(who5 as Who5Score);
  } catch {
    /* */
  }

  const suggestSoftDay =
    !softDay &&
    (recentStressHigh ||
      (psychology.minimumDay && stress >= 7) ||
      (who5Total != null && who5NeedsAttention(who5Total)));

  const liveWaterTarget = nutritionMeta.waterTargetMl + compensation.netExtraWaterMl;

  let proteinTarget = dynamic.proteinBoost
    ? nutritionMeta.proteinTargetG + 20
    : nutritionMeta.proteinTargetG;
  if (compensation.netExtraProteinG > 0) {
    proteinTarget += compensation.netExtraProteinG;
  }

  const framework = getNutritionFramework(conditions, phase, calorieTarget);
  const workoutChoiceId = todayLog?.workoutChoice || undefined;

  const rawMealPlan = getDailyMealPlan(phase, conditions, mealChoices);
  const mealTotals = sumSelectedMeals(rawMealPlan);
  const mealOverTarget =
    nutritionMeta.bodyGoal === "lose" && mealTotals.calories > calorieTarget * 1.05;

  const hints = labMealHints(labs);
  const mealPlan: MealSlotPlan[] = rawMealPlan.map((m) => ({
    slot: m.slot,
    slotLabel: SLOT_LABELS[m.slot] ?? m.slot,
    options: m.options.map((o) => ({
      ...o,
      impact: mealImpact(o.id, o.tags),
      labBoost: hints.some((h) => mealMatchesLabHint(o.title, h.mealKeywords)),
    })),
    selected: {
      ...m.selected,
      impact: mealImpact(m.selected.id, m.selected.tags),
      labBoost: hints.some((h) => mealMatchesLabHint(m.selected.title, h.mealKeywords)),
    },
  }));

  const workoutCount = recentLogs
    .slice(0, 7)
    .reduce((s, l) => s + (l.workouts?.filter((w) => w.completed).length ?? 0), 0);

  let workoutBlock = getWorkoutOptions({
    dayOfWeek: getDay(today),
    phase,
    conditions,
    energy,
    stress,
    mood,
    recentWorkoutCount: workoutCount,
  });

  if (dynamic.workoutModifier === "lighter" || psychology.minimumDay) {
    workoutBlock = getWorkoutOptions({
      dayOfWeek: getDay(today),
      phase: "menstrual",
      conditions,
      energy: 4,
      stress: 8,
      mood: 4,
      recentWorkoutCount: workoutCount,
    });
  }

  let recommended = workoutBlock.recommended;
  if (workoutChoiceId) {
    const picked =
      [workoutBlock.recommended, ...workoutBlock.alternatives].find((w) => w.id === workoutChoiceId);
    if (picked) recommended = picked;
  }

  if (compensation.netExtraWalkMin > 0) {
    recommended = {
      ...recommended,
      durationMin: recommended.durationMin + compensation.netExtraWalkMin,
      title:
        recommended.title.includes("ходьб")
          ? recommended.title
          : `${recommended.title} + ${compensation.netExtraWalkMin} мин ходьбы`,
      caloriesNote: `${recommended.caloriesNote} · компенсация переедания`,
    };
  }

  const nutritionFocus = [...framework.principles.slice(0, 4), ...dynamic.extraFocus];
  if (!GENERIC_MODE) {
    if (conditions.pcosSuspected) nutritionFocus.unshift("СПКЯ: силовая 2×/нед + ходьба после еды");
    if (conditions.endometriosis) nutritionFocus.unshift("Эндометриоз: рыба, крестоцветные, без жёсткого пресса в боли");
    if (conditions.vitaminAbsorption) nutritionFocus.push("Усвоение: жир + витамин C к железу/B12");
  }

  const warnings: string[] = [...dynamic.extraWarnings];
  if (mealOverTarget) {
    warnings.push(
      `Меню ~${mealTotals.calories} ккал — выше цели ${calorieTarget}. Попробуй варианты с меньшей цифрой`,
    );
  }
  if (!GENERIC_MODE && conditions.hypothyroidism && !todayLog?.thyroidMedTaken) {
    warnings.push("Отметь приём тироксина — на пустой желудок");
  }
  if (psychology.minimumDay) {
    warnings.push("Минимальный день: не углубляй дефицит");
  }
  if (recentStressHigh && !softDay) {
    warnings.push("3 дня высокого стресса — включи «Мягкий день» или снизь нагрузку");
  }
  if (
    !GENERIC_MODE &&
    who5Total != null &&
    who5NeedsAttention(who5Total) &&
    nutritionMeta.bodyGoal === "lose"
  ) {
    warnings.push(`WHO-5 ${who5Total}/25 — не ужесточай дефицит, приоритет сон и связи`);
  }

  const completedMarkers = labs.map((l) => l.marker);
  const labSchedule = buildLabSchedule(labs, cycleDay);
  const labsDue = labSchedule
    .filter((s) => s.urgency === "overdue" || s.urgency === "this_week")
    .slice(0, 4)
    .map((s) => ({
      label: s.label,
      dueText: formatLabDue(s.dueDate),
      urgency: s.urgency,
      reason: s.reason,
    }));

  const nextBundle = getNextBundleForCycle(cycleDay, completedMarkers);
  const suggestedLabBundle = nextBundle?.title ?? null;

  const habits = getActiveHabits(conditions);
  const completedHabits = new Set(
    todayLog?.habits?.filter((h) => h.completed).map((h) => h.habitKey) ?? [],
  );

  const dayTasks = parseDayTasks(todayLog?.tasksJson);
  const taskSummary = taskStats(dayTasks);

  const tasks: CoachTask[] = [
    {
      id: "morning_weigh",
      category: "track",
      title: GENERIC_MODE ? "Вес — по желанию" : isWeighDay(cycleDay) ? "День взвешивания (цикл 5–7)" : "Вес — по желанию",
      description: GENERIC_MODE ? "Тренд важнее ежедневного веса" : isWeighDay(cycleDay) ? "Честная точка для тренда" : "Тренд важнее ежедневного веса",
      priority: GENERIC_MODE ? "optional" : isWeighDay(cycleDay) ? "must" : "optional",
      completed: todayLog?.weightKg != null,
    },
    {
      id: "log_meals",
      category: "nutrition",
      title: `Питание ~${calorieTarget} ккал / ${proteinTarget} г белка`,
      description: `План из меню: ~${mealTotals.calories} ккал, ${mealTotals.proteinG} г белка`,
      priority: "must",
      completed: (todayLog?.calories ?? 0) > 0,
    },
    {
      id: "log_water",
      category: "track",
      title: `Вода ${liveWaterTarget} мл`,
      description: "Стакан после еды — не обязательно «лить литрами»",
      priority: "must",
      completed: (todayLog?.waterMl ?? 0) >= liveWaterTarget * 0.75,
    },
    {
      id: "log_wellbeing",
      category: "psychology",
      title: "Сон и настроение",
      description: "Влияет на тренировку и план завтра",
      priority: "must",
      completed: todayLog?.sleepMinutes != null && todayLog?.mood != null,
    },
    {
      id: "workout",
      category: "workout",
      title: recommended.title,
      description: `${recommended.durationMin} мин · ${workoutBlock.rationale}${
        compensation.netExtraWalkMin > 0
          ? ` · +${compensation.netExtraWalkMin} мин компенсация`
          : ""
      }`,
      priority: psychology.minimumDay ? "optional" : "should",
      completed: todayLog?.workouts?.some((w) => w.completed) ?? false,
    },
  ];

  if (taskSummary.workTotal > 0 || taskSummary.total > 0) {
    tasks.push({
      id: "day_tasks",
      category: "tasks",
      title:
        taskSummary.workTotal > 0
          ? `Работа: ${taskSummary.workDone}/${taskSummary.workTotal}`
          : `Дела: ${taskSummary.done}/${taskSummary.total}`,
      description: "Трекер в дневнике — работа, быт, личное",
      priority: taskSummary.workTotal > 0 ? "should" : "optional",
      completed: taskSummary.total > 0 && taskSummary.done === taskSummary.total,
    });
  }

  if (labsDue.length > 0) {
    tasks.push({
      id: "labs_due",
      category: "labs",
      title: checkupReminderTitle(labsDue[0].label),
      description: labsDue[0].reason,
      priority: labsDue[0].urgency === "overdue" ? "must" : "should",
      completed: false,
    });
  }

  for (const habit of habits.filter((h) => h.priority === "must").slice(0, 4)) {
    tasks.push({
      id: `habit_${habit.key}`,
      category: "habit",
      title: habit.label,
      description: habit.description,
      priority: psychology.minimumDay && habit.key !== "log_everything" ? "optional" : "must",
      completed: completedHabits.has(habit.key),
    });
  }

  const wellbeingTrends = computeWellbeingTrends(recentLogs);
  const wellbeingDone = parseWellbeingDone(todayLog?.lifeActionsJson);
  const moodLogged = todayLog?.mood != null;

  const wellbeing = buildWellbeingPlan({
    state: { energy, mood, stress, cortisolFeeling },
    trends: wellbeingTrends,
    cyclePhase: phase,
    moodLogged,
    actionsDone: wellbeingDone,
    flags: {
      hypothyroidism: conditions.hypothyroidism,
      endometriosis: conditions.endometriosis,
      cortisolIssues: conditions.cortisolIssues,
    },
    minimumDay: psychology.minimumDay || softDay,
  });

  const labCalorieNote =
    dynamic.calorieAdjustment !== 0
      ? `${CHECKUP.adjustmentNote}/состоянию: ${dynamic.calorieAdjustment > 0 ? "+" : ""}${dynamic.calorieAdjustment} ккал`
      : undefined;

  const doneCount = tasks.filter((t) => t.completed).length;
  const dynamicInsights = [
    ...dynamic.celebrateWins.slice(0, 2).map((w) => `✓ ${w}`),
    ...insights.slipping.slice(0, 2).map((s) => `↑ Исправить: ${s.action}`),
  ];

  if (dynamic.psychologyNote) dynamicInsights.push(dynamic.psychologyNote);

  const yesterdayLog = recentLogs.length > 1 ? recentLogs[1] : null;
  const weekOverDays = recentLogs.slice(0, 7).filter((l) => {
    const c = l.calories ?? 0;
    return c > calorieTarget + 50;
  }).length;
  const bodyBudget = computeBodyBudget(
    calorieTarget,
    mealTotals.calories,
    yesterdayLog?.calories,
    nutritionMeta.calorieTarget,
    weekOverDays,
  );

  const dayTags = parseDayTags(todayLog?.dayTagsJson);
  const inflammationLoad = computeInflammationLoad({
    stress,
    sleepMinutes: todayLog?.sleepMinutes,
    sleepTarget: profile.sleepTargetMin,
    cyclePhase: phase,
    endometriosis: conditions.endometriosis,
    dayTags,
    softDay,
  });
  const calorieExplainer = buildCalorieExplainer(nutritionMeta, conditions);

  let wheelScores: WheelScores = {};
  try {
    wheelScores = JSON.parse(profile.wheelScores || "{}") as WheelScores;
  } catch {
    /* */
  }

  const leisureQuiz = parseLeisureQuiz(profile.leisureQuizJson);

  const lifeSuggestions = pickLifeSuggestions({
    mood,
    energy,
    stress,
    cyclePhase: phase,
    wheelScores,
    interestsJson: profile.interestsJson,
    compensation,
    hour: today.getHours(),
    softDay,
    leisureQuiz,
    limit: 8,
  });

  const todayLeisure = pickTodayLeisure({
    mood,
    energy,
    stress,
    softDay,
    wheelScores,
    quiz: leisureQuiz,
    limit: 10,
  });

  const workoutCtx = {
    dayOfWeek: getDay(today),
    phase,
    conditions,
    energy,
    stress,
    mood,
    recentWorkoutCount: recentLogs.reduce(
      (s, l) => s + (l.workouts?.filter((w) => w.completed).length ?? 0),
      0,
    ),
  };
  const todaySportExtras = pickTodaySportExtras(workoutCtx, 8);

  const weeklyExperiment = currentExperiment(profile.weeklyExperimentJson, recentLogs);

  const horizonPlan = buildHorizonPlan({
    wheelScores,
    insights,
    compensation,
    dayTasks,
    lifeSuggestions,
    labsDue,
    weeklyExperiment,
    profile: {
      occupation: profile.occupation,
      careerGoal: profile.careerGoal,
      financeGoal: profile.financeGoal,
      relationshipStatus: profile.relationshipStatus,
      pcosSuspected: profile.pcosSuspected,
      cortisolIssues: profile.cortisolIssues,
    },
    workoutTitle: recommended.title,
    mealFocus: nutritionFocus[0],
    softDay: softDay || suggestSoftDay,
  });

  const mediaPicks = pickMedia(mood, energy, stress, leisureQuiz);
  const recipePicks = recipesForConditions(
    conditions.insulinResistance,
    conditions.hypothyroidism,
  );
  const placePicks = placesForQuiz(leisureQuiz?.setting, leisureQuiz?.company);
  const styleProfile = parseStyleProfile(profile.styleJson);

  const lifeActs = parseLifeActions(todayLog?.lifeActionsJson);

  const healthBriefing = buildHealthBriefing({
    conditions,
    cyclePhase: phase,
    stress,
    energy,
    softDay,
    inflammation: inflammationLoad,
    compensation,
    calorieTarget,
    baseCalorieTarget,
    labsDue: labsDue.length ? [{ label: labsDue[0].label, reason: labsDue[0].reason }] : undefined,
    tasks: dayTasks,
    thyroidTaken: todayLog?.thyroidMedTaken,
    painLevel: lifeActs.painLevel,
    painZones: lifeActs.painZones,
  });

  const syndrome = syndromeInsight(conditions, phase, stress);

  const mealsDone = rawMealPlan.filter((m) => mealChoices[m.slot] || m.selected).length;
  let lifeSelfcare = 0;
  let lifeHome = 0;
  try {
    const la = JSON.parse(todayLog?.lifeActionsJson || "{}") as {
      selfcare?: string[];
      home?: string[];
    };
    lifeSelfcare = la.selfcare?.length ?? 0;
    lifeHome = la.home?.length ?? 0;
  } catch {
    /* */
  }
  const careBoost = Math.min(0.35, (lifeSelfcare > 0 ? 0.2 : 0) + (lifeHome > 0 ? 0.15 : 0));
  const vitalityScore = computeVitalityScore(
    defaultDayRings({
      mealsDone,
      mealsTotal: 4,
      workoutDone: Boolean(todayLog?.workouts?.some((w) => w.completed) || workoutChoiceId),
      diaryDone: todayLog?.mood != null || todayLog?.weightKg != null,
      wellbeingProgress:
        (todayLog?.mood != null ? 0.35 : 0) +
        (parseWellbeingDone(todayLog?.lifeActionsJson).length > 0 ? 0.3 : 0) +
        careBoost,
    }),
  );

  return {
    greeting: `Привет${profile.name ? `, ${profile.name}` : ""}! ${format(today, "EEEE, d MMMM", { locale: ru })}`,
    summary: GENERIC_MODE
      ? `${calorieTarget} ккал · ${proteinTarget} г белка · ${doneCount}/${tasks.length} задач`
      : `День ${cycleDay ?? "?"} цикла · ${calorieTarget} ккал · ${proteinTarget} г белка · ${doneCount}/${tasks.length} задач`,
    cycleDay,
    cyclePhase: phase,
    cycleNote,
    nextPeriodEstimate,
    nutritionFramework: {
      ...framework,
      totalsFromMeals: mealTotals,
    },
    nutritionFocus,
    mealPlan,
    workout: {
      rationale: workoutBlock.rationale,
      recommended: toWorkoutSuggestion(recommended),
      alternatives: workoutBlock.alternatives.map(toWorkoutSuggestion),
    },
    psychology,
    tasks,
    warnings,
    dynamicInsights,
    encouragement: psychology.minimumDay
      ? psychology.reframe
      : dynamic.celebrateWins[0] ?? "Выбери варианты ниже — решения уже приняты.",
    labsDue,
    suggestedLabBundle,
    nutritionMeta,
    dayTargets: {
      calorieTarget,
      proteinTargetG: proteinTarget,
      fatTargetG: nutritionMeta.fatTargetG,
      carbTargetG: nutritionMeta.carbTargetG,
      waterTargetMl: liveWaterTarget,
    },
    softDay,
    suggestSoftDay,
    wellbeing,
    labCalorieNote,
    bodyBudget,
    syndromeInsight: syndrome,
    weeklyExperiment,
    labMealHints: hints,
    vitalityScore,
    calorieExplainer,
    inflammationLoad,
    compensation,
    healthBriefing,
    dayTasks,
    baseCalorieTarget,
    lifeSuggestions,
    mediaPicks,
    recipePicks,
    placePicks,
    styleProfile,
    horizonPlan,
    todayLeisure,
    todaySportExtras,
  };
}
