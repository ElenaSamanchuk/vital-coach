"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarDay } from "@/lib/day-calendar";
import { resolveDotColor } from "@/lib/day-calendar";
import type { TrackingTag } from "@/lib/tracking-tags";
import { enrichTags } from "@/lib/tracking-tags";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function DaylioCalendar({
  days,
  tags = [],
}: {
  days: CalendarDay[];
  tags?: TrackingTag[];
}) {
  const [month, setMonth] = useState(new Date());
  const enriched = enrichTags(tags);
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allCells = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const byDate = new Map(days.map((d) => [d.date, d]));
  const todayKey = format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="p-1 rounded-lg hover:bg-[var(--bg-subtle)]"
          aria-label="Прошлый месяц"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-[13px] font-semibold capitalize">
          {format(month, "LLLL yyyy", { locale: ru })}
        </p>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="p-1 rounded-lg hover:bg-[var(--bg-subtle)]"
          aria-label="Следующий месяц"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-[9px] text-center text-[var(--text-tertiary)] font-medium">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {allCells.map((cell) => {
          const key = format(cell, "yyyy-MM-dd");
          const entry = byDate.get(key);
          const inMonth = isSameMonth(cell, month);
          const isToday = key === todayKey;
          const color = entry ? resolveDotColor(entry, enriched) : "var(--gray-soft)";

          return (
            <div
              key={key}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg ${
                isToday ? "ring-2 ring-[var(--accent)] ring-offset-1" : ""
              } ${inMonth ? "" : "opacity-30"}`}
            >
              <span className="text-[10px] text-[var(--text-secondary)]">{format(cell, "d")}</span>
              <span className="w-2 h-2 rounded-full mt-0.5" style={{ background: color }} />
              {entry?.hasPhoto && (
                <span className="w-1 h-1 rounded-full bg-[var(--brown)] -mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-[var(--text-tertiary)] mt-3">
        Точка: цвет плашки или настроение · коричневая точка = фото
      </p>
    </div>
  );
}
