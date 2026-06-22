import { addDays, differenceInDays, format, parseISO, startOfDay } from "date-fns";
import { getCycleDay, getCyclePhase } from "./cycle";

export const DEFAULT_PERIOD_DAYS = 5;

export interface PeriodMeta {
  periodStarts: string[];
  periodDays: number;
  cycleLength: number;
}

export function parsePeriodMeta(assessmentJson?: string | null): PeriodMeta {
  let periodStarts: string[] = [];
  let periodDays = DEFAULT_PERIOD_DAYS;
  if (assessmentJson) {
    try {
      const j = JSON.parse(assessmentJson) as {
        periodStarts?: string[];
        periodDays?: number;
      };
      if (Array.isArray(j.periodStarts)) {
        periodStarts = j.periodStarts.filter(Boolean).slice(0, 36);
      }
      if (j.periodDays && j.periodDays >= 3 && j.periodDays <= 8) {
        periodDays = j.periodDays;
      }
    } catch {
      /* */
    }
  }
  return { periodStarts, periodDays, cycleLength: 28 };
}

export function mergePeriodStarts(
  assessmentJson: string | null | undefined,
  newStart: string,
  periodDays = DEFAULT_PERIOD_DAYS,
): string {
  let base: Record<string, unknown> = {};
  try {
    base = JSON.parse(assessmentJson || "{}") as Record<string, unknown>;
  } catch {
    base = {};
  }
  const existing = Array.isArray(base.periodStarts)
    ? (base.periodStarts as string[])
    : [];
  const starts = [newStart, ...existing.filter((d) => d !== newStart)].slice(0, 36);
  const savedDays =
    typeof base.periodDays === "number" && base.periodDays >= 3 && base.periodDays <= 8
      ? base.periodDays
      : periodDays;
  return JSON.stringify({ ...base, periodStarts: starts, periodDays: savedDays });
}

export function isMenstrualDay(
  date: Date,
  starts: string[],
  periodDays = DEFAULT_PERIOD_DAYS,
): boolean {
  const d = startOfDay(date);
  for (const s of starts) {
    const start = startOfDay(parseISO(s.split("T")[0]));
    const diff = differenceInDays(d, start);
    if (diff >= 0 && diff < periodDays) return true;
  }
  return false;
}

export function buildCycleChartData(
  from: Date,
  to: Date,
  starts: string[],
  periodDays = DEFAULT_PERIOD_DAYS,
): { date: string; dateLabel: string; menstrual: number; cycleDay: number | null }[] {
  const out: { date: string; dateLabel: string; menstrual: number; cycleDay: number | null }[] = [];
  let cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) {
    out.push({
      date: format(cur, "yyyy-MM-dd"),
      dateLabel: format(cur, "d.M"),
      menstrual: isMenstrualDay(cur, starts, periodDays) ? 1 : 0,
      cycleDay: null,
    });
    cur = addDays(cur, 1);
  }
  return out;
}

export function cycleStatus(
  lastPeriodStart: Date | string | null,
  cycleLength: number,
  reference = new Date(),
): { day: number | null; phase: ReturnType<typeof getCyclePhase>; label: string } {
  const start =
    lastPeriodStart instanceof Date
      ? lastPeriodStart
      : lastPeriodStart
        ? parseISO(String(lastPeriodStart).split("T")[0])
        : null;
  const day = getCycleDay(start, cycleLength, reference);
  const phase = getCyclePhase(day, cycleLength);
  let label = "Цикл не отмечен";
  if (day != null && phase) {
    const phaseRu: Record<string, string> = {
      menstrual: "менструация",
      follicular: "фолликулярная",
      ovulation: "овуляция",
      luteal: "лютеиновая",
    };
    label = `День ${day} · ${phaseRu[phase] ?? phase}`;
  }
  return { day, phase, label };
}
