import { VC } from "./design-tokens";
import { isSportLeisureId } from "./leisure";

export interface RingSegment {
  id: string;
  label: string;
  progress: number;
  color: string;
  done: boolean;
  /** «2/4», «67%» — подпись в легенде */
  hint?: string;
}

export function computeMovementRing(opts: {
  workoutChoice?: string | null;
  steps?: number | null;
  leisureChoice?: string;
}): Pick<RingSegment, "progress" | "done" | "hint"> {
  if (opts.workoutChoice) {
    return { progress: 1, done: true, hint: "выбрано" };
  }
  if (isSportLeisureId(opts.leisureChoice)) {
    return { progress: 1, done: true, hint: "досуг" };
  }
  const steps = opts.steps ?? 0;
  if (steps >= 5000) {
    return { progress: 1, done: true, hint: `${steps}` };
  }
  if (steps >= 1500) {
    const progress = Math.min(1, steps / 8000);
    return { progress, done: progress >= 0.625, hint: `${steps}` };
  }
  return { progress: 0, done: false, hint: "—" };
}

export function defaultDayRings(opts: {
  mealsDone: number;
  mealsTotal: number;
  movement: Pick<RingSegment, "progress" | "done" | "hint">;
  diaryDone: boolean;
  wellbeingProgress?: number;
}): RingSegment[] {
  const mealP = opts.mealsTotal > 0 ? opts.mealsDone / opts.mealsTotal : 0;
  const wb = Math.min(1, opts.wellbeingProgress ?? 0);
  const move = opts.movement;
  return [
    {
      id: "meals",
      label: "Питание",
      progress: mealP,
      color: VC.ringMeals,
      done: mealP >= 1,
      hint: `${opts.mealsDone}/${opts.mealsTotal}`,
    },
    {
      id: "move",
      label: "Движение",
      progress: move.progress,
      color: VC.ringMove,
      done: move.done,
      hint: move.hint,
    },
    {
      id: "log",
      label: "Дневник",
      progress: opts.diaryDone ? 1 : 0,
      color: VC.ringLog,
      done: opts.diaryDone,
      hint: opts.diaryDone ? "запись" : "—",
    },
    {
      id: "wellbeing",
      label: "Самочувствие",
      progress: wb,
      color: VC.ringWellbeing,
      done: wb >= 1,
      hint: wb >= 1 ? "готово" : `${Math.round(wb * 100)}%`,
    },
  ];
}

/** Единая логика колец для «Сегодня» — явный выбор + шаги + спорт в досуге */
export function buildTodayRings(opts: {
  mealSlots: string[];
  mealChoices: Record<string, string>;
  workoutChoice?: string | null;
  steps?: number | null;
  diaryDone: boolean;
  moodLogged: boolean;
  wellbeingActionsDone: number;
  leisureChoice?: string;
}): RingSegment[] {
  const mealsTotal = opts.mealSlots.length || 4;
  const mealsDone = opts.mealSlots.filter((slot) => Boolean(opts.mealChoices[slot])).length;

  let wellbeingProgress = 0;
  if (opts.moodLogged || opts.diaryDone) wellbeingProgress += 0.34;
  if (opts.wellbeingActionsDone > 0) wellbeingProgress += 0.33;
  if (opts.leisureChoice) wellbeingProgress += 0.33;

  const movement = computeMovementRing({
    workoutChoice: opts.workoutChoice,
    steps: opts.steps,
    leisureChoice: opts.leisureChoice,
  });

  return defaultDayRings({
    mealsDone,
    mealsTotal,
    movement,
    diaryDone: opts.diaryDone,
    wellbeingProgress: Math.min(1, wellbeingProgress),
  });
}
