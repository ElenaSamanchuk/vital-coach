import type { LifePulseDay } from "./life-pulse";
import { GENERIC_LEISURE_POOL } from "./generic-day-catalogs";

const SOCIAL_IDS = new Set([
  "social",
  "parents",
  "cafe",
  "anticafe",
  "boardgames",
  "concert",
  "volunteer",
  "friends",
]);

export interface DiversitySphere {
  id: string;
  label: string;
  emoji: string;
  active: boolean;
}

export function computeDayDiversity(input: {
  lifePulse: LifePulseDay;
  leisureIds: string[];
  workoutIds: string[];
  steps?: number;
}): { spheres: DiversitySphere[]; score: number; hint: string } {
  const socialFromLeisure = input.leisureIds.some((id) => SOCIAL_IDS.has(id));
  const leisureOther = input.leisureIds.some((id) => !SOCIAL_IDS.has(id));
  const socialFromPulse = false;

  const spheres: DiversitySphere[] = [
    {
      id: "work",
      label: "Работа",
      emoji: "💼",
      active: input.lifePulse.work.items.length > 0,
    },
    {
      id: "home",
      label: "Быт",
      emoji: "🏠",
      active: input.lifePulse.home.items.length > 0,
    },
    {
      id: "care",
      label: "Уход",
      emoji: "💆",
      active: input.lifePulse.care.items.length > 0,
    },
    {
      id: "social",
      label: "Общение",
      emoji: "👥",
      active: socialFromLeisure || socialFromPulse,
    },
    {
      id: "leisure",
      label: "Досуг",
      emoji: "✨",
      active: leisureOther,
    },
    {
      id: "move",
      label: "Движение",
      emoji: "🏃",
      active: input.workoutIds.length > 0 || (input.steps ?? 0) >= 5000,
    },
  ];

  const active = spheres.filter((s) => s.active).length;
  const score = Math.round((active / spheres.length) * 100);

  let hint = "Отметь разные сферы — день станет разнообразнее";
  if (active >= 5) hint = "Отличный баланс: день насыщенный и разный";
  else if (active >= 4) hint = "Хороший ритм — ещё одна сфера и будет идеально";
  else if (active === 3) hint = "Неплохо; добавь общение, уход или досуг";
  else if (spheres.find((s) => s.id === "work")?.active && active <= 2) {
    hint = "Много работы — добавь быт, уход или общение";
  }

  return { spheres, score, hint };
}

/** Для подсказки: какие досуг-id социальные */
export function isSocialLeisure(id: string): boolean {
  const act = GENERIC_LEISURE_POOL.find((a) => a.id === id);
  return SOCIAL_IDS.has(id) || act?.category === "social";
}
