import type { HealthConditions } from "./types";

/** Мягкая компенсация переборов — на следующие дни, без наказания */

export type CompensationDomain = "calories" | "movement" | "water" | "sleep" | "protein";

export interface CompensationItem {
  domain: CompensationDomain;
  active: boolean;
  totalDebt: number;
  daysRemaining: number;
  dailyCalorieAdjust: number;
  extraWalkMin: number;
  extraWaterMl: number;
  extraSleepMin: number;
  extraProteinG: number;
  title: string;
  reason: string;
  action: string;
}

export interface CompensationSummary {
  items: CompensationItem[];
  netCalorieAdjust: number;
  netExtraWalkMin: number;
  netExtraWaterMl: number;
  netExtraProteinG: number;
  headline: string;
}

interface LogSlice {
  date: Date | string;
  calories?: number | null;
  waterMl?: number | null;
  sleepMinutes?: number | null;
  proteinG?: number | null;
  workouts?: { completed: boolean }[];
  postMealWalks?: number | null;
}

const MIN_CAL_FLOOR = 1400;
const MAX_DAILY_CAL_REDUCE = 75;
const MAX_DAILY_WALK = 25;

export function computeCompensation(
  recentLogs: LogSlice[],
  calorieTarget: number,
  waterTargetMl: number,
  sleepTargetMin: number,
  conditions: HealthConditions,
  softDay: boolean,
  stress: number,
): CompensationSummary {
  const items: CompensationItem[] = [];
  if (softDay || stress >= 8) {
    return {
      items: [],
      netCalorieAdjust: 0,
      netExtraWalkMin: 0,
      netExtraWaterMl: 0,
      netExtraProteinG: 0,
      headline: "Компенсация отложена — мягкий день или высокий стресс",
    };
  }

  const proteinTarget = Math.round(calorieTarget * 0.09);

  const past = recentLogs.slice(1, 4);
  let calOver = 0;
  for (const log of past) {
    const c = log.calories ?? 0;
    if (c > calorieTarget + 80) calOver += c - calorieTarget;
  }

  if (calOver >= 120) {
    const days = Math.min(3, Math.max(2, Math.ceil(calOver / 200)));
    const dailyReduce = Math.min(
      MAX_DAILY_CAL_REDUCE,
      Math.round(calOver / days),
    );
    const floor = conditions.hypothyroidism ? MIN_CAL_FLOOR : calorieTarget - 200;
    const effectiveReduce =
      calorieTarget - dailyReduce >= floor ? dailyReduce : Math.max(0, calorieTarget - floor);

    if (effectiveReduce > 0) {
      items.push({
        domain: "calories",
        active: true,
        totalDebt: calOver,
        daysRemaining: days,
        dailyCalorieAdjust: -effectiveReduce,
        extraWalkMin: Math.min(MAX_DAILY_WALK, Math.round(calOver / 50)),
        extraWaterMl: 0,
        extraSleepMin: 0,
        extraProteinG: 0,
        title: `Переедание ~${calOver} ккал`,
        reason: `За ${past.length} дн. было больше цели — распределяем мягко на ${days} дн., не голодом`,
        action: `Сегодня −${effectiveReduce} ккал и +${Math.min(MAX_DAILY_WALK, Math.round(calOver / 50))} мин ходьбы`,
      });
    }
  }

  const lowWaterDays = past.filter(
    (l) => (l.waterMl ?? 0) < waterTargetMl * 0.65,
  ).length;
  if (lowWaterDays >= 2) {
    items.push({
      domain: "water",
      active: true,
      totalDebt: waterTargetMl - (past[0]?.waterMl ?? 0),
      daysRemaining: 2,
      dailyCalorieAdjust: 0,
      extraWalkMin: 0,
      extraWaterMl: 250,
      extraSleepMin: 0,
      extraProteinG: 0,
      title: "Долг по воде",
      reason: "2 дня ниже 65% цели — обезвоживание маскируется под голод",
      action: "+250 мл к цели сегодня, стакан перед едой",
    });
  }

  const lowSleepDays = past.filter(
    (l) => (l.sleepMinutes ?? 999) < sleepTargetMin * 0.75,
  ).length;
  if (lowSleepDays >= 2) {
    items.push({
      domain: "sleep",
      active: true,
      totalDebt: sleepTargetMin - (past[0]?.sleepMinutes ?? 0),
      daysRemaining: 2,
      dailyCalorieAdjust: 0,
      extraWalkMin: 0,
      extraWaterMl: 0,
      extraSleepMin: 30,
      extraProteinG: 0,
      title: "Недосып",
      reason: "Сон <75% цели 2 дня — кортизол ↑, вес и тяга к сладкому",
      action: "Сегодня без интервалов, лечь на 30 мин раньше",
    });
  }

  const noMoveDays = past.filter((l) => {
    const w = l.workouts?.some((x) => x.completed) ?? false;
    const walks = (l.postMealWalks ?? 0) > 0;
    return !w && !walks;
  }).length;
  if (noMoveDays >= 2 && calOver < 120) {
    items.push({
      domain: "movement",
      active: true,
      totalDebt: noMoveDays,
      daysRemaining: 2,
      dailyCalorieAdjust: 0,
      extraWalkMin: 15,
      extraWaterMl: 0,
      extraSleepMin: 0,
      extraProteinG: 0,
      title: "Мало движения",
      reason: `${noMoveDays} дн. без тренировки и прогулок — метаболизм и настроение проседают`,
      action: "+15 мин ходьбы сегодня (после обеда зачтётся)",
    });
  }

  const lowProteinDays = past.filter(
    (l) => (l.proteinG ?? 0) < proteinTarget * 0.75,
  ).length;
  if (lowProteinDays >= 2) {
    items.push({
      domain: "protein",
      active: true,
      totalDebt: proteinTarget * 2 - past.reduce((s, l) => s + (l.proteinG ?? 0), 0),
      daysRemaining: 2,
      dailyCalorieAdjust: 0,
      extraWalkMin: 0,
      extraWaterMl: 0,
      extraSleepMin: 0,
      extraProteinG: 15,
      title: "Долг по белку",
      reason: "2 дня <75% белка — голод и тяга к сладкому при ИР/СПКЯ",
      action: "+15 г белка сегодня: творог, яйца, рыба",
    });
  }

  const netCalorieAdjust = items.reduce((s, i) => s + i.dailyCalorieAdjust, 0);
  const netExtraWalkMin = items.reduce((s, i) => s + i.extraWalkMin, 0);
  const netExtraWaterMl = items.reduce((s, i) => s + i.extraWaterMl, 0);
  const netExtraProteinG = items.reduce((s, i) => s + i.extraProteinG, 0);

  let headline = "Баланс в норме — компенсация не нужна";
  if (items.length === 1) headline = items[0].title;
  if (items.length > 1) headline = `${items.length} зоны компенсации на сегодня`;

  return {
    items,
    netCalorieAdjust,
    netExtraWalkMin,
    netExtraWaterMl,
    netExtraProteinG,
    headline,
  };
}
