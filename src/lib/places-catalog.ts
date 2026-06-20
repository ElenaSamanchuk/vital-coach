/** Места для досуга и знакомств — ручной каталог (без гео API) */

export type PlaceType = "anticafe" | "park" | "pool" | "culture" | "sport" | "social";

export interface PlaceSpot {
  id: string;
  name: string;
  type: PlaceType;
  vibe: string;
  hint: string;
}

export const PLACE_TYPE_LABEL: Record<PlaceType, string> = {
  anticafe: "Антикафе / антикино",
  park: "Парк / прогулка",
  pool: "Бассейн / спа",
  culture: "Культура",
  sport: "Спорт",
  social: "Знакомства",
};

export const PLACES_CATALOG: PlaceSpot[] = [
  { id: "p1", name: "Антикафе с настолками", type: "anticafe", vibe: "Уют, можно одной", hint: "Ищи по отзывам «тихо, чай»" },
  { id: "p2", name: "Антикино / киноклуб", type: "anticafe", vibe: "Фильм + обсуждение", hint: "Хорошо с подругой" },
  { id: "p3", name: "Парк с велодорожкой", type: "park", vibe: "Природа в городе", hint: "Утро или закат" },
  { id: "p4", name: "Лесопарк / озеро", type: "park", vibe: "Шинрин-ёку", hint: "2+ часа без телефона" },
  { id: "p5", name: "Бассейн 45 мин", type: "pool", vibe: "Спина и нервы", hint: "После офиса" },
  { id: "p6", name: "Сауна / хамам", type: "pool", vibe: "Тепло, детокс", hint: "Не на голодный желудок" },
  { id: "p7", name: "Митап / конференция", type: "social", vibe: "Нетворкинг", hint: "Возьми визитки в заметки" },
  { id: "p8", name: "Йога-студия open class", type: "sport", vibe: "Тело + люди", hint: "Пробное занятие" },
  { id: "p9", name: "Галерея / выставка", type: "culture", vibe: "Вдохновение", hint: "1–1.5 ч достаточно" },
  { id: "p10", name: "Коворкинг-ивент", type: "social", vibe: "Работа + знакомства", hint: "Для фриланса/IT" },
  { id: "p11", name: "Кафе с живой музыкой", type: "culture", vibe: "Вечер без KPI", hint: "Бронь в пт–сб" },
  { id: "p12", name: "Сап-станция / прокат", type: "sport", vibe: "Вода + баланс", hint: "Летом, SPF обязателен" },
];

export function placesForQuiz(
  setting: "home" | "nature" | "city" | undefined,
  company: "solo" | "friends" | "partner" | undefined,
): PlaceSpot[] {
  let list = [...PLACES_CATALOG];
  if (setting === "home") list = list.filter((p) => p.type === "anticafe" || p.type === "culture");
  if (setting === "nature") list = list.filter((p) => p.type === "park" || p.type === "sport");
  if (setting === "city") list = list.filter((p) => p.type !== "park" || p.id === "p3");
  if (company === "solo") list = list.filter((p) => p.vibe.includes("одной") || p.type !== "social");
  if (company === "partner") list = list.filter((p) => ["culture", "park", "pool", "anticafe"].includes(p.type));
  return list.slice(0, 5);
}
