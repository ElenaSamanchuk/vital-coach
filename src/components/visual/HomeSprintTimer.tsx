"use client";

import { useEffect, useState } from "react";
import { Home, Play, Square } from "lucide-react";
import { hapticSuccess } from "@/lib/haptics";

const SPRINT_SEC = 15 * 60;

export function HomeSprintTimer({ onComplete }: { onComplete?: () => void }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(SPRINT_SEC);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          hapticSuccess();
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, onComplete]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="rounded-xl border border-[var(--brown)]/30 bg-[var(--brown-soft)] p-3">
      <div className="flex items-center gap-2">
        <Home size={14} className="text-[var(--brown)]" />
        <span className="text-[11px] font-semibold">Спринт уборки 15 мин</span>
        <span className="ml-auto text-[18px] font-bold tabular-nums">
          {mm}:{ss}
        </span>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          className="apple-btn apple-btn-secondary flex-1 text-[12px] flex items-center justify-center gap-1"
          onClick={() => {
            if (running) {
              setRunning(false);
            } else {
              setLeft(SPRINT_SEC);
              setRunning(true);
            }
          }}
        >
          {running ? <Square size={14} /> : <Play size={14} />}
          {running ? "Стоп" : "Старт"}
        </button>
      </div>
    </div>
  );
}
