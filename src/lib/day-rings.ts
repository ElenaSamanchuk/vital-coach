import { VC } from "./design-tokens";

export interface RingSegment {
  id: string;
  label: string;
  progress: number;
  color: string;
  done: boolean;
  /** «2/4», «67%» — подпись в легенде */
  hint?: string;
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
      progress: opts.workoutDone ? 1 : 0,
      color: VC.ringMove,
      done: opts.workoutDone,
      hint: opts.workoutDone ? "выбрано" : "—",
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

/** Единая логика колец для «Сегодня» — только явный выбор пользователя */
export function buildTodayRings(opts: {
  mealSlots: string[];
  mealChoices: Record<string, string>;
  workoutChoice?: string | null;
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

  return defaultDayRings({
    mealsDone,
    mealsTotal,
    workoutDone: Boolean(opts.workoutChoice),
    diaryDone: opts.diaryDone,
    wellbeingProgress: Math.min(1, wellbeingProgress),
  });
}
