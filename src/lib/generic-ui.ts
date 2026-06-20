import { GENERIC_MODE } from "./app-config";

/** Что показывать в версии «для всех» (GitHub Pages / APK) */
export const GENERIC_FEATURES = {
  /** Медицинский briefing, синдромы, лаборатория */
  medical: !GENERIC_MODE,
  /** Цикл, СПКЯ, эндометриоз */
  cycle: !GENERIC_MODE,
  /** Колесо жизни, WHO-5, Big Five */
  deepPsychology: !GENERIC_MODE,
  /** Вкладка чекапа в профиле */
  checkupTab: !GENERIC_MODE,
  /** Кольца «жизнь/сезон» — оставляем, это нейтрально */
  timeRings: true,
  /** Культура, рецепты под диагнозы, компас жизни */
  lifeCatalog: !GENERIC_MODE,
  /** Бюджет тела, компенсация, воспаление */
  bodyAnalytics: !GENERIC_MODE,
} as const;

export function genericSimplifiedPath() {
  return GENERIC_MODE;
}
