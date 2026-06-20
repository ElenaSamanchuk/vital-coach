/** 20+ рецептов под ИР и гипотиреоз — из нутри-матрицы */

export interface RecipeCard {
  id: string;
  title: string;
  mealType: string;
  calories: number;
  proteinG: number;
  tags: string[];
  evidence: string;
  irFriendly: boolean;
  thyroidFriendly: boolean;
}

export const RECIPES_CATALOG: RecipeCard[] = [
  { id: "m-b1", title: "Омлет 2 яйца + шпинат + хлеб", mealType: "breakfast", calories: 380, proteinG: 24, tags: ["iron", "protein"], evidence: "Железо + белок при менструации", irFriendly: true, thyroidFriendly: true },
  { id: "m-b2", title: "Овсянка + яйцо + ягоды + лён", mealType: "breakfast", calories: 360, proteinG: 20, tags: ["fiber", "low-gi"], evidence: "Low-GI завтрак при ИР", irFriendly: true, thyroidFriendly: true },
  { id: "f-b3", title: "Скрембл 3 яйца + авокадо + томаты", mealType: "breakfast", calories: 420, proteinG: 26, tags: ["protein"], evidence: "Высокий белок, селен из яиц", irFriendly: true, thyroidFriendly: true },
  { id: "l-b1", title: "Омлет 3 яйца + авокадо", mealType: "breakfast", calories: 420, proteinG: 28, tags: ["protein"], evidence: "Лютеиновая фаза — голод выше", irFriendly: true, thyroidFriendly: true },
  { id: "m-l1", title: "Печень + гречка + салат", mealType: "lunch", calories: 520, proteinG: 42, tags: ["iron", "b12"], evidence: "B12 и железо", irFriendly: true, thyroidFriendly: true },
  { id: "f-l1", title: "Курица + гречка + овощи", mealType: "lunch", calories: 500, proteinG: 40, tags: ["balanced"], evidence: "Классика дефицита", irFriendly: true, thyroidFriendly: true },
  { id: "f-l3", title: "Скумбрия + киноа + капуста", mealType: "lunch", calories: 520, proteinG: 38, tags: ["omega3", "vitd"], evidence: "D и омега-3 для щитовидки", irFriendly: true, thyroidFriendly: true },
  { id: "l-l2", title: "Рыба + киноа + салат", mealType: "lunch", calories: 500, proteinG: 36, tags: ["omega3"], evidence: "Противовоспалительно", irFriendly: true, thyroidFriendly: true },
  { id: "m-l3", title: "Рыба + картофель + капуста", mealType: "lunch", calories: 480, proteinG: 35, tags: ["omega3"], evidence: "Омега-3, мягкое усвоение", irFriendly: true, thyroidFriendly: true },
  { id: "f-d1", title: "Творог + салат + семечки", mealType: "dinner", calories: 320, proteinG: 28, tags: ["protein", "low-carb-evening"], evidence: "Ужин без крахмала при ИР", irFriendly: true, thyroidFriendly: true },
  { id: "m-d2", title: "Курица + тушёные овощи", mealType: "dinner", calories: 350, proteinG: 35, tags: ["lean"], evidence: "Лёгкий ужин", irFriendly: true, thyroidFriendly: true },
  { id: "l-d3", title: "Суп-пюре тыква + курица", mealType: "dinner", calories: 380, proteinG: 30, tags: ["fiber"], evidence: "Сытость без срыва", irFriendly: true, thyroidFriendly: true },
  { id: "m-s2", title: "Яйца вкрутую ×2", mealType: "snack", calories: 140, proteinG: 12, tags: ["protein"], evidence: "Быстрый белок", irFriendly: true, thyroidFriendly: true },
  { id: "f-s1", title: "Творог + ягоды", mealType: "snack", calories: 200, proteinG: 18, tags: ["protein"], evidence: "Перекус с белком", irFriendly: true, thyroidFriendly: true },
  { id: "l-s1", title: "Йогурт + ягоды + тыквенные семечки", mealType: "snack", calories: 250, proteinG: 14, tags: ["magnesium"], evidence: "Магний при ПМС", irFriendly: true, thyroidFriendly: true },
  { id: "o-l2", title: "Лосось + салат + картофель", mealType: "lunch", calories: 500, proteinG: 36, tags: ["omega3"], evidence: "Жирная рыба 3–4×/нед", irFriendly: true, thyroidFriendly: true },
  { id: "f-l2", title: "Нутовый суп + салат", mealType: "lunch", calories: 400, proteinG: 18, tags: ["fiber"], evidence: "Бобовые ↓ глюкозу", irFriendly: true, thyroidFriendly: true },
  { id: "m-l2", title: "Суп чечевица + овощи", mealType: "lunch", calories: 420, proteinG: 22, tags: ["iron", "fiber"], evidence: "Железо + клетчатка", irFriendly: true, thyroidFriendly: true },
  { id: "o-d2", title: "Рыба + овощи гриль", mealType: "dinner", calories: 340, proteinG: 34, tags: ["omega3"], evidence: "После активного дня", irFriendly: true, thyroidFriendly: true },
  { id: "l-d1", title: "Рыба + тушёные овощи", mealType: "dinner", calories: 350, proteinG: 32, tags: ["omega3"], evidence: "Лёгкий ужин в лютеине", irFriendly: true, thyroidFriendly: true },
];

export function recipesForConditions(ir: boolean, hypothyroid: boolean): RecipeCard[] {
  return RECIPES_CATALOG.filter((r) => {
    if (ir && !r.irFriendly) return false;
    if (hypothyroid && !r.thyroidFriendly) return false;
    return true;
  });
}
