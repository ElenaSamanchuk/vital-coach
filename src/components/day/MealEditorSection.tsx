"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  GENERIC_FOOD_CATALOG,
  getCatalogItemById,
  type CatalogItem,
} from "@/lib/generic-food-catalog";
import { foodBenefitText, estimateMacros } from "@/lib/food-benefit-text";
import { mealComboHints } from "@/lib/food-compatibility";
import { hapticLight } from "@/lib/haptics";

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  snack: "Перекус",
  dinner: "Ужин",
};

const CATEGORY_ICON: Record<string, string> = {
  protein: "🍗",
  dairy: "🧀",
  grain: "🌾",
  veg: "🥦",
  fruit: "🍎",
  drink: "💧",
  dish: "🍽️",
};

function foodIcon(item: CatalogItem): string {
  if (item.kind === "dish") return "🍽️";
  return CATEGORY_ICON[item.category] ?? "🥗";
}

function slotLabel(id: string): string {
  return SLOT_LABELS[id] ?? `Приём · ${id.replace("extra_", "")}`;
}

function FoodCard({ item, onRemove }: { item: CatalogItem; onRemove?: () => void }) {
  const { fatG, carbsG } = estimateMacros(item);
  return (
    <div className="vc-glass-card rounded-2xl p-3 flex gap-3">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center text-xl">
        {foodIcon(item)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="vc-text-sm font-semibold">{item.title}</p>
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-[var(--text-tertiary)] p-0.5">
              <X size={14} />
            </button>
          )}
        </div>
        <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
          {item.portionLabel} · {item.calories} ккал · Б {item.proteinG} · Ж {fatG} · У {carbsG}
        </p>
        <p className="vc-text-xs text-[var(--text-tertiary)] mt-1.5 leading-snug">{foodBenefitText(item)}</p>
      </div>
    </div>
  );
}

export function MealEditorSection({
  slots,
  choices,
  onSlotsChange,
  onChoiceToggle,
}: {
  slots: string[];
  choices: Record<string, string[]>;
  onSlotsChange: (slots: string[]) => void;
  onChoiceToggle: (slot: string, foodId: string) => void;
}) {
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const catalog = useMemo(() => GENERIC_FOOD_CATALOG.filter((c) => c.tier === "daily"), []);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q) ||
        c.kind.toLowerCase().includes(q),
    );
  }, [catalog, search]);

  const addSlot = () => {
    hapticLight();
    const n = slots.filter((s) => s.startsWith("extra_")).length + 1;
    onSlotsChange([...slots, `extra_${n}`]);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="vc-text-sm font-semibold">Питание</p>
        <button
          type="button"
          onClick={addSlot}
          className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]"
          aria-label="Добавить приём пищи"
        >
          <Plus size={18} />
        </button>
      </div>

      {slots.map((slot) => {
        const ids = choices[slot] ?? [];
        const items = ids.map(getCatalogItemById).filter((x): x is CatalogItem => Boolean(x));
        const kcal = items.reduce((s, i) => s + i.calories, 0);
        const comboHints = mealComboHints(ids);
        const pickerOpen = openSlot === slot;

        return (
          <div key={slot} className="space-y-2">
            <button
              type="button"
              onClick={() => {
                hapticLight();
                setOpenSlot(pickerOpen ? null : slot);
              }}
              className="w-full flex items-center justify-between px-1"
            >
              <span className="vc-text-sm font-medium">{slotLabel(slot)}</span>
              <span className="vc-text-xs text-[var(--text-secondary)] tabular-nums">
                {kcal > 0 ? `${kcal} ккал` : "выбери продукты"}
              </span>
            </button>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onRemove={() => onChoiceToggle(slot, item.id)}
                  />
                ))}
                {comboHints.length > 0 && (
                  <div className="rounded-xl bg-[var(--warning-soft)]/60 border border-[var(--warning)]/20 p-2.5 space-y-1">
                    {comboHints.map((h) => (
                      <p key={h} className="vc-text-xs text-[var(--text-secondary)] leading-snug">
                        💡 {h}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pickerOpen && (
              <div className="space-y-2">
                <input
                  type="search"
                  className="apple-input w-full"
                  placeholder="Поиск: курица, овсянка, салат…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => {
                  const picked = ids.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        hapticLight();
                        onChoiceToggle(slot, item.id);
                      }}
                      className={`text-left rounded-xl border p-2.5 transition-colors ${
                        picked
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--elevated)]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span>{foodIcon(item)}</span>
                        <span className="vc-text-xs font-semibold leading-tight line-clamp-2">{item.title}</span>
                      </div>
                      <p className="vc-text-xs text-[var(--text-tertiary)] tabular-nums">
                        {item.calories} ккал · {item.portionLabel}
                      </p>
                    </button>
                  );
                })}
                {filteredCatalog.length === 0 && (
                  <p className="col-span-2 text-center vc-text-xs text-[var(--text-tertiary)] py-4">
                    Ничего не найдено
                  </p>
                )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

export function sumMealCalories(choices: Record<string, string[]>): number {
  let total = 0;
  for (const ids of Object.values(choices)) {
    for (const id of ids) {
      const item = getCatalogItemById(id);
      if (item) total += item.calories;
    }
  }
  return total;
}
