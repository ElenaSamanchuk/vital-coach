"use client";

export function StatBar({
  label,
  emoji,
  level,
  progress,
  color,
  xp,
}: {
  label: string;
  emoji: string;
  level: number;
  progress: number;
  color: string;
  xp: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[13px]">
        <span className="font-semibold flex items-center gap-1.5">
          <span>{emoji}</span> {label}
        </span>
        <span className="text-[#86868b]">
          Ур. {level} · {xp} XP
        </span>
      </div>
      <div className="h-3 bg-[#e8e8ed] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${progress}%`, backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
