/**
 * Каталоги для режима «Поток»: досуг без спорта (спорт — только в «Движении»).
 */
import {
  LEISURE_ACTIVITIES,
  INTELLECT_ACTIVITIES,
  type ActivityItem,
} from "./leisure";
import { WORKOUT_OPTIONS, enrichWorkoutCalories, type WorkoutOption } from "./fitness";
import { leisureImpact, workoutImpact } from "./impact-motivation";

/** Спорт — только вкладка «Движение», не досуг */
export const LEISURE_NON_SPORT: ActivityItem[] = LEISURE_ACTIVITIES.filter(
  (a) => a.category !== "sport",
);

export const GENERIC_LEISURE_POOL: ActivityItem[] = [
  ...LEISURE_NON_SPORT,
  ...INTELLECT_ACTIVITIES,
];

export interface GenericLeisureCard {
  id: string;
  label: string;
  iconName: string;
  minutes: number;
  impact: string;
  impactLabel: string;
}

export function genericLeisureCards(): GenericLeisureCard[] {
  return GENERIC_LEISURE_POOL.map((act) => ({
    id: act.id,
    label: act.label,
    iconName: act.icon,
    minutes: act.category === "intellect" ? 30 : act.category === "social" ? 60 : 45,
    impact: leisureImpact(act.id),
    impactLabel: `настроение +${act.moodBoost}`,
  }));
}

export function genericWorkoutOptions(weightKg: number): WorkoutOption[] {
  const seen = new Set<string>();
  const out: WorkoutOption[] = [];
  for (const list of Object.values(WORKOUT_OPTIONS)) {
    for (const w of list) {
      if (seen.has(w.id)) continue;
      seen.add(w.id);
      out.push(
        enrichWorkoutCalories(
          { ...w, impact: w.impact ?? workoutImpact(w.id, w.type) },
          weightKg,
        ),
      );
    }
  }
  return out;
}
