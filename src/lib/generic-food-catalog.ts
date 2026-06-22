/**
 * Каталог продуктов и блюд для режима «Поток».
 * Ккал и белок считаются от средних значений на 100 г × стандартная порция.
 */
import type { MealOption } from "./nutrition";

export type FoodTier = "daily" | "rare";
export type FoodKind = "product" | "dish";

export interface CatalogItem {
  id: string;
  title: string;
  kind: FoodKind;
  category: string;
  categoryLabel: string;
  tier: FoodTier;
  /** Подпись порции для UI: «120 г», «200 мл», «2 шт (≈100 г)» */
  portionLabel: string;
  /** Масса/объём порции в граммах (мл ≈ г) — база для расчёта */
  portionGrams: number;
  proteinG: number;
  calories: number;
  tips?: string[];
}

/** Округление ккал и белка от эталона на 100 г */
function macrosFrom100g(
  portionGrams: number,
  kcalPer100g: number,
  proteinPer100g: number,
): { calories: number; proteinG: number } {
  const factor = portionGrams / 100;
  return {
    calories: Math.round(kcalPer100g * factor),
    proteinG: Math.round(proteinPer100g * factor),
  };
}

function product(
  id: string,
  title: string,
  category: string,
  categoryLabel: string,
  tier: FoodTier,
  portionLabel: string,
  portionGrams: number,
  kcalPer100g: number,
  proteinPer100g: number,
  tips: string[] = [],
): CatalogItem {
  const { calories, proteinG } = macrosFrom100g(portionGrams, kcalPer100g, proteinPer100g);
  return {
    id,
    title,
    kind: "product",
    category,
    categoryLabel,
    tier,
    portionLabel,
    portionGrams,
    proteinG,
    calories,
    tips,
  };
}

/** Сложное блюдо — фиксированная средняя порция (граммы + итоговые макросы) */
function dish(
  id: string,
  title: string,
  category: string,
  categoryLabel: string,
  tier: FoodTier,
  portionLabel: string,
  portionGrams: number,
  calories: number,
  proteinG: number,
  tips: string[] = [],
): CatalogItem {
  return {
    id,
    title,
    kind: "dish",
    category,
    categoryLabel,
    tier,
    portionLabel,
    portionGrams,
    proteinG,
    calories,
    tips,
  };
}

/** Продукты и блюда — daily + rare (запрещённые не в выборе) */
export const GENERIC_FOOD_CATALOG: CatalogItem[] = [
  // Молочные (ккал/100 г — средние по таблицам состава)
  product("g-milk", "Молоко 1,5%", "dairy", "Молочные", "daily", "200 мл", 200, 44, 2.8),
  product("g-cottage", "Творог 5%", "dairy", "Молочные", "daily", "150 г", 150, 121, 17),
  product("g-sourcream", "Сметана 10%", "dairy", "Молочные", "daily", "30 г", 30, 115, 2.5),
  product("g-kefir", "Кефир 2,5%", "dairy", "Молочные", "rare", "200 мл", 200, 53, 3),
  product("g-yogurt", "Йогурт детский 1% без добавок", "dairy", "Молочные", "rare", "125 г", 125, 41, 4.3),
  product("g-adygei", "Сыр Адыгейский 12%", "dairy", "Молочные", "rare", "50 г", 50, 240, 18),
  dish("g-d-cottage-sc", "Творог со сметаной", "dairy", "Молочные", "daily", "180 г", 180, 210, 24, ["Без сахара"]),
  dish("g-d-syrniki", "Сырники или запеканка", "dairy", "Молочные", "daily", "120 г (2 шт)", 120, 240, 16, ["Строго без сахара"]),

  // Фрукты
  product("g-apple", "Яблоко", "fruit", "Фрукты", "daily", "1 шт (≈150 г)", 150, 52, 0.3),
  product("g-pear", "Груша", "fruit", "Фрукты", "daily", "1 шт (≈170 г)", 170, 57, 0.4),
  product("g-berry-mix", "Ягоды (малина, клубника, вишня)", "fruit", "Фрукты", "daily", "100 г", 100, 40, 0.8),
  product("g-citrus", "Апельсин / лимон", "fruit", "Фрукты", "daily", "1 шт (≈130 г)", 130, 47, 0.9),
  product("g-watermelon", "Арбуз / дыня", "fruit", "Фрукты", "daily", "200 г", 200, 30, 0.6),
  product("g-kiwi", "Киви", "fruit", "Фрукты", "daily", "2 шт (≈160 г)", 160, 61, 1.1),
  product("g-choco", "Тёмный шоколад 70%", "fruit", "Фрукты", "rare", "20 г", 20, 550, 6),
  product("g-honey", "Мёд", "fruit", "Фрукты", "rare", "1 ч.л. (≈10 г)", 10, 304, 0.3),
  product("g-nuts", "Орехи", "fruit", "Фрукты", "rare", "20 г", 20, 620, 15),
  product("g-dried", "Сухофрукты (не в сахаре)", "fruit", "Фрукты", "rare", "30 г", 30, 280, 1.5),
  product("g-banana", "Банан / виноград / авокадо", "fruit", "Фрукты", "rare", "1 шт (≈120 г)", 120, 89, 1.1),
  dish("g-d-baked-apple", "Запечённые яблоки", "fruit", "Фрукты", "daily", "180 г", 180, 95, 0.5, ["Иногда с мёдом/орехами"]),
  dish("g-d-juice", "Сок яблочный/ягодный домашний", "fruit", "Фрукты", "daily", "200 мл", 200, 45, 0.3, ["Без сахара, разбавленный"]),
  dish("g-d-compote", "Компот без сахара", "fruit", "Фрукты", "daily", "250 мл", 250, 25, 0.2),

  // Мясо и рыба
  product("g-squid", "Кальмар", "protein", "Мясо и рыба", "daily", "120 г", 120, 92, 18),
  product("g-egg", "Яйцо", "protein", "Мясо и рыба", "daily", "2 шт (≈100 г)", 100, 155, 13),
  product("g-chicken", "Курица", "protein", "Мясо и рыба", "daily", "120 г", 120, 165, 31),
  product("g-whitefish", "Белая рыба", "protein", "Мясо и рыба", "daily", "150 г", 150, 90, 18),
  product("g-mushroom", "Грибы", "protein", "Мясо и рыба", "rare", "100 г", 100, 27, 3.1),
  product("g-chicken-mince", "Фарш куриный (для котлет)", "protein", "Мясо и рыба", "rare", "120 г", 120, 143, 17),
  product("g-soy", "Соя (варёная)", "protein", "Мясо и рыба", "rare", "100 г", 100, 173, 17),
  product("g-redfish", "Красная рыба", "protein", "Мясо и рыба", "rare", "120 г", 120, 190, 20),
  dish("g-d-steam-patties", "Котлеты на пару с зеленью", "protein", "Мясо и рыба", "daily", "180 г (2 шт)", 180, 220, 26, ["Без соли"]),
  dish("g-d-omelet", "Омлет с овощами", "protein", "Мясо и рыба", "daily", "250 г", 250, 280, 18, ["Помидор, зелень, молоко, сыр, курица"]),
  dish("g-d-baked-chicken", "Запечённая курица", "protein", "Мясо и рыба", "daily", "280 г", 280, 380, 35, ["Со сметаной, сыром, овощами"]),
  dish("g-d-baked-fish", "Запечённая рыба с лимоном", "protein", "Мясо и рыба", "daily", "250 г", 250, 320, 32, ["С овощами"]),

  // Крупы (порция — сухой вес; ккал на 100 г сухой крупы)
  product("g-oats", "Овсянка (варить)", "grain", "Крупы", "daily", "50 г сух.", 50, 342, 12),
  product("g-buckwheat", "Гречка", "grain", "Крупы", "daily", "60 г сух.", 60, 343, 13),
  product("g-brownrice", "Рис бурый", "grain", "Крупы", "daily", "60 г сух.", 60, 360, 8),
  product("g-crisp", "Хлебцы", "grain", "Крупы", "daily", "2 шт (≈18 г)", 18, 280, 10),
  product("g-bran", "Отруби / клетчатка", "grain", "Крупы", "daily", "15 г", 15, 220, 4),
  product("g-whiterice", "Рис белый", "grain", "Крупы", "rare", "60 г сух.", 60, 365, 7),
  product("g-ryebread", "Хлеб ржаной", "grain", "Крупы", "rare", "1 ломтик (≈35 г)", 35, 259, 8),
  product("g-noodles", "Вермишель цельнозерновая", "grain", "Крупы", "rare", "60 г сух.", 60, 348, 13),
  dish("g-d-oatmeal", "Каша овсяная", "grain", "Крупы", "daily", "250 г готов.", 250, 110, 6, ["На молоке/воде, без сахара и соли"]),
  dish("g-d-buckwheat-dish", "Гречка с курицей", "grain", "Крупы", "daily", "300 г", 300, 165, 14, ["Без соли"]),
  dish("g-d-rice-dish", "Рис с курицей/рыбой/овощами", "grain", "Крупы", "daily", "300 г", 300, 155, 13, ["Без соли"]),
  dish("g-d-noodles-dish", "Лапша с курицей и овощами", "grain", "Крупы", "daily", "300 г", 300, 150, 12, ["Без соли"]),

  // Овощи
  product("g-carrot", "Морковь", "veg", "Овощи", "daily", "100 г", 100, 41, 0.9),
  product("g-cabbage", "Пекинская капуста", "veg", "Овощи", "daily", "100 г", 100, 16, 1.2),
  product("g-tomato", "Помидор", "veg", "Овощи", "daily", "1 шт (≈120 г)", 120, 18, 0.9),
  product("g-cucumber", "Огурец", "veg", "Овощи", "daily", "1 шт (≈150 г)", 150, 15, 0.7),
  product("g-beet", "Свёкла", "veg", "Овощи", "daily", "100 г", 100, 43, 1.6),
  product("g-greens", "Зелень (укроп, петрушка, салат)", "veg", "Овощи", "daily", "30 г", 30, 25, 2),
  product("g-broccoli", "Брокколи", "veg", "Овощи", "daily", "150 г", 150, 34, 2.8),
  product("g-zucchini", "Кабачок", "veg", "Овощи", "daily", "150 г", 150, 24, 1.2),
  product("g-corn", "Кукуруза", "veg", "Овощи", "daily", "100 г", 100, 86, 3.3),
  product("g-celery", "Сельдерей", "veg", "Овощи", "daily", "100 г", 100, 16, 0.7),
  product("g-potato", "Картофель", "veg", "Овощи", "rare", "150 г", 150, 77, 2),
  product("g-beans", "Фасоль (варёная)", "veg", "Овощи", "rare", "100 г", 100, 127, 9),
  dish("g-d-salad", "Салат с белком", "veg", "Овощи", "daily", "250 г", 250, 120, 12, ["Овощи + кальмар/яйцо/курица/сыр"]),
  dish("g-d-stew-veg", "Тушёные/запечённые овощи", "veg", "Овощи", "daily", "250 г", 250, 90, 3),
  dish("g-d-potato-dish", "Картофель с сметаной", "veg", "Овощи", "rare", "200 г", 200, 130, 3, ["С зеленью"]),
  dish("g-d-soup", "Овощной/куриный/рыбный суп", "veg", "Овощи", "daily", "300 мл", 300, 55, 5, ["Без соли"]),
  dish("g-d-zucchini-pancake", "Оладьи из кабачков", "veg", "Овощи", "daily", "120 г (2 шт)", 120, 110, 5, ["С зеленью"]),

  // Напитки
  product("g-water", "Вода", "drink", "Напитки", "daily", "250 мл", 250, 0, 0),
  product("g-chicory", "Цикорий", "drink", "Напитки", "daily", "200 мл", 200, 3, 0.1),
  product("g-greentea", "Зелёный / травяной чай", "drink", "Напитки", "daily", "200 мл", 200, 1, 0),
  dish("g-d-chicory-milk", "Цикорий с молоком", "drink", "Напитки", "daily", "200 мл", 200, 35, 2),
  dish("g-d-tea-lemon", "Чай с лимоном", "drink", "Напитки", "daily", "200 мл", 200, 3, 0),
];

export const GENERIC_CATEGORY_ORDER = [
  "protein",
  "grain",
  "veg",
  "dairy",
  "fruit",
  "drink",
] as const;

export const GENERIC_SLOT_LABELS: Record<string, string> = {
  breakfast: "1-й приём",
  lunch: "2-й приём",
  snack: "Перекус",
  dinner: "3-й приём",
};

/** Строка для карточки: порция → ккал → белок */
export function formatFoodNutrition(c: Pick<CatalogItem, "portionLabel" | "calories" | "proteinG">): string {
  const proteinPart = c.proteinG > 0 ? ` · белок ${c.proteinG} г` : "";
  return `${c.portionLabel} · ${c.calories} ккал${proteinPart}`;
}

function catalogToMealOption(c: CatalogItem): MealOption {
  const tierTag = c.tier === "daily" ? "daily-ok" : "rare-ok";
  return {
    id: c.id,
    mealType: "any",
    title: c.title,
    description: formatFoodNutrition(c),
    proteinG: c.proteinG,
    calories: c.calories,
    tips: c.tips ?? [],
    tags: [c.kind, c.category, tierTag, `portion:${c.portionLabel}`],
    evidence: c.categoryLabel,
  };
}

export function getCatalogItemById(id: string): CatalogItem | undefined {
  return GENERIC_FOOD_CATALOG.find((c) => c.id === id);
}

/** Все пункты каталога как MealOption — один пул для любого приёма */
export function getGenericMealOptions(): MealOption[] {
  return GENERIC_FOOD_CATALOG.map(catalogToMealOption);
}

export function getGenericDailyMealPlan(selectedIds?: Record<string, string | string[]>): {
  slot: string;
  options: MealOption[];
  selected: MealOption;
  selectedIds: string[];
  selectedItems: MealOption[];
}[] {
  const options = getGenericMealOptions();
  const slots = ["breakfast", "lunch", "snack", "dinner"] as const;

  return slots.map((slot) => {
    const raw = selectedIds?.[slot];
    const ids = Array.isArray(raw) ? raw.filter(Boolean) : raw ? [raw] : [];
    const selectedItems = ids
      .map((id) => options.find((o) => o.id === id))
      .filter((o): o is MealOption => Boolean(o));
    const selected = selectedItems[0] ?? options[0];
    return { slot, options, selected, selectedIds: ids, selectedItems };
  });
}
