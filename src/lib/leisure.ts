export interface ActivityItem {
  id: string;
  label: string;
  category: "sport" | "creative" | "social" | "rest" | "intellect";
  moodBoost: number;
  xpStat: "body" | "soul" | "mind" | "energy";
  icon: string; // lucide icon name
  color: string;
}

export const LEISURE_ACTIVITIES: ActivityItem[] = [
  { id: "bike", label: "Велосипед", category: "sport", moodBoost: 8, xpStat: "body", icon: "Bike", color: "#34c759" },
  { id: "pool", label: "Бассейн", category: "sport", moodBoost: 9, xpStat: "body", icon: "Waves", color: "#0071e3" },
  { id: "yoga", label: "Йога на коврике", category: "sport", moodBoost: 8, xpStat: "soul", icon: "Flower2", color: "#af52de" },
  { id: "home_video", label: "Занятие по видео", category: "sport", moodBoost: 7, xpStat: "body", icon: "MonitorPlay", color: "#5856d6" },
  { id: "walk", label: "Прогулка", category: "sport", moodBoost: 7, xpStat: "energy", icon: "Footprints", color: "#30d158" },
  { id: "sup", label: "Сапборд", category: "sport", moodBoost: 10, xpStat: "body", icon: "Sailboat", color: "#00c7be" },
  { id: "sort", label: "Сортировка/порядок", category: "rest", moodBoost: 6, xpStat: "soul", icon: "LayoutGrid", color: "#86868b" },
  { id: "social", label: "Общение", category: "social", moodBoost: 9, xpStat: "soul", icon: "Users", color: "#ff9500" },
  { id: "movie", label: "Кино/сериал", category: "rest", moodBoost: 6, xpStat: "soul", icon: "Clapperboard", color: "#ff6b6b" },
  { id: "music", label: "Музыка", category: "creative", moodBoost: 8, xpStat: "soul", icon: "Music", color: "#af52de" },
  { id: "draw", label: "Рисование", category: "creative", moodBoost: 9, xpStat: "soul", icon: "Palette", color: "#ff2d55" },
  { id: "books", label: "Книги", category: "rest", moodBoost: 7, xpStat: "mind", icon: "BookOpen", color: "#5856d6" },
  { id: "bath", label: "Ванна/спа дома", category: "rest", moodBoost: 8, xpStat: "energy", icon: "Bath", color: "#64d2ff" },
  { id: "cooking", label: "Кулинария", category: "creative", moodBoost: 7, xpStat: "soul", icon: "ChefHat", color: "#ff9500" },
  { id: "dance", label: "Танцы", category: "sport", moodBoost: 9, xpStat: "body", icon: "Music2", color: "#ff2d55" },
  { id: "nature", label: "Природа / лес", category: "rest", moodBoost: 8, xpStat: "energy", icon: "Trees", color: "#30d158" },
  { id: "comedy", label: "Комедия / юмор", category: "rest", moodBoost: 7, xpStat: "soul", icon: "Laugh", color: "#ffd60a" },
  { id: "pets", label: "Питомец", category: "social", moodBoost: 8, xpStat: "soul", icon: "Cat", color: "#ff9500" },
  { id: "concert", label: "Концерт / живая музыка", category: "creative", moodBoost: 9, xpStat: "soul", icon: "Mic2", color: "#af52de" },
  { id: "dacha", label: "Дача / загород", category: "rest", moodBoost: 9, xpStat: "energy", icon: "Home", color: "#30d158" },
  { id: "ebike", label: "Электровелосипед", category: "sport", moodBoost: 9, xpStat: "body", icon: "Bike", color: "#34c759" },
  { id: "garden", label: "Огород / цветы", category: "rest", moodBoost: 7, xpStat: "soul", icon: "Flower2", color: "#ff9500" },
  { id: "firepit", label: "Костёр / огоньки", category: "rest", moodBoost: 9, xpStat: "soul", icon: "Flame", color: "#ff6b35" },
  { id: "hammock", label: "Гамак / беседка", category: "rest", moodBoost: 8, xpStat: "energy", icon: "Armchair", color: "#86868b" },
  { id: "banya", label: "Баня", category: "rest", moodBoost: 9, xpStat: "body", icon: "Bath", color: "#a2845e" },
  { id: "pilates", label: "Пилатес / растяжка", category: "sport", moodBoost: 8, xpStat: "body", icon: "Activity", color: "#af52de" },
  { id: "gym", label: "Тренажёрный", category: "sport", moodBoost: 8, xpStat: "body", icon: "Dumbbell", color: "#ff3b30" },
  { id: "sauna", label: "Сауна / спа", category: "rest", moodBoost: 8, xpStat: "energy", icon: "Thermometer", color: "#ff9500" },
  { id: "travel", label: "Путешествие", category: "rest", moodBoost: 10, xpStat: "soul", icon: "Plane", color: "#0071e3" },
  { id: "anticafe", label: "Антикафе / антикино", category: "social", moodBoost: 8, xpStat: "soul", icon: "Coffee", color: "#a2845e" },
  { id: "masterclass", label: "Мастер-класс", category: "creative", moodBoost: 9, xpStat: "mind", icon: "Palette", color: "#ff2d55" },
  { id: "balcony", label: "Балкон-чил", category: "rest", moodBoost: 7, xpStat: "energy", icon: "Sun", color: "#ffd60a" },
];

export const INTELLECT_ACTIVITIES: ActivityItem[] = [
  { id: "chess", label: "Шахматы", category: "intellect", moodBoost: 7, xpStat: "mind", icon: "Crown", color: "#1d1d1f" },
  { id: "english", label: "Английский", category: "intellect", moodBoost: 6, xpStat: "mind", icon: "Languages", color: "#0071e3" },
  { id: "programming", label: "Программирование", category: "intellect", moodBoost: 8, xpStat: "mind", icon: "Code2", color: "#5856d6" },
  { id: "reading_intel", label: "Нон-фикшн", category: "intellect", moodBoost: 6, xpStat: "mind", icon: "GraduationCap", color: "#34c759" },
];

export function isSportLeisureId(id: string | undefined): boolean {
  if (!id) return false;
  return LEISURE_ACTIVITIES.some((a) => a.id === id && a.category === "sport");
}

export function countActivityInLogs(
  logs: { leisureJson?: string | null; intellectJson?: string | null }[],
  activityId: string,
): number {
  let count = 0;
  for (const log of logs) {
    try {
      const l = JSON.parse(log.leisureJson || "[]") as string[];
      const i = JSON.parse(log.intellectJson || "[]") as string[];
      if (l.includes(activityId) || i.includes(activityId)) count++;
    } catch {
      /* */
    }
  }
  return count;
}
