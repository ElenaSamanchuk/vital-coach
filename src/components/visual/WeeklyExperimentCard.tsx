"use client";

import { FlaskConical } from "lucide-react";
import type { WeeklyExperiment } from "@/lib/weekly-experiment";

export function WeeklyExperimentCard({ exp }: { exp: WeeklyExperiment }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <FlaskConical size={16} className="text-[var(--accent)]" />
        <span className="text-[12px] font-semibold">Эксперимент недели</span>
      </div>
      <p className="text-[14px] font-medium">{exp.label}</p>
      <p className="text-[11px] text-[var(--text-secondary)] mt-1">{exp.hypothesis}</p>
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-2 rounded-full bg-[var(--gray-soft)] overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full"
            style={{ width: `${Math.min(100, (exp.daysDone / 7) * 100)}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-[var(--accent)]">{exp.daysDone}/7</span>
      </div>
      {exp.conclusion && (
        <p className="text-[11px] text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border)] leading-snug">
          <span className="font-semibold text-[var(--accent)]">Итог недели: </span>
          {exp.conclusion}
        </p>
      )}
    </div>
  );
}
