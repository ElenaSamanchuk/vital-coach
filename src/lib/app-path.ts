import { format, startOfDay } from "date-fns";
import { BASE_PATH } from "./app-config";

/** Путь с учётом basePath GitHub Pages (/vital-coach) */
export function appPath(path = "/"): string {
  const base = BASE_PATH.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized}`.replace(/\/+/g, "/");
}

export function homePathWithDate(date?: Date): string {
  const todayIso = format(new Date(), "yyyy-MM-dd");
  const home = appPath("/");
  if (!date) return home;
  const iso = format(startOfDay(date), "yyyy-MM-dd");
  if (iso === todayIso) return home;
  return `${home}?date=${iso}`;
}

export function syncDayInUrl(date: Date) {
  if (typeof window === "undefined") return;
  const target = homePathWithDate(date);
  const current = window.location.pathname + window.location.search;
  if (current !== target) {
    window.history.replaceState({}, "", target);
  }
}

export function navigateToDay(date: Date) {
  window.location.href = homePathWithDate(date);
}
