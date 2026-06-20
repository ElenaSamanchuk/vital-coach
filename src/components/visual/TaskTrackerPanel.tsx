"use client";

import { useState } from "react";
import { Briefcase, Check, LayoutGrid, List, Plus, Trash2 } from "lucide-react";
import {
  TASK_QUICK_ADD,
  TASK_SPHERE_META,
  newTask,
  setTaskStatus,
  taskStats,
  type DayTask,
  type TaskSphere,
} from "@/lib/day-tasks";
import { KanbanBoard } from "./KanbanBoard";
import { PomodoroTimer } from "./PomodoroTimer";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

export function TaskTrackerPanel({
  tasks,
  onChange,
  compact = false,
}: {
  tasks: DayTask[];
  onChange: (next: DayTask[]) => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [sphere, setSphere] = useState<TaskSphere>("work");
  const [view, setView] = useState<"list" | "kanban">(compact ? "list" : "list");
  const stats = taskStats(tasks);

  const toggle = (id: string) => {
    hapticLight();
    const next = tasks.map((t) => {
      if (t.id !== id) return t;
      const done = !t.done;
      return { ...t, done, status: done ? "done" as const : "todo" as const };
    });
    onChange(next);
    if (next.find((t) => t.id === id)?.done) hapticSuccess();
  };

  const add = (label: string, s: TaskSphere = sphere, schedule?: DayTask["schedule"]) => {
    if (!label.trim()) return;
    hapticLight();
    onChange([...tasks, newTask(label.trim(), s, { schedule })]);
    setDraft("");
  };

  const remove = (id: string) => {
    onChange(tasks.filter((t) => t.id !== id));
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const focusTask = tasks.find((t) => t.status === "doing" && !t.done);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[11px]">
        <Briefcase size={14} className="text-[var(--purple)]" />
        <span className="font-semibold">
          {stats.done}/{stats.total} закрыто
        </span>
        {stats.workTotal > 0 && (
          <span className="text-[var(--text-tertiary)]">
            · работа {stats.workDone}/{stats.workTotal}
          </span>
        )}
        {!compact && (
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg ${view === "list" ? "bg-[var(--accent-soft)]" : ""}`}
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg ${view === "kanban" ? "bg-[var(--accent-soft)]" : ""}`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="apple-input apple-input--compact flex-1"
          placeholder="Новая задача…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add(draft)}
        />
        <button type="button" className="apple-btn apple-btn-primary px-3" onClick={() => add(draft)}>
          <Plus size={16} />
        </button>
      </div>

      {!compact && (
        <>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(TASK_SPHERE_META) as TaskSphere[]).slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSphere(s)}
                className={`text-[10px] px-2 py-1 rounded-lg font-semibold border ${
                  sphere === s ? "border-current" : "border-[var(--border)] text-[var(--text-tertiary)]"
                }`}
                style={sphere === s ? { color: TASK_SPHERE_META[s].color } : undefined}
              >
                {TASK_SPHERE_META[s].label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {TASK_QUICK_ADD.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => add(q.label, q.sphere, q.schedule)}
                className="shrink-0 text-[10px] px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]"
              >
                + {q.label}
              </button>
            ))}
          </div>
        </>
      )}

      {(focusTask || (!compact && tasks.some((t) => t.sphere === "work" && !t.done))) && (
        <PomodoroTimer
          taskLabel={focusTask?.label}
          onComplete={() => {
            if (focusTask) {
              onChange(setTaskStatus(tasks, focusTask.id, "done"));
            }
          }}
        />
      )}

      {view === "kanban" && !compact ? (
        <KanbanBoard tasks={tasks} onChange={onChange} />
      ) : (
        <div className="space-y-1.5">
          {(compact ? open.slice(0, 4) : open).map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--elevated)] px-3 py-2"
            >
              <button
                type="button"
                onClick={() => toggle(t.id)}
                className="w-5 h-5 rounded-md border-2 border-[var(--border-strong)] flex items-center justify-center shrink-0"
              >
                {t.done && <Check size={12} className="text-[var(--accent)]" />}
              </button>
              <span
                className="text-[10px] font-bold uppercase shrink-0"
                style={{ color: TASK_SPHERE_META[t.sphere].color }}
              >
                {TASK_SPHERE_META[t.sphere].label}
              </span>
              <span className="text-[13px] flex-1 min-w-0 truncate">{t.label}</span>
              {t.carriedFrom && <span className="text-[9px] text-[var(--text-tertiary)]">↩</span>}
              {!compact && (
                <button type="button" onClick={() => remove(t.id)} className="text-[var(--text-tertiary)]">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!compact && done.length > 0 && view === "list" && (
        <details className="text-[11px] text-[var(--text-secondary)]">
          <summary className="cursor-pointer">Готово ({done.length})</summary>
          <div className="mt-2 space-y-1 opacity-70">
            {done.map((t) => (
              <div key={t.id} className="line-through px-1">
                {t.label}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
