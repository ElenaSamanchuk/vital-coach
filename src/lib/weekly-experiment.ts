/** Недельный микро-эксперимент — уникальная фича A/B без жёсткости */

export interface WeeklyExperiment {
  id: string;
  label: string;
  hypothesis: string;
  weekStart: string;
  daysDone: number;
  conclusion?: string;
  weekComplete?: boolean;
}

export const EXPERIMENT_CATALOG: Omit<WeeklyExperiment, "weekStart" | "daysDone">[] = [
  {
    id: "walk_lunch",
    label: "Ходьба 10 мин после обеда",
    hypothesis: "Снижает скачок глюкозы при ИР",
  },
  {
    id: "protein_breakfast",
    label: "30 г белка на завтрак",
    hypothesis: "Меньше тяги к сладкому к вечеру",
  },
  {
    id: "no_caffeine_empty",
    label: "Кофе только после еды",
    hypothesis: "Мягче кортизол и щитовидка",
  },
  {
    id: "sleep_23",
    label: "Сон до 23:00",
    hypothesis: "Энергия и вес стабильнее",
  },
];

export function currentExperiment(
  raw: string | null | undefined,
  logs: {
    date: string | Date;
    postMealWalks?: number | null;
    proteinG?: number | null;
    sleepMinutes?: number | null;
  }[],
): WeeklyExperiment | null {
  let exp: WeeklyExperiment | null = null;
  try {
    const j = JSON.parse(raw || "{}") as WeeklyExperiment;
    if (j.id && j.weekStart) exp = j;
  } catch {
    /* */
  }

  if (!exp) {
    const pick = EXPERIMENT_CATALOG[new Date().getMonth() % EXPERIMENT_CATALOG.length];
    const monday = getWeekStart(new Date());
    exp = { ...pick, weekStart: monday, daysDone: 0 };
  }

  const weekStart = new Date(exp.weekStart);
  const daysDone = countExperimentDays(exp, logs, weekStart);
  const weekComplete = daysDone >= 7 || daysSinceWeekStart(weekStart) >= 7;
  const conclusion = weekComplete ? buildConclusion(exp.id, daysDone) : undefined;

  return { ...exp, daysDone, weekComplete, conclusion };
}

function daysSinceWeekStart(weekStart: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - weekStart.getTime()) / 86400000);
}

function countExperimentDays(
  exp: WeeklyExperiment,
  logs: {
    date: string | Date;
    postMealWalks?: number | null;
    proteinG?: number | null;
    sleepMinutes?: number | null;
  }[],
  weekStart: Date,
): number {
  let daysDone = 0;
  for (const log of logs) {
    const d = new Date(log.date);
    if (d < weekStart) continue;
    if (exp.id === "walk_lunch" && (log.postMealWalks ?? 0) > 0) daysDone++;
    if (exp.id === "protein_breakfast" && (log.proteinG ?? 0) >= 25) daysDone++;
    if (exp.id === "sleep_23" && (log.sleepMinutes ?? 0) >= 420) daysDone++;
  }
  return daysDone;
}

function buildConclusion(id: string, daysDone: number): string {
  const rate = daysDone / 7;
  const verdict =
    rate >= 0.7
      ? "Стоит оставить привычку — выполняла чаще, чем нет."
      : rate >= 0.4
        ? "Частичный успех — попробуй упростить или сдвинуть на другое время."
        : "Не зашло на этой неделе — нормально, выбери другой эксперимент.";

  const hints: Record<string, string> = {
    walk_lunch: "Ходьба после еды: сравни энергию и тягу к сладкому вечером.",
    protein_breakfast: "Белковый завтрак: заметь, меньше ли перекусов после обеда.",
    no_caffeine_empty: "Кофе после еды: отметь, спокойнее ли утро без дрожи.",
    sleep_23: "Ранний сон: сравни вес и настроение в начале следующей недели.",
  };

  return `${verdict} ${hints[id] ?? ""}`.trim();
}

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}
