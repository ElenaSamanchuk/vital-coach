/**
 * Еженедельный обзор — синтез Gollwitzer (implementation intentions) + growth mindset.
 */

export interface WeeklyReviewAnswers {
  wins: string;
  lessons: string;
  nextWeekFocus: string;
  gratitude: string;
  sphereRating: number;
}

export const WEEKLY_REVIEW_PROMPTS = [
  { key: "wins" as const, label: "3 победы недели", placeholder: "Даже маленькие: прогулка, разговор, отложила…" },
  { key: "lessons" as const, label: "Что узнала?", placeholder: "Ошибка = данные (growth mindset)" },
  { key: "nextWeekFocus" as const, label: "Фокус на следующую неделю", placeholder: "1 сфера или 1 привычка" },
  { key: "gratitude" as const, label: "Благодарность", placeholder: "3 вещи или 1 человек" },
];

export function getWeeklyReviewInsight(answers: WeeklyReviewAnswers): string[] {
  const tips: string[] = [];
  if (answers.wins) tips.push("Победы зафиксированы — PERMA «Achievement» подпитан");
  if (answers.lessons) tips.push("Урок недели → скорректируй 1 привычку, не всю систему");
  if (answers.nextWeekFocus)
    tips.push(`Фокус «${answers.nextWeekFocus}»: если X = воскресенье вечер, то Y = план на неделю`);
  if (answers.sphereRating < 5)
    tips.push("Низкая оценка недели — минимальный план на 3 дня без вины");
  return tips;
}
