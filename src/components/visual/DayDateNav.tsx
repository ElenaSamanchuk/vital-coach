"use client";

import { useMemo, useState } from "react";
import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

export function DayDateNav({
  date,
  onDateChange,
  onOpenCalendar,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  onOpenCalendar?: () => void;
}) {
  const today = startOfDay(new Date());
  const isToday = isSameDay(date, today);
  const label = isToday
    ? "Сегодня"
    : format(date, "d MMMM, EEEE", { locale: ru });

  const go = (delta: number) => {
    hapticLight();
    onDateChange(addDays(date, delta));
  };

  return (
    <div className="flex items-center gap-1 vc-glass-card rounded-2xl px-2 py-1.5">
      <button
        type="button"
        onClick={() => go(-1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
        aria-label="Предыдущий день"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => {
          if (onOpenCalendar) {
            hapticLight();
            onOpenCalendar();
          }
        }}
        className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1 capitalize"
      >
        <CalendarDays size={15} className="text-[var(--accent)] shrink-0" />
        <span className="vc-text-sm font-semibold truncate">{label}</span>
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        disabled={isToday}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-30"
        aria-label="Следующий день"
      >
        <ChevronRight size={20} />
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onDateChange(today);
          }}
          className="vc-text-xs font-semibold text-[var(--accent)] px-2 py-1 rounded-lg bg-[var(--accent-soft)]"
        >
          Сегодня
        </button>
      )}
    </div>
  );
}

export function useDayFromUrl(): [Date, (d: Date) => void] {
  const [date, setDate] = useState(() => startOfDay(new Date()));

  const setDateWithUrl = (d: Date) => {
    const normalized = startOfDay(d);
    setDate(normalized);
    const iso = format(normalized, "yyyy-MM-dd");
    const todayIso = format(new Date(), "yyyy-MM-dd");
    const url = new URL(window.location.href);
    if (iso === todayIso) {
      url.searchParams.delete("date");
    } else {
      url.searchParams.set("date", iso);
    }
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  return [date, setDateWithUrl];
}

export function readInitialDayFromUrl(): Date {
  if (typeof window === "undefined") return startOfDay(new Date());
  const param = new URLSearchParams(window.location.search).get("date");
  if (!param) return startOfDay(new Date());
  try {
    return startOfDay(parseISO(param));
  } catch {
    return startOfDay(new Date());
  }
}
