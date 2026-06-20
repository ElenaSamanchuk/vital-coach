/**
 * Каталог жизни — одно приложение вместо десятка.
 * Домены отобраны из идей пользователя, без перегруза UI.
 */

export type LifeDomain =
  | "work"
  | "learn"
  | "social"
  | "family"
  | "nature"
  | "creativity"
  | "leisure"
  | "selfcare"
  | "home"
  | "health"
  | "pets"
  | "mind"
  | "food"
  | "style";

export interface CatalogItem {
  id: string;
  label: string;
  domain: LifeDomain;
  emoji: string;
  minutes?: number;
}

export const DOMAIN_LABELS: Record<LifeDomain, string> = {
  work: "Работа",
  learn: "Обучение",
  social: "Знакомства",
  family: "Семья",
  nature: "Дача · природа",
  creativity: "Творчество",
  leisure: "Досуг",
  selfcare: "Уход",
  home: "Дом · быт",
  health: "Здоровье",
  pets: "Питомцы · растения",
  mind: "Психология",
  food: "Кулинария",
  style: "Стиль",
};

export const LIFE_CATALOG: CatalogItem[] = [
  // Работа
  { id: "portfolio", label: "Обновить портфолио", domain: "work", emoji: "💼" },
  { id: "resume", label: "Резюме", domain: "work", emoji: "📄" },
  { id: "job_search", label: "Поиск вакансий", domain: "work", emoji: "🔍" },
  { id: "own_project", label: "Свой проект / команда", domain: "work", emoji: "🚀" },
  { id: "deep_work", label: "Глубокая работа 25 мин", domain: "work", emoji: "🎯", minutes: 25 },
  // Обучение
  { id: "english", label: "English", domain: "learn", emoji: "🇬🇧", minutes: 30 },
  { id: "course", label: "Онлайн-курс", domain: "learn", emoji: "🎓", minutes: 45 },
  { id: "tech_new", label: "Новая технология", domain: "learn", emoji: "💻", minutes: 40 },
  { id: "tutor", label: "Репетитор / видео", domain: "learn", emoji: "📺", minutes: 45 },
  // Социальное
  { id: "conference", label: "Конференция / митап", domain: "social", emoji: "🎤" },
  { id: "anticafe", label: "Антикафе / антикино", domain: "social", emoji: "☕" },
  { id: "friends_new", label: "Знакомства по интересам", domain: "social", emoji: "🤝" },
  { id: "partner", label: "Время на отношения", domain: "social", emoji: "💕" },
  // Семья
  { id: "parents", label: "Родители — звонок / визит", domain: "family", emoji: "👨‍👩‍👧" },
  { id: "family_movie", label: "Кино с семьёй", domain: "family", emoji: "🎬" },
  { id: "family_help", label: "Помощь родителям", domain: "family", emoji: "🫶" },
  // Дача · природа
  { id: "dacha", label: "Дача / загород", domain: "nature", emoji: "🏡" },
  { id: "forest", label: "Лес / озеро", domain: "nature", emoji: "🌲" },
  { id: "ebike", label: "Электровелосипед", domain: "nature", emoji: "⚡" },
  { id: "garden", label: "Огород / грядки", domain: "nature", emoji: "🥕" },
  { id: "flowers", label: "Цветы", domain: "nature", emoji: "🌸" },
  { id: "firepit", label: "Костровая чаша / огонь", domain: "nature", emoji: "🔥" },
  { id: "hammock", label: "Гамак / беседка", domain: "nature", emoji: "🪑" },
  { id: "banya", label: "Баня", domain: "nature", emoji: "🧖" },
  { id: "balcony_chill", label: "Балкон-чил: кресло, свет", domain: "nature", emoji: "🪴" },
  // Творчество
  { id: "draw", label: "Рисование", domain: "creativity", emoji: "🎨", minutes: 40 },
  { id: "masterclass", label: "Мастер-класс", domain: "creativity", emoji: "✏️", minutes: 60 },
  { id: "draw_home", label: "Рисование дома", domain: "creativity", emoji: "🖌️", minutes: 30 },
  // Досуг
  { id: "travel_plan", label: "Спланировать поездку", domain: "leisure", emoji: "✈️" },
  { id: "cinema", label: "Кино", domain: "leisure", emoji: "🎬" },
  { id: "cafe", label: "Кафе", domain: "leisure", emoji: "🍰" },
  { id: "park", label: "Парк / прогулка", domain: "leisure", emoji: "🌳" },
  { id: "pool", label: "Бассейн", domain: "leisure", emoji: "🏊" },
  { id: "sup", label: "Сап", domain: "leisure", emoji: "🏄" },
  { id: "yoga", label: "Йога / пилатес", domain: "leisure", emoji: "🧘", minutes: 40 },
  { id: "gym", label: "Тренажёрный", domain: "leisure", emoji: "🏋️" },
  { id: "sauna", label: "Сауна / спа", domain: "leisure", emoji: "♨️" },
  { id: "home_workout", label: "Треня дома: коврик, гантели", domain: "leisure", emoji: "💪", minutes: 30 },
  // Уход
  { id: "hair_care", label: "Уход за волосами", domain: "selfcare", emoji: "💇", minutes: 20 },
  { id: "skin_care", label: "Кожа: крем, масло", domain: "selfcare", emoji: "✨", minutes: 15 },
  { id: "teeth", label: "Зубы / полоскание", domain: "selfcare", emoji: "🦷", minutes: 5 },
  { id: "nails", label: "Ногти / брови / ресницы", domain: "selfcare", emoji: "💅", minutes: 20 },
  { id: "ears_nose", label: "Чистка ушей / нос", domain: "selfcare", emoji: "👂", minutes: 5 },
  { id: "aroma", label: "Свечи / арома / скраб", domain: "selfcare", emoji: "🕯️", minutes: 15 },
  { id: "eye_drops", label: "Капли для глаз", domain: "selfcare", emoji: "👁️", minutes: 2 },
  { id: "relax_music", label: "Релакс + музыка", domain: "selfcare", emoji: "🎵", minutes: 15 },
  // Дом
  { id: "clean", label: "Уборка", domain: "home", emoji: "🧹", minutes: 15 },
  { id: "shop", label: "Что купить — список", domain: "home", emoji: "🛒" },
  { id: "declutter", label: "Разобрать / выбросить", domain: "home", emoji: "📦", minutes: 15 },
  // Здоровье
  { id: "checkup", label: "Чекап / анализы", domain: "health", emoji: "🔬" },
  { id: "ultrasound", label: "УЗИ", domain: "health", emoji: "📡" },
  // Питомцы
  { id: "cat_care", label: "Кот — уход", domain: "pets", emoji: "🐱" },
  { id: "turtle", label: "Черепаха / аквариум", domain: "pets", emoji: "🐢" },
  { id: "plants", label: "Растения / полив", domain: "pets", emoji: "🪴", minutes: 10 },
  { id: "balcony_garden", label: "Мини-огород на балконе", domain: "pets", emoji: "🌱" },
  // Психология
  { id: "journal", label: "Дневник / познание себя", domain: "mind", emoji: "📔", minutes: 15 },
  { id: "reflect", label: "Рефлексия / нумерология", domain: "mind", emoji: "🔮", minutes: 20 },
  // Кулинария
  { id: "recipe", label: "Новый рецепт", domain: "food", emoji: "👩‍🍳", minutes: 45 },
  { id: "meal_prep", label: "Заготовка еды", domain: "food", emoji: "🥗", minutes: 40 },
];

export function catalogByDomain(domain: LifeDomain): CatalogItem[] {
  return LIFE_CATALOG.filter((c) => c.domain === domain);
}

export function parseInterests(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Дефолтные интересы из онбординга + популярные */
export const DEFAULT_INTEREST_IDS = [
  "yoga",
  "forest",
  "draw",
  "english",
  "cinema",
  "plants",
  "skin_care",
  "deep_work",
];
