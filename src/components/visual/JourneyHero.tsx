"use client";

import { JOURNEY_PHASES } from "@/lib/user-journey";
import type { JourneyProgress } from "@/lib/user-journey";
import { VC } from "@/lib/design-tokens";

export function JourneyHero({
  progress,
  nextTitle,
}: {
  progress: JourneyProgress;
  nextTitle?: string;
}) {
  const phaseInfo = JOURNEY_PHASES.find((p) => p.phase === progress.currentPhase);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (progress.percent / 100) * circumference;

  return (
    <div className="journey-hero vc-animate-scale relative rounded-3xl p-6 overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${VC.accent} 0%, ${VC.accentHover} 100%)` }}
      />

      <div className="relative flex items-center gap-5">
        <div className="relative w-[108px] h-[108px] shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="journey-ring-progress"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-black leading-none">{progress.percent}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest opacity-75">
            Фаза {progress.currentPhase} · {phaseInfo?.label}
          </p>
          <p className="text-[13px] opacity-85 mt-1">{phaseInfo?.weeks}</p>
          {nextTitle && (
            <p className="text-[13px] mt-2 opacity-90 line-clamp-2">{nextTitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
