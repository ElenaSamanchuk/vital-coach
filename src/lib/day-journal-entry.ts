/**
 * Есть ли у дня осмысленная запись пользователя (для точек в календаре).
 * Настроение по умолчанию (7/7/5) само по себе не считается.
 */
import { slotChoices, leisureChoices, parseMealChoicesRaw } from "./today-choices";
import { parseLifePulseFromLog } from "./life-pulse";

export interface JournalDayLog {
  date: string;
  mood?: number | null;
  energy?: number | null;
  stress?: number | null;
  notes?: string | null;
  dayPhoto?: string | null;
  calories?: number | null;
  weightKg?: number | null;
  waterMl?: number | null;
  sleepMinutes?: number | null;
  steps?: number | null;
  workoutChoice?: string | null;
  mealChoices?: string | null;
  leisureJson?: string | null;
  lifeActionsJson?: string | null;
}

const DEFAULT_MOOD = 7;
const DEFAULT_ENERGY = 7;
const DEFAULT_STRESS = 5;

function hasMealChoices(raw?: string | null): boolean {
  if (!raw || raw === "{}" || raw === "null") return false;
  try {
    const parsed = parseMealChoicesRaw(raw);
    const slots = slotChoices(parsed);
    return Object.values(slots).some((ids) => ids.length > 0);
  } catch {
    return false;
  }
}

function hasLeisure(raw?: string | null): boolean {
  if (!raw || raw === "[]" || raw === "null") return false;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.filter(Boolean).length > 0;
  } catch {
    return false;
  }
}

function hasLeisureInMeals(raw?: string | null): boolean {
  if (!raw) return false;
  try {
    return leisureChoices(parseMealChoicesRaw(raw)).length > 0;
  } catch {
    return false;
  }
}

function hasLifePulse(raw?: string | null): boolean {
  const pulse = parseLifePulseFromLog(raw);
  return ["work", "care", "leisure", "home"].some((k) => {
    const s = pulse[k as keyof typeof pulse];
    return s.items.length > 0 || s.minutes > 0;
  });
}

function moodCustomized(log: JournalDayLog): boolean {
  if (log.mood == null && log.energy == null && log.stress == null) return false;
  return (
    (log.mood != null && log.mood !== DEFAULT_MOOD) ||
    (log.energy != null && log.energy !== DEFAULT_ENERGY) ||
    (log.stress != null && log.stress !== DEFAULT_STRESS)
  );
}

export function dayHasJournalEntry(log: JournalDayLog): boolean {
  if (log.notes?.trim()) return true;
  if (log.dayPhoto?.trim()) return true;
  if (log.weightKg != null && log.weightKg > 0) return true;
  if ((log.waterMl ?? 0) > 0) return true;
  if ((log.sleepMinutes ?? 0) > 0) return true;
  if ((log.steps ?? 0) > 0) return true;
  if (log.workoutChoice?.trim()) return true;
  if ((log.calories ?? 0) > 0) return true;
  if (hasMealChoices(log.mealChoices)) return true;
  if (hasLeisureInMeals(log.mealChoices)) return true;
  if (hasLeisure(log.leisureJson)) return true;
  if (hasLifePulse(log.lifeActionsJson)) return true;
  if (moodCustomized(log)) return true;
  return false;
}

export function journalEntryDates(logs: JournalDayLog[]): Set<string> {
  const set = new Set<string>();
  for (const l of logs) {
    if (dayHasJournalEntry(l)) set.add(l.date.split("T")[0]);
  }
  return set;
}
