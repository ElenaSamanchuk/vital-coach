/**
 * Активность как досуг: вело, бассейн, йога, прогулки.
 * Учёт цикла, кортизола, настроения, восстановления после операции.
 */
import type { CyclePhase, HealthConditions } from "./types";

export interface WorkoutOption {
  id: string;
  type: string;
  title: string;
  durationMin: number;
  intensity: "low" | "moderate" | "high";
  moodBoost: string;
  leisureNote: string;
  caloriesNote: string;
  /** Расчётный расход ккал (MET × вес × время) */
  caloriesBurned?: number;
  tags: string[];
  impact?: string;
}

const TYPE_MET: Record<string, number> = {
  walk: 3.5,
  bike: 6,
  pool: 6,
  strength: 5.5,
  yoga: 2.8,
  dance: 5.5,
  sup: 5,
  rest: 2.5,
};

const INTENSITY_MULT: Record<WorkoutOption["intensity"], number> = {
  low: 0.85,
  moderate: 1,
  high: 1.2,
};

/** MET × вес (кг) × часы — ориентир расхода энергии */
export function estimateWorkoutCalories(
  weightKg: number,
  durationMin: number,
  intensity: WorkoutOption["intensity"],
  type?: string,
): number {
  const met = (type && TYPE_MET[type]) || 4.5;
  const hours = durationMin / 60;
  return Math.round(met * INTENSITY_MULT[intensity] * weightKg * hours);
}

export function enrichWorkoutCalories(w: WorkoutOption, weightKg: number): WorkoutOption {
  const caloriesBurned = estimateWorkoutCalories(
    weightKg,
    w.durationMin,
    w.intensity,
    w.type,
  );
  return {
    ...w,
    caloriesBurned,
    caloriesNote: `~${caloriesBurned} ккал · ${w.caloriesNote}`,
  };
}

export interface WorkoutContext {
  dayOfWeek: number;
  phase: CyclePhase | null;
  conditions: HealthConditions;
  energy: number;
  stress: number;
  mood: number;
  recentWorkoutCount: number;
}

export const WORKOUT_OPTIONS: Record<string, WorkoutOption[]> = {
  cardio: [
    {
      id: "bike-zone2",
      type: "bike",
      title: "Велосипед — прогулка по парку",
      durationMin: 50,
      intensity: "moderate",
      moodBoost: "Свежий воздух + ритм снижает тревогу",
      leisureNote: "Подкаст или музыка — это досуг, не «наказание»",
      caloriesNote: "Жиросжигание в зоне 2",
      tags: ["outdoor", "cardio", "cortisol-safe"],
    },
    {
      id: "pool-easy",
      type: "pool",
      title: "Бассейн — спокойное плавание",
      durationMin: 45,
      intensity: "moderate",
      moodBoost: "Вода снимает напряжение с суставов и головы",
      leisureNote: "Идеально после офиса; без ударной нагрузки",
      caloriesNote: "Спина и осанка в бонусе",
      tags: ["low-impact", "recovery", "post-surgery"],
    },
    {
      id: "walk-nature",
      type: "walk",
      title: "Прогулка 60 мин — парк/набережная",
      durationMin: 60,
      intensity: "low",
      moodBoost: "Природа ↑ настроение (исследования ecotherapy)",
      leisureNote: "Можно с подругой — социальный досуг",
      caloriesNote: "При высоком стрессе лучше интервалов",
      tags: ["leisure", "cortisol-safe", "minimum-day"],
    },
    {
      id: "ebike-ride",
      type: "bike",
      title: "Электровелосипед — прогулка 45 мин",
      durationMin: 45,
      intensity: "moderate",
      moodBoost: "Ветер и движение без усталости",
      leisureNote: "Дача, парк, набережная — досуг с пользой",
      caloriesNote: "Больше дистанция при том же усилии",
      tags: ["outdoor", "leisure", "cortisol-safe"],
    },
    {
      id: "stairs-walk",
      type: "walk",
      title: "Ходьба + лестницы 25 мин",
      durationMin: 25,
      intensity: "moderate",
      moodBoost: "Быстрый подъём эндорфинов",
      leisureNote: "Между делами — не нужен зал",
      caloriesNote: "ИР: после обеда вместо сладкого",
      tags: ["quick", "ir-benefit"],
    },
  ],
  strength: [
    {
      id: "strength-full",
      type: "strength",
      title: "Силовая: ноги + спина + кор",
      durationMin: 40,
      intensity: "moderate",
      moodBoost: "Сила ↑ уверенность в теле",
      leisureNote: "2×/нед — форма «песочных часов»",
      caloriesNote: "Мышцы = выше расход в покое",
      tags: ["muscle", "metabolism"],
    },
    {
      id: "strength-home",
      type: "strength",
      title: "Дома: резинки + присед + мост",
      durationMin: 30,
      intensity: "moderate",
      moodBoost: "20 мин достаточно для эффекта",
      leisureNote: "YouTube-тренировка под настроение",
      caloriesNote: "Минимум при нехватке времени",
      tags: ["home", "quick"],
    },
    {
      id: "aqua-strength",
      type: "pool",
      title: "Аквафитнес / аква-силовая",
      durationMin: 45,
      intensity: "moderate",
      moodBoost: "Весело + без нагрузки на живот/спину",
      leisureNote: "Связь с прошлым опытом аквафитнеса",
      caloriesNote: "После лапароскопии — комфортно",
      tags: ["low-impact", "post-surgery", "leisure"],
    },
    {
      id: "dance-cardio",
      type: "dance",
      title: "Танцы / зумба 30 мин",
      durationMin: 30,
      intensity: "moderate",
      moodBoost: "Радость движения — не «тренировка»",
      leisureNote: "YouTube или студия — как досуг",
      caloriesNote: "Сжигает без ощущения наказания",
      tags: ["leisure", "home", "quick"],
    },
    {
      id: "sup-paddle",
      type: "sup",
      title: "Сапборд 40 мин",
      durationMin: 40,
      intensity: "moderate",
      moodBoost: "Вода + баланс = медитация в движении",
      leisureNote: "Лето/дача — идеальный досуг",
      caloriesNote: "Кор и спина без ударной нагрузки",
      tags: ["outdoor", "leisure", "low-impact"],
    },
  ],
  mindbody: [
    {
      id: "yoga-flow",
      type: "yoga",
      title: "Йога 40 мин — восстановление",
      durationMin: 40,
      intensity: "low",
      moodBoost: "Парасимпатика: дыхание + растяжка",
      leisureNote: "Замена жёсткому кардио при стрессе",
      caloriesNote: "Не жиросжигание, но кортизол вниз",
      tags: ["cortisol-safe", "recovery", "minimum-day"],
    },
    {
      id: "pilates",
      type: "yoga",
      title: "Пилатес — кор и осанка",
      durationMin: 35,
      intensity: "low",
      moodBoost: "Контроль тела успокаивает",
      leisureNote: "Привычный формат из прошлого",
      caloriesNote: "Талия и осанка",
      tags: ["core", "posture"],
    },
    {
      id: "bike-intervals-light",
      type: "bike",
      title: "Вело: лёгкие интервалы",
      durationMin: 35,
      intensity: "high",
      moodBoost: "Эндорфины после — но не при стрессе 8+",
      leisureNote: "Только при энергии 7+",
      caloriesNote: "ИР: улучшает чувствительность к инсулину",
      tags: ["hiit", "ir-benefit"],
    },
    {
      id: "breath-walk",
      type: "walk",
      title: "Прогулка + дыхание 30 мин",
      durationMin: 30,
      intensity: "low",
      moodBoost: "Парасимпатика без коврика",
      leisureNote: "Парк без телефона — мини-ретрит",
      caloriesNote: "Стресс ↓ важнее калорий",
      tags: ["cortisol-safe", "minimum-day", "recovery"],
    },
  ],
  rest: [
    {
      id: "rest-walk",
      type: "rest",
      title: "День отдыха + лёгкая прогулка 30 мин",
      durationMin: 30,
      intensity: "low",
      moodBoost: "Восстановление = прогресс",
      leisureNote: "Книга, ванна, сон — тоже план",
      caloriesNote: "Перетрен ↑ кортизол и вес",
      tags: ["recovery", "cortisol-safe"],
    },
    {
      id: "stretch",
      type: "yoga",
      title: "Растяжка + дыхание 20 мин",
      durationMin: 20,
      intensity: "low",
      moodBoost: "Минимальный день — зачтён",
      leisureNote: "Лучше ноль не надрываться",
      caloriesNote: "При менструации — приоритет",
      tags: ["minimum-day", "menstrual"],
    },
  ],
};

export function getWorkoutOptions(ctx: WorkoutContext): {
  recommended: WorkoutOption;
  alternatives: WorkoutOption[];
  category: string;
  rationale: string;
} {
  const { dayOfWeek, phase, conditions, energy, stress, mood, recentWorkoutCount } = ctx;

  let category = "cardio";
  let rationale = "Базовый план: чередование кардио и силы";

  if (stress >= 7 || mood <= 4 || energy <= 4) {
    category = "mindbody";
    rationale = "Высокий стресс или низкая энергия — приоритет восстановлению, не жёсткому кардио";
  } else if (phase === "menstrual") {
    category = stress >= 6 ? "mindbody" : "cardio";
    rationale = "Менструальная фаза: мягкая нагрузка, бассейн/прогулка";
  } else if (dayOfWeek === 3 || dayOfWeek === 6) {
    category = "strength";
    rationale = "День силовой — сохранить мышцы в дефиците";
  } else if (dayOfWeek === 0 || recentWorkoutCount >= 5) {
    category = "rest";
    rationale = "Отдых после 5+ тренировок за неделю — кортизол и вес";
  } else if (phase === "ovulation" && energy >= 7 && stress < 6) {
    category = "mindbody";
    rationale = "Овуляция + энергия: можно интервалы (вело) или силу";
  }

  if (conditions.surgeryRecovery && category === "mindbody") {
    rationale += " · После операции — без максимума";
  }
  if (conditions.cortisolIssues && category === "mindbody" && stress < 5) {
    category = "cardio";
    rationale = "Кортизол под контролем — умеренное кардио ок";
  }

  const pool = WORKOUT_OPTIONS[category] ?? WORKOUT_OPTIONS.cardio;
  let filtered = [...pool];

  if (conditions.surgeryRecovery) {
    filtered = filtered.filter((o) => o.tags.includes("low-impact") || o.tags.includes("post-surgery") || o.tags.includes("recovery") || o.intensity !== "high");
  }
  if (stress >= 8) {
    filtered = filtered.filter((o) => o.intensity !== "high");
  }
  if (energy < 5) {
    filtered = filtered.filter((o) => o.tags.includes("minimum-day") || o.intensity === "low");
  }

  if (filtered.length === 0) filtered = WORKOUT_OPTIONS.rest;

  const recommended = filtered[0];
  const alternatives = [
    ...filtered.slice(1),
    ...WORKOUT_OPTIONS.rest.filter((r) => r.id !== recommended.id),
    ...WORKOUT_OPTIONS.cardio.filter((r) => r.id !== recommended.id),
  ].slice(0, 5);

  return { recommended, alternatives, category, rationale };
}

export function getWeeklyMovementPlan(conditions: HealthConditions): string[] {
  return [
    "Пн: бассейн — досуг + спина",
    "Вт: велосипед зона 2 — парк, подкаст",
    "Ср: силовая — мышцы и форма",
    "Чт: бассейн или аквафитнес",
    "Пт: вело лёгкие интервалы (если стресс <6) или йога",
    "Сб: силовая или длинная прогулка",
    "Вс: отдых — прогулка 30 мин опционально",
    conditions.cortisolIssues ? "⚠ При стрессе 7+: замени интервалы на йогу/прогулку" : "",
  ].filter(Boolean);
}
