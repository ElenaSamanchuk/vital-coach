"use client";

import { LIFE_SPHERES, type WheelScores } from "@/lib/life-spheres";
import { cn } from "@/lib/cn";

function scoreColor(score: number): string {
  if (score >= 8) return "bg-[var(--success)]";
  if (score >= 6) return "bg-[#30d158]/70";
  if (score >= 4) return "bg-[var(--warning)]";
  return "bg-[var(--danger)]";
}

export function LifeMatrixBoard({ scores }: { scores: WheelScores }) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {LIFE_SPHERES.map((s) => {
          const val = scores[s.key] ?? 0;
          const filled = val > 0;
          return (
            <div
              key={s.key}
              className={cn(
                "vc-glass-card rounded-2xl p-3 text-center transition-all hover:scale-[1.03]",
              )}
              style={{ borderLeft: filled ? `3px solid ${s.color}` : undefined }}
            >
              <p className="text-[11px] font-semibold leading-tight">{s.label}</p>
              <div
                className={cn(
                  "mt-2 mx-auto w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[15px]",
                  filled ? scoreColor(val) : "bg-[#e8e8ed] text-[var(--text-secondary)]",
                )}
              >
                {filled ? val : "—"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4 text-[10px] text-[var(--text-secondary)]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[var(--danger)]" /> 1–4</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[var(--warning)]" /> 5–6</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[var(--success)]" /> 7–10</span>
      </div>
    </div>
  );
}
