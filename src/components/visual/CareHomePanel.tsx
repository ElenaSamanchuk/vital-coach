"use client";

import { Home, Sparkles } from "lucide-react";
import { SELF_CARE_ROUTINES, CARE_ZONES } from "@/lib/self-care";
import { HOME_CHORES } from "@/lib/home-chores";
import { hapticLight } from "@/lib/haptics";

export function CareHomePanel({
  selfcare,
  home,
  onSelfcareChange,
  onHomeChange,
}: {
  selfcare: string[];
  home: string[];
  onSelfcareChange: (next: string[]) => void;
  onHomeChange: (next: string[]) => void;
}) {
  const toggle = (
    id: string,
    list: string[],
    onChange: (next: string[]) => void,
  ) => {
    hapticLight();
    onChange(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const careMinutes = selfcare.reduce((s, id) => {
    const r = SELF_CARE_ROUTINES.find((x) => x.id === id);
    return s + (r?.minutes ?? 0);
  }, 0);

  const homeMinutes = home.reduce((s, id) => {
    const c = HOME_CHORES.find((x) => x.id === id);
    return s + (c?.minutes ?? 0);
  }, 0);

  return (
    <div className="space-y-4">
      {CARE_ZONES.map((zone) => {
        const routines = SELF_CARE_ROUTINES.filter((r) => r.zone === zone.id);
        if (routines.length === 0) return null;
        return (
          <div key={zone.id}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[var(--pink)]" />
              <span className="text-[11px] font-semibold">{zone.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {routines.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggle(r.id, selfcare, onSelfcareChange)}
                  className={`rounded-xl px-3 py-2 text-[11px] font-semibold border transition-all ${
                    selfcare.includes(r.id)
                      ? "bg-[var(--pink-soft)] text-[var(--pink)] border-[var(--pink)]/30"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {careMinutes > 0 && (
        <p className="text-[10px] text-[var(--text-tertiary)]">Уход ~{careMinutes} мин</p>
      )}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Home size={14} className="text-[var(--brown)]" />
          <span className="text-[12px] font-semibold">Быт</span>
          {homeMinutes > 0 && (
            <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">~{homeMinutes} мин</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {HOME_CHORES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id, home, onHomeChange)}
              className={`rounded-xl px-3 py-2 text-[11px] font-semibold border transition-all ${
                home.includes(c.id)
                  ? "bg-[var(--brown-soft)] text-[var(--brown)] border-[var(--brown)]/30"
                  : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
