/**
 * Единая продуктовая терминология Vital.
 * Маркетинг · UX · UI — один источник правды.
 */
import { GENERIC_MODE } from "./app-config";

export const CHECKUP = {
  section: "Чекап",
  sectionPath: "Профиль → Чекап",
  markersTab: "Показатели",
  bloodScheduleTitle: "Показатели из крови",
  bloodScheduleSubtitle: "Когда пересдавать",
  emptySchedule: "Всё актуально — или добавь первые показатели во вкладке «Показатели»",
  addMarker: "Добавить показатель",
  addMarkerCard: "Новый показатель",
  history: "История",
  visitBundles: "Визиты по чекапу",
  doctorTextLabs: "Текст для врача (чекап)",
  bundlesTitle: "Комплексы чекапа",
  bundlesSubtitle: "Что сдавать вместе — меньше визитов",
  journeyTitle: "Записать чекап",
  journeyHref: "Чекап",
  reminderTitle: (label: string) => `Чекап: ${label}`,
  adjustmentNote: "Корректировка по чекапу",
  addResultHint: "Добавь результат в Профиль → Чекап.",
  backupIncludes: "чекап",
  badgeTitle: "Знаю своё тело",
  badgeDescription: "5+ показателей в чекапе",
  matrixRow: "Чекап",
  dayTask: "Чекап / УЗИ",
  guideTitle: "Чекап — 3 визита",
  overviewDesc: "Настройки и чекап",
  sphereHint: "Чекап по расписанию во вкладке «Чекап»",
  knowledgeAction: "Записать чекап",
  catalogLabel: "Чекап",
  vitaminHint: "Чекап + доза с врачом",
  motivation: "Точный план под твоё тело · 1 раз/квартал",
} as const;

/** Тексты mass-market версии (GitHub Pages / APK) */
export const UI = {
  onboardingName: "Как к тебе обращаться? (необязательно)",
  onboardingPrivacy:
    "Регистрация не нужна — всё хранится на этом устройстве. Вес и цели можно задать позже в «Профиле».",
  pathSubtitle: "Серия дней и динамика",
  backupIncludes: "профиль и дневники",
  backupTech: "Скачай файл копии — перенесёшь на новый телефон.",
  saveProfile: "Сохранить профиль",
  advancedSettings: "Расширенные настройки",
  dayTags: "Метки дня",
  diaryPhoto: "Один кадр на день",
  caloriesSubtitle: "План vs цель",
  planVsFact: "Цель на сегодня",
  kanbanLink: "Открыть канбан в дневнике →",
  calendarMood: "Календарь настроения",
  trendsSubtitle: "Динамика за период",
  badgesSubtitle: "За привычки и серию дней",
  eveningReflection: "Три коротких вопроса",
  movementDone: "Движение из «Сегодня» сделано",
  thyroidTaken: "Принял(а) натощак",
} as const;

export function checkupReminderTitle(label: string): string {
  return CHECKUP.reminderTitle(label);
}

export function backupIncludesLine(): string {
  return GENERIC_MODE ? UI.backupIncludes : CHECKUP.backupIncludes;
}
