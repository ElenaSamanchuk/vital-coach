"use client";

import { BIG_FIVE_META, type BigFiveTrait } from "@/lib/psychology-frameworks";
import { RadarChart } from "../ui/RadarChart";

const TRAIT_COLORS: Record<BigFiveTrait, string> = {
  O: "#5856d6",
  C: "#0071e3",
  E: "#ff9500",
  A: "#ff2d55",
  N: "#af52de",
};

export function PersonalityMap({ scores }: { scores: Record<BigFiveTrait, number> }) {
  const radar = (Object.keys(BIG_FIVE_META) as BigFiveTrait[]).map((t) => ({
    label: BIG_FIVE_META[t].label.slice(0, 4),
    value: Math.round((scores[t] / 7) * 100),
    color: TRAIT_COLORS[t],
  }));

  return (
    <div>
      <RadarChart stats={radar} size={200} />
      <div className="grid grid-cols-1 gap-2 mt-4">
        {(Object.entries(scores) as [BigFiveTrait, number][]).map(([trait, score]) => {
          const meta = BIG_FIVE_META[trait];
          const high = score >= 5;
          return (
            <div key={trait} className="vc-glass-card rounded-xl p-3 flex gap-3 items-start">
              <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: TRAIT_COLORS[trait] }}
              />
              <div className="min-w-0">
                <div className="flex justify-between">
                  <span className="font-semibold text-[13px]">{meta.label}</span>
                  <span className="text-[12px] font-bold" style={{ color: TRAIT_COLORS[trait] }}>
                    {score}/7
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {high ? meta.high : meta.low}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
