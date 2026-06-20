import type { NutritionMeta } from "./profile-derivation";
import type { HealthConditions } from "./types";

/** Синдром-симулятор: почему именно столько ккал */

export interface CalorieExplainer {
  headline: string;
  bullets: string[];
  comparison: { genericTdee: number; yourTarget: number; delta: number };
}

export function buildCalorieExplainer(
  meta: NutritionMeta,
  conditions: HealthConditions,
): CalorieExplainer {
  const genericTdee = meta.tdee;
  const yourTarget = meta.calorieTarget;
  const delta = genericTdee - yourTarget;
  const bullets: string[] = [];

  bullets.push(
    `Полный расход ~${meta.tdee} ккал — но при похудении еда считается от лёгкой базы ~${meta.dietBase}, не от тренировок.`,
  );

  if (meta.bmi >= 25) {
    bullets.push(`ИМТ ${meta.bmi}: при снижении веса ориентир 18–20 ккал/кг, не полный TDEE.`);
  }

  if (conditions.hypothyroidism) {
    bullets.push("Гипотиреоз: метаболизм ниже расчётного — цель консервативная, пол не ниже 1400 ккал.");
  }
  if (conditions.insulinResistance) {
    bullets.push("ИР: дефицит умеренный — резкое голодание ухудшает инсулин и настроение.");
  }
  if (conditions.pcosSuspected) {
    bullets.push("СПКЯ: белок и силовая важнее ещё −300 ккал.");
  }

  bullets.push(`Итого дефицит ~${delta} ккал от полного расхода — это похудение, не удержание.`);

  return {
    headline: `Почему ${yourTarget}, а не ~${genericTdee}?`,
    bullets,
    comparison: { genericTdee, yourTarget, delta },
  };
}
