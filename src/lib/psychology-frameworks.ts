/**
 * Психологические модели с доказательной базой (без эзотерики).
 */

export interface PermaScore {
  P: number; // Positive emotion
  E: number; // Engagement
  R: number; // Relationships
  M: number; // Meaning
  A: number; // Achievement
}

export function permaAverage(p: PermaScore): number {
  return Math.round(((p.P + p.E + p.R + p.M + p.A) / 5) * 10) / 10;
}

export function hasPermaScores(p: PermaScore | null | undefined): p is PermaScore {
  return p != null && typeof p.P === "number";
}

export function hasSdtScores(s: SdtScore | null | undefined): s is SdtScore {
  return s != null && typeof s.autonomy === "number";
}

export function hasBigFiveScores(
  b: Record<BigFiveTrait, number> | null | undefined,
): b is Record<BigFiveTrait, number> {
  return b != null && typeof b.O === "number";
}

export function hasRyffScores(r: RyffScore | null | undefined): r is RyffScore {
  return r != null && typeof r.autonomy === "number";
}

export function hasWho5Scores(w: Who5Score | null | undefined): w is Who5Score {
  return w != null && typeof w.cheerful === "number";
}

export function getPermaInsight(p: PermaScore): string[] {
  const insights: string[] = [];
  const entries = Object.entries(p).filter(([, v]) => typeof v === "number");
  if (!entries.length) return insights;
  const lowest = entries.sort((a, b) => a[1] - b[1])[0];
  const labels: Record<string, string> = {
    P: "Позитивные эмоции",
    E: "Вовлечённость (flow)",
    R: "Отношения",
    M: "Смысл",
    A: "Достижения",
  };
  insights.push(`Самая слабая зона PERMA: ${labels[lowest[0]]} (${lowest[1]}/10)`);
  if (p.R < 6) insights.push("Harvard 80+ лет: тёплые связи важнее статуса");
  if (p.M < 6) insights.push("Смысл: что для тебя «больше чем я»? Волонтёрство, творчество, семья");
  if (p.E < 6) insights.push("Flow: найди занятие на грани навыка и вызова (1.2× сложность)");
  return insights;
}

export interface IkigaiAnswers {
  love: string;
  goodAt: string;
  paidFor: string;
  worldNeeds: string;
}

export function getIkigaiInsight(a: IkigaiAnswers): string[] {
  const tips: string[] = [];
  if (!a.love) tips.push("Заполни: что любишь делать?");
  if (!a.goodAt) tips.push("Заполни: в чём сильна?");
  if (a.love && a.goodAt)
    tips.push("Пересечение «люблю + умею» → хобби с потенциалом монетизации");
  if (a.paidFor && a.worldNeeds)
    tips.push("Пересечение «платят + нужно миру» → карьерный вектор");
  if (a.love && a.paidFor)
    tips.push("Икигай ближе, когда досуг и работа хоть частично совпадают");
  return tips.length ? tips : ["Заполни 4 круга Икигай в настройках жизни"];
}

/** Упрощённый Big Five (TIPI-адаптация, 10 пунктов → 5 черт) */
export type BigFiveTrait = "O" | "C" | "E" | "A" | "N";

export const BIG_FIVE_META: Record<
  BigFiveTrait,
  { label: string; high: string; low: string; careerTip: string }
> = {
  O: {
    label: "Открытость",
    high: "Любопытство, идеи, творчество",
    low: "Практичность, традиции",
    careerTip: "Высокая O → исследование, дизайн, обучение",
  },
  C: {
    label: "Добросовестность",
    high: "Планирование, дисциплина",
    low: "Гибкость, спонтанность",
    careerTip: "Низкая C → система дневника критична для веса и финансов",
  },
  E: {
    label: "Экстраверсия",
    high: "Энергия от людей",
    low: "Энергия от одиночества",
    careerTip: "Низкая E → networking малыми дозами, 1:1",
  },
  A: {
    label: "Доброжелательность",
    high: "Эмпатия, кооперация",
    low: "Прямота, конкуренция",
    careerTip: "Высокая A → границы в работе, не перерабатывать «из вежливости»",
  },
  N: {
    label: "Нейротизм",
    high: "Чувствительность к стрессу",
    low: "Эмоциональная стабильность",
    careerTip: "Высокая N → сон, йога, не жёсткий дефицит — приоритет",
  },
};

export const BIG_FIVE_QUESTIONS: { id: string; trait: BigFiveTrait; text: string; reverse?: boolean }[] = [
  { id: "o1", trait: "O", text: "У меня богатое воображение" },
  { id: "c1", trait: "C", text: "Я организована и пунктуальна" },
  { id: "e1", trait: "E", text: "Я общительна и энергична в компании" },
  { id: "a1", trait: "A", text: "Я сочувствую другим" },
  { id: "n1", trait: "N", text: "Я часто переживаю и тревожусь" },
  { id: "o2", trait: "O", text: "Мне скучны абстрактные идеи", reverse: true },
  { id: "c2", trait: "C", text: "Я часто оставляю дела незавершёнными", reverse: true },
  { id: "e2", trait: "E", text: "Я предпочитаю быть в тени", reverse: true },
  { id: "a2", trait: "A", text: "Я могу быть грубой с другими", reverse: true },
  { id: "n2", trait: "N", text: "Я спокойна в стрессе", reverse: true },
];

export function scoreBigFive(answers: Record<string, number>): Record<BigFiveTrait, number> {
  const sums: Record<BigFiveTrait, number[]> = { O: [], C: [], E: [], A: [], N: [] };
  for (const q of BIG_FIVE_QUESTIONS) {
    const raw = answers[q.id] ?? 4;
    const scored = q.reverse ? 8 - raw : raw;
    sums[q.trait].push(scored);
  }
  return {
    O: avg(sums.O),
    C: avg(sums.C),
    E: avg(sums.E),
    A: avg(sums.A),
    N: avg(sums.N),
  };
}

function avg(nums: number[]): number {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 4;
}

export const MASLOW_LEVELS = [
  { level: 5, label: "Самоактуализация", emoji: "🌟", examples: "Творчество, смысл, рост" },
  { level: 4, label: "Уважение", emoji: "🏅", examples: "Достижения, признание, мастерство" },
  { level: 3, label: "Принадлежность", emoji: "🤝", examples: "Любовь, друзья, сообщество" },
  { level: 2, label: "Безопасность", emoji: "🛡️", examples: "Финансы, здоровье, стабильность" },
  { level: 1, label: "Физиология", emoji: "🍎", examples: "Сон, еда, вода, тело" },
];

export function getMaslowFocus(wheel: Record<string, number>): string {
  if ((wheel.health ?? 5) < 5 || (wheel.finance ?? 5) < 5)
    return "Сейчас фокус на основании: здоровье + финансовая подушка (уровни 1–2)";
  if ((wheel.relationships ?? 5) < 5)
    return "Укрепи связи (уровень 3) — это даёт энергию на всё остальное";
  return "Основание ок — время для роста и самоактуализации (4–5)";
}

/** Self-Determination Theory — Ryan & Deci */
export interface SdtScore {
  autonomy: number;
  competence: number;
  relatedness: number;
}

export const SDT_QUESTIONS: { key: keyof SdtScore; text: string }[] = [
  { key: "autonomy", text: "Я выбираю, что и как делать (автономия)" },
  { key: "competence", text: "Я чувствую рост мастерства в важных делах" },
  { key: "relatedness", text: "Я ощущаю поддержку и близость с людьми" },
];

export function sdtWeakest(s: SdtScore): keyof SdtScore {
  const entries = (Object.entries(s) as [keyof SdtScore, number][]).filter(
    ([, v]) => typeof v === "number",
  );
  if (!entries.length) return "autonomy";
  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

/** WHO-5 — скрининг благополучия (0–5 на пункт → 0–25) */
export interface Who5Score {
  cheerful: number;
  calm: number;
  active: number;
  rested: number;
  interested: number;
}

export const WHO5_QUESTIONS: { key: keyof Who5Score; text: string }[] = [
  { key: "cheerful", text: "Были ли хорошее настроение и весёлость" },
  { key: "calm", text: "Были ли спокойствие и расслабленность" },
  { key: "active", text: "Была ли энергия и бодрость" },
  { key: "rested", text: "Просыпалась ли отдохнувшей" },
  { key: "interested", text: "Был ли интерес к повседневным делам" },
];

export function who5RawTotal(w: Who5Score): number {
  return WHO5_QUESTIONS.reduce((s, q) => s + (w[q.key] ?? 0), 0);
}

export function who5Percent(w: Who5Score): number {
  return Math.round((who5RawTotal(w) / 25) * 100);
}

export function who5NeedsAttention(total: number): boolean {
  return total < 13;
}

/** Ryff Psychological Well-Being — 6 измерений (мини) */
export interface RyffScore {
  autonomy: number;
  growth: number;
  purpose: number;
  relations: number;
  selfAcceptance: number;
  environment: number;
}

export const RYFF_QUESTIONS: { key: keyof RyffScore; text: string }[] = [
  { key: "autonomy", text: "Я живу в согласии со своими убеждениями" },
  { key: "growth", text: "Я развиваюсь и открываю новое в себе" },
  { key: "purpose", text: "У меня есть цели и смысл в жизни" },
  { key: "relations", text: "У меня тёплые, доверительные отношения" },
  { key: "selfAcceptance", text: "Я принимаю себя со слабостями" },
  { key: "environment", text: "Я управляю повседневной жизнью и средой" },
];

/** ACT — выбор ценностей */
export const CORE_VALUES_OPTIONS = [
  { id: "health", label: "Здоровье", emoji: "❤️" },
  { id: "family", label: "Семья", emoji: "👨‍👩‍👧" },
  { id: "growth", label: "Рост", emoji: "🌱" },
  { id: "creativity", label: "Творчество", emoji: "🎨" },
  { id: "freedom", label: "Свобода", emoji: "🕊️" },
  { id: "connection", label: "Близость", emoji: "🤝" },
  { id: "achievement", label: "Достижения", emoji: "🏆" },
  { id: "adventure", label: "Приключения", emoji: "🌍" },
  { id: "stability", label: "Стабильность", emoji: "🛡️" },
  { id: "kindness", label: "Доброта", emoji: "💜" },
];

export function getValuesInsight(selected: string[]): string[] {
  if (!selected.length) return ["Выбери 3 ценности в настройках — коуч свяжет их с действиями"];
  const tips: string[] = [];
  if (selected.includes("health"))
    tips.push("Ценность «здоровье»: сон и белок — не наказание, а выражение ценности");
  if (selected.includes("connection"))
    tips.push("Ценность «близость»: 1 качественный контакт важнее 10 лайков");
  if (selected.includes("growth"))
    tips.push("Ценность «рост»: 20 мин навыка = действие из ценности, не из страха");
  return tips;
}
