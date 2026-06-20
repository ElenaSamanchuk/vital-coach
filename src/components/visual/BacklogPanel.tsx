"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Archive, ArrowRight, Plus, Trash2 } from "lucide-react";
import { newTask, parseBacklogTasks, type DayTask } from "@/lib/day-tasks";
import { hapticLight } from "@/lib/haptics";

export function BacklogPanel({
  onMoveToToday,
}: {
  onMoveToToday: (task: DayTask) => void;
}) {
  const [backlog, setBacklog] = useState<DayTask[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiClient("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        setBacklog(parseBacklogTasks(p.backlogTasksJson));
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (next: DayTask[]) => {
    setBacklog(next);
    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backlogTasksJson: JSON.stringify(next) }),
    });
  };

  const add = () => {
    if (!draft.trim()) return;
    hapticLight();
    save([...backlog, newTask(draft.trim(), "work", { priority: "normal" })]);
    setDraft("");
  };

  const remove = (id: string) => save(backlog.filter((t) => t.id !== id));

  const move = (t: DayTask) => {
    hapticLight();
    onMoveToToday({ ...t, carriedFrom: "backlog", status: "todo", done: false });
    remove(t.id);
  };

  if (loading) return <p className="text-[11px] text-[var(--text-tertiary)]">Загрузка…</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Archive size={14} className="text-[var(--gray)]" />
        <span className="text-[12px] font-semibold">Бэклог — долгие дела</span>
      </div>
      <div className="flex gap-2">
        <input
          className="apple-input apple-input--compact flex-1"
          placeholder="Проект, резюме, курс…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button type="button" className="apple-btn apple-btn-secondary px-3" onClick={add}>
          <Plus size={14} />
        </button>
      </div>
      {backlog.length === 0 ? (
        <p className="text-[11px] text-[var(--text-secondary)]">
          Сюда — то, что не на сегодня: портфолио, вакансии, курсы
        </p>
      ) : (
        backlog.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2"
          >
            <span className="text-[12px] flex-1">{t.label}</span>
            <button
              type="button"
              onClick={() => move(t)}
              className="text-[10px] text-[var(--accent)] flex items-center gap-0.5"
            >
              Сегодня <ArrowRight size={10} />
            </button>
            <button type="button" onClick={() => remove(t.id)} className="text-[var(--text-tertiary)]">
              <Trash2 size={12} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
