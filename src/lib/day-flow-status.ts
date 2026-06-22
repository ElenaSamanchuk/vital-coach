/**
 * Чеклист «одного потока дня» — что заполнено, что осталось.
 */
import { spheresTouched, type LifePulseDay } from "./life-pulse";
import { slotChoices } from "./today-choices";

export interface DayFlowBlock {
  id: string;
  label: string;
  done: boolean;
  hint?: string;
}

export function buildDayFlowBlocks(opts: {
  mood?: number | null;
  energy?: number | null;
  mealChoices: Record<string, string[]>;
  mealSlots: string[];
  workoutIds: string[];
  lifePulse: LifePulseDay;
  waterMl?: number;
  sleepMinutes?: number | null;
  savedToday?: boolean;
}): DayFlowBlock[] {
  const mealsDone = opts.mealSlots.filter((s) => (opts.mealChoices[s]?.length ?? 0) > 0).length;
  const moodDone = opts.mood != null && opts.energy != null;
  const moveDone = opts.workoutIds.length > 0;
  const balanceDone = spheresTouched(opts.lifePulse) >= 1;
  const waterDone = (opts.waterMl ?? 0) >= 500;
  const sleepDone = (opts.sleepMinutes ?? 0) >= 300;

  return [
    {
      id: "mood",
      label: "Настроение",
      done: moodDone,
      hint: moodDone ? "отмечено" : "4 кнопки вверху",
    },
    {
      id: "food",
      label: "Еда",
      done: mealsDone > 0,
      hint: mealsDone > 0 ? `${mealsDone} приём(а)` : "хотя бы один",
    },
    {
      id: "move",
      label: "Движение",
      done: moveDone,
      hint: moveDone ? "выбрано" : "можно пропустить",
    },
    {
      id: "balance",
      label: "Баланс",
      done: balanceDone,
      hint: balanceDone ? `${spheresTouched(opts.lifePulse)}/4 сфер` : "работа · уход · досуг · быт",
    },
    {
      id: "water",
      label: "Вода",
      done: waterDone,
      hint: waterDone ? `${opts.waterMl} мл` : "стаканы ниже",
    },
    {
      id: "sleep",
      label: "Сон",
      done: sleepDone,
      hint: sleepDone ? `${Math.round((opts.sleepMinutes ?? 0) / 60)} ч` : "вечером",
    },
  ];
}

export function dayFlowProgress(blocks: DayFlowBlock[]): {
  done: number;
  total: number;
  pct: number;
} {
  const done = blocks.filter((b) => b.done).length;
  return { done, total: blocks.length, pct: Math.round((done / blocks.length) * 100) };
}

export function mealChoicesFromRaw(raw: Record<string, string | string[]>): Record<string, string[]> {
  return slotChoices(raw);
}
