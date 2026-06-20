/** Вечерняя рефлексия — шаблоны как Apple Health State of Mind */

export const EVENING_PROMPTS = [
  { id: "helped", label: "Помогло", prefix: "Помогло: " },
  { id: "hard", label: "Мешало", prefix: "Мешало: " },
  { id: "tomorrow", label: "Завтра", prefix: "Завтра: " },
] as const;

export function appendReflection(notes: string, promptId: string, text: string): string {
  const prompt = EVENING_PROMPTS.find((p) => p.id === promptId);
  if (!prompt || !text.trim()) return notes;
  const line = `${prompt.prefix}${text.trim()}`;
  if (notes.includes(line)) return notes;
  return notes ? `${notes}\n${line}` : line;
}
