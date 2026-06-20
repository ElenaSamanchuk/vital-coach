"use client";

import { Calculator } from "lucide-react";
import type { CalorieExplainer } from "@/lib/calorie-explainer";

export function CalorieExplainerCard({ explainer }: { explainer: CalorieExplainer }) {
  return (
    <details className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4">
      <summary className="cursor-pointer list-none flex items-center gap-2">
        <Calculator size={16} className="text-[var(--accent)] shrink-0" />
        <span className="text-[13px] font-semibold">{explainer.headline}</span>
      </summary>
      <ul className="mt-3 space-y-2">
        {explainer.bullets.map((b, i) => (
          <li key={i} className="text-[11px] text-[var(--text-secondary)] leading-snug flex gap-2">
            <span className="text-[var(--accent)] shrink-0">·</span>
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-3 text-center text-[10px]">
        <div className="flex-1 rounded-xl bg-[var(--bg-subtle)] p-2">
          <p className="text-[var(--text-tertiary)]">Полный расход</p>
          <p className="font-bold text-[15px]">{explainer.comparison.genericTdee}</p>
        </div>
        <div className="flex-1 rounded-xl bg-[var(--accent-soft)] p-2">
          <p className="text-[var(--text-tertiary)]">Твоя цель</p>
          <p className="font-bold text-[15px] text-[var(--accent)]">
            {explainer.comparison.yourTarget}
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-[var(--bg-subtle)] p-2">
          <p className="text-[var(--text-tertiary)]">Дефицит</p>
          <p className="font-bold text-[15px]">−{explainer.comparison.delta}</p>
        </div>
      </div>
    </details>
  );
}
