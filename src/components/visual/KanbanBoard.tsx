"use client";

import {
  TASK_SPHERE_META,
  tasksByStatus,
  setTaskStatus,
  type DayTask,
  type TaskStatus,
} from "@/lib/day-tasks";
import { hapticLight } from "@/lib/haptics";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "Сделать" },
  { key: "doing", label: "В процессе" },
  { key: "done", label: "Готово" },
];

export function KanbanBoard({
  tasks,
  onChange,
}: {
  tasks: DayTask[];
  onChange: (next: DayTask[]) => void;
}) {
  const grouped = tasksByStatus(tasks);

  const move = (id: string, status: TaskStatus) => {
    hapticLight();
    onChange(setTaskStatus(tasks, id, status));
  };

  return (
    <div className="grid grid-cols-3 gap-2 min-h-[200px]">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-2 flex flex-col"
        >
          <p className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-2 px-1">
            {col.label} ({grouped[col.key].length})
          </p>
          <div className="space-y-1.5 flex-1">
            {grouped[col.key].map((t) => (
              <div
                key={t.id}
                className="rounded-lg bg-[var(--elevated)] border border-[var(--border)] p-2 text-[11px]"
              >
                <span
                  className="text-[9px] font-bold uppercase block mb-0.5"
                  style={{ color: TASK_SPHERE_META[t.sphere].color }}
                >
                  {TASK_SPHERE_META[t.sphere].label}
                </span>
                <p className="font-medium leading-snug">{t.label}</p>
                {t.schedule && (
                  <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                    {t.schedule === "daily" ? "ежедневно" : t.schedule === "tomorrow" ? "завтра" : "сегодня"}
                  </p>
                )}
                <div className="flex gap-1 mt-1.5">
                  {col.key !== "todo" && (
                    <button
                      type="button"
                      className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--gray-soft)]"
                      onClick={() => move(t.id, col.key === "doing" ? "todo" : "doing")}
                    >
                      ←
                    </button>
                  )}
                  {col.key !== "done" && (
                    <button
                      type="button"
                      className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]"
                      onClick={() => move(t.id, col.key === "todo" ? "doing" : "done")}
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
