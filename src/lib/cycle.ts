import { addDays, differenceInDays, startOfDay } from "date-fns";
import type { CyclePhase } from "./types";

export function getCycleDay(
  lastPeriodStart: Date | null,
  cycleLength: number,
  referenceDate: Date = new Date(),
): number | null {
  if (!lastPeriodStart) return null;
  const days = differenceInDays(startOfDay(referenceDate), startOfDay(lastPeriodStart)) + 1;
  if (days < 1) return null;
  return ((days - 1) % cycleLength) + 1;
}

export function getCyclePhase(cycleDay: number | null, cycleLength: number): CyclePhase | null {
  if (!cycleDay) return null;
  const ovulationDay = Math.round(cycleLength * 0.5);
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay < ovulationDay - 2) return "follicular";
  if (cycleDay <= ovulationDay + 2) return "ovulation";
  return "luteal";
}

export function getCycleNote(phase: CyclePhase | null, cycleDay: number | null): string {
  if (!phase || !cycleDay) {
    return "Укажи дату начала последних месячных в настройках — коуч учтёт гормональные колебания веса.";
  }
  const notes: Record<CyclePhase, string> = {
    menstrual: `День ${cycleDay}: возможна слабость. Не занижай калории сильнее 1500. Лёгкое кардио/бассейн, не максимум.`,
    follicular: `День ${cycleDay}: хорошее окно для интенсивности. Силовая + вело. Вес обычно стабильнее.`,
    ovulation: `День ${cycleDay}: пик энергии. Интервалы на велосипеде, но не перегружай кортизол.`,
    luteal: `День ${cycleDay}: +1–3 кг воды нормально. Не паникуй. Больше белка, меньше соли, магний из овощей/орехов.`,
  };
  return notes[phase];
}

export function isWeighDay(cycleDay: number | null): boolean {
  return cycleDay !== null && cycleDay >= 5 && cycleDay <= 7;
}

export function estimateNextPeriod(lastPeriodStart: Date, cycleLength: number): Date {
  return addDays(lastPeriodStart, cycleLength);
}
