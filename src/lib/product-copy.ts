/**
 * Единая продуктовая терминология Vital.
 * Раздел «Чекап» — вместо «Анализы» (маркетинг · UX · UI).
 * Технические имена API (labs) не меняем.
 */
export const CHECKUP = {
  /** Заголовок раздела / вкладки */
  section: "Чекап",
  /** Путь в подсказках */
  sectionPath: "Профиль → Чекап",
  /** Подвкладка: результаты из крови */
  markersTab: "Показатели",
  /** Карточка расписания */
  bloodScheduleTitle: "Показатели из крови",
  bloodScheduleSubtitle: "Когда пересдавать",
  emptySchedule: "Всё актуально — или добавь первые показатели во вкладке «Показатели»",
  /** Формы */
  addMarker: "Добавить показатель",
  addMarkerCard: "Новый показатель",
  history: "История",
  /** План визитов */
  visitBundles: "Визиты по чекапу",
  doctorTextLabs: "Текст для врача (чекап)",
  bundlesTitle: "Комплексы чекапа",
  bundlesSubtitle: "Что сдавать вместе — меньше визитов",
  /** Journey / коуч */
  journeyTitle: "Записать чекап",
  journeyHref: "Чекап",
  reminderTitle: (label: string) => `Чекап: ${label}`,
  adjustmentNote: "Корректировка по чекапу",
  addResultHint: "Добавь результат в Профиль → Чекап.",
  /** Бэкап / gamification */
  backupIncludes: "чекап",
  badgeTitle: "Знаю своё тело",
  badgeDescription: "5+ показателей в чекапе",
  /** Прочее */
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

export function checkupReminderTitle(label: string): string {
  return CHECKUP.reminderTitle(label);
}
