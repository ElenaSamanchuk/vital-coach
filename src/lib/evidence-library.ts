/**
 * Каталог доказательных моделей для жизненного коучинга.
 * Статическая база — офлайн, приватно. Позже можно подтянуть OpenAlex/Semantic Scholar по DOI.
 */

export type EvidenceLevel = "meta" | "rct" | "longitudinal" | "expert" | "mixed";

export interface ResearchFramework {
  id: string;
  name: string;
  authors: string;
  year: number;
  domains: string[];
  evidence: EvidenceLevel;
  summary: string;
  appHook: string;
  interventions: string[];
  doi?: string;
}

export const RESEARCH_FRAMEWORKS: ResearchFramework[] = [
  {
    id: "perma",
    name: "PERMA",
    authors: "Seligman",
    year: 2011,
    domains: ["psychology", "wellbeing"],
    evidence: "meta",
    summary: "5 столпов благополучия: эмоции, вовлечённость, отношения, смысл, достижения",
    appHook: "Настройки → PERMA-тест; слабый столп → советы в «Жизнь»",
    interventions: [
      "3 благодарности перед сном (P)",
      "1 час flow-занятия в неделю (E)",
      "1 качественный контакт без телефона (R)",
    ],
    doi: "10.1037/a0028776",
  },
  {
    id: "sdt",
    name: "Self-Determination Theory",
    authors: "Ryan & Deci",
    year: 2000,
    domains: ["motivation", "career", "health"],
    evidence: "meta",
    summary: "Автономия, компетентность, связанность — базовые потребности мотивации",
    appHook: "SDT-тест в настройках; низкая автономия → границы на работе",
    interventions: [
      "Выбери 1 задачу «по своей воле», не «надо»",
      "Микро-победа навыка 20 мин (компетентность)",
      "Сообщество/наставник 1×/нед (связанность)",
    ],
    doi: "10.1037/0003-066X.55.1.68",
  },
  {
    id: "harvard_connections",
    name: "Harvard Study of Adult Development",
    authors: "Waldinger et al.",
    year: 2015,
    domains: ["relationships", "longevity"],
    evidence: "longitudinal",
    summary: "80+ лет: качество близких связей — сильнейший предиктор счастья и здоровья",
    appHook: "Сфера «Отношения» в колесе; чипы в дневнике",
    interventions: [
      "1 глубокий разговор в неделю",
      "Благодарность конкретному человеку",
      "Новое знакомство без цели «результата»",
    ],
  },
  {
    id: "who5",
    name: "WHO-5 Well-Being Index",
    authors: "WHO",
    year: 1998,
    domains: ["mental_health", "screening"],
    evidence: "rct",
    summary: "5 вопросов — скрининг эмоционального благополучия; <13 → стоит обратиться к специалисту",
    appHook: "WHO-5 в настройках; низкий балл → мягкий план, не жёсткий дефицит",
    interventions: [
      "Сон 7+ ч при низком WHO-5",
      "Прогулка на солнце 20 мин",
      "Сократить изоляцию: 1 социальный контакт",
    ],
  },
  {
    id: "ryff",
    name: "Ryff Scales of PWB",
    authors: "Ryff",
    year: 1989,
    domains: ["psychology", "growth"],
    evidence: "longitudinal",
    summary: "6 измерений: автономия, рост, цель, отношения, принятие себя, управление средой",
    appHook: "Ryff-мини в «Жизнь»; слабое «управление средой» → сфера «Среда»",
    interventions: [
      "Еженедельный обзор целей (purpose)",
      "Принятие: 1 вещь «достаточно хорошо»",
      "15 мин порядка (environmental mastery)",
    ],
    doi: "10.1037/0022-3514.57.6.1069",
  },
  {
    id: "flow",
    name: "Flow Theory",
    authors: "Csikszentmihalyi",
    year: 1990,
    domains: ["creativity", "intellect", "leisure"],
    evidence: "mixed",
    summary: "Оптимальный опыт на грани навыка и вызова (~1.2× сложность)",
    appHook: "Творчество + интеллект в дневнике; шахматы/код/английский",
    interventions: [
      "Убрать отвлечения на 40 мин",
      "Занятие чуть сложнее комфорта",
      "Немедленная обратная связь (шахматы, код)",
    ],
  },
  {
    id: "growth_mindset",
    name: "Growth Mindset",
    authors: "Dweck",
    year: 2006,
    domains: ["growth", "career"],
    evidence: "rct",
    summary: "Усилия и стратегии развивают способности; ошибка = данные",
    appHook: "Достижение «Мягкость к себе»; обзор недели",
    interventions: [
      "После провала: «что я узнала?»",
      "Фокус на процесс, не только вес на весах",
      "1 навык в месяц — измеримый",
    ],
  },
  {
    id: "implementation_intentions",
    name: "Implementation Intentions",
    authors: "Gollwitzer",
    year: 1999,
    domains: ["habits", "finance", "health"],
    evidence: "meta",
    summary: "«Если X, то Y» удваивает вероятность выполнения намерений",
    appHook: "Финансы: «если зарплата → 10% на счёт»; еда: «если ужин → прогулка»",
    interventions: [
      "Если поднялась тревога → 5 дыханий + вода",
      "Если воскресенье → 15 мин обзор недели",
      "Если импульс купить → 24 ч пауза",
    ],
    doi: "10.1037/0003-066X.54.7.493",
  },
  {
    id: "cbt_i",
    name: "CBT-I (сон)",
    authors: "Morin et al.",
    year: 2006,
    domains: ["health", "energy"],
    evidence: "meta",
    summary: "Когнитивно-поведенческая терапия бессонницы — золотой стандарт без таблеток",
    appHook: "Сон в дневнике; кортизол/щитовидка → приоритет сна над дефицитом",
    interventions: [
      "Одно время подъёма ±30 мин",
      "Кровать только для сна",
      "Нет кофе после 14:00 при плохом сне",
    ],
  },
  {
    id: "social_prescribing",
    name: "Social Prescribing",
    authors: "WHO / UK NHS",
    year: 2019,
    domains: ["relationships", "health"],
    evidence: "mixed",
    summary: "Социальная активность как «рецепт» для здоровья — не менее важна физнагрузки",
    appHook: "Досуг + отношения; бассейн/вело с другом",
    interventions: [
      "Групповое занятие (бассейн, йога)",
      "Волонтёрство 2 ч/мес",
      "Клуб по интересам (шахматы, язык)",
    ],
  },
  {
    id: "financial_wellbeing",
    name: "Financial Well-Being",
    authors: "CFPB",
    year: 2015,
    domains: ["finance"],
    evidence: "expert",
    summary: "Контроль над финансами + цели + свобода выбора = субъективное благополучие",
    appHook: "Чипы финансов в дневнике; цель в настройках",
    interventions: [
      "Автоперевод в день зарплаты",
      "Подушка 1 мес расходов → потом 3–6",
      "«Достаточно» вместо «идеально» в бюджете",
    ],
  },
  {
    id: "burnout_maslach",
    name: "Burnout (Maslach)",
    authors: "Maslach & Leiter",
    year: 2016,
    domains: ["career", "health"],
    evidence: "longitudinal",
    summary: "Истощение + цинизм + снижение эффективности — триада выгорания",
    appHook: "Граница в дневнике; низкая удовлетворённость работой 3 дня → минимальный день",
    interventions: [
      "1 день без «догоняния» задач",
      "Делегировать или отказать 1 раз",
      "Восстановление: сон > продуктивность",
    ],
  },
  {
    id: "blue_zones",
    name: "Blue Zones / Ikigai",
    authors: "Buettner",
    year: 2012,
    domains: ["longevity", "spirituality", "relationships"],
    evidence: "mixed",
    summary: "Долгожители: движение, растительная еда, смысл, крепкие связи, стресс-ритуалы",
    appHook: "Икигай в настройках; духовность в дневнике",
    interventions: [
      "Ритуал снижения стресса ежедневно",
      "Еда до 80% сытости",
      "«Правильный круг» — 5 близких людей",
    ],
  },
  {
    id: "attachment",
    name: "Attachment Theory",
    authors: "Bowlby / Mikulincer",
    year: 2003,
    domains: ["relationships"],
    evidence: "longitudinal",
    summary: "Безопасная привязанность строится через последовательность и эмоциональную доступность",
    appHook: "Советы по отношениям зависят от статуса в настройках",
    interventions: [
      "Назвать потребность прямо, без обвинений",
      "Ответить на сообщение близкого в тот же день",
      "Репарация после конфликта в 24 ч",
    ],
  },
  {
    id: "act_values",
    name: "ACT / Ценности",
    authors: "Hayes",
    year: 2006,
    domains: ["spirituality", "psychology"],
    evidence: "rct",
    summary: "Жизнь по ценностям, не только по целям; принятие дискомфорта на пути к важному",
    appHook: "Выбор 3 ценностей в настройках; рефлексия в дневнике",
    interventions: [
      "1 действие из ценности «здоровье» сегодня",
      "Заметить мысль, не спорить — вернуться к действию",
      "«Что важно для меня в этой ситуации?»",
    ],
  },
];

export function frameworksForSphere(sphere: string): ResearchFramework[] {
  const map: Record<string, string[]> = {
    health: ["who5", "cbt_i", "implementation_intentions"],
    career: ["sdt", "burnout_maslach", "growth_mindset"],
    finance: ["financial_wellbeing", "implementation_intentions"],
    intellect: ["flow", "growth_mindset"],
    creativity: ["flow", "perma"],
    relationships: ["harvard_connections", "attachment", "social_prescribing"],
    spirituality: ["act_values", "blue_zones", "perma"],
    leisure: ["flow", "social_prescribing"],
    environment: ["ryff", "implementation_intentions"],
    growth: ["ryff", "growth_mindset", "act_values"],
  };
  const ids = map[sphere] ?? ["perma"];
  return RESEARCH_FRAMEWORKS.filter((f) => ids.includes(f.id));
}

export function getTopInterventionsForDomains(domains: string[], limit = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const fw of RESEARCH_FRAMEWORKS) {
    if (!fw.domains.some((d) => domains.includes(d))) continue;
    for (const i of fw.interventions) {
      if (!seen.has(i)) {
        seen.add(i);
        out.push(i);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
