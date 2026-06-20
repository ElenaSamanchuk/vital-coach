"use client";

import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import type { TrackingTag } from "@/lib/tracking-tags";
import { TAG_COLOR_CLASS, enrichTags } from "@/lib/tracking-tags";
import { TagIconView } from "./TagIcon";
import { hapticLight } from "@/lib/haptics";

/** Компактные плашки на «Сегодня» — без перехода в дневник */
export function QuickDayTags({
  tags,
  selected,
  onChange,
}: {
  tags: TrackingTag[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = async (id: string) => {
    hapticLight();
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onChange(next);
    await apiClient("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        partial: true,
        dayTags: next,
      }),
    });
  };

  const list = enrichTags(tags);

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {list.slice(0, 14).map((tag) => {
        const active = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
              active
                ? TAG_COLOR_CLASS[tag.color]
                : "bg-[var(--elevated)] text-[var(--text-secondary)] border-[var(--border)]"
            }`}
          >
            <TagIconView name={tag.icon} size={12} />
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}
