/**
 * Персональные рекомендации на день: еда, движение, досуг.
 * Принцип: один рычаг с максимальным эффектом при минимальных усилиях,
 * опираясь на недельную динамику, сегодняшнее состояние и профиль.
 */
import type { CyclePhase, HealthConditions, WeeklyInsights } from "./types";
import type { CompensationSummary } from "./compensation-plan";
import type { DynamicAdjustments } from "./insights";
import type { WorkoutOption } from "./fitness";

export type RecDomain = "nutrition" | "workout" | "leisure";

export interface ConcreteDayRecommendation {
  id: string;
  domain: RecDomain;
  title: string;
  /** Почему это работает — коротко, по сути */
  why: string;
  /** Сколько реально нужно */
  effort: string;
  action: string;
  pickIds: string[];
  mealSlot?: string;
  priority: number;
}

export interface PersonalizedHighlights {
  meals: Record<string, string[]>;
  workouts: string[];
  leisure: string[];
}

export interface PersonalizedDayPlan {
  recommendations: ConcreteDayRecommendation[];
  topPick: ConcreteDayRecommendation | null;
  highlights: PersonalizedHighlights;
}

type LogSlice = {
  date?: Date | string;
  proteinG?: number | null;
  calories?: number | null;
  waterMl?: number | null;
  sleepMinutes?: number | null;
  mood?: number | null;
  energy?: number | null;
  stress?: number | null;
  postMealWalks?: number | null;
  steps?: number | null;
  mealChoices?: string | null;
  workoutChoice?: string | null;
};

const PROTEIN_MEALS = [
  "u-s1",
  "u-s3",
  "f-d1",
  "l-d1",
  "u-b1",
  "m-b1",
  "m-b2",
  "u-l1",
  "l-l1",
  "f-l1",
];
const LOW_GI_MEALS = ["u-s2", "u-s3", "l-d3", "u-d2", "m-b2"];
const SATIETY_MEALS = ["l-d3", "u-d2", "u-b2", "l-b3"];
const QUICK_WALKS = ["walk-nature", "stairs-walk", "rest-walk", "breath-walk"];
const GENTLE_WORKOUTS = [
  "walk-nature",
  "yoga-flow",
  "pool-easy",
  "pilates",
  "stretch",
  "rest-walk",
  "breath-walk",
];
const QUICK_STRENGTH = ["strength-home"];
const STRESS_LEISURE = ["bath", "yoga", "walk", "comedy", "nature", "music", "breath"];
const MOOD_LEISURE = ["social", "comedy", "concert", "pets", "walk"];
const REST_LEISURE = ["bath", "books", "movie", "balcony", "hammock"];

function slippingKeys(insights: WeeklyInsights | null): Set<string> {
  return new Set((insights?.slipping ?? []).map((s) => s.key));
}

function pushRec(
  list: ConcreteDayRecommendation[],
  rec: Omit<ConcreteDayRecommendation, "priority"> & { priority?: number },
) {
  if (list.some((r) => r.id === rec.id)) return;
  list.push({ ...rec, priority: rec.priority ?? 50 });
}

function avgRecent(logs: LogSlice[], key: keyof LogSlice, days = 3): number | null {
  const slice = logs.slice(-days);
  const nums = slice
    .map((l) => l[key])
    .filter((v): v is number => typeof v === "number" && v > 0);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function buildPersonalizedDayPlan(ctx: {
  insights: WeeklyInsights | null;
  compensation: CompensationSummary;
  dynamic: DynamicAdjustments;
  conditions: HealthConditions;
  phase: CyclePhase | null;
  energy: number;
  mood: number;
  stress: number;
  softDay: boolean;
  hour: number;
  proteinTargetG: number;
  calorieTarget: number;
  recentLogs: LogSlice[];
  todayPostMealWalks?: number;
  leisureFavorites?: string[];
}): PersonalizedDayPlan {
  const recs: ConcreteDayRecommendation[] = [];
  const slip = slippingKeys(ctx.insights);
  const highlights: PersonalizedHighlights = { meals: {}, workouts: [], leisure: [] };

  const addMealHighlight = (slot: string, ids: string[]) => {
    highlights.meals[slot] = [...new Set([...(highlights.meals[slot] ?? []), ...ids])];
  };

  const recentProt = avgRecent(ctx.recentLogs, "proteinG");
  const proteinDebt =
    slip.has("protein") ||
    ctx.dynamic.proteinBoost ||
    ctx.compensation.netExtraProteinG > 0 ||
    (recentProt != null && recentProt < ctx.proteinTargetG * 0.8);

  if (proteinDebt) {
    const gap = recentProt != null ? Math.round(ctx.proteinTargetG - recentProt) : 15;
    pushRec(recs, {
      id: "protein-fix",
      domain: "nutrition",
      title: `+${Math.min(30, Math.max(12, gap))} г белка сегодня`,
      why: "Белок снижает голод, сохраняет мышцы при дефиците и стабилизирует сахар — самый простой рычаг",
      effort: "2 мин",
      action: "Перекус: творог + орехи или яйца на завтрак",
      pickIds: PROTEIN_MEALS.slice(0, 6),
      mealSlot: ctx.hour >= 14 ? "snack" : "breakfast",
      priority: 92,
    });
    addMealHighlight("snack", ["u-s1", "u-s3", "l-s1"]);
    addMealHighlight("breakfast", ["u-b1", "m-b1", "m-b2"]);
    addMealHighlight("dinner", ["f-d1", "u-d1", "l-d1"]);
  }

  if (
    (slip.has("walks") || ctx.conditions.insulinResistance || ctx.conditions.pcosSuspected) &&
    ctx.hour >= 11 &&
    (ctx.todayPostMealWalks ?? 0) < 1
  ) {
    pushRec(recs, {
      id: "post-meal-walk",
      domain: "workout",
      title: "10 мин ходьбы после обеда",
      why: "После еды мышцы забирают глюкозу без лишнего инсулина — при ИР это сильнее, чем ещё одна диета",
      effort: "10 мин",
      action: "Выбери «Ходьба» или «Лестницы 25 мин» в Движении",
      pickIds: ["stairs-walk", "walk-nature", "rest-walk"],
      priority: 88,
    });
    highlights.workouts.push("stairs-walk", "walk-nature", "rest-walk");
  }

  if (slip.has("calories") && !ctx.softDay) {
    pushRec(recs, {
      id: "calorie-volume",
      domain: "nutrition",
      title: "Объём вместо запретов",
      why: "Супы и овощи дают сытость при меньших калориях — проще, чем считать каждый перекус",
      effort: "5 мин",
      action: "Обед/ужин: боул или суп-пюре из подборки",
      pickIds: SATIETY_MEALS,
      mealSlot: ctx.hour >= 16 ? "dinner" : "lunch",
      priority: 75,
    });
    addMealHighlight("lunch", ["u-l1", "u-d2", "l-d3"]);
    addMealHighlight("dinner", ["u-d2", "l-d3", "u-d1"]);
  }

  if (
    (ctx.conditions.insulinResistance || ctx.conditions.pcosSuspected) &&
    !slip.has("calories")
  ) {
    addMealHighlight("snack", ["u-s2", "u-s3"]);
    addMealHighlight("lunch", ["u-l1", "m-l2"]);
  }

  const movementLow =
    slip.has("workouts") ||
    ctx.compensation.netExtraWalkMin > 0 ||
    (ctx.insights?.workoutCount ?? 0) < 2;

  if (movementLow && !ctx.softDay && ctx.stress < 8) {
    const quick =
      ctx.energy < 5 || ctx.dynamic.workoutModifier === "lighter"
        ? GENTLE_WORKOUTS
        : [...QUICK_WALKS, ...QUICK_STRENGTH];
    pushRec(recs, {
      id: "movement-minimum",
      domain: "workout",
      title:
        ctx.energy < 5 ? "20 мин лёгкого движения" : "30 мин — прогулка или домашняя силовая",
      why: "2–3 сессии в неделю уже улучшают настроение, сон и чувствительность к инсулину — не нужен зал",
      effort: ctx.energy < 5 ? "20 мин" : "30 мин",
      action: ctx.energy < 5 ? "Прогулка или йога на коврике" : "Домашняя силовая или вело",
      pickIds: quick.slice(0, 5),
      priority: 80,
    });
    highlights.workouts.push(...quick.slice(0, 4));
  }

  if (ctx.stress >= 7 || ctx.dynamic.workoutModifier === "lighter" || ctx.softDay) {
    pushRec(recs, {
      id: "stress-downshift",
      domain: "workout",
      title: "Движение без кортизола",
      why: "При стрессе HIIT и жёсткий дефicit ухудшают восстановление — ходьба и йога дают тот же антистресс-эффект",
      effort: "15–25 мин",
      action: "Прогулка, йога, бассейн — без «наказания» калориями",
      pickIds: GENTLE_WORKOUTS.slice(0, 4),
      priority: ctx.stress >= 8 ? 95 : 70,
    });
    highlights.workouts.push(...GENTLE_WORKOUTS.slice(0, 3));
    highlights.leisure.push(...STRESS_LEISURE.slice(0, 4));
  }

  if (ctx.mood <= 5) {
    pushRec(recs, {
      id: "mood-lift",
      domain: "leisure",
      title: "10 мин приятного без KPI",
      why: "Короткий досуг и контакт с людьми поднимают настроение быстрее, чем «заставить себя тренироваться»",
      effort: "10 мин",
      action: "Комедия, прогулка, звонок подруге — отметь в Досуге",
      pickIds: MOOD_LEISURE,
      priority: 78,
    });
    highlights.leisure.push(...MOOD_LEISURE.slice(0, 4));
  }

  if (slip.has("sleep") || (ctx.insights?.avgSleepHours ?? 8) < 6.5) {
    pushRec(recs, {
      id: "sleep-protect",
      domain: "nutrition",
      title: "Лёгкий ужин + раньше экран off",
      why: "Тяжёлый ужин и синий свет сдвигают засыпание; белковый лёгкий ужин помогает не проснуться ночью голодной",
      effort: "5 мин",
      action: "Ужин: рыба/творог + овощи; лечь на 30 мин раньше",
      pickIds: ["u-d1", "f-d1", "l-d1"],
      mealSlot: "dinner",
      priority: 72,
    });
    addMealHighlight("dinner", ["u-d1", "f-d1", "l-d1"]);
  }

  if (slip.has("water") || ctx.compensation.netExtraWaterMl > 0) {
    pushRec(recs, {
      id: "water-habit",
      domain: "nutrition",
      title: "Стакан воды перед едой",
      why: "Часто путаем жажду с голодом; 250 мл перед приёмом — самый простой способ добрать норму",
      effort: "1 мин",
      action: "Кнопки +250 на «Сегодня» после каждого приёма",
      pickIds: [],
      priority: 65,
    });
  }

  if (ctx.phase === "luteal") {
    addMealHighlight("snack", ["l-s1", "l-s2", "u-s3"]);
    if (!recs.some((r) => r.id === "luteal-snack")) {
      pushRec(recs, {
        id: "luteal-snack",
        domain: "nutrition",
        title: "Магний + белок во 2-й половине цикла",
        why: "В лютеиновой фазе тяга к сладкому выше — белок и магний (йогурт, семечки, тёмный шоколад 20 г) сглаживают без срыва",
        effort: "2 мин",
        action: "Перекус: йогурт + семечки или творог",
        pickIds: ["l-s1", "u-s3", "l-s2"],
        mealSlot: "snack",
        priority: 68,
      });
    }
  }

  if (ctx.phase === "menstrual" && ctx.energy <= 6) {
    addMealHighlight("lunch", ["l-l1", "l-l2"]);
    highlights.workouts.push("yoga-flow", "walk-nature", "pilates");
    highlights.leisure = [...new Set([...highlights.leisure, "bath", "hammock"])];
  }

  if (ctx.conditions.hypothyroidism) {
    addMealHighlight("lunch", ["u-l2", "l-l2"]);
  }

  const leisureDays = ctx.recentLogs.filter((l) => {
    try {
      const mc = JSON.parse(l.mealChoices || "{}") as Record<string, unknown>;
      return Boolean(mc._leisure);
    } catch {
      return false;
    }
  }).length;
  if (leisureDays < 2 && ctx.recentLogs.length >= 3) {
    pushRec(recs, {
      id: "leisure-reset",
      domain: "leisure",
      title: "15 мин отдыха сегодня",
      why: "Без восстановления падает сон и растёт тяга к еде — досуг это часть плана, не «лень»",
      effort: "15 мин",
      action: "Книга, ванна, прогулка — что реально приятно",
      pickIds: REST_LEISURE,
      priority: 62,
    });
    highlights.leisure.push(...REST_LEISURE.slice(0, 3));
  }

  for (const fav of ctx.leisureFavorites ?? []) {
    if (fav) highlights.leisure.unshift(fav);
  }

  highlights.workouts = [...new Set(highlights.workouts)];
  highlights.leisure = [...new Set(highlights.leisure)];

  if (ctx.hour < 11 && !proteinDebt) {
    addMealHighlight("breakfast", ["m-b1", "u-b1", "m-b2"]);
  }
  if (ctx.hour >= 11 && ctx.hour < 15) {
    addMealHighlight("lunch", ["u-l1", "f-l1", "l-l2"]);
  }
  if (ctx.hour >= 15 && ctx.hour < 18) {
    addMealHighlight("snack", ["u-s1", "u-s3", "l-s1"]);
  }

  recs.sort((a, b) => b.priority - a.priority);

  if (recs.length === 0) {
    pushRec(recs, {
      id: "maintain-rhythm",
      domain: "nutrition",
      title: "Держи текущий ритм",
      why: "Неделя без явных просадок — не усложняй: те же белок, вода и короткое движение",
      effort: "10 мин",
      action: "Отметь выборы на «Сегодня» — этого достаточно",
      pickIds: [],
      priority: 40,
    });
  }

  return {
    recommendations: recs.slice(0, 6),
    topPick: recs[0] ?? null,
    highlights,
  };
}

export function rankByHighlights<T extends { id?: string }>(
  items: T[],
  highlightIds: string[],
): T[] {
  if (highlightIds.length === 0) return items;
  const order = new Map(highlightIds.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ai = order.get(a.id ?? "") ?? 999;
    const bi = order.get(b.id ?? "") ?? 999;
    return ai - bi;
  });
}

export function mealOptionBoost(
  option: { id: string; tags: string[]; proteinG: number },
  highlights: string[],
  ctx: { proteinDebt: boolean; ir: boolean; calorieSlip: boolean },
): number {
  let s = 0;
  if (highlights.includes(option.id)) s += 20;
  if (ctx.proteinDebt && (option.tags.includes("protein") || option.proteinG >= 20)) s += 15;
  if (ctx.ir && (option.tags.includes("low-gi") || option.tags.includes("fiber"))) s += 10;
  if (ctx.calorieSlip && (option.tags.includes("satiety") || option.tags.includes("fiber"))) s += 8;
  return s;
}

export function workoutOptionBoost(option: WorkoutOption, highlights: string[]): number {
  let s = 0;
  const id = option.id ?? option.title;
  if (highlights.includes(id)) s += 25;
  if (option.tags.includes("minimum-day")) s += 5;
  if (option.tags.includes("quick")) s += 4;
  if (option.tags.includes("ir-benefit")) s += 6;
  return s;
}
