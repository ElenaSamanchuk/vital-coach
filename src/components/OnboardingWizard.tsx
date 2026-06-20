"use client";

import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { DEFAULT_ASSESSMENT } from "@/lib/onboarding-assessment";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

/** Один экран: имя + старт. Всё остальное — в Профиле. */
export function OnboardingWizard() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiClient("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...DEFAULT_ASSESSMENT, name: name.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Ошибка");
        setSaving(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Не удалось сохранить — попробуй ещё раз");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] vc-container py-10 pb-16 flex flex-col justify-center">
      <div className="vc-surface p-6 md:p-8 space-y-6 max-w-md mx-auto w-full">
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: BRAND_GRADIENT }}
          >
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="vc-display text-[26px]">{APP_NAME}</h1>
          <p className="vc-subtitle mt-2">{APP_TAGLINE}</p>
        </div>

        <label className="block">
          <span className="vc-label">Как к вам обращаться? (необязательно)</span>
          <input
            className="apple-input mt-2"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
          />
        </label>

        <p className="text-[12px] text-[var(--text-secondary)] text-center leading-snug">
          Данные хранятся на этом устройстве. Вес, цели и здоровье — в разделе «Профиль».
        </p>

        {error && (
          <p className="text-[13px] text-[var(--danger)] bg-[var(--danger-soft)] p-3 rounded-xl">{error}</p>
        )}

        <button
          type="button"
          onClick={start}
          disabled={saving}
          className="apple-btn apple-btn-primary w-full py-4 text-[16px] font-semibold"
        >
          {saving ? "Запуск…" : "Начать"}
        </button>
      </div>
    </div>
  );
}
