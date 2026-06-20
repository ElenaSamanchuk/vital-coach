/**
 * Комплексная схема анализов: когда сдавать, что объединять, пересдачи.
 */
import { addDays, addMonths, format, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import type { CyclePhase } from "./types";

export interface LabTestDef {
  marker: string;
  label: string;
  unit: string;
  refMin?: number;
  refMax?: number;
  cycleDay?: number;
  cyclePhase?: CyclePhase;
  fasting: boolean;
  retestMonths?: number;
  group: string;
  note: string;
}

export interface LabBundle {
  id: string;
  title: string;
  description: string;
  tests: string[];
  when: string;
  preparation: string[];
  canCombineWith: string[];
}

export interface ScheduledLab {
  marker: string;
  label: string;
  dueDate: Date;
  urgency: "overdue" | "this_week" | "upcoming" | "ok";
  reason: string;
  bundleId?: string;
}

export const LAB_TESTS: LabTestDef[] = [
  { marker: "TSH", label: "ТТГ (щитовидка)", unit: "мМЕ/л", refMin: 0.4, refMax: 4, fasting: false, retestMonths: 2, group: "thyroid", note: "Натощак не обязательно; утром" },
  { marker: "fT4", label: "свТ4", unit: "пмоль/л", refMin: 10, refMax: 22, fasting: false, group: "thyroid", note: "Вместе с ТТГ" },
  { marker: "anti_tpo", label: "АТ-ТПО", unit: "МЕ/мл", refMax: 34, fasting: false, group: "thyroid", note: "Раз в год при стабильном ТТГ" },
  { marker: "fasting_glucose", label: "Глюкоза натощак", unit: "ммоль/л", refMin: 3.9, refMax: 5.5, fasting: true, retestMonths: 3, group: "metabolic", note: "8–12 ч голодания" },
  { marker: "fasting_insulin", label: "Инсулин натощак", unit: "мкЕд/мл", refMin: 2, refMax: 12, fasting: true, group: "metabolic", note: "Тот же забор что глюкоза" },
  { marker: "homa_ir", label: "HOMA-IR (расчёт)", unit: "", refMax: 2.5, fasting: true, group: "metabolic", note: "глюкоза×инсулин/22,5" },
  { marker: "hba1c", label: "HbA1c", unit: "%", refMin: 4, refMax: 5.6, fasting: false, retestMonths: 3, group: "metabolic", note: "Не зависит от дня цикла" },
  { marker: "lipids", label: "Липидограмма", unit: "ммоль/л", fasting: true, group: "metabolic", note: "12 ч голодания; с ТТГ можно в другой день" },
  { marker: "vitamin_d", label: "25(OH)D", unit: "нг/мл", refMin: 30, refMax: 60, fasting: false, retestMonths: 3, group: "vitamins", note: "Любое время" },
  { marker: "b12", label: "Витамин B12", unit: "пг/мл", refMin: 300, refMax: 900, fasting: false, group: "vitamins", note: "С ферритином в один день" },
  { marker: "ferritin", label: "Ферритин", unit: "нг/мл", refMin: 30, refMax: 150, fasting: false, group: "vitamins", note: "Не на фоне острой инфекции" },
  { marker: "cbc", label: "ОАК (общий анализ крови)", unit: "", fasting: false, group: "base", note: "Базовый скрининг" },
  { marker: "alt_ast", label: "АЛТ, АСТ, ГГТ", unit: "Ед/л", fasting: false, group: "base", note: "Печень" },
  { marker: "cortisol_am", label: "Кортизол утренний", unit: "нмоль/л", refMin: 140, refMax: 690, fasting: false, group: "hormones", note: "Строго 8:00–9:00, до кофе и стресса" },
  { marker: "estradiol", label: "Эстрадиол", unit: "пмоль/л", cycleDay: 3, cyclePhase: "follicular", fasting: false, group: "hormones", note: "3–5 день цикла" },
  { marker: "progesterone", label: "Прогестерон", unit: "нмоль/л", refMin: 5, cyclePhase: "luteal", fasting: false, group: "hormones", note: "День 21 или за 7 дней до месячных" },
  { marker: "lh_fsh", label: "ЛГ + ФСГ", unit: "мМЕ/мл", cycleDay: 3, fasting: false, group: "hormones", note: "День 3 цикла, с эстрадиолом" },
  { marker: "testosterone", label: "Тестостерон + ГСПГ", unit: "нмоль/л", cycleDay: 3, fasting: false, group: "hormones", note: "День 3, при СПКЯ" },
  { marker: "prolactin", label: "Пролактин", unit: "мЕд/л", fasting: false, group: "hormones", note: "Утром, спокойно, не после секса/стресса" },
  { marker: "dhea_s", label: "ДГЭА-С", unit: "мкмоль/л", cycleDay: 3, fasting: false, group: "hormones", note: "День 3 цикла" },
];

export const LAB_BUNDLES: LabBundle[] = [
  {
    id: "bundle-1",
    title: "Визит 1 — база + метаболизм (один заход, натощак)",
    description: "Максимум информации за один утренний визит",
    tests: ["cbc", "fasting_glucose", "fasting_insulin", "ferritin", "b12", "vitamin_d", "TSH", "fT4"],
    when: "Любой день, кроме дней 1–2 месячных (если сдаёшь гормоны отдельно). Утро 8–10, 10–12 ч без еды.",
    preparation: ["Вода можно", "Без кофе утром", "Спокойно дойти, не бежать"],
    canCombineWith: [],
  },
  {
    id: "bundle-2",
    title: "Визит 2 — день 3 цикла (гормоны)",
    description: "Эстрадиол, ЛГ, ФСГ, тестостерон — один забор",
    tests: ["estradiol", "lh_fsh", "testosterone", "dhea_s", "prolactin"],
    when: "3–5 день цикла (1-й день = начало кровотечения), утро",
    preparation: ["Не накануне тяжёлых тренировок", "Сон 7+ ч"],
    canCombineWith: ["bundle-1 если совпал день 3"],
  },
  {
    id: "bundle-3",
    title: "Визит 3 — день 21 (прогестерон)",
    description: "Проверка овуляции",
    tests: ["progesterone"],
    when: "21 день цикла ИЛИ за 7 дней до ожидаемых месячных",
    preparation: ["Можно не натощак"],
    canCombineWith: ["cortisol_am если утро"],
  },
  {
    id: "bundle-4",
    title: "Кортизол отдельно",
    description: "Только утром, особые условия",
    tests: ["cortisol_am"],
    when: "8:00–9:00, после 30 мин бодрствования, до еды и кофе",
    preparation: ["Сидя 15 мин до забора", "Не после инсомнии"],
    canCombineWith: ["progesterone в тот же визит"],
  },
  {
    id: "bundle-5",
    title: "Пересдача через 8–12 недель",
    description: "После коррекции питания/лечения",
    tests: ["TSH", "fasting_glucose", "fasting_insulin", "vitamin_d", "ferritin"],
    when: "Через 2–3 мес после старта тироксина или дефицита D",
    preparation: ["Натощак для глюкозы/инсулина"],
    canCombineWith: [],
  },
];

export function getNextBundleForCycle(
  cycleDay: number | null,
  completedMarkers: string[],
): LabBundle | null {
  if (!cycleDay) return LAB_BUNDLES[0];

  if (cycleDay >= 3 && cycleDay <= 5 && !completedMarkers.includes("estradiol")) {
    return LAB_BUNDLES[1];
  }
  const cycleLength = 28;
  if (cycleDay >= cycleLength - 7 && !completedMarkers.includes("progesterone")) {
    return LAB_BUNDLES[2];
  }
  if (!completedMarkers.includes("fasting_glucose")) {
    return LAB_BUNDLES[0];
  }
  return null;
}

export function buildLabSchedule(
  lastResults: { marker: string; date: Date; value: number; refMin?: number | null; refMax?: number | null }[],
  cycleDay: number | null,
): ScheduledLab[] {
  const today = startOfDay(new Date());
  const schedule: ScheduledLab[] = [];
  const byMarker = new Map(lastResults.map((r) => [r.marker, r]));

  for (const test of LAB_TESTS) {
    const last = byMarker.get(test.marker);
    let dueDate = today;
    let reason = "Первичный скрининг";

    if (last && test.retestMonths) {
      dueDate = addMonths(last.date, test.retestMonths);
      reason = `Пересдача через ${test.retestMonths} мес`;
    } else if (!last) {
      if (test.cycleDay && cycleDay) {
        if (cycleDay <= test.cycleDay) {
          dueDate = addDays(today, test.cycleDay - cycleDay);
        } else {
          dueDate = addDays(today, 28 - cycleDay + test.cycleDay);
        }
        reason = `Цикл: день ${test.cycleDay}`;
      }
    } else {
      continue;
    }

    if (last) {
      const outOfRange =
        (test.refMin != null && last.value < test.refMin) ||
        (test.refMax != null && last.value > test.refMax);
      if (outOfRange) {
        dueDate = today;
        reason = "Вне референса — пересдать";
      }
    }

    let urgency: ScheduledLab["urgency"] = "ok";
    if (isBefore(dueDate, today)) urgency = "overdue";
    else if (isBefore(dueDate, addDays(today, 7))) urgency = "this_week";
    else if (isBefore(dueDate, addDays(today, 30))) urgency = "upcoming";

    if (!last || urgency !== "ok") {
      schedule.push({
        marker: test.marker,
        label: test.label,
        dueDate,
        urgency,
        reason,
        bundleId: LAB_BUNDLES.find((b) => b.tests.includes(test.marker))?.id,
      });
    }
  }

  return schedule.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function formatLabDue(date: Date): string {
  return format(date, "d MMMM", { locale: ru });
}

export function getDoctorOrderText(): string {
  return `КОМПЛЕКС ДЛЯ ВРАЧА (оптимизация визитов):

ВИЗИТ 1 (натощак 10–12 ч, утро):
ОАК, глюкоза, инсулин, ферритин, B12, 25(OH)D, ТТГ, свТ4, АЛТ/АСТ

ВИЗИТ 2 (3–5 день цикла, утро):
Эстрадиол, ЛГ, ФСГ, тестостерон, ГСПГ, ДГЭА-С, пролактин
(можно объединить с визитом 1, если день 3 попал на натощак)

ВИЗИТ 3 (21 день или -7 дней до месячных):
Прогестерон (+ кортизол 8–9 утра при необходимости)

ДОПОЛНИТЕЛЬНО по показаниям:
АТ-ТПО, HbA1c, липидограмма, УЗИ щитовидки, УЗИ малого таза`;
}
