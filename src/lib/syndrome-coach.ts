import type { CyclePhase } from "./types";
import type { HealthConditions } from "./types";

/** Синдром-коуч: одна фраза как сочетаются ИР + щитовидка + СПКЯ + цикл сегодня */

export function syndromeInsight(
  conditions: HealthConditions,
  phase: CyclePhase | null,
  stress: number,
): { headline: string; tip: string } | null {
  const parts: string[] = [];
  if (conditions.insulinResistance) parts.push("ИР");
  if (conditions.hypothyroidism) parts.push("гипотиреоз");
  if (conditions.pcosSuspected) parts.push("СПКЯ");
  if (conditions.endometriosis) parts.push("эндометриоз");

  if (parts.length < 2) return null;

  let tip = "Белок в каждый приём + не экстремальный дефицит — все системы в одном теле.";
  if (conditions.hypothyroidism && conditions.insulinResistance) {
    tip = "Щитовидка тормозит расход, ИР держит инсулин — белок и ходьба важнее ещё −200 ккал.";
  }
  if (phase === "luteal" && conditions.pcosSuspected) {
    tip = "Лютеиновая + СПКЯ: голод сильнее — не вини себя, держи белок и сон.";
  }
  if (stress >= 7 && conditions.cortisolIssues) {
    tip = "Стресс + кортизол: сегодня не углубляй дефицит — мягкий день уместен.";
  }

  return {
    headline: `Сегодня: ${parts.join(" · ")}`,
    tip,
  };
}
