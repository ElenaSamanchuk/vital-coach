"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Heart, Activity } from "lucide-react";
import { PAIN_ZONES, painAdvice } from "@/lib/day-routines";
import type { WellbeingPlan } from "@/lib/wellbeing-coach";
import { hapticLight } from "@/lib/haptics";
import Link from "next/link";

const PAIN_LEVELS = [
  { value: 0, label: "Нет" },
  { value: 2, label: "Легко" },
  { value: 5, label: "Средне" },
  { value: 8, label: "Сильно" },
] as const;

export function WellbeingPainCard({
  painLevel,
  painZones,
  endometriosis,
  wellbeing,
  energy,
  mood,
  stress,
  onPainChange,
  onToggleAction,
}: {
  painLevel: number;
  painZones: string[];
  endometriosis: boolean;
  wellbeing: WellbeingPlan;
  energy?: number;
  mood?: number;
  stress?: number;
  onPainChange: (level: number, zones: string[]) => void;
  onToggleAction: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(painLevel >= 4 || (stress ?? 0) >= 7);

  const toggleZone = (id: string) => {
    hapticLight();
    const next = painZones.includes(id)
      ? painZones.filter((z) => z !== id)
      : [...painZones, id];
    onPainChange(painLevel, next);
  };

  const setPain = (level: number) => {
    hapticLight();
    onPainChange(level, painZones);
    if (level >= 4) setExpanded(true);
  };

  const topAction = wellbeing.actions[0];
  const topDone = topAction && wellbeing.actionsDone.includes(topAction.id);

  return (
    <div className="vc-glass-card rounded-3xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-[var(--accent)]" />
        <p className="text-[15px] font-bold flex-1">Самочувствие</p>
        {(energy != null || mood != null) && (
          <span className="text-[10px] text-[var(--text-secondary)]">
            {mood != null ? `😊 ${mood}` : ""}
            {energy != null ? ` · ⚡ ${energy}` : ""}
            {stress != null ? ` · 😮‍💨 ${stress}` : ""}
          </span>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[var(--text-secondary)] mb-2">Боль сейчас</p>
        <div className="flex gap-2">
          {PAIN_LEVELS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPain(p.value)}
              className={`flex-1 rounded-xl py-2 text-[11px] font-semibold border transition-colors ${
                painLevel === p.value
                  ? "bg-[var(--warning-soft)] border-[var(--warning)] text-[var(--text)]"
                  : "bg-[var(--elevated)] border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {painLevel > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PAIN_ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => toggleZone(z.id)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium border ${
                    painZones.includes(z.id)
                      ? "bg-[var(--warning-soft)] border-[var(--warning)]/50"
                      : "border-[var(--border)] bg-[var(--bg-subtle)]"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-snug">
              {painAdvice(painLevel, endometriosis)}
            </p>
          </>
        )}
      </div>

      {topAction && (
        <button
          type="button"
          onClick={() => onToggleAction(topAction.id)}
          className={`w-full rounded-xl px-3 py-2.5 text-left border flex items-center gap-2 ${
            topDone
              ? "bg-[var(--success-soft)] border-[var(--success)]/40"
              : "bg-[var(--elevated)] border-[var(--border)]"
          }`}
        >
          <Heart size={14} className="text-[var(--accent)] shrink-0" />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold">{topAction.title}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{wellbeing.focusLabelRu}</p>
          </div>
        </button>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-[11px] font-medium text-[var(--accent)]"
      >
        {expanded ? "Свернуть" : "Ещё действия и дневник →"}
      </button>

      {expanded && (
        <div className="space-y-2 pt-1 border-t border-[var(--border)]">
          {wellbeing.actions.slice(1, 3).map((action) => {
            const done = wellbeing.actionsDone.includes(action.id);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onToggleAction(action.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-[12px] border ${
                  done ? "line-through opacity-70 border-[var(--success)]/30" : "border-[var(--border)]"
                }`}
              >
                {action.title} · {action.durationMin} мин
              </button>
            );
          })}
          <Link href="/log" className="text-[11px] text-[var(--accent)] block pt-1">
            Полный дневник самочувствия →
          </Link>
        </div>
      )}
    </div>
  );
}
