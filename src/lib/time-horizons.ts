import { GENERIC_PROFILE } from "./app-config";

import {
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";

export interface TimeHorizonRing {
  id: string;
  label: string;
  daysPassed: number;
  daysLeft: number;
  daysTotal: number;
  /** Доля оставшихся дней (0–1) */
  progress: number;
  color: string;
  urgency: "low" | "mid" | "high";
}

export interface SeasonInfo {
  key: "spring" | "summer" | "autumn" | "winter";
  label: string;
  emoji: string;
  start: Date;
  end: Date;
}

export function getSeason(now: Date = new Date()): SeasonInfo {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (m >= 2 && m <= 4) {
    return {
      key: "spring",
      label: "Весна",
      emoji: "🌸",
      start: new Date(y, 2, 1),
      end: new Date(y, 4, 31, 23, 59, 59),
    };
  }
  if (m >= 5 && m <= 7) {
    return {
      key: "summer",
      label: "Лето",
      emoji: "☀️",
      start: new Date(y, 5, 1),
      end: new Date(y, 7, 31, 23, 59, 59),
    };
  }
  if (m >= 8 && m <= 10) {
    return {
      key: "autumn",
      label: "Осень",
      emoji: "🍂",
      start: new Date(y, 8, 1),
      end: new Date(y, 10, 30, 23, 59, 59),
    };
  }
  if (m === 11) {
    return {
      key: "winter",
      label: "Зима",
      emoji: "❄️",
      start: new Date(y, 11, 1),
      end: new Date(y + 1, 1, 28, 23, 59, 59),
    };
  }
  return {
    key: "winter",
    label: "Зима",
    emoji: "❄️",
    start: new Date(y - 1, 11, 1),
    end: new Date(y, 1, 28, 23, 59, 59),
  };
}

function estimateLifeExpectancyAge(birthYear: number, sex: "female" | "male" = "female"): number {
  const age = new Date().getFullYear() - birthYear;
  let targetAge = sex === "male" ? 72 : 81;
  if (age >= 50) targetAge = sex === "male" ? 76 : 86;
  if (age >= 65) targetAge = sex === "male" ? 80 : 89;
  return Math.max(age + 5, targetAge);
}

export function formatDays(n: number): string {
  return n.toLocaleString("ru-RU");
}

/** Компактно для центра кольца */
export function formatDaysCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}М`;
  if (n >= 10_000) return `${Math.round(n / 1000)}к`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}к`;
  return String(n);
}

function periodStats(periodStart: Date, periodEnd: Date, today: Date) {
  const start = startOfDay(periodStart);
  const end = startOfDay(periodEnd);
  const total = differenceInCalendarDays(end, start) + 1;
  const passed = Math.max(0, Math.min(total, differenceInCalendarDays(today, start) + 1));
  const left = Math.max(0, differenceInCalendarDays(end, today) + 1);
  return { passed, left, total };
}

export function buildTimeHorizonRings(ctx: {
  birthYear?: number;
  now?: Date;
}): TimeHorizonRing[] {
  const today = startOfDay(ctx.now ?? new Date());
  const birthYear =
    ctx.birthYear && ctx.birthYear > 1920 ? ctx.birthYear : GENERIC_PROFILE.birthYear;

  const birth = new Date(birthYear, 0, 1);
  const lifeEndAge = estimateLifeExpectancyAge(birthYear);
  const lifeEnd = startOfDay(addYears(birth, lifeEndAge));
  const life = periodStats(birth, lifeEnd, today);

  const season = getSeason(today);
  const seasonStats = periodStats(season.start, season.end, today);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = endOfMonth(today);
  const monthStats = periodStats(monthStart, monthEnd, today);

  const weekStart = startOfWeek(today, { weekStartsOn: 1, locale: ru });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1, locale: ru });
  const weekStats = periodStats(weekStart, weekEnd, today);

  const monthNames = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];

  const ring = (
    id: string,
    label: string,
    stats: { passed: number; left: number; total: number },
    color: string,
    urgency: TimeHorizonRing["urgency"],
  ): TimeHorizonRing => ({
    id,
    label,
    daysPassed: stats.passed,
    daysLeft: stats.left,
    daysTotal: stats.total,
    progress: stats.total > 0 ? stats.left / stats.total : 0,
    color,
    urgency,
  });

  return [
    ring("life", "Жизнь", life, "var(--purple)", life.left / life.total < 0.55 ? "mid" : "low"),
    ring(
      "season",
      season.label,
      seasonStats,
      "var(--warning)",
      seasonStats.left / seasonStats.total < 0.25
        ? "high"
        : seasonStats.left / seasonStats.total < 0.5
          ? "mid"
          : "low",
    ),
    ring(
      "month",
      monthNames[today.getMonth()],
      monthStats,
      "var(--accent)",
      monthStats.left / monthStats.total < 0.2
        ? "high"
        : monthStats.left / monthStats.total < 0.4
          ? "mid"
          : "low",
    ),
    ring(
      "week",
      "Неделя",
      weekStats,
      "var(--success)",
      weekStats.left / weekStats.total < 0.3 ? "high" : "low",
    ),
  ];
}

export function timeHorizonMotivation(rings: TimeHorizonRing[]): string {
  const week = rings.find((r) => r.id === "week");
  const season = rings.find((r) => r.id === "season");
  if (week && week.daysLeft <= 2) {
    return `На неделе осталось ${formatDays(week.daysLeft)} дн. — главное сегодня.`;
  }
  if (season && season.daysLeft / season.daysTotal < 0.25) {
    return `${season.label}: осталось ${formatDays(season.daysLeft)} дн. — не откладывай.`;
  }
  const life = rings.find((r) => r.id === "life");
  if (life) {
    return `Прошло ${formatDays(life.daysPassed)} дн. · впереди ~${formatDays(life.daysLeft)} дн.`;
  }
  return "Каждый день на счету.";
}
