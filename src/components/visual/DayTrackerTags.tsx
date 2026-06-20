"use client";

import type { TrackingTag } from "@/lib/tracking-tags";
import {
  TAG_COLOR_CLASS,
  TAG_CATEGORY_LABEL,
  enrichTags,
  tagsByCategory,
  type TagCategory,
} from "@/lib/tracking-tags";
import { TagIconView } from "./TagIcon";
import { hapticLight } from "@/lib/haptics";
import { Plus } from "lucide-react";
import Link from "next/link";

const CATEGORY_ORDER: TagCategory[] = ["health", "care", "home", "mood"];

export function DayTrackerTags({
  tags,
  selected,
  onToggle,
}: {
  tags: TrackingTag[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const grouped = tagsByCategory(tags);

  return (
    <div className="space-y-3">
      {CATEGORY_ORDER.map((cat) => {
        const list = grouped[cat];
        if (list.length === 0) return null;
        return (
          <div key={cat}>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
              {TAG_CATEGORY_LABEL[cat]}
            </p>
            <div className="flex flex-wrap gap-2">
              {list.map((tag) => {
                const active = selected.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      onToggle(tag.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                      active
                        ? `${TAG_COLOR_CLASS[tag.color]} shadow-sm scale-[1.02]`
                        : "bg-[var(--elevated)] text-[var(--text-secondary)] border-[var(--border)]"
                    }`}
                  >
                    <TagIconView name={tag.icon} size={13} />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <Link
        href="/settings?tab=body"
        className="inline-flex items-center gap-1 mt-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent)]"
      >
        <Plus size={12} />
        Свои плашки в профиле
      </Link>
    </div>
  );
}
