import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export interface DayMemory {
  date: string;
  label: string;
  notes: string;
  dayPhoto?: string;
  mood?: number;
}

export interface JournalEntry {
  date: string;
  dateLabel: string;
  notes: string;
  dayPhoto?: string;
  mood?: number;
}

export function findDayMemories(
  logs: {
    date: string;
    notes?: string | null;
    dayPhoto?: string | null;
    mood?: number | null;
  }[],
  reference = new Date(),
): DayMemory[] {
  const today = format(reference, "MM-dd");
  const memories: DayMemory[] = [];

  for (const log of logs) {
    const raw = log.date.split("T")[0];
    const d = parseISO(raw);
    if (format(d, "MM-dd") !== today) continue;
    if (raw === format(reference, "yyyy-MM-dd")) continue;
    if (!log.notes?.trim() && !log.dayPhoto) continue;

    const daysAgo = differenceInCalendarDays(reference, d);
    let label = format(d, "d MMMM yyyy", { locale: ru });
    if (daysAgo >= 360 && daysAgo <= 370) label = `Год назад · ${label}`;
    else if (daysAgo >= 28 && daysAgo <= 35) label = `Месяц назад · ${label}`;
    else if (daysAgo >= 700) label = `${Math.round(daysAgo / 365)} года назад · ${label}`;
    else label = `${daysAgo} дн. назад · ${label}`;

    memories.push({
      date: raw,
      label,
      notes: log.notes?.trim() ?? "",
      dayPhoto: log.dayPhoto || undefined,
      mood: log.mood ?? undefined,
    });
  }

  return memories.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
}

export function journalEntries(
  logs: {
    date: string;
    notes?: string | null;
    dayPhoto?: string | null;
    mood?: number | null;
  }[],
  limit = 20,
): JournalEntry[] {
  return logs
    .filter((l) => l.notes?.trim() || l.dayPhoto)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((l) => {
      const raw = l.date.split("T")[0];
      return {
        date: raw,
        dateLabel: format(parseISO(raw), "d MMM yyyy", { locale: ru }),
        notes: l.notes?.trim() ?? "",
        dayPhoto: l.dayPhoto || undefined,
        mood: l.mood ?? undefined,
      };
    });
}
