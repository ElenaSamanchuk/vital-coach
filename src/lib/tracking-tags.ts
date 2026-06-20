/** Daylio-style метки для дневника */

import { GENERIC_MODE } from "./app-config";

export type TagColor = "green" | "gray" | "brown" | "purple" | "pink" | "black";

export type TagCategory = "health" | "care" | "home" | "mood";

export type TagIcon =
  | "footprints"
  | "dumbbell"
  | "pill"
  | "flower"
  | "users"
  | "coffee"
  | "frown"
  | "salad"
  | "moon"
  | "sparkles"
  | "bath"
  | "hand"
  | "brush"
  | "home"
  | "shirt"
  | "cooking";

export interface TrackingTag {
  id: string;
  label: string;
  color: TagColor;
  category?: TagCategory;
  emoji?: string;
  icon?: TagIcon;
}

export const TAG_CATEGORY_LABEL: Record<TagCategory, string> = {
  health: "Здоровье",
  care: "Уход",
  home: "Быт",
  mood: "Настроение",
};

export const TAG_ICON_BY_ID: Record<string, TagIcon> = {
  walk: "footprints",
  sport: "dumbbell",
  meds: "pill",
  cycle: "flower",
  social: "users",
  rest: "coffee",
  stress: "frown",
  food_ok: "salad",
  sleep_ok: "moon",
  selfcare: "sparkles",
  face_mask: "sparkles",
  massage_face: "hand",
  massage_body: "hand",
  skincare: "brush",
  bath_ritual: "bath",
  hair_mask: "sparkles",
  clean_15: "home",
  dishes: "home",
  laundry: "shirt",
  meal_prep: "cooking",
  groceries: "cooking",
};

export const TAG_COLOR_CLASS: Record<TagColor, string> = {
  green: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30",
  gray: "bg-[var(--gray-soft)] text-[var(--gray)] border-[var(--gray)]/25",
  brown: "bg-[var(--brown-soft)] text-[var(--brown)] border-[var(--brown)]/30",
  purple: "bg-[var(--purple-soft)] text-[var(--purple)] border-[var(--purple)]/30",
  pink: "bg-[var(--pink-soft)] text-[var(--pink)] border-[var(--pink)]/30",
  black: "bg-[var(--black-soft)] text-[var(--text)] border-[var(--border-strong)]",
};

export const DEFAULT_TRACKING_TAGS: TrackingTag[] = [
  { id: "walk", label: "Прогулка", color: "green", category: "health", icon: "footprints" },
  { id: "sport", label: "Спорт", color: "green", category: "health", icon: "dumbbell" },
  { id: "meds", label: "Лекарства", color: "purple", category: "health", icon: "pill" },
  { id: "cycle", label: "Цикл", color: "pink", category: "health", icon: "flower" },
  { id: "food_ok", label: "Питание ок", color: "green", category: "health", icon: "salad" },
  { id: "sleep_ok", label: "Сон ок", color: "purple", category: "health", icon: "moon" },
  { id: "face_mask", label: "Маска", color: "pink", category: "care", icon: "sparkles" },
  { id: "massage_face", label: "Массаж лица", color: "pink", category: "care", icon: "hand" },
  { id: "massage_body", label: "Массаж / роллер", color: "pink", category: "care", icon: "hand" },
  { id: "skincare", label: "Уход кожа", color: "pink", category: "care", icon: "brush" },
  { id: "bath_ritual", label: "Ванна / душ", color: "pink", category: "care", icon: "bath" },
  { id: "hair_mask", label: "Маска волос", color: "pink", category: "care", icon: "sparkles" },
  { id: "selfcare", label: "Забота о себе", color: "pink", category: "care", icon: "sparkles" },
  { id: "clean_15", label: "15 мин уборки", color: "brown", category: "home", icon: "home" },
  { id: "dishes", label: "Посуда", color: "brown", category: "home", icon: "home" },
  { id: "laundry", label: "Стирка", color: "brown", category: "home", icon: "shirt" },
  { id: "meal_prep", label: "Заготовка еды", color: "brown", category: "home", icon: "cooking" },
  { id: "groceries", label: "Продукты", color: "brown", category: "home", icon: "cooking" },
  { id: "social", label: "Общение", color: "purple", category: "mood", icon: "users" },
  { id: "rest", label: "Отдых", color: "brown", category: "mood", icon: "coffee" },
  { id: "stress", label: "Стресс", color: "gray", category: "mood", icon: "frown" },
];

/** Дефолтные метки дня — без медицинских в mass-market */
const GENERIC_HIDDEN_TAG_IDS = new Set(["meds", "cycle"]);

export function defaultTrackingTags(): TrackingTag[] {
  if (!GENERIC_MODE) return [...DEFAULT_TRACKING_TAGS];
  return DEFAULT_TRACKING_TAGS.filter((t) => !GENERIC_HIDDEN_TAG_IDS.has(t.id));
}

export function tagWithIcon(tag: TrackingTag): TrackingTag {
  return { ...tag, icon: tag.icon ?? TAG_ICON_BY_ID[tag.id] };
}

export function enrichTags(tags: TrackingTag[]): TrackingTag[] {
  return tags.map(tagWithIcon);
}

/** Добавляет новые дефолтные плашки к сохранённым в профиле */
export function mergeDefaultTags(parsed: TrackingTag[]): TrackingTag[] {
  const ids = new Set(parsed.map((t) => t.id));
  const merged = [...parsed];
  for (const d of defaultTrackingTags()) {
    if (!ids.has(d.id)) merged.push(d);
  }
  return merged;
}

export function parseTrackingTags(raw: string | null | undefined): TrackingTag[] {
  if (!raw || raw === "[]") return defaultTrackingTags();
  try {
    const parsed = JSON.parse(raw) as TrackingTag[];
    return parsed.length > 0 ? mergeDefaultTags(parsed) : defaultTrackingTags();
  } catch {
    return defaultTrackingTags();
  }
}

export function parseDayTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function tagsByCategory(tags: TrackingTag[]): Record<TagCategory, TrackingTag[]> {
  const out: Record<TagCategory, TrackingTag[]> = {
    health: [],
    care: [],
    home: [],
    mood: [],
  };
  for (const t of enrichTags(tags)) {
    const cat = t.category ?? "health";
    out[cat].push(t);
  }
  return out;
}
