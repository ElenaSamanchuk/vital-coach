/**
 * Подсказки по сферам дня с учётом настроения — как раньше в досуге.
 */
import { leisureImpact } from "./impact-motivation";
import {
  LIFE_PULSE_ITEMS,
  type LifePulseDay,
  type LifePulseKey,
} from "./life-pulse";

export interface MoodContext {
  mood: number;
  energy: number;
  stress: number;
}

const STRESS_PICKS: Record<LifePulseKey, string[]> = {
  work: ["boundary", "lunch_break", "plan"],
  care: ["bath_ritual", "meditation", "rest_eyes", "tea_ritual", "massage"],
  leisure: ["nature", "music", "comedy", "hammock", "walk", "social", "podcast", "sauna"],
  home: ["bed_make", "clean_15"],
};

const LOW_MOOD_PICKS: Record<LifePulseKey, string[]> = {
  work: ["boundary", "lunch_break"],
  care: ["walk_solo", "bath_ritual", "face_mask", "tea_ritual"],
  leisure: ["social", "pets", "comedy", "walk", "music", "cinema", "balcony"],
  home: ["clean_15", "dishes"],
};

const LOW_ENERGY_PICKS: Record<LifePulseKey, string[]> = {
  work: ["plan", "tasks", "boundary"],
  care: ["rest_eyes", "nap", "skincare", "tea_ritual"],
  leisure: ["cinema", "read", "podcast", "hammock", "balcony", "sauna"],
  home: ["dishes", "bed_make"],
};

const HIGH_ENERGY_PICKS: Record<LifePulseKey, string[]> = {
  work: ["focus", "learn_job", "creative_work"],
  care: ["walk_solo", "hair", "spa"],
  leisure: ["bike", "dacha", "dance", "travel", "sup", "garden", "concert", "run_leisure"],
  home: ["meal_prep", "groceries", "deep_clean"],
};

const DEFAULT_PICKS: Record<LifePulseKey, string[]> = {
  work: ["focus", "tasks", "meeting"],
  care: ["skincare", "bath_ritual", "walk_solo"],
  leisure: ["walk", "social", "read", "nature", "music"],
  home: ["clean_15", "dishes", "meal_prep"],
};

export function moodBannerForPulse(ctx: MoodContext): string {
  if (ctx.stress >= 7) {
    return "Стресс высокий — досуг и уход сильнее всего поддерживают настроение";
  }
  if (ctx.mood <= 4) {
    return "Настроение просело — начни с лёгкого досуга или заботы о себе";
  }
  if (ctx.energy <= 4) {
    return "Мало сил — короткий отдых лучше, чем тащить себя через день";
  }
  if (ctx.mood >= 8 && ctx.energy >= 7) {
    return "Бодрый день — можно и дела, и радость без чувства вины";
  }
  return "Плашки с ↑ — что сильнее всего влияет на настроение сегодня";
}

export function suggestedPulseItems(ctx: MoodContext, key: LifePulseKey): string[] {
  const available = new Set(LIFE_PULSE_ITEMS[key].map((i) => i.id));
  let ids: string[];
  if (ctx.stress >= 7) ids = STRESS_PICKS[key];
  else if (ctx.mood <= 4) ids = LOW_MOOD_PICKS[key];
  else if (ctx.energy <= 4) ids = LOW_ENERGY_PICKS[key];
  else if (ctx.energy >= 8 && ctx.mood >= 7) ids = HIGH_ENERGY_PICKS[key];
  else ids = DEFAULT_PICKS[key];
  return ids.filter((id) => available.has(id)).slice(0, 5);
}

export function pulseItemTip(key: LifePulseKey, itemId: string): string | undefined {
  const item = LIFE_PULSE_ITEMS[key].find((i) => i.id === itemId);
  if (!item) return undefined;
  if (item.tip) return item.tip;
  if (key === "leisure" && item.leisureId) return leisureImpact(item.leisureId);
  return undefined;
}

/** Досуг из баланса → leisureJson для аналитики и рекомендаций */
export function leisureIdsFromPulse(pulse: LifePulseDay): string[] {
  const ids = pulse.leisure.items.map((id) => {
    const item = LIFE_PULSE_ITEMS.leisure.find((i) => i.id === id);
    return item?.leisureId ?? id;
  });
  return [...new Set(ids)];
}

/** Средний moodBoost выбранного досуга — для подсказки после отметок */
export function leisureMoodBoostFromPulse(pulse: LifePulseDay): number | null {
  const boosts = pulse.leisure.items
    .map((id) => LIFE_PULSE_ITEMS.leisure.find((i) => i.id === id)?.moodBoost)
    .filter((n): n is number => n != null);
  if (boosts.length === 0) return null;
  return Math.round(boosts.reduce((a, b) => a + b, 0) / boosts.length);
}
