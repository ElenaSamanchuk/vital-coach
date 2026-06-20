"use client";

import type { SphereAdvice } from "@/lib/life-spheres";
import { LIFE_SPHERES } from "@/lib/life-spheres";

export function SphereAdviceList({ advice }: { advice: SphereAdvice[] }) {
  return (
    <div className="space-y-3">
      {advice.map((a) => {
        const sphere = LIFE_SPHERES.find((s) => s.key === a.sphere);
        return (
          <div
            key={a.sphere}
            className="rounded-2xl overflow-hidden border border-black/5"
            style={{ borderLeftWidth: 4, borderLeftColor: sphere?.color }}
          >
            <div className="px-3 py-2 bg-[#fbfbfd]">
              <p className="font-semibold text-[14px]">
                {sphere?.emoji} {a.title}
              </p>
              <p className="text-[11px] text-[#86868b]">Цель недели: {a.weeklyGoal}</p>
            </div>
            <ul className="px-3 py-2 text-[13px] space-y-1.5 bg-white">
              {a.actions.map((act) => (
                <li key={act} className="flex gap-2">
                  <span className="text-[#0071e3]">→</span>
                  {act}
                </li>
              ))}
            </ul>
            <p className="px-3 py-2 text-[10px] text-[#86868b] bg-[#f5f5f7] italic">
              📚 {a.research}
            </p>
          </div>
        );
      })}
    </div>
  );
}
