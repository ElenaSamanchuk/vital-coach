"use client";

import type { TrackingTag } from "@/lib/tracking-tags";
import { TAG_COLOR_CLASS } from "@/lib/tracking-tags";

export function TagStats({
  tags,
  counts,
  days,
}: {
  tags: TrackingTag[];
  counts: Record<string, number>;
  days: number;
}) {
  const sorted = tags
    .map((t) => ({ tag: t, count: counts[t.id] ?? 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (sorted.length === 0) {
    return (
      <p className="text-[12px] text-[var(--text-secondary)]">
        Отмечай метки в дневнике — здесь появится статистика за {days} дней
      </p>
    );
  }

  const max = sorted[0]?.count ?? 1;

  return (
    <div className="space-y-2">
      {sorted.map(({ tag, count }) => (
        <div key={tag.id} className="flex items-center gap-2">
          <span
            className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${TAG_COLOR_CLASS[tag.color]}`}
          >
            {tag.emoji} {tag.label}
          </span>
          <div className="flex-1 h-2 rounded-full bg-[var(--gray-soft)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] opacity-80"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-[var(--text-secondary)] w-6 text-right">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}
