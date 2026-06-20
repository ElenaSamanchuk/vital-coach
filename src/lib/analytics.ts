import type { DailyLog, HabitCheck, Profile, Workout } from "@prisma/client";
import type { SlippingArea, WeeklyInsights } from "./types";

type DailyLogWithRelations = DailyLog & {
  habits?: HabitCheck[];
  workouts?: Workout[];
};

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function trend(nums: number[]): "up" | "down" | "stable" {
  if (nums.length < 4) return "stable";
  const first = avg(nums.slice(0, Math.floor(nums.length / 2))) ?? 0;
  const second = avg(nums.slice(Math.floor(nums.length / 2))) ?? 0;
  const diff = second - first;
  if (Math.abs(diff) < 0.05 * (first || 1)) return "stable";
  return diff > 0 ? "up" : "down";
}

export function analyzeWeek(logs: DailyLogWithRelations[], profile: Profile): WeeklyInsights {
  const sorted = [...logs].sort((a, b) => a.date.getTime() - b.date.getTime());
  const weights = sorted.map((l) => l.weightKg).filter((w): w is number => w != null);
  const calories = sorted.map((l) => l.calories).filter((c): c is number => c != null);
  const proteins = sorted.map((l) => l.proteinG).filter((p): p is number => p != null);
  const waters = sorted.map((l) => l.waterMl).filter((w): w is number => w != null);
  const sleeps = sorted.map((l) => l.sleepMinutes).filter((s): s is number => s != null);
  const moods = sorted.map((l) => l.mood).filter((m): m is number => m != null);
  const energies = sorted.map((l) => l.energy).filter((e): e is number => e != null);
  const stresses = sorted.map((l) => l.stress).filter((s): s is number => s != null);

  const avgWeight = avg(weights);
  const weightChange =
    weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;

  const workoutCount = sorted.reduce(
    (s, l) => s + (l.workouts?.filter((w) => w.completed).length ?? 0),
    0,
  );

  const habitTotal = sorted.reduce((s, l) => s + (l.habits?.length ?? 0), 0);
  const habitDone = sorted.reduce(
    (s, l) => s + (l.habits?.filter((h) => h.completed).length ?? 0),
    0,
  );
  const habitCompletionRate = habitTotal > 0 ? habitDone / habitTotal : 0;

  const slipping: SlippingArea[] = [];
  const wins: string[] = [];

  const avgCal = avg(calories);
  if (avgCal != null && avgCal > profile.calorieTarget * 1.1) {
    slipping.push({
      key: "calories",
      label: "Калории",
      score: Math.min(100, ((avgCal - profile.calorieTarget) / profile.calorieTarget) * 100),
      trend: trend(calories),
      message: `Среднее ${Math.round(avgCal)} ккал при цели ${profile.calorieTarget}`,
      action: "Урежь крахмал на ½ порции или убери перекус",
    });
  } else if (avgCal != null && avgCal <= profile.calorieTarget) {
    wins.push(`Калории в цели (~${Math.round(avgCal)} ккал)`);
  }

  const avgProt = avg(proteins);
  if (avgProt != null && avgProt < profile.proteinTargetG * 0.85) {
    slipping.push({
      key: "protein",
      label: "Белок",
      score: Math.min(100, ((profile.proteinTargetG - avgProt) / profile.proteinTargetG) * 100),
      trend: trend(proteins),
      message: `Среднее ${Math.round(avgProt)} г при цели ${profile.proteinTargetG}`,
      action: "Добавь яйца/творог/рыбу в каждый приём",
    });
  } else if (avgProt != null) {
    wins.push(`Белок на уровне (${Math.round(avgProt)} г)`);
  }

  const avgWat = avg(waters);
  if (avgWat != null && avgWat < profile.waterTargetMl * 0.7) {
    slipping.push({
      key: "water",
      label: "Вода",
      score: Math.min(100, ((profile.waterTargetMl - avgWat) / profile.waterTargetMl) * 100),
      trend: trend(waters),
      message: `Среднее ${Math.round(avgWat)} мл при цели ${profile.waterTargetMl}`,
      action: "Стакан воды после каждого приёма пищи",
    });
  }

  const avgMood = avg(moods);
  const avgStress = avg(stresses);
  const avgEnergy = avg(energies);

  const avgSlp = avg(sleeps);
  if (avgSlp != null && avgSlp < profile.sleepTargetMin * 0.85) {
    slipping.push({
      key: "sleep",
      label: "Сон",
      score: Math.min(100, ((profile.sleepTargetMin - avgSlp) / profile.sleepTargetMin) * 100),
      trend: trend(sleeps),
      message: `Среднее ${(avgSlp / 60).toFixed(1)} ч при цели ${profile.sleepTargetMin / 60} ч`,
      action: "Ложиться в одно время; экран off за 1 ч",
    });
  } else if (avgSlp != null) {
    wins.push(`Сон достаточный (${(avgSlp / 60).toFixed(1)} ч)`);
  }

  if (profile.cortisolIssues && avgStress != null && avgStress >= 7) {
    slipping.push({
      key: "stress",
      label: "Стресс / кортизол",
      score: avgStress * 10,
      trend: "stable",
      message: `Средний стресс ${avgStress}/10`,
      action: "Меньше HIIT, больше ходьбы и 10 мин дыхания",
    });
  }

  const walkDays = sorted.filter((l) => l.postMealWalks >= 2).length;
  if (profile.insulinResistance && walkDays < 4) {
    slipping.push({
      key: "walks",
      label: "Ходьба после еды",
      score: ((7 - walkDays) / 7) * 100,
      trend: "stable",
      message: `Только ${walkDays} дней с 2+ прогулками`,
      action: "10 мин после обеда — главный приём для ИР",
    });
  }

  if (workoutCount >= 4) {
    wins.push(`${workoutCount} тренировок за неделю`);
  } else if (workoutCount < 3) {
    slipping.push({
      key: "workouts",
      label: "Тренировки",
      score: ((4 - workoutCount) / 4) * 100,
      trend: "stable",
      message: `Только ${workoutCount} тренировок`,
      action: "Минимум: 2 силовые + 2 кардио (вело/бассейн)",
    });
  }

  if (weightChange != null && weightChange < -0.3) {
    wins.push(`Вес −${Math.abs(weightChange).toFixed(1)} кг за период`);
  } else if (weightChange != null && weightChange > 0.5 && profile.hormoneIssues) {
    slipping.push({
      key: "weight",
      label: "Вес",
      score: 50,
      trend: "up",
      message: `+${weightChange.toFixed(1)} кг — проверь фазу цикла и соль`,
      action: "Взвешивай только дни 5–7 цикла",
    });
  }

  slipping.sort((a, b) => b.score - a.score);

  if (avgMood != null && avgMood <= 5) {
    slipping.push({
      key: "mood",
      label: "Настроение",
      score: (6 - avgMood) * 20,
      trend: trend(moods),
      message: `Среднее настроение ${avgMood.toFixed(1)}/10`,
      action: "Мягкая активность, сон, не ужесточать дефицит",
    });
  } else if (avgMood != null && avgMood >= 7) {
    wins.push(`Настроение стабильное (${avgMood.toFixed(1)}/10)`);
  }

  if (avgEnergy != null && avgEnergy <= 4.5) {
    slipping.push({
      key: "energy",
      label: "Энергия",
      score: (5.5 - avgEnergy) * 18,
      trend: trend(energies),
      message: `Средняя энергия ${avgEnergy.toFixed(1)}/10`,
      action: "Сон + белок + свет утром; снизить интенсивность тренировок",
    });
  }

  return {
    avgWeight,
    weightChange,
    avgCalories: avgCal,
    avgProtein: avgProt,
    avgWater: avgWat,
    avgSleepHours: avgSlp != null ? avgSlp / 60 : null,
    avgMood,
    avgStress,
    avgEnergy,
    workoutCount,
    habitCompletionRate,
    slipping,
    wins,
  };
}

export const LAB_MARKERS = [
  { marker: "TSH", unit: "мМЕ/л", refMin: 0.4, refMax: 4.0, label: "Щитовидка (ТТГ)" },
  { marker: "fT4", unit: "пмоль/л", refMin: 10, refMax: 22, label: "свТ4" },
  { marker: "fasting_glucose", unit: "ммоль/л", refMin: 3.9, refMax: 5.5, label: "Глюкоза натощак" },
  { marker: "fasting_insulin", unit: "мкЕд/мл", refMin: 2, refMax: 12, label: "Инсулин натощак" },
  { marker: "homa_ir", unit: "", refMin: 0, refMax: 2.5, label: "HOMA-IR" },
  { marker: "hba1c", unit: "%", refMin: 4, refMax: 5.6, label: "HbA1c" },
  { marker: "vitamin_d", unit: "нг/мл", refMin: 30, refMax: 60, label: "Витамин D" },
  { marker: "b12", unit: "пг/мл", refMin: 300, refMax: 900, label: "Витамин B12" },
  { marker: "ferritin", unit: "нг/мл", refMin: 30, refMax: 150, label: "Ферритин" },
  { marker: "cortisol_am", unit: "нмоль/л", refMin: 140, refMax: 690, label: "Кортизол утренний" },
  { marker: "estradiol", unit: "пмоль/л", refMin: 30, refMax: 200, label: "Эстрадиол (день 3)" },
  { marker: "progesterone", unit: "нмоль/л", refMin: 5, refMax: 60, label: "Прогестерон (день 21)" },
  { marker: "testosterone", unit: "нмоль/л", refMin: 0.3, refMax: 2.5, label: "Тестостерон" },
] as const;
