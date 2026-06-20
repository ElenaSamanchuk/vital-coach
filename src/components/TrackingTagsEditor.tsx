"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import type { TagColor, TrackingTag } from "@/lib/tracking-tags";
import { DEFAULT_TRACKING_TAGS, TAG_COLOR_CLASS } from "@/lib/tracking-tags";
import { hapticLight } from "@/lib/haptics";

const COLORS: TagColor[] = ["green", "gray", "brown", "purple", "pink", "black"];

export function TrackingTagsEditor({
  tags,
  onChange,
}: {
  tags: TrackingTag[];
  onChange: (tags: TrackingTag[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState<TagColor>("green");

  const add = () => {
    const t = label.trim();
    if (!t) return;
    hapticLight();
    onChange([
      ...tags,
      { id: `custom_${Date.now()}`, label: t, color, emoji: "✦" },
    ]);
    setLabel("");
  };

  const remove = (id: string) => {
    onChange(tags.filter((x) => x.id !== id));
  };

  const reset = () => onChange([...DEFAULT_TRACKING_TAGS]);

  return (
    <Card title="Метки дня" subtitle="Отмечай в дневнике, что было сегодня">
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${TAG_COLOR_CLASS[tag.color]}`}
          >
            {tag.emoji} {tag.label}
            <button
              type="button"
              onClick={() => remove(tag.id)}
              className="ml-1 opacity-60 hover:opacity-100"
              aria-label="Удалить"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input
          className="apple-input flex-1"
          placeholder="Новая плашка…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="button" onClick={add} className="apple-btn apple-btn-primary px-4">
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-[var(--text)] scale-110" : "border-transparent"} ${TAG_COLOR_CLASS[c].split(" ")[0]}`}
            aria-label={c}
          />
        ))}
      </div>
      <button type="button" onClick={reset} className="text-[11px] text-[var(--text-tertiary)]">
        Сбросить к стандартным
      </button>
    </Card>
  );
}
