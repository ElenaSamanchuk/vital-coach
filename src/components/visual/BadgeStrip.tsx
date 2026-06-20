"use client";

import { ACHIEVEMENT_DEFS } from "@/lib/gamification";

export function BadgeStrip({ unlockedIds }: { unlockedIds: string[] }) {
  const shown = ACHIEVEMENT_DEFS.filter((a) => unlockedIds.includes(a.id)).slice(-4);
  if (shown.length === 0) {
    return (
      <p className="text-[11px] text-[var(--text-secondary)]">
        Бейджи за серию дней, белок и мягкий день появятся здесь
      </p>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {shown.map((a) => (
        <div
          key={a.id}
          className="shrink-0 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20 px-3 py-2 text-center min-w-[88px]"
        >
          <span className="text-[20px]">{a.emoji}</span>
          <p className="text-[9px] font-semibold mt-1 leading-tight">{a.title}</p>
        </div>
      ))}
    </div>
  );
}
