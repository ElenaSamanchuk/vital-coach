"use client";

import { Dna } from "lucide-react";

export function SyndromeCoachCard({
  headline,
  tip,
}: {
  headline: string;
  tip: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--purple)]/25 bg-[var(--purple-soft)] p-4">
      <div className="flex items-start gap-2">
        <Dna size={18} className="text-[var(--purple)] shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-bold text-[var(--purple)]">{headline}</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  );
}
