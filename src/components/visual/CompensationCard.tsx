"use client";

import { Scale } from "lucide-react";
import type { CompensationSummary } from "@/lib/compensation-plan";

export function CompensationCard({ plan }: { plan: CompensationSummary }) {
  if (plan.items.length === 0) return null;

  return (
    <div className="rounded-xl bg-[var(--brown-soft)] border border-[var(--brown)]/25 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Scale size={14} className="text-[var(--brown)]" />
        <span className="text-[11px] font-semibold">Мягкая компенсация</span>
      </div>
      <p className="text-[12px] font-medium">{plan.headline}</p>
      <ul className="mt-2 space-y-1.5">
        {plan.items.map((item) => (
          <li key={item.domain} className="text-[10px] text-[var(--text-secondary)] leading-snug">
            <span className="font-semibold text-[var(--text)]">{item.title}: </span>
            {item.action}
          </li>
        ))}
      </ul>
      {(plan.netCalorieAdjust < 0 || plan.netExtraWalkMin > 0 || plan.netExtraProteinG > 0) && (
        <p className="text-[10px] text-[var(--brown)] mt-2 font-medium">
          {[
            plan.netCalorieAdjust < 0 && `Еда ${plan.netCalorieAdjust} ккал`,
            plan.netExtraWalkMin > 0 && `+${plan.netExtraWalkMin} мин ходьбы`,
            plan.netExtraProteinG > 0 && `+${plan.netExtraProteinG} г белка`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
