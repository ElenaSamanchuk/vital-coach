"use client";

import { MASLOW_LEVELS } from "@/lib/psychology-frameworks";
import type { PermaScore } from "@/lib/psychology-frameworks";

const PERMA_LABELS: Record<keyof PermaScore, { label: string; emoji: string; color: string }> = {
  P: { label: "Позитивные эмоции", emoji: "😊", color: "#ffd60a" },
  E: { label: "Вовлечённость", emoji: "🎯", color: "#5856d6" },
  R: { label: "Отношения", emoji: "🤝", color: "#ff9500" },
  M: { label: "Смысл", emoji: "🕊️", color: "#af52de" },
  A: { label: "Достижения", emoji: "🏆", color: "#34c759" },
};

export function PermaBars({ perma }: { perma: PermaScore }) {
  return (
    <div className="space-y-2">
      {(Object.keys(PERMA_LABELS) as (keyof PermaScore)[]).map((key) => {
        const meta = PERMA_LABELS[key];
        const val = perma[key];
        return (
          <div key={key}>
            <div className="flex justify-between text-[12px] mb-0.5">
              <span>{meta.emoji} {meta.label}</span>
              <span className="font-semibold">{val}/10</span>
            </div>
            <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${val * 10}%`, backgroundColor: meta.color }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-[#86868b] mt-2">Модель PERMA — Martin Seligman, позитивная психология</p>
    </div>
  );
}

export function MaslowPyramid({ focus }: { focus: string }) {
  return (
    <div className="space-y-1">
      {MASLOW_LEVELS.map((lvl) => (
        <div
          key={lvl.level}
          className="mx-auto rounded-lg px-3 py-2 text-center text-[12px] font-medium text-white"
          style={{
            width: `${40 + lvl.level * 12}%`,
            backgroundColor: `hsl(${220 - lvl.level * 25}, 70%, ${45 + lvl.level * 5}%)`,
          }}
        >
          {lvl.emoji} {lvl.label}
          <span className="block text-[10px] opacity-80 font-normal">{lvl.examples}</span>
        </div>
      ))}
      <p className="text-[12px] text-[#0071e3] mt-3 p-2 bg-[#e8f2ff] rounded-xl">{focus}</p>
      <p className="text-[10px] text-[#86868b]">Пирамида Маслоу — ориентир, не жёсткая лестница</p>
    </div>
  );
}
