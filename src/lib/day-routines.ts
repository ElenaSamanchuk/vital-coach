/**
 * Ритмы дня: утро · обед (переключение с работы) · вечер.
 */

export type RoutinePhase = "morning" | "midday" | "evening";

export interface RoutineStep {
  id: string;
  label: string;
  hint: string;
  minutes?: number;
}

export interface RoutineContext {
  hypothyroidism: boolean;
  insulinResistance: boolean;
  endometriosis: boolean;
  cortisolIssues: boolean;
  softDay: boolean;
  stress: number;
  hour: number;
}

export function activeRoutinePhase(hour: number): RoutinePhase {
  if (hour < 11) return "morning";
  if (hour < 17) return "midday";
  return "evening";
}

export function getRoutineSteps(phase: RoutinePhase, ctx: RoutineContext): RoutineStep[] {
  if (phase === "morning") {
    const steps: RoutineStep[] = [
      { id: "water", label: "Стакан воды", hint: "До кофе — щитовидка и ИР", minutes: 1 },
    ];
    if (ctx.hypothyroidism) {
      steps.push({
        id: "thyroid",
        label: "Тироксин натощак",
        hint: "30 мин до еды, без кальция",
        minutes: 1,
      });
    }
    steps.push(
      { id: "sunlight", label: "Свет у окна 5 мин", hint: "Циркадные ритмы, энергия", minutes: 5 },
      {
        id: "stretch",
        label: ctx.softDay ? "Дыхание 3 мин" : "Растяжка / дыхание",
        hint: "Шея, таз — без боли",
        minutes: ctx.softDay ? 3 : 5,
      },
    );
    return steps;
  }

  if (phase === "midday") {
    const steps: RoutineStep[] = [
      {
        id: "screen_break",
        label: "Отойти от экрана",
        hint: "Переключение с работы — глаза и мозг",
        minutes: 2,
      },
      {
        id: "lunch_mindful",
        label: "Обед без телефона",
        hint: "Осознанный приём — меньше переедания",
        minutes: 15,
      },
    ];
    if (ctx.insulinResistance || ctx.cortisolIssues) {
      steps.push({
        id: "walk_10",
        label: "10 мин ходьбы после еды",
        hint: "ИР: главный ритуал дня",
        minutes: 10,
      });
    }
    steps.push(
      {
        id: "reset_breath",
        label: "3 вдоха + вода",
        hint: "Сброс стресса перед второй половиной дня",
        minutes: 2,
      },
      {
        id: "neck_stretch",
        label: "Шея и плечи",
        hint: "Сидячая работа — каждый обед",
        minutes: 3,
      },
    );
    if (ctx.endometriosis) {
      steps.push({
        id: "pelvis_rest",
        label: "Поза покоя для таза",
        hint: "Колени к груди или сторона — без боли",
        minutes: 5,
      });
    }
    return steps;
  }

  // evening
  const steps: RoutineStep[] = [
    { id: "skincare", label: "Уход / маска", hint: "Ритуал закрытия дня", minutes: 10 },
    { id: "tea", label: "Тёплый напиток без кофе", hint: "Ромашка, какао, травы", minutes: 5 },
  ];
  if (ctx.stress >= 6 || ctx.cortisolIssues) {
    steps.push({
      id: "breath_evening",
      label: "Дыхание 4 мин",
      hint: "Перед сном — кортизол вниз",
      minutes: 4,
    });
  }
  steps.push({
    id: "sleep",
    label: "Экран off → сон",
    hint: "За 1 ч до сна — мелатонин",
    minutes: 1,
  });
  return steps;
}

export const PAIN_ZONES = [
  { id: "abdomen", label: "Живот" },
  { id: "pelvis", label: "Таз" },
  { id: "back", label: "Спина" },
  { id: "head", label: "Голова" },
  { id: "joints", label: "Суставы" },
] as const;

export function painAdvice(level: number, endometriosis: boolean): string {
  if (level === 0) return "Без боли — можно плановую нагрузку.";
  if (level <= 3) return "Лёгкий дискомфорт — мягкое движение, не HIIT.";
  if (level <= 6) {
    return endometriosis
      ? "Умеренная боль — тепло, растяжка, без пресса; при усилении — врач."
      : "Умеренная боль — снизь интенсивность, прогулка вместо зала.";
  }
  return "Сильная боль — отдых, мягкий день; при регулярности — к врачу.";
}
