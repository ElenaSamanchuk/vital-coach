/**
 * «Бюджет тела» — уникальная метафора вместо «съешь дефицит».
 * Кошелёк ккал на день + мягкий долг со вчера.
 */

export interface BodyBudget {
  allowance: number;
  spent: number;
  remaining: number;
  overBy: number;
  yesterdayOver: number;
  forgivenKcal: number;
  weeklyCredit: number;
  weeklyCreditUsed: number;
  message: string;
}

const WEEKLY_CREDIT_POOL = 300;

export function computeBodyBudget(
  calorieTarget: number,
  consumed: number,
  yesterdayCalories?: number | null,
  yesterdayTarget?: number,
  weekOverDays = 0,
): BodyBudget {
  const remaining = Math.max(0, calorieTarget - consumed);
  const overBy = Math.max(0, consumed - calorieTarget);

  let yesterdayOver = 0;
  let forgivenKcal = 0;
  if (
    yesterdayCalories != null &&
    yesterdayTarget != null &&
    yesterdayCalories > yesterdayTarget * 1.08
  ) {
    yesterdayOver = yesterdayCalories - yesterdayTarget;
    forgivenKcal = Math.min(150, Math.round(yesterdayOver * 0.3));
  }

  let message: string;
  if (overBy > 0) {
    message = `Перебор ${overBy} ккал — не компенсируй голодом завтра, вернись к плану`;
  } else if (forgivenKcal > 0) {
    message = `Вчера было плотнее — сегодня +${forgivenKcal} ккал прощения уже в плане`;
  } else if (remaining < 200) {
    message = "Бюджет почти исчерпан — белок и овощи";
  } else {
    message = `Осталось ${remaining} ккал в бюджете дня`;
  }

  const weeklyCreditUsed = Math.min(WEEKLY_CREDIT_POOL, weekOverDays * 80);
  const weeklyCredit = WEEKLY_CREDIT_POOL - weeklyCreditUsed;

  if (weeklyCredit > 100 && overBy === 0) {
    message += ` · Недельный кредит ${weeklyCredit} ккал на ужин/событие`;
  }

  return {
    allowance: calorieTarget,
    spent: consumed,
    remaining,
    overBy,
    yesterdayOver,
    forgivenKcal,
    weeklyCredit,
    weeklyCreditUsed,
    message,
  };
}
