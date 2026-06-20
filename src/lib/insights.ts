/**
 * Динамические корректировки коуча на основе трендов и анализов.
 */
import type { LabResult, Profile } from "@prisma/client";
import type { WeeklyInsights, HealthConditions } from "./types";
import { analyzeWeek } from "./analytics";

export interface DynamicAdjustments {
  calorieAdjustment: number;
  extraWarnings: string[];
  extraFocus: string[];
  workoutModifier: "normal" | "lighter" | "rest";
  proteinBoost: boolean;
  psychologyNote: string;
  celebrateWins: string[];
}

export function buildDynamicAdjustments(
  insights: WeeklyInsights,
  labs: LabResult[],
  profile: Profile,
  recentEnergy: number[],
  recentStress: number[],
): DynamicAdjustments {
  const conditions: HealthConditions = {
    insulinResistance: profile.insulinResistance,
    hypothyroidism: profile.hypothyroidism,
    cortisolIssues: profile.cortisolIssues,
    vitaminDDeficiency: profile.vitaminDDeficiency,
    b12Deficiency: profile.b12Deficiency,
    hormoneIssues: profile.hormoneIssues,
    pcosSuspected: profile.pcosSuspected,
    endometriosis: profile.endometriosis,
    vitaminAbsorption: profile.vitaminAbsorption,
    surgeryRecovery: profile.surgeryRecovery,
  };

  let calorieAdjustment = 0;
  const extraWarnings: string[] = [];
  const extraFocus: string[] = [];
  let workoutModifier: DynamicAdjustments["workoutModifier"] = "normal";
  let proteinBoost = false;
  let psychologyNote = "";

  for (const s of insights.slipping) {
    switch (s.key) {
      case "protein":
        proteinBoost = true;
        extraFocus.push("Белок +30 г сегодня: яйца, творог, рыба в каждый приём");
        break;
      case "water":
        extraFocus.push("Стакан воды перед каждым приёмом пищи");
        break;
      case "sleep":
        workoutModifier = "lighter";
        extraWarnings.push("Недосып — сегодня без интервалов");
        break;
      case "stress":
        workoutModifier = "lighter";
        psychologyNote = "Стресс неделю выше нормы — не наказывай себя дефицитом";
        break;
      case "walks":
        if (conditions.insulinResistance) {
          extraFocus.push("Обязательно: 10 мин ходьбы после обеда — главный рычаг при ИР");
        }
        break;
      case "calories":
        extraWarnings.push("Калории выше цели 3 недели — убери один перекус или ½ порции крахмала");
        break;
      case "workouts":
        extraFocus.push("Сегодня приоритет: хотя бы 30 мин движения (прогулка зачтётся)");
        break;
      case "weight":
        if (conditions.hormoneIssues) {
          psychologyNote = "Вес вырос — проверь фазу цикла и соль, не режь калории резко";
        }
        break;
    }
  }

  const avgStress = recentStress.length
    ? recentStress.reduce((a, b) => a + b, 0) / recentStress.length
    : 5;
  const avgEnergy = recentEnergy.length
    ? recentEnergy.reduce((a, b) => a + b, 0) / recentEnergy.length
    : 6;

  if (avgStress >= 7) workoutModifier = "lighter";
  if (avgEnergy <= 4) workoutModifier = "lighter";
  if (conditions.cortisolIssues && avgStress >= 8) {
    calorieAdjustment += 50;
    extraWarnings.push("Кортизол: не углубляй дефицит — белок и сон важнее +ккал");
  }

  for (const lab of labs) {
    if (lab.marker === "TSH" && lab.refMax && lab.value > lab.refMax) {
      extraWarnings.push(`ТТГ ${lab.value} выше нормы — щитовидка может тормозить вес. К эндокринологу.`);
      if (profile.hypothyroidism) {
        calorieAdjustment += 50;
        extraFocus.push("Повышенный ТТГ: не снижай калории ниже 1400 ккал без врача (ATA)");
      }
    }
    if (lab.marker === "TSH" && lab.refMin && lab.value < lab.refMin && profile.hypothyroidism) {
      extraWarnings.push("ТТГ ниже нормы — обсуди дозу тироксина с эндокринологом");
    }
    if (lab.marker === "fasting_insulin" && lab.refMax && lab.value > lab.refMax) {
      extraFocus.push("Инсулин высокий — порядок еды и ходьба после приёма критичны");
    }
    if (lab.marker === "homa_ir" && lab.refMax && lab.value > lab.refMax) {
      extraFocus.push(`HOMA-IR ${lab.value.toFixed(1)} — крахмал только днём, клетчатка 30+ г`);
    }
    if (lab.marker === "vitamin_d" && lab.refMin && lab.value < lab.refMin) {
      extraFocus.push("D низкий — рыба 4×/нед, обсуди дозу с врачом");
    }
    if (lab.marker === "ferritin" && lab.refMin && lab.value < lab.refMin) {
      extraWarnings.push("Ферритин низкий — усталость ≠ лень. Печень/говядина + пересдача");
    }
    if (lab.marker === "b12" && lab.refMin && lab.value < lab.refMin) {
      extraFocus.push("B12 низкий — яйца ежедневно, печень 1×/нед");
    }
  }

  const celebrateWins = [...insights.wins];
  if (insights.weightChange != null && insights.weightChange < -0.8) {
    celebrateWins.push("Отличная динамика веса — не ускоряй, сохраняй белок");
  }
  if (insights.habitCompletionRate >= 0.7) {
    celebrateWins.push(`Привычки ${Math.round(insights.habitCompletionRate * 100)}% — система работает`);
  }

  return {
    calorieAdjustment,
    extraWarnings,
    extraFocus,
    workoutModifier,
    proteinBoost,
    psychologyNote,
    celebrateWins,
  };
}

export function computeStreak(loggedDates: Date[]): number {
  return computeForgivingStreak(loggedDates).streak;
}

/** 1 пропуск за 7 дней не сбрасывает серию (паттерн Steady) */
export function computeForgivingStreak(loggedDates: Date[]): {
  streak: number;
  freezeUsed: boolean;
} {
  if (loggedDates.length === 0) return { streak: 0, freezeUsed: false };

  const dayKeys = new Set(
    loggedDates.map((d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x.getTime();
    }),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let freezeUsed = false;
  let gapsUsed = 0;

  for (let i = 0; i < 90; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.getTime();

    if (dayKeys.has(key)) {
      streak++;
    } else if (gapsUsed < 1 && i > 0) {
      gapsUsed++;
      freezeUsed = true;
      streak++;
    } else {
      break;
    }
  }

  return { streak, freezeUsed };
}

export { analyzeWeek };
