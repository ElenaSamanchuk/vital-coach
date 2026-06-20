/** Единая сетка «побед дня» — вместо 7 отдельных секций в дневнике */

export type WinBucket =
  | "work"
  | "finance"
  | "relations"
  | "spirit"
  | "environment"
  | "creativity"
  | "growth"
  | "leisure"
  | "intellect"
  | "selfcare"
  | "home";

export interface DailyWin {
  id: string;
  bucket: WinBucket;
  label: string;
  emoji: string;
}

export const DAILY_WINS: DailyWin[] = [
  { id: "deep_work", bucket: "work", label: "Глубокая работа", emoji: "🎯" },
  { id: "boundary", bucket: "work", label: "Граница на работе", emoji: "🚧" },
  { id: "saved", bucket: "finance", label: "Отложила", emoji: "🏦" },
  { id: "budget", bucket: "finance", label: "Бюджет", emoji: "📊" },
  { id: "date", bucket: "relations", label: "Время с близким", emoji: "💕" },
  { id: "friend", bucket: "relations", label: "Встреча с другом", emoji: "☕" },
  { id: "meditate", bucket: "spirit", label: "Тишина / медитация", emoji: "🧘" },
  { id: "tidy", bucket: "environment", label: "15 мин порядка", emoji: "🧹" },
  { id: "draw", bucket: "creativity", label: "Творчество", emoji: "🎨" },
  { id: "review", bucket: "growth", label: "Обзор дня", emoji: "📋" },
  { id: "pool", bucket: "leisure", label: "Бассейн", emoji: "🏊" },
  { id: "bike", bucket: "leisure", label: "Велосипед", emoji: "🚴" },
  { id: "yoga", bucket: "leisure", label: "Йога", emoji: "🧘‍♀️" },
  { id: "chess", bucket: "intellect", label: "Шахматы", emoji: "♟️" },
  { id: "english", bucket: "intellect", label: "English", emoji: "🇬🇧" },
  { id: "face_mask", bucket: "selfcare", label: "Маска", emoji: "✨" },
  { id: "massage", bucket: "selfcare", label: "Массаж", emoji: "💆" },
  { id: "bath_ritual", bucket: "selfcare", label: "Ванна-ритуал", emoji: "🛁" },
  { id: "clean_15", bucket: "home", label: "15 мин уборки", emoji: "🧹" },
  { id: "laundry", bucket: "home", label: "Стирка", emoji: "👕" },
  { id: "meal_prep", bucket: "home", label: "Заготовка еды", emoji: "🥗" },
];

export function winsToPayload(selected: string[]) {
  const lifeActions: Record<string, string[]> = {
    work: [],
    finance: [],
    relations: [],
    spirit: [],
    environment: [],
    creativity: [],
    growth: [],
    selfcare: [],
    home: [],
  };
  const leisure: string[] = [];
  const intellect: string[] = [];

  for (const id of selected) {
    const win = DAILY_WINS.find((w) => w.id === id);
    if (!win) continue;
    if (win.bucket === "leisure") leisure.push(id);
    else if (win.bucket === "intellect") intellect.push(id);
    else if (win.bucket === "selfcare") lifeActions.selfcare.push(id);
    else if (win.bucket === "home") lifeActions.home.push(id);
    else lifeActions[win.bucket]?.push(id);
  }

  return { lifeActions, leisure, intellect };
}

export function payloadToWins(
  lifeActions: Record<string, string[]>,
  leisure: string[],
  intellect: string[],
): string[] {
  const ids: string[] = [];
  for (const arr of Object.values(lifeActions)) ids.push(...(arr ?? []));
  ids.push(...leisure, ...intellect);
  return ids.filter((id) => DAILY_WINS.some((w) => w.id === id));
}
