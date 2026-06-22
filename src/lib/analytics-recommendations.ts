/**
 * Рекомендации из аналитики: еда, движение, досуг, сон, вода, настроение…
 */
import { parseWorkoutChoices, leisureChoices, parseMealChoicesRaw } from "./today-choices";
import type { WeeklyInsights } from "./types";

export type RecCategory =
  | "nutrition"
  | "workout"
  | "leisure"
  | "mood"
  | "sleep"
  | "water"
  | "movement"
  | "diary";

export interface AnalyticsRecommendation {
  id: string;
  category: RecCategory;
  categoryLabel: string;
  emoji: string;
  title: string;
  detail: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export const REC_CATEGORY_META: Record<
  RecCategory,
  { label: string; emoji: string; color: string }
> = {
  nutrition: { label: "Еда", emoji: "🥗", color: "var(--accent)" },
  workout: { label: "Тренировки", emoji: "💪", color: "#4A7FD4" },
  leisure: { label: "Досуг", emoji: "✨", color: "#C45C9A" },
  mood: { label: "Настроение", emoji: "😊", color: "#E08B47" },
  sleep: { label: "Сон", emoji: "🌙", color: "var(--brown)" },
  water: { label: "Вода", emoji: "💧", color: "var(--purple)" },
  movement: { label: "Движение", emoji: "🚶", color: "#34AADC" },
  diary: { label: "Дневник", emoji: "📓", color: "var(--gray)" },
};

type LogRow = {
  mealChoices?: string | null;
  leisureJson?: string | null;
  workoutChoice?: string | null;
  mood?: number | null;
  weightKg?: number | null;
  steps?: number | null;
  waterMl?: number | null;
  sleepMinutes?: number | null;
  postMealWalks?: number | null;
};

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function hasLeisure(log: LogRow): boolean {
  try {
    const mc = parseMealChoicesRaw(log.mealChoices);
    if (leisureChoices(mc).length > 0) return true;
  } catch {
    /* */
  }
  try {
    const leisure = JSON.parse(log.leisureJson || "[]") as unknown[];
    return leisure.length > 0;
  } catch {
    return false;
  }
}

function slippingToCategory(key: string): RecCategory | null {
  const map: Record<string, RecCategory> = {
    calories: "nutrition",
    protein: "nutrition",
    weight: "nutrition",
    workouts: "workout",
    walks: "movement",
    water: "water",
    sleep: "sleep",
    mood: "mood",
    energy: "mood",
    stress: "mood",
  };
  return map[key] ?? null;
}

function pushRec(
  list: AnalyticsRecommendation[],
  seen: Set<string>,
  rec: Omit<AnalyticsRecommendation, "categoryLabel" | "emoji"> & { category: RecCategory },
) {
  const key = `${rec.category}:${rec.id}`;
  if (seen.has(key)) return;
  seen.add(key);
  const meta = REC_CATEGORY_META[rec.category];
  list.push({
    ...rec,
    categoryLabel: meta.label,
    emoji: meta.emoji,
  });
}

export function buildAnalyticsRecommendations(
  insights: WeeklyInsights | null,
  logs: LogRow[],
  opts?: { waterTargetMl?: number; sleepTargetMin?: number; proteinTargetG?: number },
): AnalyticsRecommendation[] {
  const weekLogs = logs.slice(-7);
  const recs: AnalyticsRecommendation[] = [];
  const seen = new Set<string>();

  if (!insights && weekLogs.length === 0) {
    pushRec(recs, seen, {
      id: "start-logging",
      category: "diary",
      title: "Начни с дневника",
      detail: "3–4 дня записей — и рекомендации станут точнее",
      action: "Отметь настроение и воду сегодня",
      priority: "high",
    });
    return recs;
  }

  // Из analyzeWeek (просадки)
  for (const s of insights?.slipping ?? []) {
    const cat = slippingToCategory(s.key);
    if (!cat) continue;
    pushRec(recs, seen, {
      id: s.key,
      category: cat,
      title: s.label,
      detail: s.message,
      action: s.action,
      priority: s.score >= 50 ? "high" : "medium",
    });
  }

  // Досуг
  const leisureDays = weekLogs.filter(hasLeisure).length;
  if (weekLogs.length >= 3 && leisureDays < 2) {
    pushRec(recs, seen, {
      id: "leisure-low",
      category: "leisure",
      title: "Мало досуга",
      detail: `За неделю отдых отмечен ${leisureDays} из ${weekLogs.length} дн.`,
      action: "Выбери досуг на «Сегодня» — прогулка, книга, встреча",
      priority: "medium",
    });
  } else if (leisureDays >= 4) {
    pushRec(recs, seen, {
      id: "leisure-win",
      category: "leisure",
      title: "Досуг в ритме",
      detail: `${leisureDays} дн. с отдыхом — это поддерживает настроение`,
      action: "Продолжай: 1 приятное дело без KPI в день",
      priority: "low",
    });
  }

  // Шаги
  const stepsLogged = weekLogs.map((l) => l.steps).filter((s): s is number => s != null && s > 0);
  const avgSteps = avg(stepsLogged);
  if (stepsLogged.length >= 2 && avgSteps != null && avgSteps < 6000) {
    pushRec(recs, seen, {
      id: "steps-low",
      category: "movement",
      title: "Мало шагов",
      detail: `В среднем ~${Math.round(avgSteps)} шагов`,
      action: "10 мин ходьбы после обеда или выбери прогулку в досуге",
      priority: "medium",
    });
  } else if (avgSteps != null && avgSteps >= 8000) {
    pushRec(recs, seen, {
      id: "steps-win",
      category: "movement",
      title: "Шаги в цели",
      detail: `~${Math.round(avgSteps)} шагов в среднем`,
      action: "Держи темп — ходьба снижает стресс и тягу к сладкому",
      priority: "low",
    });
  }

  // Дневник
  const logDays = weekLogs.filter((l) => l.mood != null || l.weightKg != null).length;
  if (weekLogs.length >= 4 && logDays < 3) {
    pushRec(recs, seen, {
      id: "diary-gap",
      category: "diary",
      title: "Пропуски в дневнике",
      detail: `Записей ${logDays} из ${weekLogs.length} дн. — картина неполная`,
      action: "Вечером: настроение + сон — 30 секунд",
      priority: "high",
    });
  }

  // Вода (если analyzeWeek не поймал)
  const waters = weekLogs.map((l) => l.waterMl).filter((w): w is number => w != null && w > 0);
  const avgWater = avg(waters);
  const waterTarget = opts?.waterTargetMl ?? 2000;
  if (
    waters.length >= 2 &&
    avgWater != null &&
    avgWater < waterTarget * 0.75 &&
    !seen.has("water:water")
  ) {
    pushRec(recs, seen, {
      id: "water-extra",
      category: "water",
      title: "Вода ниже цели",
      detail: `~${Math.round(avgWater)} мл при цели ${waterTarget}`,
      action: "Стакан после каждого приёма пищи — на «Сегодня» кнопки +250",
      priority: "medium",
    });
  }

  // Сон
  const sleeps = weekLogs.map((l) => l.sleepMinutes).filter((s): s is number => s != null && s > 0);
  const avgSleep = avg(sleeps);
  const sleepTarget = opts?.sleepTargetMin ?? 480;
  if (
    sleeps.length >= 2 &&
    avgSleep != null &&
    avgSleep < sleepTarget * 0.85 &&
    !seen.has("sleep:sleep")
  ) {
    pushRec(recs, seen, {
      id: "sleep-extra",
      category: "sleep",
      title: "Сон короткий",
      detail: `~${(avgSleep / 60).toFixed(1)} ч при цели ${sleepTarget / 60} ч`,
      action: "Ложиться на 30 мин раньше; экран off за час до сна",
      priority: "high",
    });
  }

  // Тренировки — выбор на «Сегодня»
  const workoutPicks = weekLogs.filter((l) => parseWorkoutChoices(l.workoutChoice).length > 0).length;
  if (weekLogs.length >= 3 && workoutPicks < 2 && !seen.has("workout:workouts")) {
    pushRec(recs, seen, {
      id: "workout-pick",
      category: "workout",
      title: "Редко выбираешь движение",
      detail: `Тренировка выбрана ${workoutPicks} из ${weekLogs.length} дн.`,
      action: "На «Сегодня» → Движение: даже 20 мин ходьбы зачтётся",
      priority: "medium",
    });
  }

  // Победы → мягкие рекомендации «продолжай»
  if (recs.filter((r) => r.priority !== "low").length === 0) {
    for (const win of (insights?.wins ?? []).slice(0, 2)) {
      const lower = win.toLowerCase();
      let cat: RecCategory = "nutrition";
      if (lower.includes("тренир")) cat = "workout";
      else if (lower.includes("настроен")) cat = "mood";
      else if (lower.includes("сон")) cat = "sleep";
      pushRec(recs, seen, {
        id: `win-${cat}-${win.slice(0, 12)}`,
        category: cat,
        title: "Работает",
        detail: win,
        action: "Закрепи ещё на 3–4 дня — привычка станет автоматической",
        priority: "low",
      });
    }
  }

  if (recs.length === 0) {
    pushRec(recs, seen, {
      id: "balanced",
      category: "mood",
      title: "Ритм ровный",
      detail: "Явных просадок за неделю нет",
      action: "Держи текущий темп: еда, движение, досуг, сон",
      priority: "low",
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}
