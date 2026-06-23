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

/** Постоянная ссылка на последний APK (GitHub Releases) */
export const APK_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_APK_URL ??
  "https://github.com/ElenaSamanchuk/vital-coach/releases/download/apk-latest/potok.apk";

  /** Средний взрослый профиль — без диагнозов и цикла */
export const GENERIC_PROFILE = {
  birthYear: 1990,
  heightCm: 170,
  currentWeightKg: 70,
  targetWeightKg: 70,
  targetWaistCm: 75,
  targetHipsCm: 95,
  targetChestCm: 90,
  activityLevel: "moderate" as const,
  workActivityLevel: "sedentary" as const,
  primaryFocus: "balance" as const,
  sleepHours: 7.5,
};

export const APP_NAME = GENERIC_MODE ? "Поток" : "Vital Coach";
export const APP_TAGLINE = GENERIC_MODE
  ? "будь в потоке"
  : "Личный коуч: питание, тренировки, здоровье";

/** Мягкие подписи цикла в режиме «Поток» — без слова «месячные» */
export const CYCLE_COPY = {
  cardTitle: "Цикл",
  markButton: "День цикла",
  markHint: "Отмечай дни, когда идёт цикл — повторное нажатие снимает",
  chartBars: "Розовые столбцы — отмеченные дни цикла",
  chartAction: "Отмечай день цикла на «Мой день»",
  profileHint: "Дни цикла — на «Мой день», каждый день отдельно",
  chartLegend: "цикл",
  phaseMenstrual: "цикл",
  phaseFollicular: "фолликулярная фаза",
  phaseOvulation: "овуляция",
  phaseLuteal: "лютеиновая фаза",
  notMarked: "Цикл не отмечен",
} as const;

/** Человекочитаемый статус фазы для «Поток» */
export function potokCycleLabel(
  day: number | null,
  phase: string | null | undefined,
): string {
  if (day == null || !phase) return CYCLE_COPY.notMarked;
  const phaseRu: Record<string, string> = {
    menstrual: CYCLE_COPY.phaseMenstrual,
    follicular: CYCLE_COPY.phaseFollicular,
    ovulation: CYCLE_COPY.phaseOvulation,
    luteal: CYCLE_COPY.phaseLuteal,
  };
  return `День ${day} · ${phaseRu[phase] ?? phase}`;
}

/** Префикс файла резервной копии в standalone */
export const BACKUP_FILE_PREFIX = GENERIC_MODE ? "potok-backup" : "vital-coach-backup";
