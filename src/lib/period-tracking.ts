import { addDays, differenceInDays, format, parseISO, startOfDay } from "date-fns";
import { getCycleDay, getCyclePhase } from "./cycle";

export interface PeriodMeta {
  menstrualDays: string[];
  cycleLength: number;
}

function normalizeIso(d: string): string {
  return d.split("T")[0];
}

/** Развернуть старый формат periodStarts + duration в список дней */
function migrateLegacyStarts(starts: string[], periodDays: number): string[] {
  const out: string[] = [];
  for (const start of starts) {
    const base = startOfDay(parseISO(normalizeIso(start)));
    for (let i = 0; i < periodDays; i++) {
      out.push(format(addDays(base, i), "yyyy-MM-dd"));
    }
  }
  return out;
}

export function parsePeriodMeta(assessmentJson?: string | null): PeriodMeta {
  let menstrualDays: string[] = [];
  if (assessmentJson) {
    try {
      const j = JSON.parse(assessmentJson) as {
        menstrualDays?: string[];
        periodStarts?: string[];
        periodDays?: number;
      };
      if (Array.isArray(j.menstrualDays) && j.menstrualDays.length > 0) {
        menstrualDays = j.menstrualDays.map(normalizeIso).filter(Boolean);
      } else if (Array.isArray(j.periodStarts) && j.periodStarts.length > 0) {
        const pd =
          typeof j.periodDays === "number" && j.periodDays >= 1 && j.periodDays <= 10
            ? j.periodDays
            : 5;
        menstrualDays = migrateLegacyStarts(j.periodStarts, pd);
      }
    } catch {
      /* */
    }
  }
  menstrualDays = [...new Set(menstrualDays)].sort().slice(-120);
  return { menstrualDays, cycleLength: 28 };
}

export function isMenstrualDay(date: Date, days: string[]): boolean {
  const iso = format(startOfDay(date), "yyyy-MM-dd");
  return days.includes(iso);
}

/** Первый день последней непрерывной серии — для расчёта фазы цикла */
export function deriveLastPeriodStart(menstrualDays: string[]): string | null {
  if (menstrualDays.length === 0) return null;
  const sorted = [...menstrualDays].map(normalizeIso).sort();
  const groups: string[][] = [];
  let group = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const cur = parseISO(sorted[i]);
    if (differenceInDays(cur, prev) === 1) {
      group.push(sorted[i]);
    } else {
      groups.push(group);
      group = [sorted[i]];
    }
  }
  groups.push(group);
  return groups[groups.length - 1]?.[0] ?? null;
}

export function toggleMenstrualDay(
  assessmentJson: string | null | undefined,
  date: string,
): string {
  let base: Record<string, unknown> = {};
  try {
    base = JSON.parse(assessmentJson || "{}") as Record<string, unknown>;
  } catch {
    base = {};
  }
  const iso = normalizeIso(date);
  const current = parsePeriodMeta(assessmentJson).menstrualDays;
  const next = current.includes(iso)
    ? current.filter((d) => d !== iso)
    : [...current, iso].sort();
  return JSON.stringify({ ...base, menstrualDays: next });
}

export function buildCycleChartData(
  from: Date,
  to: Date,
  menstrualDays: string[],
): { date: string; dateLabel: string; menstrual: number; cycleDay: number | null }[] {
  const set = new Set(menstrualDays.map(normalizeIso));
  const out: { date: string; dateLabel: string; menstrual: number; cycleDay: number | null }[] = [];
  let cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) {
    const iso = format(cur, "yyyy-MM-dd");
    out.push({
      date: iso,
      dateLabel: format(cur, "d.M"),
      menstrual: set.has(iso) ? 1 : 0,
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
