import type { CatalogItem } from "./generic-food-catalog";

const BY_ID: Record<string, string> = {
  "g-chicken": "Лейцин и белок — дольше сытость, мышцы в дефиците не тают",
  "g-cottage": "Казеин медленно усваивается — идеален на перекус или вечер",
  "g-oats": "Клетчатка β-глюкан — ровнее сахар и сытость до обеда",
  "g-buckwheat": "Рутин и железо — энергия без скачков глюкозы",
  "g-egg": "Полный аминокислотный профиль · холин для мозга",
  "g-whitefish": "Лёгкий белок · минимум жира · легко переваривается",
  "g-broccoli": "Клетчатка и витamin C · объём без лишних калорий",
  "g-apple": "Пектин замедляет всасывание · перекус без скачка сахара",
  "g-water": "Гидратация — метаболизм и меньше ложного голода",
  "g-d-steam-patties": "Пар без масла — белок без лишних калорий",
  "g-d-baked-chicken": "Запекание сохраняет белок · сытость на 4–5 часов",
  "g-d-oatmeal": "Медленные углеводы — стабильная энергия с утра",
};

const BY_KIND: Record<CatalogItem["kind"], string> = {
  product: "Продукт — контролируешь состав и порцию",
  dish: "Готовое блюдо — сбалансированный приём без подсчёта рецепта",
};

const BY_CATEGORY: Record<string, string> = {
  protein: "Белок — строительный материал для мышц и сытости",
  grain: "Сложные углеводы — топливо без резкого скачка сахара",
  veg: "Овощи — объём, клетчатка, микроэлементы",
  dairy: "Кальций и белок — кости и длительная сытость",
  fruit: "Витамины и клетчатка — сладость в рамках плана",
  drink: "Жидкость без калорий или с мягким эффектом",
};

export function foodBenefitText(item: CatalogItem): string {
  if (item.tips?.[0]) return item.tips[0];
  if (BY_ID[item.id]) return BY_ID[item.id];
  return BY_CATEGORY[item.category] ?? BY_KIND[item.kind];
}

/** Оценка жиров и углеводов, если в каталоге только ккал и белок */
export function estimateMacros(item: Pick<CatalogItem, "calories" | "proteinG">): {
  fatG: number;
  carbsG: number;
} {
  const proteinKcal = item.proteinG * 4;
  const rest = Math.max(0, item.calories - proteinKcal);
  const fatG = Math.round((rest * 0.35) / 9);
  const carbsG = Math.max(0, Math.round((rest - fatG * 9) / 4));
  return { fatG, carbsG };
}
