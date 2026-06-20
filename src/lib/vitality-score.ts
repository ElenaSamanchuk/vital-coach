import type { RingSegment } from "./day-rings";

/** Vitality Score 0–100 — аналог PAI / Samsung Energy Score */
export function computeVitalityScore(rings: RingSegment[]): number {
  if (rings.length === 0) return 0;
  const weights = [0.3, 0.25, 0.25, 0.2];
  let sum = 0;
  rings.forEach((r, i) => {
    sum += r.progress * (weights[i] ?? 0.25);
  });
  return Math.round(sum * 100);
}

export function vitalityLabel(score: number): string {
  if (score >= 85) return "Отличный день";
  if (score >= 65) return "Хороший ритм";
  if (score >= 40) return "На пути";
  return "Мягкий старт";
}
