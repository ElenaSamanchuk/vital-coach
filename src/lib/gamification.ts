/**
 * Sims-style life progression: XP, levels, achievements.
 */

export type LifeStatKey =
  | "body"
  | "fuel"
  | "mind"
  | "soul"
  | "energy"
  | "balance";

export interface LifeStat {
  key: LifeStatKey;
  label: string;
  emoji: string;
  color: string;
  xp: number;
  level: number;
  progress: number; // 0-100 to next level
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: LifeStatKey;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

const LEVEL_XP = (level: number) => 100 + level * 50;

export function xpToLevel(xp: number): { level: number; progress: number; current: number; next: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= LEVEL_XP(level) && level < 50) {
    remaining -= LEVEL_XP(level);
    level++;
  }
  const needed = LEVEL_XP(level);
  return {
    level,
    progress: Math.round((remaining / needed) * 100),
    current: remaining,
    next: needed,
  };
}

export const STAT_META: Record<
  LifeStatKey,
  { label: string; emoji: string; color: string; gradient: string }
> = {
  body: { label: "Тело", emoji: "💪", color: "#ff6b6b", gradient: "from-rose-400 to-orange-400" },
  fuel: { label: "Топливо", emoji: "🥗", color: "#34c759", gradient: "from-green-400 to-emerald-500" },
  mind: { label: "Разум", emoji: "🧠", color: "#5856d6", gradient: "from-indigo-400 to-violet-500" },
  soul: { label: "Душа", emoji: "✨", color: "#af52de", gradient: "from-purple-400 to-pink-400" },
  energy: { label: "Энергия", emoji: "⚡", color: "#ff9500", gradient: "from-amber-400 to-yellow-500" },
  balance: { label: "Баланс", emoji: "⚖️", color: "#0071e3", gradient: "from-blue-400 to-cyan-500" },
};

export const ACHIEVEMENT_DEFS: Omit<Achievement, "unlocked" | "unlockedAt" | "progress">[] = [
  { id: "first_log", title: "Первый шаг", description: "Заполнила первый дневник", emoji: "🌱", category: "balance", xpReward: 50 },
  { id: "streak_3", title: "Три дня подряд", description: "3 дня записей без пропуска", emoji: "🔥", category: "balance", xpReward: 100 },
  { id: "streak_7", title: "Неделя силы", description: "7 дней подряд", emoji: "🏆", category: "balance", xpReward: 250 },
  { id: "protein_hero", title: "Белковый герой", description: "5 дней белок в цели", emoji: "🥚", category: "fuel", xpReward: 150 },
  { id: "water_week", title: "Водный баланс", description: "7 дней вода 80%+", emoji: "💧", category: "energy", xpReward: 120 },
  { id: "pool_5", title: "Водная нимфа", description: "5 тренировок в бассейне", emoji: "🏊", category: "body", xpReward: 200 },
  { id: "bike_10", title: "Велогонщица", description: "10 вело-сессий", emoji: "🚴", category: "body", xpReward: 250 },
  { id: "yoga_calm", title: "Поток покоя", description: "10 йога/пилатес сессий", emoji: "🧘", category: "soul", xpReward: 200 },
  { id: "chess_mind", title: "Стратег", description: "5 занятий шахматами", emoji: "♟️", category: "mind", xpReward: 150 },
  { id: "english_flow", title: "English flow", description: "10 сессий английского", emoji: "🇬🇧", category: "mind", xpReward: 200 },
  { id: "code_builder", title: "Код-мастер", description: "10 сессий программирования", emoji: "💻", category: "mind", xpReward: 200 },
  { id: "leisure_week", title: "Жизнь вне KPI", description: "7 дней с досугом", emoji: "🎨", category: "soul", xpReward: 150 },
  { id: "waist_down", title: "Талия минус", description: "Талия −3 см от старта", emoji: "📏", category: "body", xpReward: 300 },
  { id: "labs_done", title: "Знаю своё тело", description: "Внесла 5+ анализов", emoji: "🔬", category: "balance", xpReward: 100 },
  { id: "pcos_week", title: "СПКЯ под контролем", description: "Неделя: ходьба после еды + белок", emoji: "🌸", category: "balance", xpReward: 180 },
  { id: "minimum_day", title: "Мягкость к себе", description: "Минимальный день без срыва", emoji: "💜", category: "soul", xpReward: 80 },
  { id: "finance_week", title: "Финансовая дисциплина", description: "5 дней финансовых действий", emoji: "💰", category: "balance", xpReward: 150 },
  { id: "career_week", title: "Карьерный рывок", description: "5 дней рабочих действий", emoji: "💼", category: "mind", xpReward: 150 },
  { id: "connections_week", title: "Социальный капитал", description: "5 дней действий для связей", emoji: "🤝", category: "soul", xpReward: 150 },
  { id: "wheel_filled", title: "Карта жизни", description: "Заполнила колесо жизни", emoji: "🎯", category: "balance", xpReward: 100 },
  { id: "weekly_review", title: "Осознанная неделя", description: "Сохранила обзор недели", emoji: "📋", category: "balance", xpReward: 80 },
  { id: "dacha_day", title: "Загородная душа", description: "5 дней с природой/дачей", emoji: "🏡", category: "soul", xpReward: 180 },
  { id: "selfcare_10", title: "Ритуал красоты", description: "10 дней ухода за собой", emoji: "✨", category: "soul", xpReward: 200 },
  { id: "social_5", title: "Новые связи", description: "5 социальных активностей", emoji: "🤝", category: "soul", xpReward: 150 },
  { id: "learn_10", title: "Вечная студентка", description: "10 сессий обучения", emoji: "📚", category: "mind", xpReward: 200 },
  { id: "nature_7", title: "Стихии", description: "7 дней: лес, вода, огонь", emoji: "🌲", category: "energy", xpReward: 170 },
  { id: "kanban_week", title: "Мастер дел", description: "7 дней с закрытыми задачами 70%+", emoji: "✅", category: "balance", xpReward: 220 },
  { id: "draw_5", title: "Художница", description: "5 сессий рисования", emoji: "🎨", category: "soul", xpReward: 160 },
];

export interface XpState {
  body: number;
  fuel: number;
  mind: number;
  soul: number;
  energy: number;
  balance: number;
}

export function emptyXp(): XpState {
  return { body: 0, fuel: 0, mind: 0, soul: 0, energy: 0, balance: 0 };
}

export function computeStats(xp: XpState): LifeStat[] {
  return (Object.keys(STAT_META) as LifeStatKey[]).map((key) => {
    const meta = STAT_META[key];
    const { level, progress } = xpToLevel(xp[key]);
    return { key, label: meta.label, emoji: meta.emoji, color: meta.color, xp: xp[key], level, progress };
  });
}

export function totalLevel(stats: LifeStat[]): number {
  return Math.round(stats.reduce((s, st) => s + st.level, 0) / stats.length);
}

interface LogForXp {
  proteinG?: number | null;
  proteinTarget: number;
  waterMl?: number | null;
  waterTarget: number;
  sleepMinutes?: number | null;
  sleepTarget: number;
  workouts?: { type: string; completed: boolean }[];
  leisureJson?: string;
  intellectJson?: string;
  habits?: { completed: boolean }[];
  mood?: number | null;
}

export function xpFromDailyLog(log: LogForXp): Partial<XpState> {
  const xp: Partial<XpState> = {};
  if (log.proteinG && log.proteinG >= log.proteinTarget * 0.9) xp.fuel = 25;
  if (log.waterMl && log.waterMl >= log.waterTarget * 0.8) xp.energy = 20;
  if (log.sleepMinutes && log.sleepMinutes >= log.sleepTarget * 0.85) xp.energy = (xp.energy ?? 0) + 15;
  const workouts = log.workouts?.filter((w) => w.completed) ?? [];
  if (workouts.length) xp.body = 20 + workouts.length * 10;
  try {
    const leisure = JSON.parse(log.leisureJson || "[]") as string[];
    if (leisure.length) xp.soul = 15 + leisure.length * 8;
    const intellect = JSON.parse(log.intellectJson || "[]") as string[];
    if (intellect.length) xp.mind = 15 + intellect.length * 12;
  } catch {
    /* ignore */
  }
  if (log.habits?.some((h) => h.completed)) xp.balance = 15;
  if (log.mood && log.mood >= 7) xp.soul = (xp.soul ?? 0) + 10;
  return xp;
}

export interface LifeActionsXp {
  career?: number;
  finance?: number;
  relations?: number;
  soul?: number;
  mind?: number;
  balance?: number;
}

export function xpFromTasks(tasksJson?: string | null): LifeActionsXp {
  const xp: LifeActionsXp = {};
  try {
    const tasks = JSON.parse(tasksJson || "[]") as { done: boolean; sphere: string }[];
    const workDone = tasks.filter((t) => t.sphere === "work" && t.done).length;
    if (workDone) xp.career = 10 + workDone * 12;
    const otherDone = tasks.filter((t) => t.sphere !== "work" && t.done).length;
    if (otherDone) xp.balance = 5 + otherDone * 5;
  } catch {
    /* */
  }
  return xp;
}

export function xpFromLifeActions(lifeActionsJson?: string | null): LifeActionsXp {
  const xp: LifeActionsXp = {};
  try {
    const a = JSON.parse(lifeActionsJson || "{}") as Record<string, string[]>;
    if (a.work?.length) xp.career = 15 + a.work.length * 8;
    if (a.finance?.length) xp.finance = 15 + a.finance.length * 10;
    if (a.relations?.length) xp.relations = 15 + a.relations.length * 10;
    if (a.spirit?.length) xp.relations = (xp.relations ?? 0) + 5;
    if (a.environment?.length) xp.balance = (xp.balance ?? 0) + 10;
    if (a.creativity?.length) xp.soul = (xp.soul ?? 0) + 8;
    if (a.growth?.length) xp.mind = (xp.mind ?? 0) + 8;
    if (a.selfcare?.length) xp.soul = (xp.soul ?? 0) + a.selfcare.length * 6;
    if (a.home?.length) xp.balance = (xp.balance ?? 0) + a.home.length * 5;
    if (a.wellbeing?.length) {
      xp.mind = (xp.mind ?? 0) + a.wellbeing.length * 6;
      xp.soul = (xp.soul ?? 0) + a.wellbeing.length * 4;
      xp.balance = (xp.balance ?? 0) + a.wellbeing.length * 5;
    }
  } catch {
    /* */
  }
  return xp;
}

export function evaluateAchievements(
  unlocked: string[],
  ctx: {
    logCount: number;
    streak: number;
    proteinDays: number;
    waterDays: number;
    poolCount: number;
    bikeCount: number;
    yogaCount: number;
    chessCount: number;
    englishCount: number;
    codeCount: number;
    leisureDays: number;
    waistDelta: number | null;
    labCount: number;
    pcosWeekOk: boolean;
    minimumDayLogged: boolean;
    financeActionDays: number;
    careerActionDays: number;
    relationsActionDays: number;
    wheelFilled: boolean;
    weeklyReviewDone: boolean;
  },
): Achievement[] {
  const checks: Record<string, boolean> = {
    first_log: ctx.logCount >= 1,
    streak_3: ctx.streak >= 3,
    streak_7: ctx.streak >= 7,
    protein_hero: ctx.proteinDays >= 5,
    water_week: ctx.waterDays >= 7,
    pool_5: ctx.poolCount >= 5,
    bike_10: ctx.bikeCount >= 10,
    yoga_calm: ctx.yogaCount >= 10,
    chess_mind: ctx.chessCount >= 5,
    english_flow: ctx.englishCount >= 10,
    code_builder: ctx.codeCount >= 10,
    leisure_week: ctx.leisureDays >= 7,
    waist_down: ctx.waistDelta != null && ctx.waistDelta <= -3,
    labs_done: ctx.labCount >= 5,
    pcos_week: ctx.pcosWeekOk,
    minimum_day: ctx.minimumDayLogged,
    finance_week: ctx.financeActionDays >= 5,
    career_week: ctx.careerActionDays >= 5,
    connections_week: ctx.relationsActionDays >= 5,
    wheel_filled: ctx.wheelFilled,
    weekly_review: ctx.weeklyReviewDone,
  };

  return ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: unlocked.includes(def.id) || checks[def.id] === true,
    progress: checks[def.id] ? 1 : 0,
    target: 1,
  }));
}
