/**
 * План по горизонтам: день · неделя · месяц + проседающие сферы.
 */

import type { Profile } from "@prisma/client";
import type { CompensationSummary } from "./compensation-plan";
import type { DayTask } from "./day-tasks";
import type { LifeSuggestion } from "./life-recommendations";
import {
  getLowestSpheres,
  getSphereAdvice,
  LIFE_SPHERES,
  type SphereKey,
  type WheelScores,
  type RelationshipStatus,
} from "./life-spheres";
import type { WeeklyInsights, LabDueItem } from "./types";
import type { WeeklyExperiment } from "./weekly-experiment";

export type HorizonKind = "day" | "week" | "month";
export type HorizonDomain =
  | "nutrition"
  | "sport"
  | "leisure"
  | "care"
  | "work"
  | "health"
  | "life";

export interface HorizonItem {
  id: string;
  horizon: HorizonKind;
  title: string;
  why: string;
  domain: HorizonDomain;
  sphere?: SphereKey;
  priority: "high" | "medium" | "low";
}

export interface SlippingSphere {
  key: SphereKey;
  label: string;
  emoji: string;
  score: number;
  source: "wheel" | "logs" | "both";
  todayAction: string;
  weekAction: string;
  monthAction: string;
}

export interface HorizonPlan {
  today: HorizonItem[];
  week: HorizonItem[];
  month: HorizonItem[];
  slippingSpheres: SlippingSphere[];
  summary: string;
}

function sphereMeta(key: SphereKey) {
  return LIFE_SPHERES.find((s) => s.key === key)!;
}

function slippingFromWheel(scores: WheelScores): SlippingSphere[] {
  const entries = Object.entries(scores) as [SphereKey, number][];
  return entries
    .filter(([, v]) => v != null && v < 6)
    .sort((a, b) => a[1] - b[1])
    .map(([key, score]) => {
      const meta = sphereMeta(key);
      const advice = getSphereAdvice(key, {
        occupation: "",
        relationshipStatus: "single_open",
        score,
        pcos: false,
        stressHigh: false,
      });
      return {
        key,
        label: meta.label,
        emoji: meta.emoji,
        score,
        source: "wheel" as const,
        todayAction: advice.actions[0] ?? advice.weeklyGoal,
        weekAction: advice.weeklyGoal,
        monthAction: advice.actions[1] ?? advice.actions[0],
      };
    });
}

function logSlippingToSphere(key: string): SphereKey | null {
  const map: Record<string, SphereKey> = {
    calories: "health",
    protein: "health",
    water: "health",
    sleep: "health",
    stress: "health",
    walks: "health",
    workouts: "health",
    weight: "health",
    mood: "leisure",
    energy: "health",
  };
  return map[key] ?? null;
}

export function buildHorizonPlan(ctx: {
  wheelScores: WheelScores;
  insights: WeeklyInsights;
  compensation: CompensationSummary;
  dayTasks: DayTask[];
  lifeSuggestions: LifeSuggestion[];
  labsDue: LabDueItem[];
  weeklyExperiment: WeeklyExperiment | null;
  profile: Pick<
    Profile,
    "occupation" | "careerGoal" | "financeGoal" | "relationshipStatus" | "pcosSuspected" | "cortisolIssues"
  >;
  workoutTitle: string;
  mealFocus?: string;
  softDay: boolean;
}): HorizonPlan {
  const today: HorizonItem[] = [];
  const week: HorizonItem[] = [];
  const month: HorizonItem[] = [];
  const used = new Set<string>();

  const push = (
    list: HorizonItem[],
    item: Omit<HorizonItem, "id"> & { id?: string },
  ) => {
    const id = item.id ?? `${item.horizon}-${item.domain}-${item.title.slice(0, 12)}`;
    if (used.has(id)) return;
    used.add(id);
    list.push({ ...item, id });
  };

  // —— Сегодня ——
  for (const item of ctx.compensation.items.filter((i) => i.active).slice(0, 2)) {
    push(today, {
      horizon: "day",
      title: item.title,
      why: item.reason || item.action,
      domain:
        item.domain === "movement"
          ? "sport"
          : item.domain === "calories" || item.domain === "protein"
            ? "nutrition"
            : "health",
      priority: "high",
    });
  }

  const openTasks = ctx.dayTasks.filter((t) => !t.done);
  for (const t of openTasks.slice(0, 2)) {
    push(today, {
      horizon: "day",
      title: t.label,
      why: "Дело дня — закрой до вечера",
      domain: t.sphere === "work" || t.sphere === "finance" ? "work" : t.sphere === "health" ? "health" : "life",
      priority: "high",
    });
  }

  if (ctx.workoutTitle) {
    push(today, {
      horizon: "day",
      title: ctx.softDay ? "Лёгкая прогулка 30 мин" : ctx.workoutTitle,
      why: ctx.softDay ? "Мягкий день — движение без нагрузки" : "Тренировка в плане коуча",
      domain: "sport",
      sphere: "health",
      priority: ctx.softDay ? "medium" : "high",
    });
  }

  if (ctx.mealFocus) {
    push(today, {
      horizon: "day",
      title: ctx.mealFocus,
      why: "Фокус питания на сегодня",
      domain: "nutrition",
      sphere: "health",
      priority: "medium",
    });
  }

  for (const s of ctx.lifeSuggestions.slice(0, 2)) {
    push(today, {
      horizon: "day",
      title: s.label,
      why: s.why,
      domain: s.domain === "leisure" ? "leisure" : "life",
      priority: "medium",
    });
  }

  // —— Неделя ——
  for (const slip of ctx.insights.slipping.slice(0, 3)) {
    const sphere = logSlippingToSphere(slip.key);
    push(week, {
      horizon: "week",
      title: slip.action,
      why: slip.message,
      domain: slip.key === "workouts" ? "sport" : slip.key === "mood" ? "leisure" : "health",
      sphere: sphere ?? undefined,
      priority: slip.score >= 50 ? "high" : "medium",
    });
  }

  if (ctx.weeklyExperiment) {
    push(week, {
      horizon: "week",
      title: ctx.weeklyExperiment.label,
      why: ctx.weeklyExperiment.hypothesis,
      domain: "health",
      priority: "medium",
    });
  }

  const weakSpheres = getLowestSpheres(ctx.wheelScores, 2);
  for (const key of weakSpheres) {
    const advice = getSphereAdvice(key, {
      occupation: ctx.profile.occupation,
      relationshipStatus: (ctx.profile.relationshipStatus as RelationshipStatus) || "single_open",
      score: ctx.wheelScores[key] ?? 5,
      pcos: ctx.profile.pcosSuspected,
      stressHigh: (ctx.insights.avgStress ?? 0) >= 7,
    });
    push(week, {
      horizon: "week",
      title: advice.weeklyGoal,
      why: `${advice.title} — сфера проседает`,
      domain: key === "career" ? "work" : key === "leisure" ? "leisure" : "life",
      sphere: key,
      priority: "medium",
    });
  }

  if (ctx.insights.workoutCount < 3) {
    push(week, {
      horizon: "week",
      title: "4 тренировки: 2 силовые + 2 кардио",
      why: `Сейчас ${ctx.insights.workoutCount} за неделю`,
      domain: "sport",
      sphere: "health",
      priority: "high",
    });
  }

  // —— Месяц ——
  for (const key of getLowestSpheres(ctx.wheelScores, 3)) {
    const score = ctx.wheelScores[key] ?? 5;
    const advice = getSphereAdvice(key, {
      occupation: ctx.profile.occupation,
      relationshipStatus: (ctx.profile.relationshipStatus as RelationshipStatus) || "single_open",
      score,
      pcos: ctx.profile.pcosSuspected,
      stressHigh: false,
    });
    push(month, {
      horizon: "month",
      title: advice.actions[0],
      why: `${advice.title} (${score}/10) — долгий горизонт`,
      domain: key === "finance" || key === "career" ? "work" : "life",
      sphere: key,
      priority: score <= 4 ? "high" : "medium",
    });
  }

  if (ctx.profile.careerGoal) {
    push(month, {
      horizon: "month",
      title: `Карьера: ${ctx.profile.careerGoal.slice(0, 50)}${ctx.profile.careerGoal.length > 50 ? "…" : ""}`,
      why: "Цель из профиля — 20 мин/день к ней",
      domain: "work",
      sphere: "career",
      priority: (ctx.wheelScores.career ?? 10) < 6 ? "high" : "low",
    });
  }

  if (ctx.profile.financeGoal) {
    push(month, {
      horizon: "month",
      title: `Финансы: ${ctx.profile.financeGoal.slice(0, 50)}${ctx.profile.financeGoal.length > 50 ? "…" : ""}`,
      why: "Финансовая цель — 1 действие в неделю",
      domain: "work",
      sphere: "finance",
      priority: (ctx.wheelScores.finance ?? 10) < 6 ? "high" : "low",
    });
  }

  const overdueLab = ctx.labsDue.find((l) => l.urgency === "overdue") ?? ctx.labsDue[0];
  if (overdueLab) {
    push(month, {
      horizon: "month",
      title: `Анализы: ${overdueLab.label}`,
      why: overdueLab.reason || overdueLab.dueText,
      domain: "health",
      sphere: "health",
      priority: overdueLab.urgency === "overdue" ? "high" : "medium",
    });
  }

  // Проседающие сферы
  const wheelSlip = slippingFromWheel(ctx.wheelScores);
  const logSlip = ctx.insights.slipping
    .map((s) => {
      const sk = logSlippingToSphere(s.key);
      if (!sk) return null;
      const meta = sphereMeta(sk);
      return {
        key: sk,
        label: meta.label,
        emoji: meta.emoji,
        score: Math.round(s.score / 10),
        source: "logs" as const,
        todayAction: s.action,
        weekAction: s.message,
        monthAction: `Стабилизировать: ${s.label}`,
      };
    })
    .filter((x) => x != null);

  const merged = new Map<string, SlippingSphere>();
  for (const w of wheelSlip) {
    merged.set(w.key, w);
  }
  for (const l of logSlip) {
    const existing = merged.get(l.key);
    if (existing) {
      merged.set(l.key, {
        ...existing,
        score: Math.min(existing.score, l.score),
        source: "both",
        todayAction: l.todayAction,
        weekAction: l.weekAction,
      });
    } else {
      merged.set(l.key, l);
    }
  }

  const slippingSpheres = [...merged.values()]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const topSlip = slippingSpheres[0]?.label ?? ctx.insights.slipping[0]?.label;
  const summary = topSlip
    ? `Фокус: ${topSlip} — ниже остальных. Сегодня ${today.length} шагов, на неделе ${week.length}.`
    : `Баланс ок. Сегодня ${today.length} приоритетов, неделя — ${week.length} целей.`;

  return {
    today: today.slice(0, 6),
    week: week.slice(0, 5),
    month: month.slice(0, 4),
    slippingSpheres,
    summary,
  };
}
