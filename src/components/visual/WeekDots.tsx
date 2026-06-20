"use client";

const DAY_LABELS = ["П", "В", "С", "Ч", "П", "С", "В"];

export function WeekDots({
  loggedDays,
}: {
  /** ISO date strings YYYY-MM-DD for last 7 days ending today */
  loggedDays: string[];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logged = new Set(loggedDays);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const isToday = i === 6;
    return { iso, isToday, filled: logged.has(iso), dow: d.getDay() };
  });

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((day, i) => (
        <div key={day.iso} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[9px] text-[var(--text-tertiary)]">
            {DAY_LABELS[day.dow === 0 ? 6 : day.dow - 1]}
          </span>
          <div
            className={`w-3 h-3 rounded-full border transition-colors ${
              day.filled
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : day.isToday
                  ? "border-[var(--accent)] bg-transparent ring-2 ring-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
            }`}
            title={day.iso}
          />
        </div>
      ))}
    </div>
  );
}
