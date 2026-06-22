/**
 * Расширенный выбор досуга и спорта на экран «Сегодня».
 */

import type { WorkoutOption, WorkoutContext } from "./fitness";
import { getWorkoutOptions, WORKOUT_OPTIONS } from "./fitness";
import { LEISURE_ACTIVITIES, INTELLECT_ACTIVITIES, type ActivityItem } from "./leisure";
import type { WheelScores } from "./life-spheres";
import { getLowestSpheres } from "./life-spheres";
import type { LeisureQuizAnswers } from "./leisure-quiz";
import { leisureImpact, workoutImpact } from "./impact-motivation";
import { rankByHighlights, workoutOptionBoost } from "./personalized-day-recs";

function quizLeisureBoost(actId: string, q: LeisureQuizAnswers): number {
  let b = 0;
  if (q.energy === "low" && ["bath", "balcony", "movie", "books", "hammock", "yoga", "pilates"].includes(actId)) b += 3;
  if (q.energy === "high" && ["ebike", "gym", "bike", "sup", "dance", "pool"].includes(actId)) b += 3;
  if (q.company === "friends" && ["social", "anticafe", "concert", "masterclass"].includes(actId)) b += 2;
  if (q.company === "partner" && ["dacha", "banya", "cooking", "movie"].includes(actId)) b += 2;
  if (q.setting === "home" && ["home_video", "cooking", "balcony", "sort"].includes(actId)) b += 2;
  if (q.setting === "nature" && ["nature", "dacha", "garden", "firepit", "hammock", "walk"].includes(actId)) b += 3;
  if (q.setting === "city" && ["anticafe", "concert", "walk", "gym"].includes(actId)) b += 2;
  return b;
}

export interface TodayLeisurePick {
  id: string;
  label: string;
  category: ActivityItem["category"];
  why: string;
  impact: string;
  icon: string;
  color: string;
}

function scoreLeisure(
  act: ActivityItem,
  ctx: {
    mood: number;
    energy: number;
    stress: number;
    softDay: boolean;
    quiz?: LeisureQuizAnswers | null;
    weakSpheres: string[];
  },
): number {
  let s = act.moodBoost;
  if (ctx.stress >= 7 && (act.category === "rest" || act.id === "yoga" || act.id === "walk")) s += 4;
  if (ctx.energy >= 7 && act.category === "sport" && act.id !== "gym") s += 3;
  if (ctx.mood <= 5 && (act.category === "social" || act.id === "comedy")) s += 3;
  if (ctx.softDay && act.category === "rest") s += 2;
  if (ctx.quiz) s += quizLeisureBoost(act.id, ctx.quiz);
  if (ctx.weakSpheres.includes("leisure") && act.category === "rest") s += 2;
  if (ctx.weakSpheres.includes("intellect") && act.category === "intellect") s += 3;
  if (ctx.weakSpheres.includes("creativity") && act.category === "creative") s += 3;
  if (ctx.weakSpheres.includes("relationships") && act.category === "social") s += 3;
  return s;
}

export function pickTodayLeisure(ctx: {
  mood: number;
  energy: number;
  stress: number;
  softDay: boolean;
  wheelScores: WheelScores;
  quiz?: LeisureQuizAnswers | null;
  limit?: number;
  highlightIds?: string[];
  leisureFavorites?: string[];
}): TodayLeisurePick[] {
  const weakSpheres = getLowestSpheres(ctx.wheelScores, 3);
  const pool = [...LEISURE_ACTIVITIES, ...INTELLECT_ACTIVITIES];

  const scored = pool
    .map((act) => {
      let score = scoreLeisure(act, { ...ctx, weakSpheres });
      if (ctx.highlightIds?.includes(act.id)) score += 12;
      if (ctx.leisureFavorites?.includes(act.id)) score += 8;
      return { act, score };
    })
    .sort((a, b) => b.score - a.score);

  const reasons: Record<string, string> = {
    sport: "Движение поднимает настроение",
    rest: "Восстановление снижает кортизол",
    social: "Связи — главный предиктор счастья",
    creative: "Творчество без KPI",
    intellect: "Разум — сфера в фокусе",
  };

  const limit = ctx.limit ?? 32;
  const picks: TodayLeisurePick[] = [];
  const used = new Set<string>();

  for (const { act } of scored) {
    if (picks.length >= limit || used.has(act.id)) continue;
    used.add(act.id);
    let why = reasons[act.category] ?? "Подходит под сегодня";
    if (ctx.stress >= 7 && act.category === "rest") why = "Стресс высокий — отдых важнее KPI";
    if (ctx.softDay) why = "Мягкий день — без давления";
    if (ctx.highlightIds?.includes(act.id)) why = "Рекомендуем сегодня по твоим данным";
    picks.push({
      id: act.id,
      label: act.label,
      category: act.category,
      why,
      impact: leisureImpact(act.id),
      icon: act.icon,
      color: act.color,
    });
  }

  return picks;
}

export function pickTodaySportExtras(
  ctx: WorkoutContext,
  limit = 22,
  highlightIds?: string[],
): WorkoutOption[] {
  const base = getWorkoutOptions(ctx);
  const seen = new Set<string>();
  const result: WorkoutOption[] = [];

  const add = (w: WorkoutOption) => {
    const id = w.id ?? w.title;
    if (seen.has(id) || result.length >= limit) return;
    seen.add(id);
    result.push(w);
  };

  const withImpact = (w: WorkoutOption): WorkoutOption => ({
    ...w,
    impact: w.impact ?? workoutImpact(w.id, w.type),
  });

  add(withImpact(base.recommended));
  for (const w of base.alternatives) add(withImpact(w));

  const all = Object.values(WORKOUT_OPTIONS).flat();
  let filtered = [...all];

  if (ctx.stress >= 8) {
    filtered = filtered.filter((o) => o.intensity !== "high");
  }
  if (ctx.energy < 5) {
    filtered = filtered.filter(
      (o) => o.intensity === "low" || o.tags.includes("minimum-day"),
    );
  }
  if (ctx.conditions.surgeryRecovery) {
    filtered = filtered.filter(
      (o) =>
        o.tags.includes("low-impact") ||
        o.tags.includes("post-surgery") ||
        o.intensity !== "high",
    );
  }

  for (const w of filtered) {
    add(withImpact(w));
    if (result.length >= limit) break;
  }

  if (highlightIds?.length) {
    return rankByHighlights(
      [...result].sort((a, b) => workoutOptionBoost(b, highlightIds) - workoutOptionBoost(a, highlightIds)),
      highlightIds,
    );
  }

  return result;
}
