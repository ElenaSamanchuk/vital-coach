"use client";

import { LIFE_SPHERES, type WheelScores, type SphereKey } from "@/lib/life-spheres";
import { RadarChart } from "./ui/RadarChart";

export function WheelOfLife({
  scores,
  onChange,
  readonly = false,
}: {
  scores: WheelScores;
  onChange?: (scores: WheelScores) => void;
  readonly?: boolean;
}) {
  const radar = LIFE_SPHERES.map((s) => ({
    label: s.label,
    value: (scores[s.key] ?? 5) * 10,
    color: s.color,
  }));

  return (
    <div>
      <RadarChart stats={radar} size={240} />
      <div className="mt-4 space-y-3">
        {LIFE_SPHERES.map((sphere) => {
          const val = scores[sphere.key] ?? 5;
          return (
            <div key={sphere.key}>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="font-medium">
                  {sphere.emoji} {sphere.label}
                </span>
                <span style={{ color: sphere.color }} className="font-bold">
                  {val}/10
                </span>
              </div>
              {!readonly && onChange ? (
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={val}
                  onChange={(e) =>
                    onChange({ ...scores, [sphere.key]: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#0071e3]"
                />
              ) : (
                <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${val * 10}%`, backgroundColor: sphere.color }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
