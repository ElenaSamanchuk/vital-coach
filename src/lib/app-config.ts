/**
 * Режим массового приложения: без медицинского и возрастного индивидуализма.
 * NEXT_PUBLIC_GENERIC_MODE=true — в браузере и PWA/APK.
 *
 * STANDALONE — GitHub Pages + APK: данные в IndexedDB (local-store), без сервера.
 */
export const STANDALONE_MODE =
  process.env.NEXT_PUBLIC_STANDALONE === "true" ||
  process.env.STANDALONE === "true";

export const GENERIC_MODE =
  STANDALONE_MODE ||
  process.env.NEXT_PUBLIC_GENERIC_MODE === "true" ||
  process.env.GENERIC_MODE === "true";

/** basePath для GitHub Pages: /repo-name */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Публичный URL приложения (GitHub Pages или свой домен) */
export const PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (typeof window !== "undefined" ? window.location.origin + BASE_PATH : "");

  /** Средний взрослый профиль — без диагнозов и цикла */
export const GENERIC_PROFILE = {
  birthYear: 1990,
  heightCm: 170,
  currentWeightKg: 70,
  targetWeightKg: 65,
  targetWaistCm: 75,
  targetHipsCm: 95,
  targetChestCm: 90,
  activityLevel: "moderate" as const,
  workActivityLevel: "sedentary" as const,
  primaryFocus: "balance" as const,
  sleepHours: 7.5,
};

export const APP_NAME = GENERIC_MODE ? "Ритм" : "Vital Coach";
export const APP_TAGLINE = GENERIC_MODE
  ? "Еда · движение · дневник"
  : "Личный коуч: питание, тренировки, здоровье";
