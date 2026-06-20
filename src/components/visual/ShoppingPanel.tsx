"use client";

import { useState } from "react";
import { Check, Plus, ShoppingCart } from "lucide-react";
import { SHOP_QUICK, newShopItem, type ShopItem } from "@/lib/shopping-list";
import { hapticLight } from "@/lib/haptics";

export function ShoppingPanel({
  items,
  onChange,
}: {
  items: ShopItem[];
  onChange: (next: ShopItem[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const toggle = (id: string) => {
    hapticLight();
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const add = (label: string, category: ShopItem["category"] = "other") => {
    if (!label.trim()) return;
    onChange([...items, newShopItem(label.trim(), category)]);
    setDraft("");
  };

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ShoppingCart size={14} className="text-[var(--brown)]" />
        <span className="text-[12px] font-semibold">Что купить / убрать</span>
      </div>
      <div className="flex gap-2">
        <input
          className="apple-input flex-1 text-[13px]"
          placeholder="Добавить…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add(draft)}
        />
        <button type="button" className="apple-btn apple-btn-secondary px-3" onClick={() => add(draft)}>
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SHOP_QUICK.map((q) => (
          <button
            key={q.label}
            type="button"
            className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]"
            onClick={() => add(q.label, q.category)}
          >
            + {q.label}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {open.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => toggle(i.id)}
            className="w-full flex items-center gap-2 text-left text-[12px] px-2 py-1.5 rounded-lg hover:bg-[var(--bg-subtle)]"
          >
            <span className="w-4 h-4 rounded border border-[var(--border)]" />
            {i.label}
          </button>
        ))}
        {done.map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-[12px] px-2 py-1 opacity-50 line-through">
            <Check size={12} className="text-[var(--accent)]" />
            {i.label}
          </div>
        ))}
      </div>
    </div>
  );
}
