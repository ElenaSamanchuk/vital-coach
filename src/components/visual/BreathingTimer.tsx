"use client";

import { useEffect, useState } from "react";
import { Wind } from "lucide-react";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

/** 60 сек дыхание 4-4-6 — Samsung / Apple mindfulness */
export function BreathingTimer() {
  const [active, setActive] = useState(false);
  const [sec, setSec] = useState(60);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          setActive(false);
          hapticSuccess();
          return 60;
        }
        return s - 1;
      });
      setPhase((p) => (p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(t);
  }, [active]);

  const label = phase === "inhale" ? "Вдох" : phase === "hold" ? "Пауза" : "Выдох";

  return (
    <div className="rounded-2xl border border-[var(--purple)]/30 bg-[var(--purple-soft)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-[var(--purple)]" />
          <div>
            <p className="text-[13px] font-semibold">Дыхание 1 мин</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Стресс высокий — парасимпатика</p>
          </div>
        </div>
        {!active ? (
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setActive(true);
              setSec(60);
            }}
            className="apple-btn apple-btn-primary px-4 py-2 text-[13px]"
          >
            Старт
          </button>
        ) : (
          <div className="text-center">
            <p className="text-[20px] font-bold text-[var(--purple)]">{sec}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
