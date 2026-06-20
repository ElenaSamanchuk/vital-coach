import type { CompensationSummary } from "./compensation-plan";
import { painAdvice } from "./day-routines";
import type { InflammationLoad } from "./inflammation-score";
import type { HealthConditions, CyclePhase } from "./types";
import type { DayTask } from "./day-tasks";
import { taskStats } from "./day-tasks";

export type BriefLevel = "info" | "attention" | "action";

export interface HealthBrief {
  id: string;
  level: BriefLevel;
  title: string;
  body: string;
  why: string;
  domain: "nutrition" | "movement" | "cycle" | "mind" | "labs" | "tasks" | "recovery";
}

export function buildHealthBriefing(input: {
  conditions: HealthConditions;
  cyclePhase: CyclePhase | null;
  stress: number;
  energy: number;
  softDay: boolean;
  inflammation: InflammationLoad;
  compensation: CompensationSummary;
  calorieTarget: number;
  baseCalorieTarget: number;
  labsDue?: { label: string; reason: string }[];
  tasks: DayTask[];
  thyroidTaken?: boolean;
  painLevel?: number;
  painZones?: string[];
}): HealthBrief[] {
  const briefs: HealthBrief[] = [];

  if (input.compensation.items.length > 0) {
    for (const c of input.compensation.items) {
      briefs.push({
        id: `comp_${c.domain}`,
        level: c.domain === "calories" ? "attention" : "info",
        title: c.title,
        body: c.action,
        why: c.reason,
        domain:
          c.domain === "movement"
            ? "movement"
            : c.domain === "sleep"
              ? "recovery"
              : c.domain === "protein"
                ? "nutrition"
                : "nutrition",
      });
    }
  }

  if (input.inflammation.level === "high") {
    briefs.push({
      id: "inflammation_high",
      level: "action",
      title: "Высокая нагрузка на тело",
      body: input.inflammation.tip,
      why: `Индекс ${input.inflammation.score}: ${input.inflammation.factors.join(", ") || "стресс и восстановление"}`,
      domain: "recovery",
    });
  } else if (input.inflammation.level === "moderate") {
    briefs.push({
      id: "inflammation_mod",
      level: "info",
      title: "Умеренная нагрузка",
      body: input.inflammation.tip,
      why: "Сочетание стресса, сна и фазы цикла",
      domain: "recovery",
    });
  }

  if (input.calorieTarget !== input.baseCalorieTarget) {
    const delta = input.calorieTarget - input.baseCalorieTarget;
    briefs.push({
      id: "calorie_adjust",
      level: "info",
      title: `Калории сегодня: ${input.calorieTarget}`,
      body: delta < 0 ? "Мягкая компенсация после переедания" : "Чуть больше из‑за мягкого дня или анализов",
      why:
        delta < 0
          ? "Не наказываем голодом — распределяем дефицит на несколько дней"
          : "Корректировка по самочувствию, не произвольная цифра",
      domain: "nutrition",
    });
  }

  if (input.conditions.hypothyroidism && !input.thyroidTaken) {
    briefs.push({
      id: "thyroid",
      level: "action",
      title: "Тироксин",
      body: "Отметь приём натощак — без этого план калорий неточен",
      why: "Гипотиреоз снижает расход; лекарство стабилизирует метаболизм",
      domain: "nutrition",
    });
  }

  if (input.conditions.insulinResistance && input.cyclePhase === "luteal") {
    briefs.push({
      id: "ir_luteal",
      level: "attention",
      title: "ИР + лютеиновая фаза",
      body: "Белок в каждый приём, ходьба 10 мин после обеда",
      why: "В этой фазе инсулиновая чувствительность ниже — скачки глюкозы сильнее",
      domain: "nutrition",
    });
  }

  if (input.painLevel != null && input.painLevel >= 4) {
    const zones = input.painZones?.length ? ` (${input.painZones.join(", ")})` : "";
    briefs.push({
      id: "pain",
      level: input.painLevel >= 7 ? "action" : "attention",
      title: `Боль ${input.painLevel}/10${zones}`,
      body: painAdvice(input.painLevel, input.conditions.endometriosis ?? false),
      why: "Боль влияет на нагрузку, дефицит и сон — коуч смягчает план",
      domain: "recovery",
    });
  }

  if (input.stress >= 7) {
    briefs.push({
      id: "stress",
      level: "attention",
      title: "Стресс высокий",
      body: input.softDay ? "Мягкий день активен — не ужесточай дефицит" : "Рассмотри «Мягкий день» или дыхание 4-7-8",
      why: "Кортизол держит вес и усиливает тягу к быстрым углеводам",
      domain: "mind",
    });
  }

  if (input.energy <= 4) {
    briefs.push({
      id: "low_energy",
      level: "info",
      title: "Энергия низкая",
      body: "Лёгкая прогулка вместо интенсивной тренировки",
      why: "При дефиците и гипотиреозе организм не успевает восстанавливаться",
      domain: "movement",
    });
  }

  const ts = taskStats(input.tasks);
  if (ts.workTotal > 0 && ts.workDone === 0) {
    briefs.push({
      id: "work_tasks",
      level: "info",
      title: "Рабочие дела ждут",
      body: `${ts.workTotal} задач — начни с одной на 25 мин`,
      why: "Незакрытые рабочие хвосты повышают стресс и срывают вечерний ритуал",
      domain: "tasks",
    });
  }

  if (input.labsDue?.[0]) {
    briefs.push({
      id: "labs",
      level: "action",
      title: `Анализы: ${input.labsDue[0].label}`,
      body: "Запланируй сдачу — коуч подстроит питание под результаты",
      why: input.labsDue[0].reason,
      domain: "labs",
    });
  }

  const order: Record<BriefLevel, number> = { action: 0, attention: 1, info: 2 };
  return briefs.sort((a, b) => order[a.level] - order[b.level]).slice(0, 6);
}
