/**
 * Кейсы отношений — attachment, Gottman, Harvard study.
 */

export interface RelationshipCase {
  id: string;
  title: string;
  forStatus: ("single_searching" | "single_open" | "in_relationship" | "married" | "developing" | "all")[];
  situation: string;
  action: string;
  result: string;
  evidence: string;
}

export const RELATIONSHIP_CASES: RelationshipCase[] = [
  {
    id: "bid-response",
    title: "Ответ на «заявку на связь» в тот же день",
    forStatus: ["in_relationship", "married", "developing"],
    situation: "Партнёр написал/позвал — занята",
    action: "Даже «вижу, отвечу вечером» — не игнор",
    result: "Накопление «поворотов к» вместо «от» (Gottman)",
    evidence: "Gottman — bids for connection; 5:1 positive ratio",
  },
  {
    id: "gratitude-specific",
    title: "Благодарность конкретная",
    forStatus: ["in_relationship", "married", "developing", "all"],
    situation: "Отношения «в рутине»",
    action: "Раз в неделю: «спасибо за ___» — одна конкретная вещь",
    result: "PERMA Relationships ↑; меньше критики",
    evidence: "Seligman gratitude interventions; Gottman",
  },
  {
    id: "single-expand",
    title: "1 новое социальное действие/нед",
    forStatus: ["single_searching", "single_open"],
    situation: "Круг узкий, мало знакомств",
    action: "Клуб (шахматы, вело, язык), волонтёрство 2ч, друзья друзей",
    result: "Расширение слабых связей без «охоты на пару»",
    evidence: "Harvard Study; weak ties (Granovetter)",
  },
  {
    id: "clarity-three",
    title: "3 качества партнёра на бумаге",
    forStatus: ["single_searching"],
    situation: "Встречаешь «не тех»",
    action: "Написать 3 must-have и 3 deal-breaker; перечитывать перед свиданием",
    result: "Меньше компромиссов из одиночества",
    evidence: "Attachment theory — conscious partner selection",
  },
  {
    id: "repair-24h",
    title: "Ремонт после ссоры за 24 ч",
    forStatus: ["in_relationship", "married", "developing"],
    situation: "Конфликт не закрыт",
    action: "«Мне важно…» без «ты всегда»; извинение за свою часть",
    result: "Безопасная привязанность не рвётся",
    evidence: "Gottman repair attempts; attachment repair",
  },
  {
    id: "quality-time",
    title: "2 ч без телефонов",
    forStatus: ["in_relationship", "married", "developing"],
    situation: "Физически вместе, ментально нет",
    action: "Свидание по расписанию: прогулка, готовка, вело",
    result: "Глубина > количество часов рядом",
    evidence: "Harvard — quality of close relationships",
  },
];

export function casesForStatus(status: string): RelationshipCase[] {
  return RELATIONSHIP_CASES.filter(
    (c) => c.forStatus.includes("all") || c.forStatus.includes(status as RelationshipCase["forStatus"][number]),
  );
}
