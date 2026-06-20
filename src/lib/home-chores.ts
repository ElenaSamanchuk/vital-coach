/** Бытовые дела — уборка, стирка, без чувства «не успела» */

export interface HomeChore {
  id: string;
  label: string;
  minutes: number;
  micro?: boolean;
}

export const HOME_CHORES: HomeChore[] = [
  { id: "clean_15", label: "15 мин уборки", minutes: 15, micro: true },
  { id: "dishes", label: "Посуда", minutes: 10, micro: true },
  { id: "laundry", label: "Стирка", minutes: 15 },
  { id: "declutter", label: "Разобрать стол/зону", minutes: 10, micro: true },
  { id: "meal_prep", label: "Заготовка еды", minutes: 30 },
  { id: "groceries", label: "Продукты", minutes: 45 },
  { id: "plants", label: "Растения / полив", minutes: 5, micro: true },
  { id: "bed_make", label: "Заправить кровать", minutes: 3, micro: true },
];

export function parseHomeLog(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
