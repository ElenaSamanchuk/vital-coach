import { parseWorkoutChoices } from "./today-choices";
import { genericWorkoutOptions } from "./generic-day-catalogs";

export interface MovementDayRow {
  date: string;
  dateLabel?: string;
  steps?: number;
  workoutChoice?: string;
  workoutCount: number;
  burnedKcal: number;
  hasMovement: boolean;
}

export function enrichLogsWithMovement(
  logs: {
    date: string;
    dateLabel?: string;
    steps?: number | null;
    workoutChoice?: string | null;
  }[],
  weightKg: number,
): MovementDayRow[] {
  const workouts = genericWorkoutOptions(weightKg);
  return logs.map((log) => {
    const ids = parseWorkoutChoices(log.workoutChoice);
    const burnedKcal = ids.reduce((sum, id) => {
      const w = workouts.find((o) => o.id === id);
      return sum + (w?.caloriesBurned ?? 0);
    }, 0);
    const steps = log.steps ?? 0;
    return {
      ...log,
      steps: steps || undefined,
      workoutChoice: log.workoutChoice ?? undefined,
      workoutCount: ids.length,
      burnedKcal,
      hasMovement: ids.length > 0 || steps > 0,
    };
  });
}

export function hasMovementData(rows: MovementDayRow[]): boolean {
  return rows.some((r) => r.hasMovement);
}
