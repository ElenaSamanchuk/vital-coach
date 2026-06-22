"use client";

import type { DayMemory } from "@/lib/day-memories";

export function DayMemoryCard({ memories }: { memories: DayMemory[] }) {
  if (memories.length === 0) return null;

  return (
    <div className="vc-glass-card rounded-2xl p-4 space-y-3">
      <p className="vc-text-sm font-semibold">В этот день раньше</p>
      {memories.map((m) => (
        <div key={m.date} className="rounded-xl bg-[var(--bg-subtle)] p-3 space-y-2">
          <p className="vc-text-xs font-semibold text-[var(--accent)]">{m.label}</p>
          {m.dayPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.dayPhoto}
              alt=""
              className="w-full max-h-32 object-cover rounded-lg"
            />
          )}
          {m.notes && (
            <p className="vc-text-sm text-[var(--text-secondary)] leading-snug line-clamp-4">
              {m.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
