"use client";

import { CYCLE_PHASES } from "@/lib/design-tokens";
import { cn } from "@/lib/cn";

export function CyclePhaseBar({
  phase,
  day,
}: {
  phase: string | null;
  day?: number | null;
}) {
  if (!phase) return null;

  return (
    <div className="mt-3">
      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[#e8e8ed]">
        {CYCLE_PHASES.map((p) => (
          <div
            key={p.id}
            className={cn("flex-1 transition-opacity", phase === p.id ? "opacity-100" : "opacity-25")}
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {CYCLE_PHASES.map((p) => (
          <span
            key={p.id}
            className={cn(
              "text-[9px] font-medium",
              phase === p.id ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]",
            )}
          >
            {p.label}
          </span>
        ))}
      </div>
      {day != null && (
        <p className="text-[11px] text-[var(--text-secondary)] mt-1">
          День {day} · {CYCLE_PHASES.find((p) => p.id === phase)?.full}
        </p>
      )}
    </div>
  );
}
