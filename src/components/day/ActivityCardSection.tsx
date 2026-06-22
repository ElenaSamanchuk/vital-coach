"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

export interface ActivityCardItem {
  id: string;
  label: string;
  icon: string | LucideIcon;
  minutes?: number;
  impact?: string;
  impactLabel?: string;
}

function ItemIcon({ icon }: { icon: string | LucideIcon }) {
  if (typeof icon === "string") {
    return <span className="text-2xl leading-none">{icon}</span>;
  }
  const Icon = icon;
  return <Icon size={22} className="text-[var(--accent)]" />;
}

export function ActivityCardSection({
  title,
  items,
  selectedIds,
  onToggle,
}: {
  title: string;
  items: ActivityCardItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const selected = items.filter((i) => selectedIds.includes(i.id));
  const [pickerOpen, setPickerOpen] = useState(selected.length === 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="vc-text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setPickerOpen((v) => !v);
          }}
          className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]"
          aria-label="Добавить"
        >
          <Plus size={18} />
        </button>
      </div>

      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                hapticLight();
                onToggle(item.id);
              }}
              className="w-full text-left vc-glass-card rounded-2xl p-3 flex gap-3 items-start"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center">
                <ItemIcon icon={item.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="vc-text-sm font-semibold">{item.label}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 vc-text-xs text-[var(--text-secondary)]">
                  {item.minutes != null && <span>{item.minutes} мин</span>}
                  {item.impactLabel && <span>{item.impactLabel}</span>}
                </div>
                {item.impact && (
                  <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5 leading-snug">{item.impact}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {pickerOpen && (
        <div className="grid grid-cols-2 gap-2">
          {items
            .filter((i) => !selectedIds.includes(i.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  hapticLight();
                  onToggle(item.id);
                }}
                className="text-left rounded-xl border border-[var(--border)] bg-[var(--elevated)] p-2.5 hover:border-[var(--accent)]/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ItemIcon icon={item.icon} />
                  <span className="vc-text-xs font-semibold leading-tight">{item.label}</span>
                </div>
                {item.minutes != null && (
                  <p className="vc-text-xs text-[var(--text-tertiary)]">{item.minutes} мин</p>
                )}
              </button>
            ))}
        </div>
      )}
    </section>
  );
}
