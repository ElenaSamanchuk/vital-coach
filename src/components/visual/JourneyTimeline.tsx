"use client";

import Link from "next/link";
import { JOURNEY_STEPS, type JourneyProgress } from "@/lib/user-journey";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export function JourneyTimeline({ progress }: { progress: JourneyProgress }) {
  const firstIncompleteIdx = JOURNEY_STEPS.findIndex((s) => !progress.completed.includes(s.id));
  const start = Math.max(0, firstIncompleteIdx - 1);
  const visible = JOURNEY_STEPS.slice(start, start + 4);

  return (
    <div className="space-y-2">
      {visible.map((step) => {
        const done = progress.completed.includes(step.id);
        const isCurrent = step.id === JOURNEY_STEPS[firstIncompleteIdx]?.id;
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl",
              isCurrent ? "bg-[var(--accent-soft)] border border-[var(--accent)]/20" : "bg-[var(--bg-subtle)]",
              done && "opacity-50",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold",
                done
                  ? "bg-[var(--success)] text-white"
                  : isCurrent
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[#e8e8ed] text-[var(--text-tertiary)]",
              )}
            >
              {done ? <Check size={14} /> : step.phase}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-[14px] font-medium truncate", done && "line-through")}>
                {step.title}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">{step.subtitle}</p>
            </div>
            {isCurrent && (
              <Link href={step.href} className="shrink-0 text-[12px] font-semibold text-[var(--accent)]">
                {step.hrefLabel} →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
