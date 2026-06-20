"use client";

import Link from "next/link";
import { JOURNEY_PHASES, JOURNEY_STEPS, type JourneyProgress } from "@/lib/user-journey";
import { cn } from "@/lib/cn";
import { Check, Circle } from "lucide-react";

export function DevelopmentPath({ progress }: { progress: JourneyProgress }) {
  const currentPhase = progress.currentPhase;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="vc-label">Твой путь</p>
          <p className="text-[28px] font-bold tracking-tight">{progress.percent}%</p>
        </div>
        <div className="vc-glass-card rounded-2xl px-4 py-2 text-center">
          <p className="text-[11px] text-[var(--text-secondary)]">Фаза</p>
          <p className="font-bold text-[var(--accent)]">{currentPhase}/5</p>
        </div>
      </div>

      <div className="vc-progress-track h-2">
        <div
          className="vc-progress-fill h-full"
          style={{
            width: `${progress.percent}%`,
            background: "linear-gradient(90deg, #6baf92, var(--accent))",
          }}
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {JOURNEY_PHASES.map((p) => (
          <div
            key={p.phase}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all",
              p.phase === currentPhase
                ? "bg-[var(--accent)] text-white shadow-md"
                : p.phase < currentPhase
                  ? "bg-[var(--success-soft)] text-[#248a3d]"
                  : "bg-black/5 text-[var(--text-secondary)]",
            )}
          >
            {p.label}
          </div>
        ))}
      </div>

      <div className="space-y-0">
        {JOURNEY_STEPS.map((step) => {
          const done = progress.completed.includes(step.id);
          const firstIncomplete = JOURNEY_STEPS.find((s) => !progress.completed.includes(s.id))?.id;
          const isNext = step.id === firstIncomplete;
          return (
            <div key={step.id} className={cn("path-node relative pl-6 pb-4", done && "opacity-90")}>
              <div className="path-line" />
              <div
                className={cn(
                  "absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                  done
                    ? "bg-[var(--success)] text-white"
                    : isNext
                      ? "bg-[var(--accent)] text-white ring-4 ring-[var(--accent-glow)] animate-pulse"
                      : "bg-[#e8e8ed] text-[var(--text-tertiary)]",
                )}
              >
                {done ? <Check size={12} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
              </div>
              <div
                className={cn(
                  "vc-glass-card rounded-xl p-3 transition-transform",
                  isNext && "scale-[1.02] vc-glow-accent",
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-lg mr-1">{step.icon}</span>
                    <span className={cn("font-semibold text-[14px]", done && "line-through text-[var(--text-secondary)]")}>
                      {step.title}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{step.subtitle}</p>
                  </div>
                  {!done && (
                    <Link
                      href={step.href}
                      className="shrink-0 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-full"
                    >
                      {step.hrefLabel}
                    </Link>
                  )}
                </div>
                {isNext && (
                  <p className="text-[12px] mt-2 text-[var(--text)]">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
