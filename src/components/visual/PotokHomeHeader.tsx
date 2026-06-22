"use client";

import { useEffect, useState } from "react";
import { format, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Leaf } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { BRAND_GRADIENT } from "@/lib/design-tokens";
import { readInitialDayFromUrl } from "./DayDateNav";

/** Шапка «Мой день»: приветствие + дата (с учётом ?date=) */
export function PotokHomeHeader() {
  const [name, setName] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    setViewDate(readInitialDayFromUrl());
    const onPop = () => setViewDate(readInitialDayFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    apiClient("/api/profile")
      .then((r) => r.json())
      .then((p) => setName(p.name?.trim() || null))
      .catch(() => setName(null));
  }, []);

  const weekday = format(viewDate, "EEEE", { locale: ru });
  const dateStr = format(viewDate, "d MMMM", { locale: ru });
  const isToday = startOfDay(viewDate).getTime() === startOfDay(new Date()).getTime();
  const greeting = name ? `Привет, ${name}` : "Привет";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: BRAND_GRADIENT }}
        aria-hidden
      >
        <Leaf size={17} className="text-white" />
      </div>
      <div className="min-w-0">
        <h1 className="vc-display capitalize">{greeting}</h1>
        <p className="vc-subtitle vc-text-xs mt-0.5 truncate capitalize">
          {isToday ? weekday : "День"} · {dateStr}
          {!isToday && (
            <span className="text-[var(--accent)] ml-1">· прошлый день</span>
          )}
        </p>
      </div>
    </div>
  );
}
