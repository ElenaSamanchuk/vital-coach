import { format, parseISO, startOfDay } from "date-fns";

export function toDateKey(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(startOfDay(d), "yyyy-MM-dd");
}

export function startOfDayDate(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return startOfDay(d);
}
