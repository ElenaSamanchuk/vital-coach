import {
  LIFE_CATALOG,
  parseInterests,
  type CatalogItem,
  type LifeDomain,
} from "./life-catalog";
import type { CompensationSummary } from "./compensation-plan";
import type { CyclePhase } from "./types";
import type { WheelScores } from "./life-spheres";
import { getLowestSpheres } from "./life-spheres";
import { quizCatalogBoost, type LeisureQuizAnswers } from "./leisure-quiz";
import { actionImpact } from "./impact-motivation";

export interface LifeSuggestion {
  id: string;
  label: string;
  domain: LifeDomain;
  emoji: string;
  why: string;
  impact?: string;
  minutes?: number;
}

const DOMAIN_FROM_SPHERE: Partial<Record<string, LifeDomain>> = {
  health: "health",
  career: "work",
  relationships: "social",
  intellect: "learn",
  creativity: "creativity",
  leisure: "leisure",
  environment: "home",
  spirituality: "mind",
};

export function pickLifeSuggestions(input: {
  mood: number;
  energy: number;
  stress: number;
  cyclePhase: CyclePhase | null;
  wheelScores: WheelScores;
  interestsJson?: string | null;
  compensation: CompensationSummary;
  hour: number;
  softDay: boolean;
  leisureQuiz?: LeisureQuizAnswers | null;
  limit?: number;
}): LifeSuggestion[] {
  const interests = new Set(parseInterests(input.interestsJson));
  if (interests.size === 0) {
    for (const id of ["yoga", "forest", "cinema", "plants", "deep_work"]) interests.add(id);
  }

  const picks: LifeSuggestion[] = [];
  const used = new Set<string>();

  const add = (item: CatalogItem, why: string) => {
    if (used.has(item.id) || picks.length >= (input.limit ?? 6)) return;
    used.add(item.id);
    picks.push({
      id: item.id,
      label: item.label,
      domain: item.domain,
      emoji: item.emoji,
      why,
      impact: actionImpact(item.domain, item.label),
      minutes: item.minutes,
    });
  };

  // Компенсация → движение / вода / сон
  if (input.compensation.netExtraWalkMin > 0) {
    const w = LIFE_CATALOG.find((c) => c.id === "park")!;
    add(w, `+${input.compensation.netExtraWalkMin} мин ходьбы в плане компенсации`);
  }
  if (input.compensation.items.some((i) => i.domain === "sleep")) {
    const s = LIFE_CATALOG.find((c) => c.id === "relax_music")!;
    add(s, "Недосып — вечер без экранов, релакс");
  }
  if (input.compensation.items.some((i) => i.domain === "water")) {
    add(
      LIFE_CATALOG.find((c) => c.id === "plants")!,
      "Долг по воде — стакан перед едой, полив растений как напоминание",
    );
  }

  // Слабые сферы колеса
  for (const sphere of getLowestSpheres(input.wheelScores, 2)) {
    const domain = DOMAIN_FROM_SPHERE[sphere];
    if (!domain) continue;
    const item = LIFE_CATALOG.find((c) => c.domain === domain);
    if (item) add(item, `Сфера «${sphere}» просела в колесе жизни`);
  }

  // Настроение / энергия
  if (input.stress >= 7 || input.softDay) {
    for (const id of ["banya", "hammock", "yoga", "journal", "relax_music"]) {
      const item = LIFE_CATALOG.find((c) => c.id === id);
      if (item) add(item, "Стресс высокий — восстановление важнее KPI");
    }
  } else if (input.energy >= 7) {
    for (const id of ["ebike", "gym", "deep_work", "garden"]) {
      const item = LIFE_CATALOG.find((c) => c.id === id);
      if (item) add(item, "Энергия есть — хороший день для активности");
    }
  } else if (input.energy <= 4) {
    for (const id of ["balcony_chill", "cinema", "draw_home", "cat_care"]) {
      const item = LIFE_CATALOG.find((c) => c.id === id);
      if (item) add(item, "Низкая энергия — мягкий досуг");
    }
  }

  // Цикл
  if (input.cyclePhase === "menstrual" || input.cyclePhase === "luteal") {
    const item = LIFE_CATALOG.find((c) => c.id === "skin_care")!;
    add(item, "Лютеал/месячные — уход и тепло снижают дискомфорт");
  }

  if (input.leisureQuiz) {
    for (const id of quizCatalogBoost(input.leisureQuiz)) {
      const item = LIFE_CATALOG.find((c) => c.id === id);
      if (item) add(item, "Из опроса досуга");
    }
  }

  // Интересы пользователя
  for (const id of interests) {
    const item = LIFE_CATALOG.find((c) => c.id === id);
    if (item) add(item, "Из твоих интересов");
  }

  // Время суток
  if (input.hour >= 18) {
    const item = LIFE_CATALOG.find((c) => c.id === "family_movie");
    if (item && input.mood >= 5) add(item, "Вечер — время для близких");
  } else if (input.hour < 12) {
    const item = LIFE_CATALOG.find((c) => c.id === "deep_work");
    if (item) add(item, "Утро — окно для фокуса");
  }

  // Социальное если давно не было
  if (input.mood <= 5) {
    const item = LIFE_CATALOG.find((c) => c.id === "anticafe")!;
    add(item, "Настроение ниже — социальный контакт помогает");
  }

  return picks.slice(0, input.limit ?? 6);
}
