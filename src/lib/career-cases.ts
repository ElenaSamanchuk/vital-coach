/**
 * Рабочие кейсы карьеры — из исследований SDT, deliberate practice, networking.
 */

export interface CareerCase {
  id: string;
  title: string;
  situation: string;
  action: string;
  result: string;
  evidence: string;
  timeframe: string;
}

export const CAREER_CASES: CareerCase[] = [
  {
    id: "skill-20min",
    title: "20 минут навыка ежедневно",
    situation: "Нет времени на «курсы»",
    action: "Каждый день 20 мин одного навыка (English, код, доменная экспертиза) — одно и то же время",
    result: "Через 3 мес — измеримый уровень; через год — смена роли или дохода",
    evidence: "Deliberate practice (Ericsson); SDT competence need",
    timeframe: "3–12 мес",
  },
  {
    id: "boundary-email",
    title: "Граница «после 19:00 — нет рабочей почты»",
    situation: "Выгорание, нет энергии на жизнь",
    action: "Implementation intention: если 19:00 → телефон в другую комнату; автоответ «отвечу завтра»",
    result: "Сон ↑, продуктивность в рабочие часы ↑ (не ↓)",
    evidence: "Maslach burnout recovery; sleep & performance meta",
    timeframe: "2–4 нед",
  },
  {
    id: "one-network",
    title: "1 полезный контакт в неделю",
    situation: "Карьера стоит, нет видимости",
    action: "Каждую пятницу: 1 сообщение благодарности / 1 кофе 1:1 / 1 пост о кейсе",
    result: "Слабые связи → возможности (Granovetter)",
    evidence: "Strength of weak ties; SDT relatedness",
    timeframe: "2–6 мес",
  },
  {
    id: "portfolio-win",
    title: "1 win в портфолио в месяц",
    situation: "Нет ощущения роста",
    action: "Зафиксировать проект, метрику, отзыв — в Notion/LinkedIn",
    result: "Переговоры о повышении с данными, не с эмоциями",
    evidence: "Achievement motivation; PERMA Accomplishment",
    timeframe: "1 мес / win",
  },
  {
    id: "deep-work-block",
    title: "Блок глубокой работы 90 мин",
    situation: "День уходит на мелочь",
    action: "Утро: 90 мин без мессенджеров на главную задачу",
    result: "1 важная задача/день = 20/мес",
    evidence: "Cal Newport deep work; flow (Csikszentmihalyi)",
    timeframe: "1 нед привычка",
  },
];
