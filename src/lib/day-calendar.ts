import { parseDayTags, type TagColor, type TrackingTag } from "./tracking-tags";

export interface CalendarDay {
  date: string;
  mood?: number | null;
  energy?: number | null;
  hasLog: boolean;
  hasPhoto: boolean;
  tagIds: string[];
}

const MOOD_COLORS: Record<string, string> = {
  great: "var(--accent)",
  ok: "var(--purple)",
  low: "var(--pink)",
  stress: "var(--brown)",
  empty: "var(--gray-soft)",
};

const TAG_COLOR_MAP: Record<TagColor, string> = {
  green: "var(--accent)",
  gray: "var(--gray)",
  brown: "var(--brown)",
  purple: "var(--purple)",
  pink: "var(--pink)",
  black: "var(--text)",
};

export function moodDotColor(mood?: number | null, energy?: number | null, stress?: number): string {
  if (mood == null && energy == null) return MOOD_COLORS.empty;
  const m = mood ?? 7;
  const e = energy ?? 7;
  const s = stress ?? 5;
  if (s >= 7 || m <= 4 || e <= 4) return MOOD_COLORS.stress;
  if (m >= 8 && e >= 7) return MOOD_COLORS.great;
  if (m >= 6) return MOOD_COLORS.ok;
  return MOOD_COLORS.low;
}

export function tagColorFromMap(color: TagColor): string {
  return TAG_COLOR_MAP[color];
}

/** Приоритет: первая плашка дня → иначе настроение */
export function resolveDotColor(
  day: CalendarDay,
  tags: TrackingTag[],
): string {
  if (day.tagIds.length > 0) {
    const first = tags.find((t) => t.id === day.tagIds[0]);
    if (first) return tagColorFromMap(first.color);
  }
  if (day.hasLog) return moodDotColor(day.mood, day.energy);
  return MOOD_COLORS.empty;
}

export function logsToCalendarDays(
  logs: {
    date: string | Date;
    mood?: number | null;
    energy?: number | null;
    stress?: number | null;
    dayTagsJson?: string | null;
    dayPhoto?: string | null;
    weightKg?: number | null;
  }[],
): CalendarDay[] {
  return logs.map((l) => ({
    date: String(l.date).slice(0, 10),
    mood: l.mood,
    energy: l.energy,
    hasLog: l.mood != null || l.weightKg != null || l.energy != null,
    hasPhoto: Boolean(l.dayPhoto),
    tagIds: parseDayTags(l.dayTagsJson),
  }));
}

export function countTagUsage(
  logs: { dayTagsJson?: string | null }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const l of logs) {
    for (const id of parseDayTags(l.dayTagsJson)) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
  return counts;
}
