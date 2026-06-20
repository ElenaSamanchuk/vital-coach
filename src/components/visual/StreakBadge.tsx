"use client";

import { Flame, Snowflake } from "lucide-react";
import { VC } from "@/lib/design-tokens";

export function StreakBadge({
  days,
  freezeUsed,
}: {
  days: number;
  freezeUsed?: boolean;
}) {
  if (days < 1) return null;

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        style={{ background: VC.successSoft, color: VC.success }}
      >
        <Flame size={12} />
        {days} {days === 1 ? "день" : days < 5 ? "дня" : "дней"} подряд
      </span>
      {freezeUsed && (
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)]"
          title="Один пропуск за неделю не сбрасывает серию"
        >
          <Snowflake size={10} />
          день отдыха
        </span>
      )}
    </span>
  );
}
