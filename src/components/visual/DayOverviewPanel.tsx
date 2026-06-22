"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Home,
  Heart,
  Users,
  Sparkles,
  Activity,
} from "lucide-react";
import { DayMiniRings, type MiniRingSpec } from "./DayMiniRings";
import type { DiversitySphere } from "@/lib/day-diversity";

const SPHERE_ICONS: Record<string, LucideIcon> = {
  work: Briefcase,
  home: Home,
  care: Heart,
  social: Users,
  leisure: Sparkles,
  move: Activity,
};

function BalanceWheel({
  spheres,
  score,
  hint,
}: {
  spheres: DiversitySphere[];
  score: number;
  hint: string;
}) {
  const active = spheres.filter((s) => s.active).length;

  return (
    <div className="pt-3 border-t border-[var(--border)]/60">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0 w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx={32} cy={32} r={26} fill="none" stroke="var(--ring-track)" strokeWidth={5} />
            <circle
              cx={32}
              cy={32}
              r={26}
              fill="none"
              stroke="url(#balanceGrad)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 163.4} 163.4`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="#4A90D9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[13px] font-bold tabular-nums text-[var(--accent)]">{score}%</span>
            <span className="text-[8px] text-[var(--text-tertiary)] leading-none">{active}/6</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="vc-text-xs font-semibold mb-2">Баланс дня</p>
          <div className="grid grid-cols-3 gap-1.5">
            {spheres.map((s) => {
              const Icon = SPHERE_ICONS[s.id] ?? Sparkles;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all ${
                    s.active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] opacity-50"
                  }`}
                >
                  <Icon size={12} strokeWidth={1.75} className="shrink-0" />
                  <span className="text-[9px] font-semibold truncate leading-none">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="vc-text-xs text-[var(--text-secondary)] mt-2 leading-snug">{hint}</p>
    </div>
  );
}

export function DayOverviewPanel({
  rings,
  spheres,
  score,
  hint,
}: {
  rings: MiniRingSpec[];
  spheres: DiversitySphere[];
  score: number;
  hint: string;
}) {
  return (
    <div className="vc-glass-card rounded-2xl px-2 pb-3">
      <DayMiniRings rings={rings} />
      <BalanceWheel spheres={spheres} score={score} hint={hint} />
    </div>
  );
}
