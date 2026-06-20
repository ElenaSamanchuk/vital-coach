"use client";

import { useState } from "react";
import {
  QUIZ_QUESTIONS,
  type LeisureQuizAnswers,
} from "@/lib/leisure-quiz";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

export function LeisureQuizCard({
  initial,
  onSave,
}: {
  initial: LeisureQuizAnswers | null;
  onSave: (answers: LeisureQuizAnswers) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<LeisureQuizAnswers>>(initial ?? {});
  const [done, setDone] = useState(Boolean(initial?.completedAt));

  const q = QUIZ_QUESTIONS[step];

  const pick = async (value: string) => {
    hapticLight();
    const next = { ...answers, [q.id]: value } as Partial<LeisureQuizAnswers>;
    setAnswers(next);
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const full: LeisureQuizAnswers = {
        energy: next.energy ?? "mid",
        company: next.company ?? "solo",
        setting: next.setting ?? "home",
        completedAt: new Date().toISOString(),
      };
      await onSave(full);
      setDone(true);
      hapticSuccess();
    }
  };

  if (done && initial) {
    return (
      <div className="rounded-xl bg-[var(--accent-soft)] p-3 text-[11px]">
        <p className="font-semibold text-[var(--accent)]">Опрос пройден</p>
        <p className="text-[var(--text-secondary)] mt-1">
          Рекомендации учитывают: {initial.energy === "low" ? "мягкий" : initial.energy === "high" ? "активный" : "средний"} режим,{" "}
          {initial.setting === "nature" ? "природа" : initial.setting === "city" ? "город" : "дом"}
        </p>
        <button
          type="button"
          className="text-[10px] text-[var(--accent)] mt-2 underline"
          onClick={() => {
            setDone(false);
            setStep(0);
            setAnswers({});
          }}
        >
          Пройти заново
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] p-3">
      <p className="text-[12px] font-semibold mb-1">
        Опрос досуга ({step + 1}/{QUIZ_QUESTIONS.length})
      </p>
      <p className="text-[13px] mb-3">{q.label}</p>
      <div className="flex flex-col gap-2">
        {q.options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => pick(o.id)}
            className="text-left text-[12px] px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--accent)]/40"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
