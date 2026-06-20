/**
 * Поведенческая психология для устойчивого похудения:
 * мотивация, стресс, «минимальный день», когнитивные рамки.
 */
import type { WeeklyInsights } from "./types";

export interface PsychologyState {
  energy: number;
  mood: number;
  stress: number;
  cortisolFeeling: number;
}

export interface PsychologyCoach {
  headline: string;
  message: string;
  reframe: string;
  minimumDay: boolean;
  habits: string[];
  avoid: string[];
}

export function getPsychologyCoach(
  state: PsychologyState,
  insights: WeeklyInsights | null,
  cyclePhase: string | null,
  streakDays: number,
): PsychologyCoach {
  const { energy, mood, stress, cortisolFeeling } = state;
  const minimumDay = stress >= 7 || mood <= 4 || energy <= 4 || cortisolFeeling >= 8;

  let headline = "Сегодня обычный рабочий день";
  let message = "Один шаг за раз: план готов, решения уже приняты.";
  let reframe = "Прогресс — это тренд за недели, не один день на весах.";
  const habits: string[] = [];
  const avoid: string[] = [];

  if (minimumDay) {
    headline = "Минимальный день — это тоже победа";
    message =
      "Не нужно «идеально». Сохрани белок, воду и 10 мин движения — остальное вторично.";
    reframe = "Срыв диеты из-за перфекционизма хуже, чем спокойный неидеальный день.";
    habits.push("Белок хотя бы в 2 приёма");
    habits.push("10 мин прогулка или растяжка");
    habits.push("Заполнить дневник — 2 минуты");
    avoid.push("Жёсткое кардио и новый дефицит");
    avoid.push("Взвешивание при плохом настроении");
  } else if (mood >= 7 && energy >= 7) {
    headline = "Хороший ресурс — используй с умом";
    message = "Энергия есть — силовая или вело, но не «отработать» вину за вчера.";
    reframe = "Движение как досуг усиливает привычку, а не выгорание.";
    habits.push("Тренировка из плана или альтернатива на выбор");
    habits.push("Отметить что понравилось в активности");
  }

  if (cyclePhase === "luteal" && mood <= 5) {
    message += " Лютеиновая фаза: раздражительность и голод — нормальны, не слабость характера.";
    reframe = "+1–3 кг воды ≠ ты «сломала» план.";
    avoid.push("Паника из-за веса");
  }

  if (insights?.slipping.some((s) => s.key === "stress")) {
    message += " Неделя показала высокий стресс — сегодня приоритет сну и спокойной активности.";
    habits.push("10 мин дыхания (4-7-8 или box breathing)");
  }

  if (insights?.slipping.some((s) => s.key === "sleep")) {
    habits.push("Лечь на 30 мин раньше — важнее утренней тренировки");
  }

  if (streakDays >= 3) {
    reframe = `${streakDays} дней подряд с записями — идентичность «я тот, кто ведёт систему» уже формируется.`;
  }

  if (insights?.wins.length) {
    message += ` Работает: ${insights.wins.slice(0, 2).join("; ")}.`;
  }

  return { headline, message, reframe, minimumDay, habits, avoid };
}

export function getMoodPresets(): { label: string; energy: number; mood: number; stress: number }[] {
  return [
    { label: "😊 Отлично", energy: 8, mood: 8, stress: 3 },
    { label: "😐 Нормально", energy: 6, mood: 6, stress: 5 },
    { label: "😴 Устала", energy: 4, mood: 5, stress: 6 },
    { label: "😤 Стресс", energy: 5, mood: 4, stress: 8 },
    { label: "🩸 ПМС/цикл", energy: 4, mood: 4, stress: 7 },
  ];
}
