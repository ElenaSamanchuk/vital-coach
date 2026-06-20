"use client";

import { Moon, Sparkles } from "lucide-react";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

const STEPS = [
  { id: "skincare", label: "Уход / маска" },
  { id: "tea", label: "Тёплый напиток без кофе" },
  { id: "sleep", label: "Экран off → сон" },
];

export function EveningRitualCard({
  done,
  onToggle,
}: {
  done: string[];
  onToggle: (id: string) => void;
}) {
  const allDone = STEPS.every((s) => done.includes(s.id));

  return (
    <div className="rounded-xl border border-[var(--purple)]/25 bg-[var(--purple-soft)] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Moon size={14} className="text-[var(--purple)]" />
        <span className="text-[11px] font-semibold">Вечерний ритуал</span>
        {allDone && <Sparkles size={12} className="text-[var(--accent)] ml-auto" />}
      </div>
      <div className="flex flex-col gap-1.5">
        {STEPS.map((s) => {
          const active = done.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                hapticLight();
                onToggle(s.id);
                if (!active) hapticSuccess();
              }}
              className={`text-left text-[12px] px-3 py-2 rounded-lg border transition-all ${
                active
                  ? "bg-[var(--accent-soft)] border-[var(--accent)]/40 line-through opacity-80"
                  : "bg-[var(--elevated)] border-[var(--border)]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
