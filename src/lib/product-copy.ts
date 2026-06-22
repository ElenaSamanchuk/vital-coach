/**
 * Единая продуктовая терминология приложения.
 * Маркетинг · UX · UI — один источник правды.
 */
import { APP_NAME, GENERIC_MODE } from "./app-config";

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
  onboardingTitle: "Добро пожаловать",
  onboardingBadge: "Без пароля и регистрации",
  onboardingName: "Как к тебе обращаться? (необязательно)",
  onboardingPrivacy:
    "Это не аккаунт — имя только для приветствия. Все данные остаются на этом устройстве.",
  onboardingCta: "Начать",
  onboardingNext: "Дальше",
  onboardingSkipSlides: "Пропустить",
  onboardingSlides: [
    {
      title: "Мой день — всё в одном месте",
      desc: "Настроение, еда, движение, баланс, вода и сон. Один экран — одна кнопка «Сохранить».",
    },
    {
      title: "Без лишних вкладок",
      desc: "Не нужно искать, где что вводить. Прогресс дня виден сверху.",
    },
    {
      title: "Прогресс — серия и динамика",
      desc: "Кольца привычек, четыре сферы за неделю, графики из записей.",
    },
  ] as const,
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
  recommendationsTitle: "Рекомендации",
  recommendationsSubtitle: "Еда · движение · досуг · сон · вода · настроение",
  badgesSubtitle: "За привычки и серию дней",
  eveningReflection: "Три коротких вопроса",
  movementDone: "Движение из «Сегодня» сделано",
  thyroidTaken: "Принял(а) натощак",
  diaryOpen: "Записать в дневник",
  diaryClose: "Закрыть день",
  diaryDone: "День записан",
  todayRoleHint: "Всё на одном экране — в конце нажми «Сохранить день».",
  diaryRoleHint: "Дневник объединён с «Мой день» на главном экране.",
  vitalityHint: "0–100: еда + движение + досуг + запись за сегодня",
  onboardingHeight: "Рост, см",
  onboardingWeight: "Вес сейчас, кг",
  onboardingBodySkip: "Можно пропустить — потом в Профиле",
  saveAllProfile: "Сохранить профиль",
} as const;

/** Структура приложения — для подсказок в UI */
export const APP_FLOW = {
  title: `Как устроено ${APP_NAME}`,
  steps: [
    { label: "Мой день", desc: "Ввод и отметки за сегодня — одна кнопка «Сохранить день»" },
    { label: "Прогресс", desc: "Серия, кольца, графики — только смотреть, без ввода" },
    { label: "Профиль", desc: "Рост, цели, плашки, напоминания, резервная копия" },
  ],
  note: "Три вкладки. День заполняешь только на первой — остальное не дублируется.",
} as const;

export function checkupReminderTitle(label: string): string {
  return CHECKUP.reminderTitle(label);
}

export function backupIncludesLine(): string {
  return GENERIC_MODE ? UI.backupIncludes : CHECKUP.backupIncludes;
}
