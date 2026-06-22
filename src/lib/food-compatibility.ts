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

/** Подсказки по сочетаемости между приёмами пищи за день */
export function dayMealComboHints(choices: Record<string, string[]>): string[] {
  const hints: string[] = [];
  const breakfast = choices.breakfast ?? [];
  const lunch = choices.lunch ?? [];
  const dinner = choices.dinner ?? [];
  const snack = choices.snack ?? [];
  const extras = Object.entries(choices)
    .filter(([k]) => k.startsWith("extra_"))
    .flatMap(([, ids]) => ids);

  const dinnerIds = [...dinner, ...extras.filter((id) => !snack.includes(id))];
  const allFruitSlots = [
    hasCategory(breakfast, "fruit") ? "завтрак" : null,
    hasCategory(lunch, "fruit") ? "обед" : null,
    hasCategory(dinner, "fruit") ? "ужин" : null,
    hasCategory(snack, "fruit") ? "перекус" : null,
  ].filter(Boolean);

  if (hasCategory(dinnerIds, "fruit") && hasCategory(dinnerIds, "protein")) {
    hints.push("Фрукт на ужине лучше отдельным перекусом — не смешивай с белковым ужином");
  }
  if (hasCategory(breakfast, "fruit") && !hasCategory(breakfast, "protein")) {
    hints.push("Фрукт на завтрак — добавь белок (яйцо, творог), чтобы дольше не было голода");
  }
  if (hasCategory(lunch, "fruit") && hasCategory(lunch, "grain") && !hasCategory(lunch, "protein")) {
    hints.push("Фрукт + крупа на обед — добавь белок, сахар будет ровнее");
  }
  if (allFruitSlots.length >= 2) {
    hints.push("Фрукты в нескольких приёмах — распредели: лучше 1–2 порции в день с белком");
  }
  if (hasCategory(snack, "fruit") && (hasCategory(dinner, "protein") || hasCategory(lunch, "protein"))) {
    hints.push("Фрукт отдельным перекусом — удобнее, чем в одном приёме с плотным белком");
  }
  if (
    countCategory([...breakfast, ...lunch, ...dinner], "grain") >= 3 &&
    !hasCategory([...breakfast, ...lunch, ...dinner], "veg")
  ) {
    hints.push("Много круп за день — добавь овощи хотя бы в один приём");
  }

  return [...new Set(hints)].slice(0, 2);
}
