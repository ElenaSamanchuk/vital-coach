/**
 * Безопасные рекомендации: то, что усваивается у большинства и не вредит.
 * С оговорками при ИР, гипотиреозе, СПКЯ, проблемах всасывания.
 */

export interface SafeItem {
  id: string;
  title: string;
  category: "food" | "workout" | "leisure" | "supplement";
  whySafe: string;
  evidence: string;
  caution?: string;
  endorphinScore?: number;
  tags: string[];
}

export const SAFE_WORKOUTS: SafeItem[] = [
  {
    id: "walk",
    title: "Ходьба 30–60 мин",
    category: "workout",
    whySafe: "Низкая ударная нагрузка; подходит при гипотиреозе, после операции, высоком стрессе",
    evidence: "WHO 150 мин/нед умеренной активности; meta — снижение ИР",
    tags: ["universal", "cortisol-safe", "post-surgery"],
  },
  {
    id: "bike",
    title: "Велосипед (зона 2)",
    category: "workout",
    whySafe: "Без ударов по суставам; эндорфины + природа",
    evidence: "ACSM — кардио низкой интенсивности",
    tags: ["universal", "endorphin"],
    endorphinScore: 8,
  },
  {
    id: "pool",
    title: "Плавание / бассейн",
    category: "workout",
    whySafe: "Разгрузка позвоночника; гипоаллергенно для суставов",
    evidence: "Реабилитация после операций; снижение тревоги",
    tags: ["universal", "recovery", "endorphin"],
    endorphinScore: 9,
  },
  {
    id: "mat",
    title: "Йога / пилатес на коврике",
    category: "workout",
    whySafe: "Контролируемая нагрузка; парасимпатика при стрессе",
    evidence: "Meta — йога снижает кортизол и тревогу",
    caution: "Избегай инверсий при высоком давлении; в лютеиновой — мягче",
    tags: ["universal", "cortisol-safe", "endorphin"],
    endorphinScore: 8,
  },
  {
    id: "home_strength",
    title: "Силовая дома (резинки, вес тела)",
    category: "workout",
    whySafe: "Мышцы без зала; важно при дефиците и СПКЯ",
    evidence: "Силовая сохраняет мышцы в дефиците (meta)",
    caution: "Не через боль; после лапароскопии — с разрешения врача",
    tags: ["muscle", "pcos"],
  },
];

export const SAFE_FOODS: SafeItem[] = [
  {
    id: "eggs",
    title: "Яйца",
    category: "food",
    whySafe: "Полный белок; усваивается у большинства",
    evidence: "Dietary protein quality — PDCAAS высокий",
    caution: "При непереносимости — только белки или рыба",
    tags: ["protein", "universal"],
  },
  {
    id: "fish",
    title: "Рыба (нежирная + жирная 2×/нед)",
    category: "food",
    whySafe: "Омега-3, белок; средиземноморский паттерн",
    evidence: "AHA — 2 порции рыбы/нед",
    tags: ["protein", "anti-inflammatory"],
  },
  {
    id: "greens",
    title: "Овощи + зелень",
    category: "food",
    whySafe: "Клетчатка без скачков глюкозы при ИР",
    evidence: "Low-GI patterns; клетчатка 25–35 г",
    tags: ["fiber", "ir-friendly"],
  },
  {
    id: "berries",
    title: "Ягоды",
    category: "food",
    whySafe: "Антиоксиданты; умеренный сахар",
    evidence: "Polyphenols — метаболическое здоровье",
    tags: ["ir-friendly"],
  },
  {
    id: "fermented",
    title: "Кефир / йогурт без сахара",
    category: "food",
    whySafe: "Белок + пробиотики; лучше молока при чувствительности",
    evidence: "Fermented dairy — переносимость выше",
    caution: "При непереносимости лактозы — безлактозный или отказ",
    tags: ["protein", "gut"],
  },
  {
    id: "olive_oil",
    title: "Оливковое масло",
    category: "food",
    whySafe: "Жиры без трансжиров; сытость",
    evidence: "PREDIMED — средиземноморская диета",
    tags: ["fat", "universal"],
  },
];

export const SUPPLEMENT_CAUTIONS: SafeItem[] = [
  {
    id: "iron",
    title: "Железо",
    category: "supplement",
    whySafe: "Только по ферритину с врачом",
    evidence: "Избыток железа токсичен",
    caution: "Не пить «на всякий случай»; отдельно от кальция и чая",
    tags: ["labs-first"],
  },
  {
    id: "d3",
    title: "Витамин D",
    category: "supplement",
    whySafe: "По чекапу 25(OH)D; доза с врачом",
    evidence: "Endocrine Society guidelines",
    caution: "При проблемах всасывания — форма с врачом (масло/спрей)",
    tags: ["labs-first", "absorption"],
  },
  {
    id: "b12",
    title: "B12",
    category: "supplement",
    whySafe: "При дефиците — часто сублингвально лучше",
    evidence: "При атрофическом гастрите — перорально может не работать",
    caution: "Если показатель низкий несмотря на приём — ФГДС, форма метилкобаламин",
    tags: ["labs-first", "absorption"],
  },
  {
    id: "multivitamin",
    title: "«Мультивитамины на всякий случай»",
    category: "supplement",
    whySafe: "Не заменяют еду и чекап",
    evidence: "USPSTF — нет пользы для здоровых без дефицитов",
    caution: "Может маскировать дефицит B12/D; сначала чекап",
    tags: ["avoid-blind"],
  },
];

export const ENDORPHIN_LEISURE: SafeItem[] = [
  { id: "pool", title: "Бассейн", category: "leisure", whySafe: "Вода + ритм", evidence: "Exercise-induced endorphins", endorphinScore: 9, tags: ["top"] },
  { id: "bike", title: "Вело", category: "leisure", whySafe: "Свобода + природа", evidence: "Outdoor activity — mood", endorphinScore: 8, tags: ["top"] },
  { id: "dance", title: "Танцы", category: "leisure", whySafe: "Социально + тело", evidence: "Dance therapy meta", endorphinScore: 9, tags: ["top"] },
  { id: "sup", title: "Сап / вода", category: "leisure", whySafe: "Баланс + природа", evidence: "Blue space wellbeing", endorphinScore: 10, tags: ["top"] },
  { id: "social", title: "Встреча с близким", category: "leisure", whySafe: "Окситоцин", evidence: "Harvard 80 лет", endorphinScore: 9, tags: ["top"] },
  { id: "music", title: "Живая музыка / концерт", category: "leisure", whySafe: "Дофамин + эмоции", evidence: "Music therapy reviews", endorphinScore: 8, tags: ["top"] },
  { id: "nature", title: "Лес / парк 2+ ч", category: "leisure", whySafe: "Кортизол ↓", evidence: "Shinrin-yoku studies", endorphinScore: 8, tags: ["top"] },
  { id: "bath", title: "Тёплая ванна", category: "leisure", whySafe: "Парасимпатика", evidence: "Passive heat — recovery", endorphinScore: 7, tags: ["rest"] },
  { id: "comedy", title: "Комедия / юмор", category: "leisure", whySafe: "Смех — физиология", evidence: "Positive psychology", endorphinScore: 7, tags: ["rest"] },
  { id: "pets", title: "Время с питомцем", category: "leisure", whySafe: "Снижение одиночества", evidence: "Human-animal bond", endorphinScore: 8, tags: ["social"] },
];

export function getSafeWorkoutsForProfile(flags: Record<string, boolean>): SafeItem[] {
  return SAFE_WORKOUTS.filter((w) => {
    if (flags.surgeryRecovery && !w.tags.includes("post-surgery") && w.id === "home_strength") return false;
    if (flags.cortisolIssues && w.tags.includes("cortisol-safe")) return true;
    return true;
  });
}
