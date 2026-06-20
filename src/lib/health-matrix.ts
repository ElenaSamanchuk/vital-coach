/**
 * Visual health condition matrix — impacts on weight, nutrition, movement.
 */
import type { HealthConditions } from "./types";

export interface ConditionCard {
  key: string;
  label: string;
  emoji: string;
  active: boolean;
  impact: string;
  nutrition: string;
  movement: string;
  labs: string;
  color: string;
}

export function getConditionMatrix(c: HealthConditions & {
  endometriosis?: boolean;
  vitaminAbsorption?: boolean;
  pcos?: boolean;
}): ConditionCard[] {
  return [
    {
      key: "pcos",
      label: "СПКЯ",
      emoji: "🌸",
      active: c.pcos || c.pcosSuspected,
      impact: "ИР, живот, акне, цикл, вес стоит",
      nutrition: "Low-GI, белок 150г+, инозитол (с врачом), крахмал днём",
      movement: "Силовая 2× + ходьба после еды > HIIT ежедневно",
      labs: "Инсулин, HOMA-IR, тестостерон, АМГ, УЗИ яичников",
      color: "#ff2d55",
    },
    {
      key: "endometriosis",
      label: "Эндометриоз",
      emoji: "🩸",
      active: !!c.endometriosis,
      impact: "Боль, воспаление, усталость, вздутие",
      nutrition: "Противовоспалительное: рыба, крестоцветные, меньше трансжиров",
      movement: "Йога, плавание, без скручиваний в острую фазу",
      labs: "Консультация гинеколога, МРТ малого таза по показаниям",
      color: "#af52de",
    },
    {
      key: "insulinResistance",
      label: "Инсулинорезистентность",
      emoji: "📊",
      active: c.insulinResistance,
      impact: "Голод, талия, плато веса",
      nutrition: "Порядок еды, клетчатка 30г, ходьба 10 мин после еды",
      movement: "Силовая + умеренное кардио",
      labs: "Глюкоза, инсулин, HbA1c, HOMA-IR",
      color: "#ff9500",
    },
    {
      key: "hypothyroidism",
      label: "Щитовидка",
      emoji: "🦋",
      active: c.hypothyroidism,
      impact: "−200–400 ккал расхода, отёки, усталость",
      nutrition: "Йод, белок, не <1500 ккал, тироксин натощак",
      movement: "Постепенно, без перегруза",
      labs: "ТТГ, свТ4, АТ-ТПО каждые 6–8 нед после смены дозы",
      color: "#0071e3",
    },
    {
      key: "cortisolIssues",
      label: "Кортизол / стресс",
      emoji: "🌊",
      active: c.cortisolIssues,
      impact: "Висцеральный жир, вода, срывы",
      nutrition: "Стабильные приёмы, не голодать",
      movement: "Йога, прогулки > ежедневный HIIT",
      labs: "Кортизол утром 8–9, сон 7–8 ч",
      color: "#5856d6",
    },
    {
      key: "vitaminAbsorption",
      label: "Усвоение витаминов",
      emoji: "💊",
      active: !!c.vitaminAbsorption,
      impact: "Дефициты D, B12, железа при «нормальной» еде",
      nutrition: "Жир к витаминам, B12/железо с C, формы с врачом",
      movement: "Энергия низкая — минимальный день ок",
      labs: "D, B12, ферритин, фолат, кальций",
      color: "#34c759",
    },
    {
      key: "hormoneIssues",
      label: "Гормональные колебания",
      emoji: "🌙",
      active: c.hormoneIssues,
      impact: "±2–3 кг воды по циклу",
      nutrition: "Фолликулярная — дефицит, лютеиновая — белок+",
      movement: "Синхронизация с фазой",
      labs: "Эстрадиол д3, прогестерон д21",
      color: "#64d2ff",
    },
  ];
}

export function getActiveConditionCount(matrix: ConditionCard[]): number {
  return matrix.filter((c) => c.active).length;
}
