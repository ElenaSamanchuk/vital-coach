/**
 * 4 вкладки · 2 места ввода · единый акцент wellness green (#3B9B7A)
 * Эмодзи: только настроение (дневник) и онбординг.
 * Навигация — нижняя панель (без дублирующей карты зон).
 */

export const APP_RULES = {
  edit: ["Дневник", "Профиль"],
  auto: ["Сегодня", "Путь"],
} as const;

export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Сегодня", subtitle: "Выбери еду и движение" },
  "/log": { title: "Дневник", subtitle: "Дела · уход · самочувствие" },
  "/path": { title: "Путь", subtitle: "Прогресс и динамика" },
  "/settings": { title: "Профиль", subtitle: "Данные о себе" },
  "/labs": { title: "Анализы", subtitle: "Профиль → Анализы" },
  "/life": { title: "Баланс", subtitle: "Перенесено в Путь" },
  "/progress": { title: "Динамика", subtitle: "Графики" },
  "/guide": { title: "Справочник", subtitle: "Справка" },
};

export const NAV_ITEMS = [
  { href: "/", label: "Сегодня" },
  { href: "/log", label: "Дневник" },
  { href: "/path", label: "Путь" },
  { href: "/settings", label: "Профиль" },
] as const;
