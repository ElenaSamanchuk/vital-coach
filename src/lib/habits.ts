import type { HealthConditions } from "./types";

export interface HabitDefinition {
  key: string;
  label: string;
  description: string;
  category: "nutrition" | "movement" | "sleep" | "stress" | "medication" | "tracking";
  priority: "must" | "should";
  condition?: (c: HealthConditions) => boolean;
}

export const CORE_HABITS: HabitDefinition[] = [
  {
    key: "protein_each_meal",
    label: "Белок в каждый приём пищи",
    description: "30–40 г белка за приём — сохранение мышц в дефиците",
    category: "nutrition",
    priority: "must",
  },
  {
    key: "veggies_500g",
    label: "Овощи 500+ г",
    description: "Объём без лишних калорий, клетчатка для ИР",
    category: "nutrition",
    priority: "must",
    condition: (c) => c.insulinResistance,
  },
  {
    key: "post_meal_walk",
    label: "10 мин ходьбы после еды",
    description: "Снижает глюкозу при инсулинорезистентности",
    category: "movement",
    priority: "must",
    condition: (c) => c.insulinResistance,
  },
  {
    key: "carbs_before_evening",
    label: "Крахмал до вечера",
    description: "Углеводы в основном на завтрак/обед",
    category: "nutrition",
    priority: "should",
    condition: (c) => c.insulinResistance || c.pcosSuspected,
  },
  {
    key: "thyroid_med_fasting",
    label: "Тироксин натощак",
    description: "За 30–60 мин до еды, не с кофе и кальцием",
    category: "medication",
    priority: "must",
    condition: (c) => c.hypothyroidism,
  },
  {
    key: "water_target",
    label: "Вода по цели",
    description: "2–2,5 л — метаболизм и отёки",
    category: "nutrition",
    priority: "must",
  },
  {
    key: "sleep_7h",
    label: "Сон 7–8 часов",
    description: "Кортизол и голодные гормоны при недосыпе",
    category: "sleep",
    priority: "must",
    condition: (c) => c.cortisolIssues,
  },
  {
    key: "no_intense_cardio_daily",
    label: "Без ежедневного жёсткого кардио",
    description: "При кортизоловой нагрузке — чередовать с силой и отдыхом",
    category: "movement",
    priority: "should",
    condition: (c) => c.cortisolIssues,
  },
  {
    key: "strength_2x",
    label: "Силовая 2×/нед",
    description: "Сохранить мышцы и форму «песочных часов»",
    category: "movement",
    priority: "must",
  },
  {
    key: "fish_omega",
    label: "Рыба / омега-3",
    description: "3–4 раза в неделю — D, B12, омега",
    category: "nutrition",
    priority: "should",
    condition: (c) => c.vitaminDDeficiency || c.b12Deficiency,
  },
  {
    key: "weigh_cycle_day",
    label: "Вес в один день цикла",
    description: "Дни 5–7 после месячных — честная динамика",
    category: "tracking",
    priority: "should",
    condition: (c) => c.hormoneIssues,
  },
  {
    key: "stress_downshift",
    label: "10 мин успокоения",
    description: "Дыхание, йога, прогулка — снижение кортизола",
    category: "stress",
    priority: "should",
    condition: (c) => c.cortisolIssues,
  },
  {
    key: "log_everything",
    label: "Заполнить дневник",
    description: "Вес, еда, вода, сон, самочувствие",
    category: "tracking",
    priority: "must",
  },
];

export function getActiveHabits(conditions: HealthConditions): HabitDefinition[] {
  return CORE_HABITS.filter(
    (h) => !h.condition || h.condition(conditions),
  );
}
