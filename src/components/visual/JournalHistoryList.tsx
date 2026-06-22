"use client";

import type { JournalEntry } from "@/lib/day-memories";

export function JournalHistoryList({ entries }: { entries: JournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="vc-text-sm text-[var(--text-secondary)] py-4 text-center">
        Заметки и фото появятся после сохранения дней
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {entries.map((e) => (
        <div key={e.date} className="rounded-xl border border-[var(--border)] p-3 space-y-2">
          <p className="vc-text-xs font-semibold text-[var(--text-secondary)]">{e.dateLabel}</p>
          {e.dayPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.dayPhoto} alt="" className="w-full max-h-28 object-cover rounded-lg" />
          )}
          {e.notes && (
            <p className="vc-text-sm leading-snug line-clamp-3">{e.notes}</p>
          )}
          {e.mood != null && (
            <p className="vc-text-xs text-[var(--text-tertiary)]">Настроение: {e.mood}/10</p>
          )}
        </div>
      ))}
    </div>
  );
}
