/**
 * Мотивирующие подписи: что даст действие в перспективе.
 * Питание — нутриенты и эффект; спорт — мышцы и срок; досуг/ритуалы — восстановление.
 */

export interface ImpactLabel {
  /** Короткая мотивация «что получишь» */
  effect: string;
  /** Нутриент / зона тела */
  target?: string;
  /** Горизонт результата */
  horizon?: string;
}

function line(label: ImpactLabel): string {
  const parts = [label.effect];
  if (label.target) parts.push(label.target);
  if (label.horizon) parts.push(label.horizon);
  return parts.join(" · ");
}

// —— Питание: по тегам ——
const MEAL_TAG_IMPACT: Record<string, ImpactLabel> = {
  iron: {
    effect: "↑ энергия, меньше головокружения",
    target: "Железо + вит. C",
    horizon: "2–4 нед при 3×/нед",
  },
  b12: {
    effect: "↑ концентрация и метаболизм",
    target: "B12, фолат",
    horizon: "4–8 нед",
  },
  protein: {
    effect: "Сохраняешь мышцы в дефиците",
    target: "Лейцин, белок",
    horizon: "эффект с первой недели",
  },
  omega3: {
    effect: "↓ воспаление, кожа и суставы",
    target: "EPA/DHA",
    horizon: "3–6 нед регулярно",
  },
  fiber: {
    effect: "Стабильная глюкоза, сытость",
    target: "Клетчатка",
    horizon: "сразу + долгосрочно кишечник",
  },
  "low-gi": {
    effect: "Меньше тяги к сладкому к вечеру",
    target: "Низкий ГИ",
    horizon: "особенно при ИР",
  },
  calcium: {
    effect: "Кости + легче ПМС",
    target: "Кальций, магний",
    horizon: "2–3 цикла",
  },
  magnesium: {
    effect: "Спокойнее нервная система",
    target: "Магний",
    horizon: "1–2 нед при дефиците",
  },
  zinc: {
    effect: "Кожа, иммунитет, цикл",
    target: "Цинк",
    horizon: "4–8 нед",
  },
  gut: {
    effect: "Микробиом → настроение и вес",
    target: "Пробиотики",
    horizon: "2–4 нед",
  },
  vitd: {
    effect: "Энергия, иммунитет, настроение",
    target: "Витамин D",
    horizon: "8 нед + солнце/рыба",
  },
  lean: {
    effect: "Дефицит без потери формы",
    target: "Нежирный белок",
    horizon: "талия − при стабильности",
  },
  satiety: {
    effect: "Меньше срывов вечером",
    target: "Объём + белок",
    horizon: "с первого приёма",
  },
  energy: {
    effect: "Топливо перед тренировкой",
    target: "Углеводы + белок",
    horizon: "на этой тренировке",
  },
  quick: {
    effect: "Белок без возни",
    target: "Быстрый перекус",
    horizon: "голод ↓ на 3–4 ч",
  },
};

const MEAL_ID_IMPACT: Record<string, ImpactLabel> = {
  "m-b1": {
    effect: "Восполняешь потери железа в цикле",
    target: "Шпинат + яйца",
    horizon: "энергия за 2–3 нед",
  },
  "m-l1": {
    effect: "Мощный удар по анемии",
    target: "Печень = B12 + железо",
    horizon: "1×/нед достаточно",
  },
  "f-l3": {
    effect: "Щитовидка и воспаление",
    target: "Скумбрия: D + омега-3",
    horizon: "3–4×/нед идеал",
  },
  "u-l2": {
    effect: "Лёгкий белок без жара",
    target: "Рыба → Т3/T4 поддержка",
    horizon: "2–3 мес стабильности",
  },
  "o-l1": {
    effect: "Восстановление после нагрузки",
    target: "Говядина + рис",
    horizon: "мышцы + гликоген",
  },
  "l-b2": {
    effect: "ПМС: меньше отёков и срывов",
    target: "Магний из семечек",
    horizon: "за 1–2 цикла",
  },
};

export function mealImpact(id: string, tags: string[]): string {
  if (MEAL_ID_IMPACT[id]) return line(MEAL_ID_IMPACT[id]);
  for (const tag of tags) {
    if (MEAL_TAG_IMPACT[tag]) return line(MEAL_TAG_IMPACT[tag]);
  }
  return line({
    effect: "Шаг к цели веса без голода",
    target: "Баланс БЖУ",
    horizon: "накопительно",
  });
}

// —— Спорт: мышцы + срок ——
const WORKOUT_IMPACT: Record<string, ImpactLabel> = {
  "bike-zone2": {
    effect: "Жиросжигание + выносливость",
    target: "Квадрицепс, ягодицы, сердце",
    horizon: "4–6 нед 2×/нед",
  },
  "pool-easy": {
    effect: "Осанка и спина без ударной нагрузки",
    target: "Широчайшие, кор",
    horizon: "6–8 нед",
  },
  "walk-nature": {
    effect: "Кортизол ↓, настроение ↑",
    target: "Всё тело мягко",
    horizon: "сразу, 3×/нед",
  },
  "ebike-ride": {
    effect: "Кардио без перегруза суставов",
    target: "Ноги + лёгкие",
    horizon: "4 нед",
  },
  "stairs-walk": {
    effect: "ИР: глюкоза после еды",
    target: "Ягодицы, икры",
    horizon: "10 мин × 5 дн/нед",
  },
  "strength-full": {
    effect: "Форма «песочные часы»",
    target: "Ягодицы, спина, квадрицепс",
    horizon: "8–12 нед 2×/нед",
  },
  "strength-home": {
    effect: "Мышцы в дефиците не тают",
    target: "Ягодицы, кор, руки",
    horizon: "6–8 нед",
  },
  "aqua-strength": {
    effect: "Сила без давления на живот",
    target: "Ноги, плечи, кор",
    horizon: "6 нед",
  },
  "dance-cardio": {
    effect: "Калории + радость",
    target: "Всё тело, координация",
    horizon: "2–3×/нед",
  },
  "sup-paddle": {
    effect: "Кор и баланс на воде",
    target: "Пресс, плечи, стабилизаторы",
    horizon: "4–6 нед сезон",
  },
  "yoga-flow": {
    effect: "Гибкость + парасимпатика",
    target: "Таз, спина, дыхание",
    horizon: "3–4 нед регулярно",
  },
  pilates: {
    effect: "Талия и осанка",
    target: "Поперечная мышца живота, кор",
    horizon: "6–8 нед 2×/нед",
  },
  "bike-intervals-light": {
    effect: "Инсулиночувствительность ↑",
    target: "Ноги, VO2max",
    horizon: "4 нед (не при стрессе 8+)",
  },
  "breath-walk": {
    effect: "Стресс ↓ без зала",
    target: "Нервная система",
    horizon: "сегодня вечером легче",
  },
  "rest-walk": {
    effect: "Восстановление = прогресс",
    target: "Кортизол в норму",
    horizon: "завтра сильнее",
  },
  stretch: {
    effect: "Меньше боли в тазу/спине",
    target: "Связки, мышцы-стабилизаторы",
    horizon: "10–15 мин достаточно",
  },
};

export function workoutImpact(id: string, type: string): string {
  if (WORKOUT_IMPACT[id]) return line(WORKOUT_IMPACT[id]);
  const fallback: Record<string, ImpactLabel> = {
    bike: { effect: "Кардио и настроение", target: "Ноги", horizon: "4 нед" },
    pool: { effect: "Спина и суставы", target: "Всё тело", horizon: "6 нед" },
    walk: { effect: "Шаги к цели веса", target: "Ноги, сердце", horizon: "ежедневно" },
    strength: { effect: "Мышцы в дефиците", target: "Всё тело", horizon: "8 нед" },
    yoga: { effect: "Гибкость и сон", target: "Кор, спина", horizon: "3 нед" },
    dance: { effect: "Эндорфины", target: "Координация", horizon: "сразу" },
    rest: { effect: "Тело восстанавливается", target: "Гормоны", horizon: "1 день отдыха" },
  };
  return line(fallback[type] ?? { effect: "Движение — шаг к форме", horizon: "регулярно" });
}

// —— Досуг ——
const LEISURE_IMPACT: Record<string, ImpactLabel> = {
  bike: { effect: "Эндорфины + ноги", target: "Квадрицепс", horizon: "как кардио" },
  pool: { effect: "Снятие напряжения", target: "Спина", horizon: "после офиса" },
  yoga: { effect: "Гибкость + сон", target: "Таз, дыхание", horizon: "вечером легче" },
  walk: { effect: "10 000 шагов ближе", target: "Кортизол ↓", horizon: "сразу" },
  dacha: { effect: "Перезагрузка мозга", target: "Стресс ↓", horizon: "на всю неделю" },
  banya: { effect: "Детокс-ощущение", target: "Сосуды, кожа", horizon: "1×/нед" },
  books: { effect: "Когнитивный резерв", target: "Мозг", horizon: "долгосрочно" },
  social: { effect: "Счастье по Harvard Study", target: "Связи", horizon: "настроение сегодня" },
  cooking: { effect: "Контроль состава", target: "Питание", horizon: "дефицит проще" },
  chess: { effect: "Стратегия и фокус", target: "Префронтальная кора", horizon: "2×/нед" },
  english: { effect: "Новые возможности", target: "Язык", horizon: "15 мин/день" },
  nature: { effect: "Ecotherapy: настроение +15%", target: "Нервная система", horizon: "40 мин" },
  bath: { effect: "Парасимпатика перед сном", target: "Восстановление", horizon: "сон глубже" },
  dance: { effect: "Кардио без скуки", target: "Всё тело", horizon: "30 мин" },
  gym: { effect: "Мышечный тонус", target: "Ягодицы, спина", horizon: "8 нед 2×/нед" },
};

export function leisureImpact(id: string): string {
  if (LEISURE_IMPACT[id]) return line(LEISURE_IMPACT[id]);
  return line({ effect: "Досуг без KPI — батарейка ↑", horizon: "настроение сегодня" });
}

// —— Ритуалы дня ——
const ROUTINE_IMPACT: Record<string, ImpactLabel> = {
  water: { effect: "Метаболизм +0", target: "Щитовидка, кожа", horizon: "сразу" },
  thyroid: { effect: "Стабильный Т3/T4", target: "Щитовидная железа", horizon: "ежедневно натощак" },
  sunlight: { effect: "Циркадные ритмы", target: "Мелатонин вечером", horizon: "5 мин утром" },
  stretch: { effect: "Меньше зажимов", target: "Шея, таз", horizon: "3–5 мин" },
  screen_break: { effect: "Глаза и фокус", target: "Мозг", horizon: "продуктивность ↑" },
  lunch_mindful: { effect: "Меньше переедания", target: "ИР", horizon: "−200 ккал незаметно" },
  walk_10: { effect: "Глюкоза −20–30%", target: "Инсулин", horizon: "после каждого обеда" },
  reset_breath: { effect: "Вторая половина дня легче", target: "Кортизол", horizon: "2 мин" },
  neck_stretch: { effect: "Меньше головной боли", target: "Трапеции", horizon: "ежедневно" },
  pelvis_rest: { effect: "Боль в тазу ↓", target: "Эндометриоз", horizon: "5 мин" },
  skincare: { effect: "Ритуал закрытия", target: "Кожа, сон", horizon: "вечер" },
  tea: { effect: "Расслабление", target: "Парасимпатика", horizon: "перед сном" },
  breath_evening: { effect: "Засыпание быстрее", target: "Нервная система", horizon: "4 мин" },
  sleep: { effect: "Завтра −300 ккал тяги", target: "Лептин/грелин", horizon: "7–8 ч сна" },
};

export function routineImpact(stepId: string): string {
  if (ROUTINE_IMPACT[stepId]) return line(ROUTINE_IMPACT[stepId]);
  return line({ effect: "Маленький шаг — большой эффект", horizon: "привычка" });
}

/** Горизонтный план / идеи жизни */
export function actionImpact(domain: string, title: string): string {
  const lower = title.toLowerCase();
  if (domain === "sport" || lower.includes("ходьб") || lower.includes("тренир"))
    return "Мышцы и настроение · 4–6 нед";
  if (domain === "nutrition" || lower.includes("белок") || lower.includes("ккал"))
    return "Форма без потери мышц · ежедневно";
  if (lower.includes("сон")) return "Вес и ИР стабильнее · с этой ночи";
  if (lower.includes("анализ")) return "Точный план под твоё тело · 1 раз/квартал";
  return "Баланс колеса жизни · 2–4 нед";
}
