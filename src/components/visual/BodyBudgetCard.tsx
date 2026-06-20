"use client";

import { Wallet } from "lucide-react";
import type { BodyBudget } from "@/lib/body-budget";

export function BodyBudgetCard({ budget }: { budget: BodyBudget }) {
  const pct = budget.allowance > 0 ? Math.min(1, budget.spent / budget.allowance) : 0;

  return (
    <div className="rounded-xl bg-[var(--bg-subtle)] p-3 border border-[var(--border)]">
      <div className="flex items-center gap-2 mb-2">
        <Wallet size={14} className="text-[var(--brown)]" />
        <span className="text-[11px] font-semibold">Бюджет тела</span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">не «дефицит», а кошелёк</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-bold text-[var(--accent)]">{budget.remaining}</span>
        <span className="text-[12px] text-[var(--text-secondary)]">ккал осталось</span>
        <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">
          {budget.spent}/{budget.allowance}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--gray-soft)] mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct * 100}%`,
            background: budget.overBy > 0 ? "var(--pink)" : "var(--accent)",
          }}
        />
      </div>
      <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-snug">{budget.message}</p>
      {budget.weeklyCredit > 0 && (
        <p className="text-[10px] text-[var(--brown)] mt-1">
          Недельный кредит: {budget.weeklyCredit} ккал на ужин или событие
        </p>
      )}
    </div>
  );
}
