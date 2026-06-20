"use client";

import { ChefHat } from "lucide-react";
import type { RecipeCard } from "@/lib/recipes-catalog";

export function RecipesCard({ recipes }: { recipes: RecipeCard[] }) {
  const byMeal = recipes.reduce(
    (acc, r) => {
      (acc[r.mealType] ??= []).push(r);
      return acc;
    },
    {} as Record<string, RecipeCard[]>,
  );

  const labels: Record<string, string> = {
    breakfast: "Завтрак",
    lunch: "Обед",
    snack: "Перекус",
    dinner: "Ужин",
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ChefHat size={16} className="text-[var(--accent)]" />
        <span className="text-[13px] font-semibold">Рецепты под ИР и щитовидку</span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">{recipes.length}</span>
      </div>
      {Object.entries(byMeal).map(([meal, items]) => (
        <div key={meal}>
          <p className="text-[10px] uppercase text-[var(--text-tertiary)] mb-1">{labels[meal] ?? meal}</p>
          <div className="space-y-1.5">
            {items.slice(0, 3).map((r) => (
              <div key={r.id} className="rounded-lg bg-[var(--bg-subtle)] px-3 py-2">
                <p className="text-[12px] font-medium">{r.title}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {r.calories} ккал · {r.proteinG} г белка
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
