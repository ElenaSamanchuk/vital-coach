import type { CyclePhase } from "./types";

/** Inflammation Load 0–100 — уникальный индекс нагрузки на тело */

export interface InflammationLoad {
  score: number;
  level: "low" | "moderate" | "high";
  labelRu: string;
  factors: string[];
  tip: string;
}

export function computeInflammationLoad(input: {
  stress: number;
  sleepMinutes?: number | null;
  sleepTarget: number;
  cyclePhase: CyclePhase | null;
  endometriosis: boolean;
  dayTags: string[];
  softDay: boolean;
}): InflammationLoad {
  let score = 20;
  const factors: string[] = [];

  if (input.stress >= 7) {
    score += 25;
    factors.push("высокий стресс");
  } else if (input.stress >= 5) score += 10;

  if (input.sleepMinutes != null && input.sleepMinutes < input.sleepTarget * 0.75) {
    score += 20;
    factors.push("недосып");
  }

  if (input.cyclePhase === "menstrual" || input.cyclePhase === "luteal") {
    score += 12;
    factors.push("фаза цикла");
  }

  if (input.endometriosis && input.dayTags.includes("cycle")) {
    score += 15;
    factors.push("эндометриоз + цикл");
  }

  if (input.dayTags.includes("stress")) score += 10;

  if (input.dayTags.includes("selfcare") || input.dayTags.includes("face_mask")) {
    score -= 8;
  }
  if (input.dayTags.includes("bath_ritual") || input.dayTags.includes("massage_body")) {
    score -= 6;
  }
  if (input.softDay) score -= 5;

  score = Math.max(0, Math.min(100, score));

  let level: InflammationLoad["level"] = "low";
  let labelRu = "Низкая нагрузка";
  let tip = "Хороший день для обычного плана.";

  if (score >= 60) {
    level = "high";
    labelRu = "Высокая нагрузка";
    tip = "Мягкий день, сон и уход — не ужесточай дефицит.";
  } else if (score >= 35) {
    level = "moderate";
    labelRu = "Умеренная";
    tip = "Белок, сон, маска/ванна — поддержка восстановления.";
  }

  return { score, level, labelRu, factors, tip };
}
