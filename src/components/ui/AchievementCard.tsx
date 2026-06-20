"use client";

import type { Achievement } from "@/lib/gamification";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const locked = !achievement.unlocked;
  return (
    <div
      className={`relative p-3 rounded-2xl border-2 transition-all ${
        locked
          ? "border-[#e8e8ed] bg-[#fbfbfd] opacity-50 grayscale"
          : "border-[#ffd60a] bg-gradient-to-br from-[#fff9e6] to-white shadow-sm"
      }`}
    >
      {!locked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ffd60a] rounded-full flex items-center justify-center text-[10px]">
          ✓
        </div>
      )}
      <div className="text-2xl mb-1">{achievement.emoji}</div>
      <p className="font-semibold text-[13px]">{achievement.title}</p>
      <p className="text-[11px] text-[#86868b] mt-0.5">{achievement.description}</p>
      <p className="text-[10px] text-[#0071e3] mt-1 font-medium">+{achievement.xpReward} XP</p>
    </div>
  );
}
