/**
 * Путь пользователя: от регистрации к мастерству системы.
 * Постепенное усложнение — не всё сразу.
 */

import { GENERIC_MODE } from "./app-config";
import { CHECKUP } from "./product-copy";

export type JourneyPhase = 1 | 2 | 3 | 4 | 5;

export interface JourneyStep {
  id: string;
  phase: JourneyPhase;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  hrefLabel: string;
  icon: string;
  unlockHint?: string;
}

export const JOURNEY_PHASES: { phase: JourneyPhase; label: string; weeks: string }[] = [
  { phase: 1, label: "Старт", weeks: "День 1–3" },
  { phase: 2, label: "Ритм", weeks: "Неделя 1" },
  { phase: 3, label: "Глубина", weeks: "Неделя 2–4" },
  { phase: 4, label: "Система", weeks: "Месяц 2" },
  { phase: 5, label: "Мастерство", weeks: "Постоянно" },
];

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "onboarding",
    phase: 1,
    title: "Пройти стартовый тест",
    subtitle: "8 шагов — весь профиль",
    description: "Тело, здоровье, колесо жизни, цели. Коуч строит план только отсюда.",
    href: "/onboarding",
    hrefLabel: "Тест",
    icon: "🚀",
  },
  {
    id: "first_log",
    phase: 1,
    title: "Первый дневник",
    subtitle: "5 минут",
    description: "Вес, настроение, сон — минимум. Не обязательно идеально.",
    href: "/log",
    hrefLabel: "Дневник",
    icon: "📝",
  },
  {
    id: "coach_plan",
    phase: 1,
    title: "Выбрать еду и тренировку",
    subtitle: "На главной",
    description: "Меню и активность на выбор — без жёстких диет.",
    href: "/",
    hrefLabel: "Коуч",
    icon: "🎯",
  },
  {
    id: "wheel_save",
    phase: 2,
    title: "Сохранить колесо жизни",
    subtitle: "10 сфер",
    description: "Увидишь матрицу и слабые зоны — коуч даст приоритеты.",
    href: "/settings",
    hrefLabel: "Профиль",
    icon: "🎡",
  },
  {
    id: "streak_3",
    phase: 2,
    title: "3 дня дневника подряд",
    subtitle: "Привычка",
    description: "Данные → точные советы. XP и достижение.",
    href: "/log",
    hrefLabel: "Дневник",
    icon: "🔥",
  },
  {
    id: "safe_activity",
    phase: 2,
    title: "Мягкая активность",
    subtitle: "Ходьба / вело / бассейн / коврик",
    description: "Только безопасные форматы — не навредишь телу.",
    href: "/path",
    hrefLabel: "Безопасно",
    icon: "🚴",
  },
  {
    id: "labs_first",
    phase: 3,
    title: CHECKUP.journeyTitle,
    subtitle: "Хотя бы ТТГ + глюкоза",
    description: "Коуч подстроит питание и расписание пересдач.",
    href: "/settings?tab=health",
    hrefLabel: CHECKUP.journeyHref,
    icon: "🩸",
  },
  {
    id: "exam_first",
    phase: 3,
    title: "Записать УЗИ / обследование",
    subtitle: "Щитовидка или таз",
    description: "Не только кровь — полная картина здоровья.",
    href: "/settings?tab=health",
    hrefLabel: "УЗИ",
    icon: "📡",
  },
  {
    id: "life_actions",
    phase: 3,
    title: "Чипы жизни в дневнике",
    subtitle: "Работа · финансы · связи",
    description: "Карьера и отношения — не отдельно от тела.",
    href: "/log",
    hrefLabel: "Чипы",
    icon: "💼",
  },
  {
    id: "who5",
    phase: 3,
    title: "WHO-5 и ценности",
    subtitle: "Настройки",
    description: "Психика влияет на дефицит и мотивацию.",
    href: "/settings",
    hrefLabel: "Профиль",
    icon: "🧠",
  },
  {
    id: "weekly_review",
    phase: 4,
    title: "Обзор недели",
    subtitle: "Воскресенье",
    description: "Победы, уроки, фокус — growth mindset.",
    href: "/settings",
    hrefLabel: "Обзор",
    icon: "📋",
  },
  {
    id: "backup",
    phase: 4,
    title: "Сохранить резервную копию",
    subtitle: "Прогресс не потеряется",
    description: "Экспорт JSON — все данные и XP.",
    href: "/settings",
    hrefLabel: "Бэкап",
    icon: "💾",
  },
  {
    id: "cases_apply",
    phase: 4,
    title: "1 кейс карьеры + 1 отношений",
    subtitle: "Проверенные сценарии",
    description: "Конкретные действия из исследований.",
    href: "/path",
    hrefLabel: "Кейсы",
    icon: "📚",
  },
  {
    id: "full_system",
    phase: 5,
    title: "Вся система в ритме",
    subtitle: "Мастер",
    description: "Коуч + дневник + здоровье + жизнь + путь — еженедельный цикл.",
    href: "/path",
    hrefLabel: "Путь",
    icon: "🌟",
  },
];

const GENERIC_HIDDEN_STEP_IDS = new Set([
  "wheel_save",
  "labs_first",
  "exam_first",
  "life_actions",
  "who5",
  "weekly_review",
  "cases_apply",
]);

const GENERIC_STEP_OVERRIDES: Partial<Record<string, Partial<JourneyStep>>> = {
  onboarding: {
    title: "Представиться",
    subtitle: "1 экран",
    description: "Имя по желанию — остальное настроишь в профиле.",
    hrefLabel: "Старт",
  },
  first_log: {
    title: "Первый день",
    subtitle: "5 минут",
    description: "Настроение, вода, еда — один экран, одна кнопка «Сохранить».",
    href: "/",
    hrefLabel: "Мой день",
  },
  coach_plan: {
    title: "Отметить еду или движение",
    hrefLabel: "Мой день",
  },
  streak_3: {
    title: "3 дня подряд",
    subtitle: "Привычка",
    description: "Каждый день «Сохранить день» — серия растёт.",
    href: "/",
    hrefLabel: "Мой день",
  },
  backup: {
    description: "Скачай копию — данные не потеряются при смене телефона.",
    hrefLabel: "Копия",
  },
  full_system: {
    description: "Сегодня + дневник + прогресс — в еженедельном ритме.",
    hrefLabel: "Прогресс",
  },
};

export function getActiveJourneySteps(): JourneyStep[] {
  if (!GENERIC_MODE) return JOURNEY_STEPS;
  return JOURNEY_STEPS.filter((s) => !GENERIC_HIDDEN_STEP_IDS.has(s.id)).map((s) => ({
    ...s,
    ...GENERIC_STEP_OVERRIDES[s.id],
  }));
}

export interface JourneyProgress {
  completed: string[];
  currentPhase: JourneyPhase;
  percent: number;
}

export function computeJourneyProgress(ctx: {
  onboardingDone: boolean;
  logCount: number;
  streak: number;
  wheelFilled: boolean;
  labCount: number;
  examCount: number;
  lifeActionDays: number;
  who5Filled: boolean;
  weeklyReviewDone: boolean;
  backupDone: boolean;
  mealChoicesUsed: boolean;
}): JourneyProgress {
  const completed: string[] = [];

  if (ctx.onboardingDone) completed.push("onboarding");
  if (ctx.logCount >= 1) completed.push("first_log");
  if (ctx.mealChoicesUsed) completed.push("coach_plan");
  if (ctx.wheelFilled) completed.push("wheel_save");
  if (ctx.streak >= 3) completed.push("streak_3");
  if (ctx.logCount >= 3) completed.push("safe_activity");
  if (ctx.labCount >= 1) completed.push("labs_first");
  if (ctx.examCount >= 1) completed.push("exam_first");
  if (ctx.lifeActionDays >= 1) completed.push("life_actions");
  if (ctx.who5Filled) completed.push("who5");
  if (ctx.weeklyReviewDone) completed.push("weekly_review");
  if (ctx.backupDone) completed.push("backup");
  if (ctx.lifeActionDays >= 3) completed.push("cases_apply");
  if (completed.length >= 12) completed.push("full_system");

  const active = getActiveJourneySteps();
  const activeIds = new Set(active.map((s) => s.id));
  const relevant = completed.filter((id) => activeIds.has(id));
  const percent = Math.round((relevant.length / active.length) * 100);
  const currentPhase = (Math.min(5, Math.ceil(relevant.length / 2)) || 1) as JourneyPhase;

  return { completed, currentPhase, percent };
}

export function nextRecommendedStep(completed: string[]): JourneyStep | null {
  return getActiveJourneySteps().find((s) => !completed.includes(s.id)) ?? null;
}
