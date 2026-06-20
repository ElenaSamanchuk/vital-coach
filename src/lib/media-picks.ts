import type { LeisureQuizAnswers } from "./leisure-quiz";

/** Книги · музыка · фильмы — по настроению без внешнего API */

export interface MediaPick {
  title: string;
  why: string;
  mood: string;
}

export type MediaVibe = "calm" | "energy" | "focus" | "joy" | "deep" | "cozy";

export function detectVibe(
  mood: number,
  energy: number,
  stress: number,
  quiz?: LeisureQuizAnswers | null,
): MediaVibe {
  if (quiz?.energy === "low" || stress >= 7 || energy <= 4) return "calm";
  if (quiz?.energy === "high" || (energy >= 8 && mood >= 7)) return "energy";
  if (quiz?.company === "solo" && quiz.setting === "home") return "cozy";
  if (mood <= 5) return "cozy";
  if (quiz?.setting === "city" && energy >= 6) return "focus";
  if (energy >= 6 && stress <= 5) return "focus";
  if (mood >= 8) return "joy";
  return "deep";
}

const MOVIES: Record<MediaVibe, MediaPick[]> = {
  calm: [
    { title: "Душа (Soul)", why: "Тепло и смысл без напряга", mood: "спокойствие" },
    { title: "Повар, мотоциклист и др.", why: "Медитативное путешествие", mood: "умиротворение" },
  ],
  energy: [
    { title: "Ла-Ла Ленд", why: "Цвет и движение", mood: "подъём" },
    { title: "Мулан", why: "Сила и преодоление", mood: "энергия" },
  ],
  focus: [
    { title: "Социальная сеть", why: "История амбиции", mood: "фокус" },
    { title: "Одержимость", why: "Про мастерство", mood: "концентрация" },
  ],
  joy: [
    { title: "Барби", why: "Лёгкость и ирония", mood: "радость" },
    { title: "Миссия невыполнима", why: "Адреналин с улыбкой", mood: "веселье" },
  ],
  deep: [
    { title: "Маленькие женщины", why: "Семья и выбор", mood: "глубина" },
    { title: "Прибытие", why: "Философия времени", mood: "рефлексия" },
  ],
  cozy: [
    { title: "Почтальон всегда звонит дважды", why: "Классика уюта", mood: "уют" },
    { title: "Отель «Гранд Будапешт»", why: "Эстетика и юмор", mood: "чил" },
  ],
};

const MUSIC: Record<MediaVibe, MediaPick[]> = {
  calm: [
    { title: "Lo-fi beats / Nujabes", why: "Снижает пульс", mood: "релакс" },
    { title: "Ólafur Arnalds", why: "Для ванны и маски", mood: "тишина" },
  ],
  energy: [
    { title: "Dua Lipa / disco-pop", why: "Для прогулки или уборки", mood: "драйв" },
    { title: "Кино — «Молчание»", why: "Русский инди-заряд", mood: "движение" },
  ],
  focus: [
    { title: "Hans Zimmer — Interstellar", why: "Глубокая работа", mood: "фокус" },
    { title: "Классика: Дебюсси", why: "Без слов", mood: "концентрация" },
  ],
  joy: [
    { title: "ABBA / Fleetwood Mac", why: "Ностальгия + улыбка", mood: "радость" },
    { title: "Монеточка", why: "Лёгкий юмор", mood: "игра" },
  ],
  deep: [
    { title: "Leonard Cohen", why: "Вечерняя рефлексия", mood: "глубина" },
    { title: "Radiohead — In Rainbows", why: "Сложные эмоции", mood: "созерцание" },
  ],
  cozy: [
    { title: "Billie Eilish — soft", why: "Плед и чай", mood: "уют" },
    { title: "Jazz café playlist", why: "Балкон-чил", mood: "тепло" },
  ],
};

const BOOKS: Record<MediaVibe, MediaPick[]> = {
  calm: [
    { title: "Маленькая книга о приятии жизни", why: "Мягкая психология", mood: "покой" },
    { title: "Дневник Анны Франк", why: "Тихая сила", mood: "осознанность" },
  ],
  energy: [
    { title: "Атомные привычки", why: "Действие с понедельника", mood: "мотивация" },
    { title: "Думай медленно…", why: "Прокачка решений", mood: "разум" },
  ],
  focus: [
    { title: "Deep Work", why: "Про глубокую работу", mood: "карьера" },
    { title: "Шахматы: учебник для начинающих", why: "Интеллект", mood: "стратегия" },
  ],
  joy: [
    { title: "Алиса в стране чудес", why: "Игра воображения", mood: "лёгкость" },
    { title: "Девушка с татуировкой…", why: "Детектив-погружение", mood: "увлечение" },
  ],
  deep: [
    { title: "Человек в поисках смысла", why: "Психология и смысл", mood: "познание" },
    { title: "Sapiens", why: "Расширить кругозор", mood: "масштаб" },
  ],
  cozy: [
    { title: "Хроники Нарнии", why: "Уютное фэнтези", mood: "уют" },
    { title: "Еда и хорошее настроение", why: "Кулинария + wellness", mood: "забота" },
  ],
};

export function pickMedia(
  mood: number,
  energy: number,
  stress: number,
  quiz?: LeisureQuizAnswers | null,
) {
  const vibe = detectVibe(mood, energy, stress, quiz);
  return {
    vibe,
    vibeLabel: {
      calm: "Спокойствие",
      energy: "Энергия",
      focus: "Фокус",
      joy: "Радость",
      deep: "Глубина",
      cozy: "Уют",
    }[vibe],
    movies: MOVIES[vibe],
    music: MUSIC[vibe],
    books: BOOKS[vibe],
  };
}
