"use client";

import { LIFE_CATALOG, parseInterests, type LifeDomain, DOMAIN_LABELS } from "@/lib/life-catalog";
import { hapticLight } from "@/lib/haptics";

export function InterestsPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (json: string) => void;
}) {
  const selected = new Set(parseInterests(value));

  const toggle = (id: string) => {
    hapticLight();
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(JSON.stringify([...next]));
  };

  const domains = [...new Set(LIFE_CATALOG.map((c) => c.domain))] as LifeDomain[];

  return (
    <div className="space-y-3 max-h-[360px] overflow-y-auto">
      <p className="text-[11px] text-[var(--text-secondary)]">
        Выбери интересы — коуч подберёт идеи на «Сегодня» и в дневнике
      </p>
      {domains.map((d) => (
        <div key={d}>
          <p className="text-[10px] uppercase text-[var(--text-tertiary)] mb-1.5">{DOMAIN_LABELS[d]}</p>
          <div className="flex flex-wrap gap-1.5">
            {LIFE_CATALOG.filter((c) => c.domain === d).map((c) => {
              const active = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                    active
                      ? "bg-[var(--accent-soft)] border-[var(--accent)]/40 text-[var(--accent)]"
                      : "bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-secondary)]"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
