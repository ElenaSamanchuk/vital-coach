/**
 * Колесо жизни (Wheel of Life) + сферы развития.
 * Основа: коучинг Wheel of Life, PERMA (Seligman), SDT (Ryan & Deci).
 */

export type SphereKey =
  | "health"
  | "career"
  | "finance"
  | "intellect"
  | "creativity"
  | "relationships"
  | "spirituality"
  | "leisure"
  | "environment"
  | "growth";

export interface LifeSphere {
  key: SphereKey;
  label: string;
  emoji: string;
  color: string;
  description: string;
  research: string;
}

export const LIFE_SPHERES: LifeSphere[] = [
  {
    key: "health",
    label: "Здоровье",
    emoji: "❤️",
    color: "#ff3b30",
    description: "Тело, анализы, сон, энергия",
    research: "WHO: физическая активность 150 мин/нед снижает риски НИЗ",
  },
  {
    key: "career",
    label: "Карьера",
    emoji: "💼",
    color: "#5856d6",
    description: "Работа, навыки, смысл, рост",
    research: "Self-Determination Theory: автономия + мастерство → мотивация",
  },
  {
    key: "finance",
    label: "Финансы",
    emoji: "💰",
    color: "#34c759",
    description: "Доход, подушка, инвестиции, осознанность",
    research: "Behavioral economics: автосбережение ↑ финансовое благополучие",
  },
  {
    key: "intellect",
    label: "Интеллект",
    emoji: "🧠",
    color: "#0071e3",
    description: "Языки, шахматы, код, обучение",
    research: "Cognitive reserve: обучение в зрелом возрасте ↓ когнитивный спад",
  },
  {
    key: "creativity",
    label: "Творчество",
    emoji: "🎨",
    color: "#ff2d55",
    description: "Рисование, музыка, кулинария, созидание",
    research: "Flow (Csikszentmihalyi): творчество ↑ субъективное благополучие",
  },
  {
    key: "relationships",
    label: "Отношения",
    emoji: "🤝",
    color: "#ff9500",
    description: "Партнёр, друзья, семья, границы",
    research: "Harvard Study of Adult Development: связи — главный предиктор счастья",
  },
  {
    key: "spirituality",
    label: "Духовность",
    emoji: "🕊️",
    color: "#af52de",
    description: "Смысл, медитация, ценности, тишина",
    research: "PERMA: Meaning — один из 5 столпов благополучия (Seligman)",
  },
  {
    key: "leisure",
    label: "Досуг",
    emoji: "🌿",
    color: "#30d158",
    description: "Отдых без KPI, природа, радость",
    research: "Recovery experience: психологическая детachment от работы",
  },
  {
    key: "environment",
    label: "Среда",
    emoji: "🏠",
    color: "#00c7be",
    description: "Дом, порядок, эстетика, пространство",
    research: "Environmental psychology: порядок ↓ кортизол (умеренный эффект)",
  },
  {
    key: "growth",
    label: "Рост",
    emoji: "🌱",
    color: "#ffd60a",
    description: "Привычки, коучинг, рефлексия, цели",
    research: "Growth mindset (Dweck): усилия → способности",
  },
];

export type WheelScores = Partial<Record<SphereKey, number>>;

export function getWheelAverage(scores: WheelScores): number {
  const vals = Object.values(scores).filter((v) => v != null) as number[];
  if (!vals.length) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export function getLowestSpheres(scores: WheelScores, n = 3): SphereKey[] {
  return (Object.entries(scores) as [SphereKey, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([k]) => k);
}

export type RelationshipStatus =
  | "single_searching"
  | "single_open"
  | "in_relationship"
  | "married"
  | "developing";

export const RELATIONSHIP_LABELS: Record<RelationshipStatus, string> = {
  single_searching: "В поиске партнёра",
  single_open: "Один, открыта дружбе",
  in_relationship: "В отношениях",
  married: "Семья / брак",
  developing: "Развиваю текущие отношения",
};

export interface SphereAdvice {
  sphere: SphereKey;
  title: string;
  actions: string[];
  weeklyGoal: string;
  research: string;
}

export function getSphereAdvice(
  key: SphereKey,
  ctx: {
    occupation: string;
    relationshipStatus: RelationshipStatus;
    score: number;
    pcos: boolean;
    stressHigh: boolean;
  },
): SphereAdvice {
  const base: Record<SphereKey, SphereAdvice> = {
    health: {
      sphere: "health",
      title: "Здоровье и тело",
      actions: [
        "Белок 150 г + вода 2,5 л — база",
        "2 силовые + 2 кардио (вело/бассейн)",
        "Анализы по расписанию во вкладке «Анализы»",
      ],
      weeklyGoal: "4 тренировки + 5 дней дневника",
      research: "Дефицит 500–750 ккал + белок сохраняет мышцы",
    },
    career: {
      sphere: "career",
      title: "Карьера и работа",
      actions: ctx.occupation
        ? [`Прокачка в «${ctx.occupation}»: 1 навык в месяц`, "30 мин обучения в день", "1 полезный контакт в неделю"]
        : ["Опиши род занятий в настройках", "Определи 1 навык на квартал", "LinkedIn/портфолио 20 мин/нед"],
      weeklyGoal: "5 часов развития навыка + 1 рабочий win в дневнике",
      research: "SDT: выбирай задачи с элементом автономии",
    },
    finance: {
      sphere: "finance",
      title: "Финансы",
      actions: [
        "Подушка: цель 3–6 мес расходов",
        "Правило 50/30/20 или упрощённо: 20% → сбережения",
        "Раз в неделю: 15 мин обзор трат (без осуждения)",
      ],
      weeklyGoal: "1 финансовое действие в дневнике",
      research: "Implementation intentions: «если зарплата → 10% на счёт»",
    },
    intellect: {
      sphere: "intellect",
      title: "Интеллект",
      actions: [
        "Шахматы 2×/нед — стратегия",
        "English 15 мин/день — immersion",
        "Код/пет-проект 3×/нед по 40 мин",
      ],
      weeklyGoal: "5 сессий разума в дневнике",
      research: "Spaced repetition для языков",
    },
    creativity: {
      sphere: "creativity",
      title: "Творчество",
      actions: [
        "Рисование/музыка без оценки результата",
        "Кулинария как творчество, не диета",
        "1 час в неделю «только для себя»",
      ],
      weeklyGoal: "2 творческих сессии",
      research: "Flow: баланс сложности и навыка",
    },
    relationships: {
      sphere: "relationships",
      title: "Отношения",
      actions:
        ctx.relationshipStatus === "single_searching"
          ? [
              "Расширь круг: 1 новое социальное действие/нед",
              "Ясность: что ищешь в партнёре (3 качества)",
              "Не снижай стандарты из-за спешки — Harvard: качество связей",
            ]
          : ctx.relationshipStatus === "developing" || ctx.relationshipStatus === "in_relationship"
            ? [
                "1 разговор «по душам» без телефонов в неделю",
                "Благодарность: 1 конкретная вещь партнёру/другу",
                "Совместный досуг из списка (вело, кино, готовка)",
              ]
            : [
                "1 встреча с другом вживую",
                "Границы: сказать «нет» без оправданий",
                "Качество > количество контактов",
              ],
      weeklyGoal: "2 действия для связей",
      research: "Attachment theory: безопасность через последовательность",
    },
    spirituality: {
      sphere: "spirituality",
      title: "Духовность и смысл",
      actions: [
        "10 мин тишины/медитации утром",
        "Дневник благодарности: 3 пункта",
        "Прогулка без подкаста — «ничегонеделание»",
      ],
      weeklyGoal: "5 дней духовной практики (любой формат)",
      research: "PERMA: Meaning — принадлежность к чему-то большему",
    },
    leisure: {
      sphere: "leisure",
      title: "Досуг",
      actions: [
        "Вело/бассейн как радость, не KPI",
        "Кино/книга без чувства вины",
        "Сап/природа — перезагрузка кортизола",
      ],
      weeklyGoal: "3 блока досуга без телефона",
      research: "Recovery: psychological detachment от работы",
    },
    environment: {
      sphere: "environment",
      title: "Среда и порядок",
      actions: [
        "15 мин сортировки 3×/нед",
        "Рабочее место: только нужное на столе",
        "Уют: свет, растение, одна зона «красиво»",
      ],
      weeklyGoal: "1 сессия порядка",
      research: "Среда влияет на импульсные решения (еда, покупки)",
    },
    growth: {
      sphere: "growth",
      title: "Личный рост",
      actions: [
        "Дневник каждый вечер — главная привычка",
        "1 книга/месяц по психологии или навыку",
        "Еженедельный обзор: что сработало?",
      ],
      weeklyGoal: "7/7 записей + 15 мин обзор в воскресенье",
      research: "Growth mindset: ошибка = данные, не приговор",
    },
  };

  const advice = { ...base[key] };
  if (ctx.stressHigh && (key === "career" || key === "health")) {
    advice.actions = ["Минимальный день: сон + прогулка", ...advice.actions.slice(0, 2)];
  }
  if (ctx.pcos && key === "health") {
    advice.actions.unshift("СПКЯ: силовая важнее длинного кардио");
  }
  if (ctx.score > 0 && ctx.score <= 4) {
    advice.title += ` (оценка ${ctx.score}/10 — приоритет)`;
  }
  return advice;
}
