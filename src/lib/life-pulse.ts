/**
 * Мониторинг 4 сфер: работа · уход · досуг · быт.
 * Хранится в lifeActionsJson._pulse
 */
import type { LucideIcon } from "lucide-react";
import { Briefcase, Heart, Home, Sparkles } from "lucide-react";

export type LifePulseKey = "work" | "care" | "leisure" | "home";

export interface LifePulseItem {
  id: string;
  label: string;
  minutes?: number;
  /** 1–10: влияние на настроение (досуг) */
  moodBoost?: number;
  /** Короткая подсказка «зачем» */
  tip?: string;
  /** id в каталоге LEISURE_ACTIVITIES для аналитики */
  leisureId?: string;
}

export interface LifePulseSphere {
  items: string[];
  minutes: number;
  /** 1 = мало сил, 2 = норм, 3 = хорошо */
  feel: number | null;
}

export type LifePulseDay = Record<LifePulseKey, LifePulseSphere>;

export const LIFE_PULSE_KEYS: LifePulseKey[] = ["work", "care", "leisure", "home"];

export const LIFE_PULSE_META: Record<
  LifePulseKey,
  { label: string; short: string; color: string; icon: LucideIcon; hint: string }
> = {
  work: {
    label: "Работа",
    short: "Работа",
    color: "#4A90D9",
    icon: Briefcase,
    hint: "Фокус, задачи, границы",
  },
  care: {
    label: "Уход за собой",
    short: "Уход",
    color: "#D4869C",
    icon: Heart,
    hint: "Тело, кожа, отдых для себя",
  },
  leisure: {
    label: "Досуг",
    short: "Досуг",
    color: "#3B9B7A",
    icon: Sparkles,
    hint: "Радость без пользы",
  },
  home: {
    label: "Быт",
    short: "Быт",
    color: "#C9956B",
    icon: Home,
    hint: "Дом, порядок, бытовые дела",
  },
};

export const LIFE_PULSE_ITEMS: Record<LifePulseKey, LifePulseItem[]> = {
  work: [
    { id: "focus", label: "Глубокий фокус", minutes: 60, tip: "2–3 блока — меньше выгорания" },
    { id: "tasks", label: "Задачи / почта", minutes: 30, tip: "Закрыть хвосты — голова легче" },
    { id: "meeting", label: "Встречи", minutes: 45 },
    { id: "plan", label: "Планирование", minutes: 20, tip: "10 мин утром снимают тревогу" },
    { id: "learn_job", label: "Обучение", minutes: 30 },
    { id: "boundary", label: "Граница — стоп", minutes: 5, tip: "Стоп вовремя → сон и настроение" },
    { id: "remote", label: "Удалёнка", minutes: 480, tip: "Границы дом/работа важнее" },
    { id: "calls", label: "Звонки", minutes: 30 },
    { id: "admin", label: "Админ / бумаги", minutes: 25 },
    { id: "creative_work", label: "Творческая задача", minutes: 45, tip: "Икигай: работа + кайф" },
    { id: "overtime", label: "Переработка", minutes: 60, tip: "Отметь — видно связь со стрессом" },
    { id: "side_project", label: "Свой проект", minutes: 40 },
    { id: "lunch_break", label: "Обед без экрана", minutes: 30, tip: "Перезагрузка — настроение ↑" },
    { id: "presentation", label: "Презентация / выступление", minutes: 60 },
    { id: "email_batch", label: "Почта пачкой", minutes: 20, tip: "Не весь день — один слот" },
    { id: "deep_work", label: "Продуктивная работа", minutes: 90, tip: "Блок без отвлечений — результат ↑" },
    { id: "cowork", label: "Коворкинг / офис", minutes: 480, tip: "Смена среды для фокуса" },
  ],
  care: [
    { id: "skincare", label: "Уход за кожей", minutes: 10, moodBoost: 6, tip: "Ритуал закрытия дня" },
    { id: "face_mask", label: "Маска", minutes: 15, moodBoost: 7, tip: "15 мин только для себя" },
    { id: "bath_ritual", label: "Ванна / душ", minutes: 20, moodBoost: 8, tip: "Парасимпатика → сон глубже" },
    { id: "massage", label: "Массаж / роллер", minutes: 10, moodBoost: 7, tip: "Шея и таз — стресс ↓" },
    { id: "hair", label: "Волосы", minutes: 20, moodBoost: 6 },
    { id: "rest_eyes", label: "Отдых для глаз", minutes: 10, moodBoost: 5, tip: "Экраны → усталость → раздражение" },
    { id: "walk_solo", label: "Прогулка для себя", minutes: 20, moodBoost: 8, tip: "Ecotherapy: настроение +15%" },
    { id: "meditation", label: "Медитация / дыхание", minutes: 10, moodBoost: 8, tip: "Кортизол ↓ за 5 мин" },
    { id: "journal", label: "Дневник / рефлексия", minutes: 15, moodBoost: 7, tip: "Выгрузить мысли — легче спать" },
    { id: "tea_ritual", label: "Чай / пауза", minutes: 10, moodBoost: 6, tip: "Микро-остановка без KPI" },
    { id: "nap", label: "Дневной отдых", minutes: 20, moodBoost: 7, tip: "20 мин — не весь день" },
    { id: "nails", label: "Маникюр / уход рук", minutes: 30, moodBoost: 6 },
    { id: "stretch_care", label: "Растяжка / йога", minutes: 15, moodBoost: 8, tip: "Таз и спина — меньше зажимов" },
    { id: "spa", label: "Спа / баня дома", minutes: 30, moodBoost: 9, tip: "Восстановление = прогресс" },
    { id: "makeup", label: "Макияж / образ", minutes: 15, moodBoost: 6 },
    { id: "sauna_home", label: "Сауна / баня", minutes: 45, moodBoost: 8, tip: "Детокс-ощущение · стресс ↓" },
    { id: "manicure", label: "Маникюр / педикюр", minutes: 45, moodBoost: 6 },
    { id: "facial", label: "Уход за лицом", minutes: 15, moodBoost: 6 },
  ],
  leisure: [
    { id: "read", label: "Чтение", minutes: 30, moodBoost: 7, leisureId: "books", tip: "Когнитивный отдых" },
    { id: "friends", label: "Друзья", minutes: 60, moodBoost: 9, leisureId: "social", tip: "Связи — счастье" },
    { id: "cinema", label: "Кино / сериал", minutes: 90, moodBoost: 6, leisureId: "movie", tip: "Переключение" },
    { id: "creative", label: "Творчество", minutes: 30, moodBoost: 9, leisureId: "draw", tip: "Поток без KPI" },
    { id: "tea_leisure", label: "Чай / кофе", minutes: 15, moodBoost: 6, leisureId: "tea", tip: "Пауза" },
    { id: "chess_home", label: "Шахматы", minutes: 40, moodBoost: 7, leisureId: "chess", tip: "Фокус и стратегия" },
  ],
  home: [
    { id: "clean_15", label: "15 мин уборки", minutes: 15, tip: "Маленький порядок — меньше фоновой тревоги" },
    { id: "dishes", label: "Посуда", minutes: 10 },
    { id: "laundry", label: "Стирка", minutes: 15 },
    { id: "meal_prep", label: "Готовка / заготовки", minutes: 30, tip: "Завтра проще есть по плану" },
    { id: "groceries", label: "Продукты", minutes: 45 },
    { id: "organize", label: "Разобрать зону", minutes: 15, tip: "Одна полка, не весь дом" },
    { id: "bed_make", label: "Заправить кровать", minutes: 3, tip: "Микро-победа с утра" },
    { id: "trash", label: "Мусор / вынос", minutes: 5 },
    { id: "plants", label: "Цветы / полив", minutes: 10, moodBoost: 6, tip: "Зелень успокаивает" },
    { id: "paperwork", label: "Бумаги / оплаты", minutes: 20, tip: "Закрыть хвост — голова легче" },
    { id: "deep_clean", label: "Глубокая уборка", minutes: 60 },
    { id: "fridge", label: "Холодильник / кухня", minutes: 20, tip: "Порядок → проще готовить" },
    { id: "pet_home", label: "Уход за питомцем", minutes: 15, moodBoost: 7 },
    { id: "repair", label: "Мелкий ремонт", minutes: 30 },
    { id: "shop", label: "Магазин / закупки", minutes: 40, tip: "Список — меньше импульсных покупок" },
    { id: "cook_prep", label: "Готовка на неделю", minutes: 45, tip: "Проще есть по плану" },
    { id: "ironing", label: "Глажка / разбор", minutes: 20 },
  ],
};

const EMPTY_SPHERE = (): LifePulseSphere => ({
  items: [],
  minutes: 0,
  feel: null,
});

export function emptyLifePulseDay(): LifePulseDay {
  return {
    work: EMPTY_SPHERE(),
    care: EMPTY_SPHERE(),
    leisure: EMPTY_SPHERE(),
    home: EMPTY_SPHERE(),
  };
}

export function parseLifePulse(raw: unknown): LifePulseDay {
  const base = emptyLifePulseDay();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Record<LifePulseKey, Partial<LifePulseSphere>>>;
  for (const key of LIFE_PULSE_KEYS) {
    const s = p[key];
    if (!s) continue;
    base[key] = {
      items: Array.isArray(s.items) ? s.items.filter(Boolean) : [],
      minutes: typeof s.minutes === "number" ? Math.max(0, Math.round(s.minutes)) : 0,
      feel: s.feel === 1 || s.feel === 2 || s.feel === 3 ? s.feel : null,
    };
  }
  return base;
}

export function parseLifePulseFromLog(lifeActionsJson?: string | null): LifePulseDay {
  if (!lifeActionsJson) return emptyLifePulseDay();
  try {
    const j = JSON.parse(lifeActionsJson) as { _pulse?: unknown };
    return parseLifePulse(j._pulse);
  } catch {
    return emptyLifePulseDay();
  }
}

export function mergePulseIntoLifeActions(
  lifeActions: Record<string, unknown>,
  pulse: LifePulseDay,
): Record<string, unknown> {
  return { ...lifeActions, _pulse: pulse };
}

/** Прогресс сферы 0–1: пункты + минуты + самочувствие */
export function sphereProgress(s: LifePulseSphere): number {
  const itemPart = Math.min(1, s.items.length / 2) * 0.45;
  const minPart = Math.min(1, s.minutes / 45) * 0.35;
  const feelPart = s.feel != null ? (s.feel / 3) * 0.2 : 0;
  return Math.min(1, itemPart + minPart + feelPart);
}

export function dayBalanceScore(pulse: LifePulseDay): number {
  const avg =
    LIFE_PULSE_KEYS.reduce((sum, k) => sum + sphereProgress(pulse[k]), 0) /
    LIFE_PULSE_KEYS.length;
  return Math.round(avg * 100);
}

export function spheresTouched(pulse: LifePulseDay): number {
  return LIFE_PULSE_KEYS.filter((k) => sphereProgress(pulse[k]) > 0.05).length;
}

export function togglePulseItem(
  pulse: LifePulseDay,
  key: LifePulseKey,
  itemId: string,
): LifePulseDay {
  const s = pulse[key];
  const items = s.items.includes(itemId)
    ? s.items.filter((x) => x !== itemId)
    : [...s.items, itemId];
  const item = LIFE_PULSE_ITEMS[key].find((i) => i.id === itemId);
  let minutes = s.minutes;
  if (s.items.includes(itemId)) {
    if (item?.minutes) minutes = Math.max(0, s.minutes - item.minutes);
  } else if (item?.minutes) {
    minutes = s.minutes + item.minutes;
  }
  return { ...pulse, [key]: { ...s, items, minutes } };
}

export function setPulseMinutes(pulse: LifePulseDay, key: LifePulseKey, minutes: number): LifePulseDay {
  return { ...pulse, [key]: { ...pulse[key], minutes: Math.max(0, Math.round(minutes)) } };
}

export function setPulseFeel(pulse: LifePulseDay, key: LifePulseKey, feel: number | null): LifePulseDay {
  return { ...pulse, [key]: { ...pulse[key], feel } };
}

export function addPulseMinutes(pulse: LifePulseDay, key: LifePulseKey, delta: number): LifePulseDay {
  return setPulseMinutes(pulse, key, pulse[key].minutes + delta);
}

export interface WeekPulseStat {
  key: LifePulseKey;
  daysActive: number;
  totalMinutes: number;
  avgFeel: number | null;
}

export function weekPulseStats(
  logs: { lifeActionsJson?: string | null }[],
): WeekPulseStat[] {
  return LIFE_PULSE_KEYS.map((key) => {
    let daysActive = 0;
    let totalMinutes = 0;
    let feelSum = 0;
    let feelCount = 0;
    for (const log of logs) {
      const p = parseLifePulseFromLog(log.lifeActionsJson)[key];
      if (sphereProgress(p) > 0.05) daysActive += 1;
      totalMinutes += p.minutes;
      if (p.feel != null) {
        feelSum += p.feel;
        feelCount += 1;
      }
    }
    return {
      key,
      daysActive,
      totalMinutes,
      avgFeel: feelCount > 0 ? Math.round((feelSum / feelCount) * 10) / 10 : null,
    };
  });
}

export function weekBalanceInsight(stats: WeekPulseStat[]): string {
  const sorted = [...stats].sort((a, b) => a.daysActive - b.daysActive);
  const weak = sorted[0];
  const strong = sorted[sorted.length - 1];
  if (weak.daysActive === 0 && strong.daysActive === 0) {
    return "Отметь хотя бы одну сферу сегодня — баланс начинается с малого";
  }
  if (weak.daysActive < 2 && strong.daysActive >= 4) {
    return `${LIFE_PULSE_META[weak.key].short} почти не было на неделе — можно добавить 15 минут`;
  }
  if (stats.every((s) => s.daysActive >= 3)) {
    return "Хороший ритм: все сферы живут на неделе";
  }
  return "Следи за четырьмя опорами — не обязательно идеально каждый день";
}
