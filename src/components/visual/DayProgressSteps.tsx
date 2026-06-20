"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { TODAY_STEPS } from "@/lib/visual-icons";
import { VC } from "@/lib/design-tokens";

export function DayProgressSteps({
  done,
}: {
  done: { meals: boolean; workout: boolean; diary: boolean };
}) {
  const items = TODAY_STEPS.map((s) => ({
    ...s,
    complete: done[s.id as keyof typeof done],
  }));

  return (
    <div className="flex items-center gap-1">
      {items.map((step, i) => {
        const StepIcon = step.Icon;
        const inner = (
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                step.complete ? "text-white" : "text-[var(--accent)]",
              )}
              style={{
                background: step.complete ? VC.success : VC.accentSoft,
              }}
            >
              {step.complete ? <Check size={18} strokeWidth={3} /> : <StepIcon size={18} />}
            </div>
            <span className="text-[9px] font-medium mt-1 text-[var(--text-secondary)]">{step.label}</span>
          </div>
        );

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            {step.id === "diary" ? (
              <Link href="/log" className="flex-1 min-w-0">
                {inner}
              </Link>
            ) : (
              <div className="flex-1 min-w-0">{inner}</div>
            )}
            {i < items.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-2 shrink-0 rounded-full mb-4",
                  step.complete ? "bg-[var(--success)]" : "bg-[#e8e8ed]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
