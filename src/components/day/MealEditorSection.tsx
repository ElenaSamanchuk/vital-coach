"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  GENERIC_FOOD_CATALOG,
  getCatalogItemById,
  type CatalogItem,
} from "@/lib/generic-food-catalog";
import { foodBenefitText, estimateMacros } from "@/lib/food-benefit-text";
import { mealComboHints, dayMealComboHints } from "@/lib/food-compatibility";
import { foodCategoryIcon } from "@/lib/visual-icons";
import { hapticLight } from "@/lib/haptics";
import { HorizontalPickSection, type HorizontalPickItem } from "@/components/ui/HorizontalPickSection";

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  snack: "Перекус",
  dinner: "Ужин",
};

function slotLabel(id: string): string {
  return SLOT_LABELS[id] ?? `Приём · ${id.replace("extra_", "")}`;
}

function catalogToPickItem(item: CatalogItem): HorizontalPickItem {
  const { fatG, carbsG } = estimateMacros(item);
  return {
    id: item.id,
    title: item.title,
    subtitle: `${item.portionLabel} · ${item.calories} ккал · Б${item.proteinG} Ж${fatG} У${carbsG}`,
    impact: foodBenefitText(item),
    icon: foodCategoryIcon(item.category, item.kind),
  };
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
  const catalog = useMemo(() => GENERIC_FOOD_CATALOG.filter((c) => c.tier === "daily"), []);
  const pickItems = useMemo(() => catalog.map(catalogToPickItem), [catalog]);
  const crossHints = useMemo(() => dayMealComboHints(choices), [choices]);

  const addSlot = () => {
    hapticLight();
    const n = slots.filter((s) => s.startsWith("extra_")).length + 1;
    onSlotsChange([...slots, `extra_${n}`]);
  };

  const removeSlot = (slot: string) => {
    hapticLight();
    onSlotsChange(slots.filter((s) => s !== slot));
    for (const id of choices[slot] ?? []) {
      onChoiceToggle(slot, id);
    }
  };

  return (
    <section className="space-y-3">
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
        const kcal = ids.reduce((s, id) => s + (getCatalogItemById(id)?.calories ?? 0), 0);

        return (
          <HorizontalPickSection
            key={slot}
            title={`${slotLabel(slot)}${kcal > 0 ? ` · ${kcal} ккал` : ""}`}
            items={pickItems}
            selectedIds={ids}
            onToggle={(id) => onChoiceToggle(slot, id)}
            searchPlaceholder="Поиск: курица, овсянка, салат…"
            removableSlot={slot.startsWith("extra_")}
            onRemoveSlot={() => removeSlot(slot)}
            defaultSearchOpen={false}
          />
        );
      })}

      {(crossHints.length > 0 || slots.some((s) => mealComboHints(choices[s] ?? []).length > 0)) && (
        <div className="rounded-xl bg-[var(--warning-soft)]/60 border border-[var(--warning)]/20 p-2.5 space-y-1">
          {[...crossHints, ...slots.flatMap((s) => mealComboHints(choices[s] ?? []))]
            .filter((h, i, a) => a.indexOf(h) === i)
            .slice(0, 3)
            .map((h) => (
              <p key={h} className="vc-text-xs text-[var(--text-secondary)] leading-snug">
                {h}
              </p>
            ))}
        </div>
      )}
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
