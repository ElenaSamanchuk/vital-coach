/** Стиль — тип фигуры и капсульный гардероб без AI */

export type BodyArchetype = "hourglass" | "rectangle" | "pear" | "apple" | "unsure";

export interface StyleProfile {
  archetype: BodyArchetype;
  capsule: string[];
  faceShape?: string;
  hairNote?: string;
}

export const ARCHETYPE_LABELS: Record<BodyArchetype, string> = {
  hourglass: "Песочные часы",
  rectangle: "Прямоугольник",
  pear: "Груша",
  apple: "Яблоко",
  unsure: "Не уверена",
};

export const ARCHETYPE_TIPS: Record<BodyArchetype, string> = {
  hourglass: "Подчёркивай талию: пояса, приталенные силуэты, V-вырез",
  rectangle: "Объём вверх/вниз: баски, A-силуэт, слои",
  pear: "Акцент на плечи и верх, тёмный низ, A-линия",
  apple: "Вертикальные линии, империя, структура плеч",
  unsure: "Базовый капсульный набор ниже — универсален",
};

export const CAPSULE_CHECKLIST = [
  "Белая рубашка / топ",
  "Тёмные джинсы по фигуре",
  "Приталенный пиджак",
  "Чёрное платье-футляр",
  "Качественное пальто",
  "Белые кроссовки / лоферы",
  "Шарф / акцентный аксессуар",
  "Сумка среднего размера",
  "Базовый макияж: тон + брови",
  "Украшения на каждый день",
];

export const FACE_SHAPE_TIPS: Record<string, string> = {
  oval: "Любая причёска, мягкие контуры бровей",
  round: "Высота на макушке, угловатые очки",
  square: "Волны, боковой объём, мягкий контур",
  heart: "Чёлка, баланс нижней части лица",
};

export function parseStyleProfile(raw: string | null | undefined): StyleProfile {
  if (!raw || raw === "{}") {
    return { archetype: "unsure", capsule: [] };
  }
  try {
    return JSON.parse(raw) as StyleProfile;
  } catch {
    return { archetype: "unsure", capsule: [] };
  }
}
