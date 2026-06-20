"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface GridActivity {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export function ActivityGrid({
  activities,
  selected,
  onToggle,
}: {
  activities: GridActivity[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {activities.map((act) => {
        const isOn = selected.includes(act.id);
        const Icon =
          (Icons as unknown as Record<string, LucideIcon>)[act.icon] ?? Icons.Circle;
        return (
          <button
            key={act.id}
            type="button"
            onClick={() => onToggle(act.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
              isOn
                ? "border-current shadow-md scale-[1.02]"
                : "border-transparent bg-[#fbfbfd]"
            }`}
            style={{
              color: isOn ? act.color : "#86868b",
              backgroundColor: isOn ? `${act.color}15` : undefined,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: isOn ? `${act.color}25` : "#e8e8ed" }}
            >
              <Icon size={22} strokeWidth={isOn ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium text-center leading-tight text-[#1d1d1f]">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
