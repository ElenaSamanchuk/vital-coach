import { getCatalogItemById } from "./generic-food-catalog";

function cats(ids: string[]): string[] {
  return ids.map((id) => getCatalogItemById(id)?.category).filter(Boolean) as string[];
}

function hasCategory(ids: string[], cat: string): boolean {
  return ids.some((id) => getCatalogItemById(id)?.category === cat);
}

function countCategory(ids: string[], cat: string): number {
  return ids.filter((id) => getCatalogItemById(id)?.category === cat).length;
}

/** Подсказки по сочетаемости продуктов в одном приёме пищи */
export function mealComboHints(itemIds: string[]): string[] {
  if (itemIds.length < 2) return [];
  const hints: string[] = [];
  const categories = cats(itemIds);

  if (hasCategory(itemIds, "protein") && hasCategory(itemIds, "veg")) {
    hints.push("Белок + овощи — сытость дольше, сахар ровнее");
  }
  if (hasCategory(itemIds, "protein") && hasCategory(itemIds, "fruit")) {
    hints.push("Фрукт с белком — мягче скачок глюкозы, чем фрукт один");
  }
  if (countCategory(itemIds, "grain") >= 2) {
    hints.push("Две крупы в одном приёме — много углеводов; добавь белок или овощи");
  }
  if (countCategory(itemIds, "fruit") >= 2) {
    hints.push("Несколько фруктов — сильнее сахар; лучше один фрукт + белок");
  }
  if (hasCategory(itemIds, "dairy") && hasCategory(itemIds, "fruit") && !hasCategory(itemIds, "protein")) {
    hints.push("Молочное + фрукт — ок, но добавь белок для сытости");
  }
  if (hasCategory(itemIds, "protein") && hasCategory(itemIds, "grain") && !hasCategory(itemIds, "veg")) {
    hints.push("Добавь овощи — клетчатка замедлит усвоение");
  }
  if (itemIds.some((id) => getCatalogItemById(id)?.tier === "rare")) {
    hints.push("Редкий продукт — лучше не сочетать с другими «редкими» в одном приёме");
  }
  if (
    hasCategory(itemIds, "drink") &&
    categories.filter((c) => c !== "drink").length >= 1
  ) {
    hints.push("Напиток + еда — пей в начале или между, не заливай сразу после");
  }

  return [...new Set(hints)].slice(0, 2);
}
