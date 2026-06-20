"use client";

import { useEffect, useState } from "react";
import { Play, Square, Timer } from "lucide-react";
import { hapticSuccess } from "@/lib/haptics";

const FOCUS_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

export function PomodoroTimer({
  taskLabel,
  onComplete,
}: {
  taskLabel?: string;
  onComplete?: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(FOCUS_SEC);
  const [onBreak, setOnBreak] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          hapticSuccess();
          if (!onBreak) {
            setOnBreak(true);
            setLeft(BREAK_SEC);
            onComplete?.();
          } else {
            setOnBreak(false);
            setLeft(FOCUS_SEC);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, onBreak, onComplete]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="rounded-xl border border-[var(--purple)]/30 bg-[var(--purple-soft)] p-3">
      <div className="flex items-center gap-2">
        <Timer size={14} className="text-[var(--purple)]" />
        <span className="text-[11px] font-semibold">
          {onBreak ? "Перерыв 5 мин" : "Фокус 25 мин"}
        </span>
        <span className="ml-auto text-[20px] font-bold tabular-nums">
          {mm}:{ss}
        </span>
      </div>
      {taskLabel && (
        <p className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">{taskLabel}</p>
      )}
      <button
        type="button"
        className="apple-btn apple-btn-secondary w-full mt-2 text-[12px] flex items-center justify-center gap-1"
        onClick={() => {
          if (running) {
            setRunning(false);
          } else {
            if (!onBreak) setLeft(FOCUS_SEC);
            setRunning(true);
          }
        }}
      >
        {running ? <Square size={14} /> : <Play size={14} />}
        {running ? "Пауза" : "Старт фокуса"}
      </button>
    </div>
  );
}
