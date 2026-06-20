/** Распределение ккал по приёмам — ориентир Lifesum / Samsung Health */

export const MEAL_SLOT_SHARE: Record<string, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  snack: 0.1,
  dinner: 0.3,
};

export const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  snack: "Перекус",
  dinner: "Ужин",
};

export function mealSlotBudget(calorieTarget: number, slot: string): number {
  const share = MEAL_SLOT_SHARE[slot] ?? 0.25;
  return Math.round(calorieTarget * share);
}

export function mealSlotsFromPlan(
  mealPlan: { slot: string; selected?: { calories?: number } }[],
  calorieTarget: number,
): { slot: string; label: string; budget: number; actual: number; pct: number }[] {
  return mealPlan.map((m) => {
    const budget = mealSlotBudget(calorieTarget, m.slot);
    const actual = m.selected?.calories ?? 0;
    return {
      slot: m.slot,
      label: MEAL_SLOT_LABELS[m.slot] ?? m.slot,
      budget,
      actual,
      pct: budget > 0 ? Math.min(1.2, actual / budget) : 0,
    };
  });
}
