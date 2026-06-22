/**
 * Выборы на «Сегодня»: несколько блюд на приём, несколько тренировок и досуга.
 * В JSON совместимо со старым форматом (одна строка на слот).
 */

export const MEAL_SLOTS = ["breakfast", "lunch", "snack", "dinner"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const META_KEYS = new Set(["_leisure", "_softDay"]);

export type MealChoicesRaw = Record<string, string | string[]>;

export function asIdList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function parseMealChoicesRaw(raw: string | null | undefined): MealChoicesRaw {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as MealChoicesRaw;
  } catch {
    return {};
  }
}

export function slotChoices(raw: MealChoicesRaw): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (META_KEYS.has(k)) continue;
    const ids = asIdList(v);
    if (ids.length) out[k] = ids;
  }
  return out;
}

export function leisureChoices(raw: MealChoicesRaw): string[] {
  return asIdList(raw._leisure);
}

export function serializeMealChoices(
  slots: Record<string, string[]>,
  leisure: string[],
): MealChoicesRaw {
  const out: MealChoicesRaw = {};
  for (const [slot, ids] of Object.entries(slots)) {
    if (ids.length === 1) out[slot] = ids[0];
    else if (ids.length > 1) out[slot] = ids;
  }
  if (leisure.length === 1) out._leisure = leisure[0];
  else if (leisure.length > 1) out._leisure = leisure;
  return out;
}

export function toggleSlotChoice(raw: MealChoicesRaw, slot: string, id: string): MealChoicesRaw {
  const slots = slotChoices(raw);
  const next = toggleId(slots[slot] ?? [], id);
  const leisure = leisureChoices(raw);
  if (next.length) slots[slot] = next;
  else delete slots[slot];
  return serializeMealChoices(slots, leisure);
}

export function toggleLeisureChoice(raw: MealChoicesRaw, id: string): MealChoicesRaw {
  const slots = slotChoices(raw);
  const leisure = toggleId(leisureChoices(raw), id);
  return serializeMealChoices(slots, leisure);
}

/** workoutChoice: legacy id или JSON-массив */
export function parseWorkoutChoices(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const t = raw.trim();
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t) as unknown;
      if (Array.isArray(arr)) return arr.filter((x): x is string => typeof x === "string" && Boolean(x));
    } catch {
      /* */
    }
  }
  return [t];
}

export function serializeWorkoutChoices(ids: string[]): string {
  if (ids.length === 0) return "";
  if (ids.length === 1) return ids[0];
  return JSON.stringify(ids);
}

export function toggleWorkoutChoice(current: string[], id: string): string[] {
  return toggleId(current, id);
}

export function countFilledMealSlots(slots: Record<string, string[]>, mealSlots: string[]): number {
  return mealSlots.filter((s) => (slots[s]?.length ?? 0) > 0).length;
}

export function hasSportInLeisure(leisureIds: string[], isSport: (id: string) => boolean): boolean {
  return leisureIds.some(isSport);
}
