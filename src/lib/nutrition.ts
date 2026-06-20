/**
 * Единая нутриционная матрица.
 * Синтез: средиземноморская, low-GI/carb timing (IR/СПКЯ), high-protein deficit,
 * anti-inflammatory, thyroid-aware, cortisol-aware — без экстремальных диет.
 */
import type { CyclePhase, HealthConditions, MealSuggestion } from "./types";

export interface MealOption extends MealSuggestion {
  id: string;
  tags: string[];
  evidence: string;
}

export interface DailyNutritionFramework {
  calorieNote: string;
  macroSplit: { protein: string; carbs: string; fat: string };
  principles: string[];
  micronutrientFocus: string[];
  avoid: string[];
}

const MEAL_SLOTS = ["breakfast", "lunch", "snack", "dinner"] as const;

export function getNutritionFramework(
  conditions: HealthConditions & { endometriosis?: boolean; vitaminAbsorption?: boolean },
  phase: CyclePhase | null,
  calorieTarget: number,
): DailyNutritionFramework {
  const principles: string[] = [
    "Дефицит умеренный — не ниже 1500 ккал при росте 170+",
    "Белок 1,6–1,8 г/кг — сохранение мышц",
    "Овощи 400–600 г — объём и клетчатка",
  ];
  const micronutrientFocus: string[] = [];
  const avoid: string[] = ["Алкоголь на фазе активного сброса", "Сладкие напитки"];

  if (conditions.insulinResistance || conditions.pcosSuspected) {
    principles.push("Крахмал порционно, в основном до 16:00");
    principles.push("Порядок: овощи → белок → углеводы");
    principles.push("10–15 мин ходьбы после еды с углеводами");
    avoid.push("Углеводы отдельно (фрукт без жира/белка)");
  }
  if (conditions.hypothyroidism) {
    principles.push("Йодированная соль, достаточно белка и селена (яйца, рыба)");
    principles.push("Тироксин натощак — не конкурировать с кальцием/кофе");
    avoid.push("Экстремальный дефицит (<1400 ккал длительно)");
  }
  if (conditions.cortisolIssues) {
    principles.push("Не голодать — стабильные приёмы каждые 4–5 ч");
    avoid.push("Кофеин на голодный желудок при высоком стрессе");
  }
  if (phase === "luteal") {
    principles.push("Лютеиновая фаза: +белок, умеренная соль, магний из овощей/орехов");
  }
  if (phase === "menstrual") {
    principles.push("Менструация: железо (печень/говядина) + витамин C");
    micronutrientFocus.push("Железо", "B12", "Фолат");
  }

  if (conditions.vitaminDDeficiency) micronutrientFocus.push("D: рыба 3–4×/нед");
  if (conditions.b12Deficiency) micronutrientFocus.push("B12: яйца, печень, кефир");
  if (conditions.endometriosis) {
    principles.push("Эндометриоз: омега-3, мало трансжиров, крестоцветные");
    avoid.push("Избыток красного мяса в острую фазу (по самочувствию)");
  }
  if (conditions.pcosSuspected) {
    principles.push("СПКЯ: низкий ГИ, инозитол обсудить с врачом");
  }
  if (conditions.vitaminAbsorption) {
    principles.push("Усвоение: жирорастворимые с жиром, B12/железо — формы с врачом");
    micronutrientFocus.push("Пересдача D, B12, ферритина через 8 нед");
  }

  let calorieNote = `Цель ${calorieTarget} ккал`;
  if (phase === "luteal") calorieNote += " (не снижать из-за воды на весах)";
  if (conditions.cortisolIssues && phase === "menstrual") {
    calorieNote += " · при слабости +100 ккал из белка";
  }

  return {
    calorieNote,
    macroSplit: {
      protein: "30–35% (приоритет)",
      carbs: conditions.insulinResistance ? "30–35%, в основном днём" : "35–40%",
      fat: "25–30%, с каждым приёмом для витаминов",
    },
    principles,
    micronutrientFocus,
    avoid,
  };
}

type MealBank = Record<string, MealOption[]>;

function opt(
  id: string,
  mealType: string,
  title: string,
  description: string,
  proteinG: number,
  calories: number,
  tips: string[],
  tags: string[],
  evidence: string,
): MealOption {
  return { id, mealType, title, description, proteinG, calories, tips, tags, evidence };
}

const BANK: Record<CyclePhase, MealBank> = {
  menstrual: {
    breakfast: [
      opt("m-b1", "breakfast", "Омлет 2 яйца + шпинат + цельный хлеб", "Железо + белок, мягкий старт", 24, 380, ["Шпинат с витамином C", "Не пропускать завтрак"], ["iron", "protein"], "Железо + белок при менструации — восполнение потерь"),
      opt("m-b2", "breakfast", "Овсянка + яйцо + ягоды + лён", "Энергия + клетчатка", 20, 360, ["Корица для глюкозы"], ["fiber", "low-gi"], "Low-GI завтрак снижает голод при ИР (мета-анализы)"),
      opt("m-b3", "breakfast", "Творог 5% + банан + орехи", "Кальций + магний для ПМС", 28, 400, ["Магний из орехов"], ["calcium", "protein"], "Кальций и магний — облегчение ПМС-симптомов"),
    ],
    lunch: [
      opt("m-l1", "lunch", "Печень + гречка + салат", "100 г печени 1×/нед — B12, железо", 42, 520, ["Салат с перцем/лимоном"], ["iron", "b12"], "Гемовое железо — лучшая биодоступность"),
      opt("m-l2", "lunch", "Суп чечевица + овощи", "Растительное железо + C из овощей", 22, 420, ["Лимон в суп"], ["fiber", "iron"], "Чечевица + витамин C — негемовое железо"),
      opt("m-l3", "lunch", "Рыба + картофель + капуста", "Омега-3, лёгкое усвоение", 35, 480, ["Не пересушивать рыбу"], ["omega3", "protein"], "Омега-3 — противовоспалительный эффект"),
    ],
    snack: [
      opt("m-s1", "snack", "Кефир + яблоко", "Пробиотики + пектин", 10, 200, [], ["gut"], "Пробиотики поддерживают микробиом"),
      opt("m-s2", "snack", "Яйца вкрутую ×2", "Быстрый белок", 12, 140, [], ["protein"], "Белок снижает голод"),
      opt("m-s3", "snack", "Грецкие орехи + киви", "Магний + витамин C", 4, 220, [], ["magnesium"], "Магний при ПМС"),
    ],
    dinner: [
      opt("m-d1", "dinner", "Творог + зелёный салат", "Казеин на ночь", 28, 300, ["Без крахмала"], ["protein"], "Казеин — медленный белок"),
      opt("m-d2", "dinner", "Курица + тушёные овощи", "Лёгкий ужин", 35, 350, ["Овощи 300+ г"], ["lean"], "Белок + объём без лишних калорий"),
      opt("m-d3", "dinner", "Рыба + брокколи", "Лёгко, омега-3", 32, 320, ["Брокколи 5 мин тушения"], ["omega3"], "Сульфорафан из брокколи"),
    ],
  },
  follicular: {
    breakfast: [
      opt("f-b1", "breakfast", "Овсянка + 2 яйца + ягоды", "Крахмал утром — ок при ИР", 22, 380, ["Корица"], ["low-gi"], "Low-GI + белок"),
      opt("f-b2", "breakfast", "Греческий йогурт + гранола + семечки", "Пробиотики + цинк", 20, 350, [], ["gut", "zinc"], "Йогурт — пробиотики"),
      opt("f-b3", "breakfast", "Скрембл 3 яйца + авокадо + томаты", "Высокий белок, фолликулярная энергия", 26, 420, ["Ликопин с жиром"], ["protein"], "Фолликулярная фаза — лучшее окно для дефицита"),
    ],
    lunch: [
      opt("f-l1", "lunch", "Курица + гречка + овощи", "Классика дефицита", 40, 500, ["Ходьба 10 мин после"], ["balanced"], "Средиземноморский паттерн"),
      opt("f-l2", "lunch", "Нутовый суп + салат", "Клетчатка + белок", 18, 400, ["Овощи сначала"], ["fiber"], "Бобовые снижают постпрандиальную глюкозу"),
      opt("f-l3", "lunch", "Скумбрия + киноа + капуста", "Омега-3 + D", 38, 520, ["Рыба 3–4×/нед"], ["omega3", "vitd"], "Жирная рыба — D и EPA/DHA"),
    ],
    snack: [
      opt("f-s1", "snack", "Творог + ягоды", "Белок", 18, 200, [], ["protein"], "Перекус с белком"),
      opt("f-s2", "snack", "Хумус + морковь", "Клетчатка без скачка", 8, 180, [], ["fiber"], "Низкий ГИ"),
      opt("f-s3", "snack", "Яйцо + огурец", "Минималистично", 6, 100, [], ["protein"], "Быстрый перекус"),
    ],
    dinner: [
      opt("f-d1", "dinner", "Творог + салат + семечки", "Вечер без крахмала при ИР", 28, 320, [], ["protein", "low-carb-evening"], "Углеводы вечером ↑ глюкоза при ИР"),
      opt("f-d2", "dinner", "Индейка + запечённые овощи", "Нежирный белок", 35, 380, [], ["lean"], "Индейка — лейцин"),
      opt("f-d3", "dinner", "Омлет + грибы + шпинат", "Ужин за 3 ч до сна", 24, 300, [], ["protein"], "Лёгкий ужин — сон"),
    ],
  },
  ovulation: {
    breakfast: [
      opt("o-b1", "breakfast", "Овсянка + протеин/яйца + банан", "Энергия для тренировки", 28, 450, ["Перед вело/бассейном"], ["energy"], "Углеводы перед нагрузкой"),
      opt("o-b2", "breakfast", "Яичница + фасоль + авокадо", "Белок + клетчатка", 24, 400, [], ["protein", "fiber"], "Сытость"),
      opt("o-b3", "breakfast", "Смузи: кефир + ягоды + лён", "Быстро", 14, 280, [], ["quick"], "Практичный вариант"),
    ],
    lunch: [
      opt("o-l1", "lunch", "Говядина + овощи + рис бурый", "Железо + крахмал после тренировки", 38, 550, ["Рис после бассейна/вело"], ["iron"], "Пик эстрогена — хорошая переносимость нагрузки"),
      opt("o-l2", "lunch", "Лосось/форель + салат + картофель", "Омега-3", 36, 500, [], ["omega3"], "Рыба"),
      opt("o-l3", "lunch", "Куриный боул с киноа", "Полный приём", 40, 520, [], ["balanced"], "Боул — контроль порции"),
    ],
    snack: [
      opt("f-s1", "snack", "Творог + ягоды", "Белок", 18, 200, [], ["protein"], "Перекус"),
      opt("f-s2", "snack", "Банан + арахисовая паста 1 ч.л.", "Перед интервалами", 4, 200, [], ["energy"], "Быстрые углеводы перед HIIT"),
      opt("o-s3", "snack", "Сыр + яблоко", "Жир + клетчатка", 12, 220, [], ["balanced"], "Не голый углевод"),
    ],
    dinner: [
      opt("f-d1", "dinner", "Творог + салат", "Вечер", 28, 320, [], ["protein"], "Белковый ужин"),
      opt("o-d2", "dinner", "Рыба + овощи гриль", "Лёгко", 34, 340, [], ["omega3"], "После активного дня"),
      opt("f-d2", "dinner", "Индейка + овощи", "Стандарт", 35, 380, [], ["lean"], "Нежирный белок"),
    ],
  },
  luteal: {
    breakfast: [
      opt("l-b1", "breakfast", "Омлет 3 яйца + авокадо", "Больше белка — голод в лютеине", 28, 420, ["Соль умеренно"], ["protein"], "Прогестерон ↑ аппетит"),
      opt("l-b2", "breakfast", "Овсянка + творог + тыквенные семечки", "Магний + цинк", 30, 400, ["Цинк для ПМС"], ["magnesium", "zinc"], "Семечки — магний"),
      opt("l-b3", "breakfast", "Яйца + цельный тост + сыр", "Сытно", 22, 380, [], ["satiety"], "Насыщение без срыва"),
    ],
    lunch: [
      opt("l-l1", "lunch", "Говядина/печень + овощи", "Железо, без лишнего крахмала", 38, 480, [], ["iron"], "Железо"),
      opt("l-l2", "lunch", "Рыба + киноа + салат", "Омега-3 против воспаления", 36, 500, [], ["omega3"], "ПМС-воспаление"),
      opt("f-l1", "lunch", "Курица + гречка + овощи", "Сбалансированно", 40, 500, [], ["balanced"], "Стабильный приём"),
    ],
    snack: [
      opt("l-s1", "snack", "Йогурт + ягоды + тыквенные семечки", "Магний", 14, 250, [], ["magnesium"], "Магний при ПМС"),
      opt("l-s2", "snack", "Тёмный шоколад 85% 20г + орехи", "Магний, без срыва", 4, 180, ["Не больше 30 г"], ["mood"], "Полифенолы"),
      opt("m-s1", "snack", "Кефир + яблоко", "Пробиотики", 10, 200, [], ["gut"], "Кишечник"),
    ],
    dinner: [
      opt("l-d1", "dinner", "Рыба + тушёные овощи", "Лёгкий ужин", 32, 350, [], ["omega3"], "Без тяжёлого крахмала"),
      opt("f-d1", "dinner", "Творог + салат", "Казеин", 28, 320, [], ["protein"], "Белок на ночь"),
      opt("l-d3", "dinner", "Суп-пюре из тыквы + курица", "Сытость, клетчатка", 30, 380, [], ["fiber", "satiety"], "Объём без калорий"),
    ],
  },
};

/** Универсальные варианты — дополняют фазовый банк */
const UNIVERSAL_EXTRAS: MealBank = {
  breakfast: [
    opt("u-b1", "breakfast", "Смузи: кефир + ягоды + протеин", "Быстро, белок с утра", 22, 280, ["Можно взять с собой"], ["protein", "quick"], "Белок на завтрак ↓ тягу к сладкому"),
    opt("u-b2", "breakfast", "Тост цельный + авокадо + яйцо", "Жиры + белок, сытно", 18, 380, ["Авокадо — клетчатка и жир"], ["balanced"], "Сытость до обеда"),
  ],
  lunch: [
    opt("u-l1", "lunch", "Салат боул: курица + киноа + овощи", "Контроль порции, много овощей", 38, 480, ["Заправка отдельно"], ["balanced", "fiber"], "Боул — визуальный контроль калорий"),
    opt("u-l2", "lunch", "Рыбные котлеты + тушёные овощи", "Омега-3, лёгкий ужин-обед", 34, 420, ["Запекать, не жарить"], ["omega3", "lean"], "Рыба 3–4×/нед при гипотиреозе"),
  ],
  snack: [
    opt("u-s1", "snack", "Творог + льняное семя", "Белок + омега-3", 16, 180, [], ["protein", "omega3"], "Перекус с белком"),
    opt("u-s2", "snack", "Огурец + хумус", "Объём без скачка глюкозы", 6, 120, [], ["fiber", "low-gi"], "Низкий ГИ при ИР"),
    opt("u-s3", "snack", "Греческий йогурт + орехи", "Пробиотики + жир", 14, 200, [], ["gut", "protein"], "Сытость между приёмами"),
  ],
  dinner: [
    opt("u-d1", "dinner", "Запечённая рыба + салат", "Лёгкий вечер", 32, 340, ["Без крахмала"], ["omega3", "lean"], "Белковый ужин — сон лучше"),
    opt("u-d2", "dinner", "Суп-пюре + отварная курица", "Объём, тепло, сытость", 28, 360, ["Овощи 400+ г"], ["fiber", "satiety"], "Супы ↓ общий калораж"),
  ],
};

export function getMealOptions(
  phase: CyclePhase | null,
  conditions: HealthConditions,
  mealType: string,
): MealOption[] {
  const p = phase ?? "follicular";
  const phaseOpts = BANK[p][mealType] ?? BANK.follicular[mealType] ?? [];
  const extraOpts = UNIVERSAL_EXTRAS[mealType] ?? [];
  const seen = new Set<string>();
  let options = [...phaseOpts, ...extraOpts].filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });

  if (conditions.insulinResistance || conditions.pcosSuspected) {
    options = options.sort((a, b) => {
      const aIr = a.tags.includes("low-gi") || a.tags.includes("fiber") ? 1 : 0;
      const bIr = b.tags.includes("low-gi") || b.tags.includes("fiber") ? 1 : 0;
      return bIr - aIr;
    });
  }
  if (conditions.hypothyroidism) {
    options = options.filter((o) => !o.title.toLowerCase().includes("сырой капуст"));
  }

  return options.slice(0, 5);
}

export function getDailyMealPlan(
  phase: CyclePhase | null,
  conditions: HealthConditions,
  selectedIds?: Record<string, string>,
): { slot: string; options: MealOption[]; selected: MealOption }[] {
  return MEAL_SLOTS.map((slot) => {
    const options = getMealOptions(phase, conditions, slot);
    const selectedId = selectedIds?.[slot];
    const selected = options.find((o) => o.id === selectedId) ?? options[0];
    return { slot, options, selected };
  });
}

export function sumSelectedMeals(plan: { selected: MealOption }[]): {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
} {
  return plan.reduce(
    (acc, p) => {
      const c = p.selected.calories;
      const pr = p.selected.proteinG;
      const fat = Math.round((c * 0.28) / 9);
      const carbs = Math.round((c - pr * 4 - fat * 9) / 4);
      return {
        calories: acc.calories + c,
        proteinG: acc.proteinG + pr,
        fatG: acc.fatG + fat,
        carbsG: acc.carbsG + Math.max(0, carbs),
      };
    },
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );
}

/** Оценка макросов из ккал/белка если нет точных данных */
export function estimateMacros(
  calories: number,
  proteinG: number,
  fatTargetG: number,
  carbTargetG: number,
): { fatG: number; carbsG: number } {
  const fatG = Math.round((calories * 0.28) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return {
    fatG: Math.min(fatG, fatTargetG * 1.2),
    carbsG: Math.min(carbsG, carbTargetG * 1.2),
  };
}
