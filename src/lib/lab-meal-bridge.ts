import type { LabResult } from "@prisma/client";

/** Лаборатория → тарелка: уникальная связка анализов и меню */

export interface LabMealHint {
  marker: string;
  message: string;
  mealKeywords: string[];
  priority: "high" | "medium";
}

export function labMealHints(labs: LabResult[]): LabMealHint[] {
  const hints: LabMealHint[] = [];
  const latest = (marker: string) => labs.find((l) => l.marker === marker);

  const ferritin = latest("ferritin");
  if (ferritin?.refMin && ferritin.value < ferritin.refMin) {
    hints.push({
      marker: "ferritin",
      message: "Ферритин низкий — приоритет железо + витамин C",
      mealKeywords: ["печень", "говядина", "шпинат", "чечевица", "яйц"],
      priority: "high",
    });
  }

  const b12 = latest("b12");
  if (b12?.refMin && b12.value < b12.refMin) {
    hints.push({
      marker: "b12",
      message: "B12 низкий — яйца, рыба, печень в меню",
      mealKeywords: ["яйц", "рыб", "печень", "творог"],
      priority: "high",
    });
  }

  const vitd = latest("vitamin_d");
  if (vitd?.refMin && vitd.value < vitd.refMin) {
    hints.push({
      marker: "vitamin_d",
      message: "D низкий — жирная рыба 3–4×/нед",
      mealKeywords: ["рыб", "скумбр", "лосось", "форель"],
      priority: "medium",
    });
  }

  const tsh = latest("TSH");
  if (tsh?.refMax && tsh.value > tsh.refMax) {
    hints.push({
      marker: "TSH",
      message: "ТТГ выше нормы — не урезай калории резко",
      mealKeywords: ["белок", "селен", "яйц"],
      priority: "medium",
    });
  }

  return hints;
}

export function mealMatchesLabHint(title: string, keywords: string[]): boolean {
  const t = title.toLowerCase();
  return keywords.some((k) => t.includes(k));
}
