/** Опрос досуга — 3 вопроса для точнее рекомендаций */

export interface LeisureQuizAnswers {
  energy: "low" | "mid" | "high";
  company: "solo" | "friends" | "partner";
  setting: "home" | "nature" | "city";
  completedAt?: string;
}

export const QUIZ_QUESTIONS = [
  {
    id: "energy" as const,
    label: "Сколько сил сейчас?",
    options: [
      { id: "low" as const, label: "Мало — хочу мягко" },
      { id: "mid" as const, label: "Средне" },
      { id: "high" as const, label: "Много — активность" },
    ],
  },
  {
    id: "company" as const,
    label: "С кем хочется?",
    options: [
      { id: "solo" as const, label: "Одна" },
      { id: "friends" as const, label: "Друзья" },
      { id: "partner" as const, label: "Партнёр / семья" },
    ],
  },
  {
    id: "setting" as const,
    label: "Где комфортнее?",
    options: [
      { id: "home" as const, label: "Дом / балкон" },
      { id: "nature" as const, label: "Природа / дача" },
      { id: "city" as const, label: "Город / кафе" },
    ],
  },
];

export function parseLeisureQuiz(raw: string | null | undefined): LeisureQuizAnswers | null {
  if (!raw || raw === "{}") return null;
  try {
    const j = JSON.parse(raw) as LeisureQuizAnswers;
    return j.energy ? j : null;
  } catch {
    return null;
  }
}

export function quizCatalogBoost(q: LeisureQuizAnswers): string[] {
  const ids: string[] = [];
  if (q.energy === "low") ids.push("balcony_chill", "cinema", "bath_ritual", "draw_home");
  if (q.energy === "high") ids.push("ebike", "gym", "forest", "pool");
  if (q.company === "friends") ids.push("anticafe", "conference", "cafe");
  if (q.company === "partner") ids.push("family_movie", "banya", "travel_plan");
  if (q.setting === "home") ids.push("home_workout", "recipe", "relax_music");
  if (q.setting === "nature") ids.push("dacha", "hammock", "firepit", "garden");
  if (q.setting === "city") ids.push("park", "cinema", "anticafe");
  return ids;
}
