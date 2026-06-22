/**
 * 4 вкладки · 2 места ввода · единый акcent wellness green (#3B9B7A)
 * Эмодзи: только настроение (дневник) и онбординг.
 * Навигация — нижняя панель (без дублирующей карты зон).
 */
import { GENERIC_MODE, APP_NAME } from "@/lib/app-config";
import { CHECKUP, UI } from "@/lib/product-copy";

export const APP_RULES = {
  edit: ["Дневник", "Профиль"],
  auto: ["Сегодня", "Путь"],
} as const;

export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: GENERIC_MODE ? "Мой день" : "Сегодня",
    subtitle: GENERIC_MODE ? "Всё про сегодня — один экран" : "Выбери еду и движение",
  },
  "/log": {
    title: "Дневник",
    subtitle: GENERIC_MODE ? "Перенесено в «Мой день»" : "Запись дня · баланс",
  },
  "/path": {
    title: "Прогресс",
    subtitle: GENERIC_MODE ? UI.pathSubtitle : "Прогресс и динамика",
  },
  "/settings": {
    title: "Профиль",
    subtitle: GENERIC_MODE ? "Цели и бэкап" : "Данные о себе",
  },
  "/labs": { title: CHECKUP.section, subtitle: CHECKUP.sectionPath },
  "/life": { title: "Баланс", subtitle: "Перенесено в Путь" },
  "/progress": { title: "Динамика", subtitle: "Графики" },
  "/guide": { title: "Справочник", subtitle: "Справка" },
};

export const NAV_ITEMS = GENERIC_MODE
  ? ([
      { href: "/", label: "Мой день" },
      { href: "/path", label: "Прогресс" },
      { href: "/settings", label: "Профиль" },
    ] as const)
  : ([
      { href: "/", label: "Сегодня" },
      { href: "/log", label: "Дневник" },
      { href: "/path", label: "Путь" },
      { href: "/settings", label: "Профиль" },
    ] as const);
