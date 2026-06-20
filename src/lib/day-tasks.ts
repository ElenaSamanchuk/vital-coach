/** Универсальный трекер дел — работа, жизнь, канбан */

export type TaskSphere =
  | "work"
  | "personal"
  | "health"
  | "home"
  | "finance"
  | "social"
  | "learn"
  | "leisure"
  | "nature"
  | "care"
  | "shop";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskSchedule = "today" | "tomorrow" | "daily" | "weekly";

export interface DayTask {
  id: string;
  label: string;
  sphere: TaskSphere;
  done: boolean;
  status: TaskStatus;
  priority: "high" | "normal" | "low";
  schedule?: TaskSchedule;
  minutes?: number;
  carriedFrom?: string;
  catalogId?: string;
}

export const TASK_SPHERE_META: Record<
  TaskSphere,
  { label: string; color: string }
> = {
  work: { label: "Работа", color: "var(--purple)" },
  personal: { label: "Личное", color: "var(--pink)" },
  health: { label: "Здоровье", color: "var(--accent)" },
  home: { label: "Дом", color: "var(--brown)" },
  finance: { label: "Финансы", color: "var(--gray)" },
  social: { label: "Социальное", color: "var(--pink)" },
  learn: { label: "Обучение", color: "var(--purple)" },
  leisure: { label: "Досуг", color: "var(--accent)" },
  nature: { label: "Природа", color: "var(--brown)" },
  care: { label: "Уход", color: "var(--pink)" },
  shop: { label: "Покупки", color: "var(--gray)" },
};

export const TASK_QUICK_ADD: { label: string; sphere: TaskSphere; schedule?: TaskSchedule }[] = [
  { label: "Глубокая работа 25 мин", sphere: "work", schedule: "today" },
  { label: "Обновить резюме", sphere: "work" },
  { label: "Портфолио", sphere: "work" },
  { label: "Поиск вакансий", sphere: "work" },
  { label: "English 30 мин", sphere: "learn", schedule: "daily" },
  { label: "Курс / видео", sphere: "learn" },
  { label: "Конференция / митап", sphere: "social" },
  { label: "Антикафе", sphere: "social" },
  { label: "Родители — звонок", sphere: "personal" },
  { label: "Дача / лес", sphere: "nature" },
  { label: "Рисование", sphere: "leisure" },
  { label: "Мастер-класс", sphere: "leisure" },
  { label: "Уход: маска + ванна", sphere: "care", schedule: "daily" },
  { label: "15 мин уборки", sphere: "home", schedule: "daily" },
  { label: "Список покупок", sphere: "shop" },
  { label: "Анализы / УЗИ", sphere: "health" },
  { label: "Кот / растения", sphere: "personal" },
];

const DOMAIN_TO_SPHERE: Record<string, TaskSphere> = {
  work: "work",
  learn: "learn",
  social: "social",
  family: "personal",
  nature: "nature",
  creativity: "leisure",
  leisure: "leisure",
  selfcare: "care",
  home: "home",
  health: "health",
  pets: "personal",
  mind: "personal",
  food: "home",
  style: "care",
};

export function sphereFromDomain(domain: string): TaskSphere {
  return DOMAIN_TO_SPHERE[domain] ?? "personal";
}

export function normalizeTask(t: DayTask): DayTask {
  const status: TaskStatus = t.done ? "done" : (t.status ?? "todo");
  return { ...t, status, done: status === "done" };
}

export function parseDayTasks(raw: string | null | undefined): DayTask[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as DayTask[]).map(normalizeTask);
  } catch {
    return [];
  }
}

export function parseBacklogTasks(raw: string | null | undefined): DayTask[] {
  return parseDayTasks(raw).filter((t) => !t.done);
}

export function newTask(
  label: string,
  sphere: TaskSphere,
  opts?: Partial<Pick<DayTask, "priority" | "schedule" | "minutes" | "catalogId" | "status">>,
): DayTask {
  return {
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    sphere,
    done: false,
    status: opts?.status ?? "todo",
    priority: opts?.priority ?? "normal",
    schedule: opts?.schedule,
    minutes: opts?.minutes,
    catalogId: opts?.catalogId,
  };
}

export function taskFromCatalog(
  label: string,
  sphere: TaskSphere,
  catalogId: string,
  minutes?: number,
): DayTask {
  return newTask(label, sphere, { catalogId, minutes, schedule: "today" });
}

export function setTaskStatus(tasks: DayTask[], id: string, status: TaskStatus): DayTask[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, status, done: status === "done" } : t,
  );
}

export function tasksByStatus(tasks: DayTask[]): Record<TaskStatus, DayTask[]> {
  const norm = tasks.map(normalizeTask);
  return {
    todo: norm.filter((t) => t.status === "todo"),
    doing: norm.filter((t) => t.status === "doing"),
    done: norm.filter((t) => t.status === "done"),
  };
}

export function taskStats(tasks: DayTask[]) {
  const norm = tasks.map(normalizeTask);
  const total = norm.length;
  const done = norm.filter((t) => t.done).length;
  const workDone = norm.filter((t) => t.sphere === "work" && t.done).length;
  const workTotal = norm.filter((t) => t.sphere === "work").length;
  return { total, done, workDone, workTotal, pct: total ? done / total : 0 };
}

export function carryOverTasks(yesterday: DayTask[], today: DayTask[]): DayTask[] {
  const todayIds = new Set(today.map((t) => t.id));
  const todayLabels = new Set(today.map((t) => t.label.toLowerCase()));
  const carried = yesterday
    .filter((t) => !t.done && !todayIds.has(t.id) && !todayLabels.has(t.label.toLowerCase()))
    .map((t) => ({
      ...normalizeTask(t),
      status: "todo" as TaskStatus,
      carriedFrom: t.carriedFrom ?? "yesterday",
    }));
  return [...carried, ...today.map(normalizeTask)];
}

export function tasksForSchedule(tasks: DayTask[], schedule: TaskSchedule): DayTask[] {
  return tasks.filter((t) => t.schedule === schedule || (!t.schedule && schedule === "today"));
}
