import { VC } from "./design-tokens";

export interface RingSegment {
  id: string;
  label: string;
  progress: number;
  color: string;
  done: boolean;
}

export function defaultDayRings(opts: {
  mealsDone: number;
  mealsTotal: number;
  workoutDone: boolean;
  diaryDone: boolean;
  wellbeingProgress?: number;
}): RingSegment[] {
  const mealP = opts.mealsTotal > 0 ? opts.mealsDone / opts.mealsTotal : 0;
  const wb = Math.min(1, opts.wellbeingProgress ?? 0);
  return [
    { id: "meals", label: "Питание", progress: mealP, color: VC.ringMeals, done: mealP >= 1 },
    { id: "move", label: "Движение", progress: opts.workoutDone ? 1 : 0, color: VC.ringMove, done: opts.workoutDone },
    { id: "log", label: "Дневник", progress: opts.diaryDone ? 1 : 0, color: VC.ringLog, done: opts.diaryDone },
    { id: "wellbeing", label: "Самочувствие", progress: wb, color: VC.ringWellbeing, done: wb >= 1 },
  ];
}
