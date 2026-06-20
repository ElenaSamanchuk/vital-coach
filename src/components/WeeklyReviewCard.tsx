"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Card } from "./ui/Card";
import { SliderField } from "./ui/SliderField";
import { WEEKLY_REVIEW_PROMPTS, type WeeklyReviewAnswers } from "@/lib/weekly-review";

export function WeeklyReviewCard() {
  const [answers, setAnswers] = useState<WeeklyReviewAnswers>({
    wins: "",
    lessons: "",
    nextWeekFocus: "",
    gratitude: "",
    sphereRating: 6,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient("/api/wheel")
      .then((r) => r.json())
      .then((d) => {
        if (d.weeklyReviewJson?.wins !== undefined) {
          setAnswers({ ...answers, ...d.weeklyReviewJson });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    await apiClient("/api/wheel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyReviewJson: answers }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card title="Обзор недели" subtitle="Воскресенье · 10 мин · growth mindset">
      <div className="space-y-3">
        {WEEKLY_REVIEW_PROMPTS.map((p) => (
          <div key={p.key}>
            <label className="text-[12px] font-medium">{p.label}</label>
            <textarea
              className="apple-input apple-input--compact mt-1 min-h-[3.75rem]"
              placeholder={p.placeholder}
              value={answers[p.key]}
              onChange={(e) => setAnswers({ ...answers, [p.key]: e.target.value })}
            />
          </div>
        ))}
        <SliderField
          label="Как прошла неделя в целом?"
          value={answers.sphereRating}
          onChange={(v) => setAnswers({ ...answers, sphereRating: v })}
        />
      </div>
      <button type="button" onClick={save} className="apple-btn apple-btn-primary w-full mt-4">
        {saved ? "Сохранено ✓" : "Сохранить обзор"}
      </button>
    </Card>
  );
}
