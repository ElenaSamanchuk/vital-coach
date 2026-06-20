/**
 * Единый индекс знаний по всем сферам жизни.
 * Офлайн-база; каждый блок ссылается на evidence-library где применимо.
 */

import { CHECKUP } from "./product-copy";

export type KnowledgeDomain =
  | "medicine"
  | "nutrition"
  | "fitness"
  | "psychology"
  | "relationships"
  | "career"
  | "finance"
  | "intellect"
  | "creativity"
  | "leisure"
  | "spirituality"
  | "sleep";

export interface KnowledgeArticle {
  id: string;
  domain: KnowledgeDomain;
  title: string;
  summary: string;
  keyPoints: string[];
  actions: string[];
  evidence?: string;
}

export const DOMAIN_META: Record<KnowledgeDomain, { label: string; emoji: string; color: string }> = {
  medicine: { label: "Медицина", emoji: "🩺", color: "#ff3b30" },
  nutrition: { label: "Питание", emoji: "🥗", color: "#34c759" },
  fitness: { label: "Фитнес", emoji: "💪", color: "#5856d6" },
  psychology: { label: "Психология", emoji: "🧠", color: "#af52de" },
  relationships: { label: "Отношения", emoji: "💕", color: "#ff9500" },
  career: { label: "Карьера", emoji: "💼", color: "#0071e3" },
  finance: { label: "Финансы", emoji: "💰", color: "#30d158" },
  intellect: { label: "Интеллект", emoji: "📚", color: "#5e5ce6" },
  creativity: { label: "Творчество", emoji: "🎨", color: "#ff2d55" },
  leisure: { label: "Досуг", emoji: "🌿", color: "#32ade6" },
  spirituality: { label: "Духовность", emoji: "🕊️", color: "#bf5af2" },
  sleep: { label: "Сон", emoji: "😴", color: "#636366" },
};

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "ir-nutrition",
    domain: "nutrition",
    title: "Инсулинорезистентность и еда",
    summary: "Low-GI, белок, порядок приёма пищи, ходьба после углеводов",
    keyPoints: [
      "Белок 1,6–1,8 г/кг сохраняет мышцы в дефиците",
      "Крахмал — в первой половине дня при ИР",
      "Овощи и белок перед углеводами снижают пик глюкозы",
      "10–15 мин ходьбы после еды — доказанный эффект на глюкозу",
    ],
    actions: ["Выбери меню в коуче", "Чип «прогулка после еды» в дневнике"],
    evidence: "ADA Standards of Care; Mediterranean diet meta-analyses",
  },
  {
    id: "thyroid",
    domain: "medicine",
    title: "Щитовидка и вес",
    summary: "ТТГ, свТ4, УЗИ; тироксин натощак; не резать калории ниже 1500",
    keyPoints: [
      "Контроль ТТГ каждые 6–8 недель при смене дозы",
      "УЗИ щитовидки ежегодно при узлах/гипотиреозе",
      "Дефицит >750 ккал может ухудшить конверсию T4→T3",
    ],
    actions: [CHECKUP.knowledgeAction, "УЗИ в разделе «Здоровье»", "Чип тироксина в дневнике"],
    evidence: "ATA Guidelines",
  },
  {
    id: "pcos",
    domain: "medicine",
    title: "СПКЯ: комплексный подход",
    summary: "Силовая важнее длинного кардио; УЗИ таза; инсулин + гормоны день 3",
    keyPoints: [
      "УЗИ яичников + андрогены (день 3 цикла)",
      "Силовая 2–3×/нед улучшает чувствительность к инсулину",
      "Сон 7+ ч — влияет на андрогены",
    ],
    actions: ["Отметить СПКЯ в профиле", "Запланировать УЗИ таза"],
    evidence: "ESHRE PCOS Guidelines",
  },
  {
    id: "endometriosis",
    domain: "medicine",
    title: "Эндометриоз",
    summary: "УЗИ → МРТ при боли; восстановление; не «терпеть» через силу",
    keyPoints: [
      "МРТ малого таза — при подозрении на глубокий эндометриоз",
      "Цикл-синхронизация нагрузки в лютеиновой фазе",
      "Стресс усиливает боль — досуг и сон в приоритете",
    ],
    actions: ["Мягкий план в лютеиновой", "Досуг без KPI"],
    evidence: "ESHRE Endometriosis Guidelines",
  },
  {
    id: "strength-women",
    domain: "fitness",
    title: "Силовая для женщин 30+",
    summary: "Сохранение мышц в дефиците; кости; метаболизм",
    keyPoints: [
      "2–3 силовые + 2 кардио (вело/бассейн)",
      "После операции — постепенное возвращение",
      "Прогрессия нагрузки важнее длительности",
    ],
    actions: ["Выбрать тренировку в коуче", "Вело/бассейн в дневнике"],
    evidence: "ACSM Guidelines",
  },
  {
    id: "sleep-cbti",
    domain: "sleep",
    title: "Сон и восстановление",
    summary: "CBT-I: время подъёма, кровать только для сна, свет утром",
    keyPoints: [
      "7–9 ч — цель; хуже сон → хуже вес и кортизол",
      "Полисомнография при храпе/усталости",
      "Кофеин до 14:00 при чувствительности",
    ],
    actions: ["Сон в дневнике", "Обследование сна при необходимости"],
    evidence: "Morin CBT-I meta-analysis",
  },
  {
    id: "harvard-relations",
    domain: "relationships",
    title: "Качество связей",
    summary: "Harvard 80 лет: тёплые отношения — предиктор здоровья и счастья",
    keyPoints: [
      "1 глубокий разговор в неделю",
      "Безопасная привязанность через последовательность",
      "В поиске партнёра: качество > количество встреч",
    ],
    actions: ["Чипы отношений в дневнике", "Статус в настройках"],
    evidence: "Harvard Study of Adult Development",
  },
  {
    id: "career-sdt",
    domain: "career",
    title: "Карьера и мотивация",
    summary: "SDT: автономия, мастерство, связи — основа устойчивой мотивации",
    keyPoints: [
      "Границы от переработки",
      "1 навык в месяц измеримо",
      "Выгорание: истощение + цинизм — сигнал снизить план",
    ],
    actions: ["Чип «граница»", "Цель карьеры в профиле"],
    evidence: "Ryan & Deci SDT",
  },
  {
    id: "finance-cfpb",
    domain: "finance",
    title: "Финансовое благополучие",
    summary: "Подушка, автосбережение, обзор без осуждения",
    keyPoints: [
      "3–6 мес расходов — цель подушки",
      "«Если зарплата → 10% на счёт»",
      "24 ч пауза перед импульсной покупкой",
    ],
    actions: ["Чипы финансов", "Цель в настройках"],
    evidence: "CFPB Financial Well-Being",
  },
  {
    id: "intellect-flow",
    domain: "intellect",
    title: "Интеллект и обучение",
    summary: "Spaced repetition, flow, 15 мин/день лучше 2 ч раз в месяц",
    keyPoints: [
      "English: immersion 15 мин ежедневно",
      "Шахматы: стратегия и перерыв от экрана",
      "Код: пет-проект с измеримым результатом",
    ],
    actions: ["Сетка интеллекта в дневнике"],
    evidence: "Csikszentmihalyi Flow; spaced repetition research",
  },
  {
    id: "creativity",
    domain: "creativity",
    title: "Творчество без оценки",
    summary: "Процесс важнее результата; снижает кортизол",
    keyPoints: [
      "1 ч в неделю «только для себя»",
      "Готовка как творчество, не диета",
      "Рисование/музыка без публикации",
    ],
    actions: ["Чипы творчества в дневнике"],
    evidence: "PERMA Engagement",
  },
  {
    id: "leisure-recovery",
    domain: "leisure",
    title: "Досуг и восстановление",
    summary: "Psychological detachment от работы — обязательна",
    keyPoints: [
      "Вело/бассейн как радость, не KPI",
      "Природа снижает кортизол",
      "Социальное — бассейн с подругой",
    ],
    actions: ["Досуг в дневнике", "Досуг в колесе жизни"],
    evidence: "Recovery experience research",
  },
  {
    id: "spirituality-act",
    domain: "spirituality",
    title: "Смысл и ценности",
    summary: "ACT: жизнь по ценностям, не только по целям",
    keyPoints: [
      "3 ценности в профиле",
      "10 мин тишины/медитации",
      "Дневник благодарности: 3 пункта",
    ],
    actions: ["Ценности в настройках", "Чипы духовности"],
    evidence: "Hayes ACT",
  },
  {
    id: "mental-who5",
    domain: "psychology",
    title: "Эмоциональное благополучие",
    summary: "WHO-5 скрининг; PERMA; при низком балле — мягкий план",
    keyPoints: [
      "WHO-5 < 13 → не ужесточать дефицит",
      "Big Five — персонализация стресса",
      "Минимальный день — не срыв, а стратегия",
    ],
    actions: ["WHO-5 в настройках", "PERMA-тест"],
    evidence: "WHO-5; Seligman PERMA",
  },
];

export function articlesByDomain(domain: KnowledgeDomain): KnowledgeArticle[] {
  return KNOWLEDGE_ARTICLES.filter((a) => a.domain === domain);
}

export function articlesForHealthFlags(flags: Record<string, boolean>): KnowledgeArticle[] {
  const ids: string[] = [];
  if (flags.insulinResistance) ids.push("ir-nutrition");
  if (flags.hypothyroidism) ids.push("thyroid");
  if (flags.pcosSuspected) ids.push("pcos");
  if (flags.endometriosis) ids.push("endometriosis");
  if (flags.cortisolIssues) ids.push("sleep-cbti", "leisure-recovery");
  return KNOWLEDGE_ARTICLES.filter((a) => ids.includes(a.id));
}
