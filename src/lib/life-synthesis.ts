/**
 * Сквозной синтез: колесо + PERMA + SDT + WHO-5 + здоровье + дневник → единый план жизни.
 */

import type { WheelScores, SphereKey } from "./life-spheres";
import { getLowestSpheres, LIFE_SPHERES } from "./life-spheres";
import type { PermaScore, BigFiveTrait } from "./psychology-frameworks";
import type { SdtScore, Who5Score, RyffScore } from "./psychology-frameworks";
import {
  who5RawTotal,
  who5NeedsAttention,
  sdtWeakest,
  hasPermaScores,
  hasSdtScores,
  hasRyffScores,
  hasWho5Scores,
} from "./psychology-frameworks";
import { frameworksForSphere, RESEARCH_FRAMEWORKS } from "./evidence-library";

export interface LifeLogSignals {
  avgSleepMin: number;
  avgStress: number;
  avgMood: number;
  avgEnergy: number;
  avgWorkSatisfaction: number;
  lifeActionDays: number;
  leisureDays: number;
  intellectDays: number;
  workoutDays: number;
}

export interface HolisticInsight {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  message: string;
  action: string;
  research: string;
  sphere?: SphereKey;
}

export interface HolisticLifePlan {
  insights: HolisticInsight[];
  dailyMicroHabits: string[];
  weeklyTheme: string;
  synergies: string[];
  frameworksToExplore: string[];
  burnoutRisk: boolean;
  wellbeingAlert: boolean;
}

export function buildHolisticLifePlan(ctx: {
  wheelScores: WheelScores;
  perma: PermaScore | null;
  sdt: SdtScore | null;
  who5: Who5Score | null;
  ryff: RyffScore | null;
  bigFive: Record<BigFiveTrait, number> | null;
  signals: LifeLogSignals;
  healthFlags: {
    pcos: boolean;
    hypothyroidism: boolean;
    cortisolIssues: boolean;
    endometriosis: boolean;
  };
  relationshipStatus: string;
  careerGoal: string;
  financeGoal: string;
}): HolisticLifePlan {
  const insights: HolisticInsight[] = [];
  const synergies: string[] = [];
  const dailyMicroHabits: string[] = [];

  const weakSpheres = getLowestSpheres(ctx.wheelScores, 3);
  const who5Total = hasWho5Scores(ctx.who5) ? who5RawTotal(ctx.who5) : null;
  const wellbeingAlert = who5Total != null && who5NeedsAttention(who5Total);
  const burnoutRisk =
    ctx.signals.avgWorkSatisfaction < 5 &&
    ctx.signals.avgStress >= 7 &&
    (ctx.wheelScores.career ?? 5) < 6;

  // --- Сквозные паттерны ---
  if (ctx.signals.avgSleepMin > 0 && ctx.signals.avgSleepMin < 420) {
    insights.push({
      id: "sleep_cascade",
      priority: "high",
      category: "Здоровье",
      title: "Сон тянет всё вниз",
      message: `Средний сон ~${Math.round(ctx.signals.avgSleepMin / 60)} ч. CBT-I: сон влияет на вес, кортизол, настроение и решения.`,
      action: "Сегодня: одно время подъёма, кофе до 14:00, экран −1 ч перед сном",
      research: "Morin et al. — CBT-I meta-analysis",
      sphere: "health",
    });
    dailyMicroHabits.push("Лечь на 30 мин раньше обычного");
  }

  if (burnoutRisk) {
    insights.push({
      id: "burnout",
      priority: "high",
      category: "Карьера",
      title: "Риск выгорания",
      message: "Низкая удовлетворённость работой + высокий стресс. Maslach: восстановление важнее «догнать».",
      action: "Чип «Граница» в дневнике + минимальный день без вины",
      research: "Maslach Burnout Inventory",
      sphere: "career",
    });
  }

  if (wellbeingAlert) {
    insights.push({
      id: "who5_low",
      priority: "high",
      category: "Психика",
      title: "WHO-5 ниже нормы",
      message: `Балл ${who5Total}/25. Не ужесточай дефицит — приоритет сон, связи, прогулки.`,
      action: "1 социальный контакт + 20 мин на солнце",
      research: "WHO-5 Well-Being Index",
      sphere: "health",
    });
  }

  if (hasSdtScores(ctx.sdt)) {
    const weak = sdtWeakest(ctx.sdt);
    const labels = { autonomy: "автономия", competence: "компетентность", relatedness: "связанность" };
    insights.push({
      id: "sdt_weak",
      priority: "medium",
      category: "Мотивация",
      title: `SDT: проседает ${labels[weak]}`,
      message: "Ryan & Deci: без базовых потребностей мотивация на исходе — даже при силе воли.",
      action:
        weak === "autonomy"
          ? "Выбери 1 задачу «хочу», не «надо»"
          : weak === "competence"
            ? "20 мин навыка с измеримым результатом"
            : "Напиши близкому человеку или встретись",
      research: "Self-Determination Theory",
      sphere: weak === "relatedness" ? "relationships" : "career",
    });
  }

  // Сферы колеса
  for (const key of weakSpheres) {
    const sphere = LIFE_SPHERES.find((s) => s.key === key);
    const score = ctx.wheelScores[key] ?? 0;
    if (!sphere || score > 6) continue;
    const fw = frameworksForSphere(key)[0];
    insights.push({
      id: `wheel_${key}`,
      priority: score <= 4 ? "high" : "medium",
      category: sphere.label,
      title: `${sphere.label}: ${score}/10`,
      message: sphere.description,
      action: fw?.interventions[0] ?? sphere.research,
      research: fw ? `${fw.name} (${fw.authors})` : sphere.research,
      sphere: key,
    });
  }

  // PERMA cross
  if (hasPermaScores(ctx.perma)) {
    const permaLow = Object.entries(ctx.perma).sort((a, b) => a[1] - b[1])[0];
    if (permaLow && permaLow[1] < 6) {
      const map: Record<string, string> = {
        P: "3 благодарности вечером",
        E: "40 мин занятия в flow",
        R: "Глубокий разговор без телефона",
        M: "Запиши «зачем» одной цели",
        A: "Зафиксируй 1 win в дневнике",
      };
      dailyMicroHabits.push(map[permaLow[0]] ?? "PERMA-микрошаг");
    }
  }

  // Big Five personalization
  if ((ctx.bigFive?.N ?? 0) >= 5.5 && ctx.healthFlags.cortisolIssues) {
    synergies.push("Высокий нейротизм + кортизол: йога/бассейн важнее жёсткого дефицита");
    dailyMicroHabits.push("5 мин дыхания после еды");
  }
  if ((ctx.bigFive?.C ?? 5) <= 4) {
    synergies.push("Низкая добросовестность: дневник и чипы — внешняя система вместо «силы воли»");
  }

  // Health × life cross
  if (ctx.healthFlags.pcos && (ctx.wheelScores.health ?? 5) < 7) {
    synergies.push("СПКЯ: силовая + белок + сон → влияет на карьерную энергию и настроение");
  }
  if (ctx.healthFlags.hypothyroidism && ctx.signals.avgEnergy < 5) {
    synergies.push("Гипотиреоз: не режь калории ниже 1500 — энергия для работы и отношений");
  }
  if (ctx.healthFlags.endometriosis && (ctx.wheelScores.leisure ?? 5) < 6) {
    synergies.push("Эндометриоз: досуг и восстановление — не роскошь, а лечение стресса");
  }

  // Activity balance
  if (ctx.signals.workoutDays >= 4 && ctx.signals.leisureDays < 2) {
    synergies.push("Много тренировок, мало радости: добавь досуг без KPI (вело «для души»)");
  }
  if (ctx.signals.intellectDays >= 5 && (ctx.wheelScores.relationships ?? 5) < 6) {
    synergies.push("Harvard 80 лет: интеллект без связей не даёт счастья — 1 встреча в неделю");
  }
  if (ctx.signals.lifeActionDays < 2 && weakSpheres.includes("finance")) {
    synergies.push("Финансы в колесе просели — 1 чип в дневнике в неделю меняет привычку");
  }

  // Goals alignment
  if (ctx.careerGoal && (ctx.wheelScores.career ?? 0) < 6) {
    dailyMicroHabits.push(`20 мин к цели: «${ctx.careerGoal.slice(0, 40)}…»`);
  }
  if (ctx.financeGoal && (ctx.wheelScores.finance ?? 0) < 6) {
    dailyMicroHabits.push("15 мин финансов: бюджет или отложить");
  }

  if (ctx.relationshipStatus === "single_searching" && (ctx.wheelScores.relationships ?? 5) < 7) {
    dailyMicroHabits.push("1 социальное действие: клуб, прогулка, знакомство");
  }

  // Ryff
  if (hasRyffScores(ctx.ryff)) {
    const ryffLow = Object.entries(ctx.ryff).sort((a, b) => a[1] - b[1])[0];
    if (ryffLow && ryffLow[1] < 5) {
      const ryffActions: Record<string, string> = {
        autonomy: "Скажи «нет» одной просьбе без оправданий",
        growth: "Запиши 1 урок недели",
        purpose: "Свяжи задачу с «зачем»",
        relations: "Качественный контакт 30 мин",
        selfAcceptance: "1 вещь «достаточно хорошо»",
        environment: "15 мин порядка в одной зоне",
      };
      if (!dailyMicroHabits.includes(ryffActions[ryffLow[0]]))
        dailyMicroHabits.push(ryffActions[ryffLow[0]]);
    }
  }

  // Dedupe and sort
  const sorted = insights.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });

  const weeklyTheme = weakSpheres.length
    ? `Неделя «${LIFE_SPHERES.find((s) => s.key === weakSpheres[0])?.label}»: маленькие шаги каждый день`
    : "Неделя баланса: поддерживай все сферы";

  const frameworksToExplore = [
    ...new Set(weakSpheres.flatMap((k) => frameworksForSphere(k).map((f) => f.id))),
  ].slice(0, 4);

  return {
    insights: sorted.slice(0, 8),
    dailyMicroHabits: [...new Set(dailyMicroHabits)].slice(0, 4),
    weeklyTheme,
    synergies: synergies.slice(0, 5),
    frameworksToExplore,
    burnoutRisk,
    wellbeingAlert,
  };
}

export function computeLifeLogSignals(
  logs: {
    sleepMinutes?: number | null;
    stress?: number | null;
    mood?: number | null;
    energy?: number | null;
    workSatisfaction?: number | null;
    lifeActionsJson?: string | null;
    leisureJson?: string | null;
    intellectJson?: string | null;
    workouts?: { completed: boolean }[];
  }[],
  days = 14,
): LifeLogSignals {
  const slice = logs.slice(0, days);
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const sleeps = slice.map((l) => l.sleepMinutes).filter((v): v is number => v != null);
  const stresses = slice.map((l) => l.stress).filter((v): v is number => v != null);
  const moods = slice.map((l) => l.mood).filter((v): v is number => v != null);
  const energies = slice.map((l) => l.energy).filter((v): v is number => v != null);
  const workSats = slice.map((l) => l.workSatisfaction).filter((v): v is number => v != null);

  let lifeActionDays = 0;
  let leisureDays = 0;
  let intellectDays = 0;
  let workoutDays = 0;

  for (const l of slice) {
    try {
      const la = JSON.parse(l.lifeActionsJson || "{}") as Record<string, string[]>;
      if (Object.values(la).some((a) => a?.length)) lifeActionDays++;
      if (JSON.parse(l.leisureJson || "[]").length) leisureDays++;
      if (JSON.parse(l.intellectJson || "[]").length) intellectDays++;
    } catch {
      /* */
    }
    if (l.workouts?.some((w) => w.completed)) workoutDays++;
  }

  return {
    avgSleepMin: avg(sleeps),
    avgStress: avg(stresses),
    avgMood: avg(moods),
    avgEnergy: avg(energies),
    avgWorkSatisfaction: avg(workSats),
    lifeActionDays,
    leisureDays,
    intellectDays,
    workoutDays,
  };
}

export function getFrameworksByIds(ids: string[]) {
  return RESEARCH_FRAMEWORKS.filter((f) => ids.includes(f.id));
}
