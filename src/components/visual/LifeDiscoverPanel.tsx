"use client";

import { Compass, Plus } from "lucide-react";
import { DOMAIN_LABELS, LIFE_CATALOG, type LifeDomain } from "@/lib/life-catalog";
import type { LifeSuggestion } from "@/lib/life-recommendations";
import { taskFromCatalog, sphereFromDomain, type DayTask } from "@/lib/day-tasks";
import { hapticLight } from "@/lib/haptics";
import { ImpactLine } from "./ImpactLine";

export function LifeDiscoverPanel({
  suggestions,
  onAddTask,
  showCatalog = false,
}: {
  suggestions: LifeSuggestion[];
  onAddTask?: (task: DayTask) => void;
  showCatalog?: boolean;
}) {
  const add = (s: LifeSuggestion) => {
    if (!onAddTask) return;
    hapticLight();
    onAddTask(
      taskFromCatalog(s.label, sphereFromDomain(s.domain), s.id, s.minutes),
    );
  };

  const domains = [...new Set(LIFE_CATALOG.map((c) => c.domain))] as LifeDomain[];

  return (
    <div className="space-y-3">
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass size={14} className="text-[var(--accent)]" />
            <span className="text-[12px] font-semibold">Что сделать сегодня</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--elevated)] p-3 flex gap-2"
              >
                <span className="text-[20px] shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">{s.label}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                    {s.why}
                  </p>
                  {s.impact && <ImpactLine text={s.impact} />}
                  <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                    {DOMAIN_LABELS[s.domain]}
                    {s.minutes ? ` · ~${s.minutes} мин` : ""}
                  </p>
                </div>
                {onAddTask && (
                  <button
                    type="button"
                    onClick={() => add(s)}
                    className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCatalog && (
        <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]">
          <summary className="p-3 text-[12px] font-semibold cursor-pointer list-none">
            Каталог жизни ({LIFE_CATALOG.length} идей)
          </summary>
          <div className="px-3 pb-3 space-y-3 max-h-[280px] overflow-y-auto">
            {domains.map((d) => (
              <div key={d}>
                <p className="text-[10px] uppercase text-[var(--text-tertiary)] mb-1">
                  {DOMAIN_LABELS[d]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LIFE_CATALOG.filter((c) => c.domain === d).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        onAddTask?.(
                          taskFromCatalog(c.label, sphereFromDomain(c.domain), c.id, c.minutes),
                        )
                      }
                      className="text-[10px] px-2 py-1 rounded-lg bg-[var(--elevated)] border border-[var(--border)]"
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
