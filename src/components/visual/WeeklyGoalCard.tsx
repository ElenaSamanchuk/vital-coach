"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";

const DIARY_GOAL = 3;
const STREAK_GOAL = 5;

export function WeeklyGoalCard({
  diaryDaysThisWeek,
  streak,
}: {
  diaryDaysThisWeek: number;
  streak: number;
}) {
  const diaryPct = Math.min(1, diaryDaysThisWeek / DIARY_GOAL);
  const streakDone = streak >= STREAK_GOAL;

  return (
    <div className="vc-glass-card rounded-2xl space-y-3">
      <div>
        <p className="vc-text-sm font-semibold text-[var(--text)]">Цель недели</p>
        <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5">Мягко — без давления</p>
      </div>
      <div>
        <div className="flex justify-between text-[12px] mb-1">
          <span className="text-[var(--text-secondary)]">Записи в дневнике</span>
          <span className="font-semibold tabular-nums">
            {diaryDaysThisWeek}/{DIARY_GOAL}
          </span>
        </div>
        <ProgressBar value={diaryDaysThisWeek} max={DIARY_GOAL} />
        {diaryDaysThisWeek < DIARY_GOAL && (
          <Link href="/log?tab=quick" className="text-[11px] text-[var(--accent)] font-medium mt-2 inline-block">
            Записать сегодня →
          </Link>
        )}
      </div>
      <p className="text-[12px] text-[var(--text-secondary)]">
        Серия {streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"}
        {streakDone ? " — цель недели по серии ✓" : ` · до ${STREAK_GOAL} дней подряд`}
      </p>
    </div>
  );
}
