"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

interface DayLog {
  date: string;
  mood?: number;
  notes?: string;
  dayPhoto?: string;
  mealChoices?: string;
  calories?: number;
}

function hasEntry(log: DayLog): boolean {
  return Boolean(
    log.mood != null ||
      log.notes?.trim() ||
      log.dayPhoto ||
      log.calories ||
      (log.mealChoices && log.mealChoices !== "{}" && log.mealChoices !== "null"),
  );
}

export function JournalCalendar({
  logs,
  selectedDate,
  onSelectDate,
  compact = false,
}: {
  logs: DayLog[];
  selectedDate?: Date;
  onSelectDate: (d: Date) => void;
  compact?: boolean;
}) {
  const [month, setMonth] = useState(() => startOfMonth(selectedDate ?? new Date()));

  const entryDates = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) {
      if (hasEntry(l)) set.add(l.date.split("T")[0]);
    }
    return set;
  }, [logs]);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [month]);

  const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className={`vc-glass-card rounded-2xl space-y-3 ${compact ? "p-3" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="vc-text-sm font-semibold capitalize">
          {format(month, "LLLL yyyy", { locale: ru })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setMonth((m) => subMonths(m, 1));
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-subtle)]"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setMonth((m) => addMonths(m, 1));
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-subtle)]"
            aria-label="Следующий месяц"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekdayLabels.map((d) => (
          <span key={d} className="vc-text-xs text-[var(--text-tertiary)] py-1">
            {d}
          </span>
        ))}
        {weeks.flat().map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const hasDot = entryDates.has(iso);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={iso}
              type="button"
              onClick={() => {
                hapticLight();
                onSelectDate(startOfDay(day));
              }}
              className={`relative flex flex-col items-center justify-center min-h-[2.25rem] rounded-lg vc-text-xs font-medium transition-colors ${
                !inMonth
                  ? "text-[var(--text-tertiary)]/40"
                  : selected
                    ? "bg-[var(--accent)] text-white"
                    : isToday
                      ? "ring-1 ring-[var(--accent)]/50 text-[var(--text)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              {format(day, "d")}
              {hasDot && inMonth && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    selected ? "bg-white" : "bg-[var(--accent)]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="vc-text-xs text-[var(--text-tertiary)] text-center">
        Точки — дни с записями · нажми, чтобы открыть
      </p>
    </div>
  );
}

export { navigateToDay } from "@/lib/app-path";
