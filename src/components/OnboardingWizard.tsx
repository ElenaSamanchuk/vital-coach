"use client";

import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { DEFAULT_ASSESSMENT } from "@/lib/onboarding-assessment";
import { APP_NAME, APP_TAGLINE, GENERIC_PROFILE } from "@/lib/app-config";
import { BRAND_GRADIENT } from "@/lib/design-tokens";
import { SwipeSlider } from "@/components/ui/SwipeSlider";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  GENERIC_HEALTH_OPTIONS,
} from "@/lib/generic-health-options";

/** Один экран: данные для расчёта калорий, воды и активности */
export function OnboardingWizard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [heightCm, setHeightCm] = useState(170);
  const [currentWeightKg, setCurrentWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(65);
  const [gender, setGender] = useState("female");
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [activityLevel, setActivityLevel] = useState<"low" | "moderate" | "high">("moderate");
  const [health, setHealth] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHealth = (key: string) => {
    setHealth((h) => ({ ...h, [key]: !h[key] }));
  };

  const start = async () => {
    if (!name.trim()) {
      setError("Укажи имя");
      return;
    }
    setSaving(true);
    setError(null);
    const birthYear = parseInt(birthDate.slice(0, 4), 10) || 1990;
    try {
      const body = {
        ...DEFAULT_ASSESSMENT,
        ...GENERIC_PROFILE,
        name: name.trim(),
        heightCm,
        currentWeightKg,
        targetWeightKg,
        birthYear,
        activityLevel,
        insulinResistance: health.insulinResistance ?? false,
        hypothyroidism: health.hypothyroidism ?? false,
        cortisolIssues: health.cortisolIssues ?? false,
        hormoneIssues: health.hormoneIssues ?? false,
        pcosSuspected: health.pcosSuspected ?? false,
        endometriosis: health.endometriosis ?? false,
        assessmentExtras: { gender, birthDate },
      };
      const res = await apiClient("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Ошибка");
        setSaving(false);
        return;
      }
      router.replace("/");
    } catch {
      setError("Не удалось сохранить — попробуй ещё раз");
      setSaving(false);
    }
  };

  return (
    <div className="vc-app-shell vc-app-shell--page">
      <main className="vc-app-main px-4 py-8 pb-14 vc-header-safe">
        <div className="vc-surface p-5 space-y-5 w-full max-w-md mx-auto">
          <div className="text-center">
            <div
              className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
              style={{ background: BRAND_GRADIENT }}
            >
              <Leaf className="text-white" size={28} />
            </div>
            <h1 className="vc-display text-[1.5rem]">{APP_NAME}</h1>
            <p className="vc-subtitle mt-1">будь в потоке</p>
          </div>

          <label className="block">
            <span className="vc-label">Имя</span>
            <input
              className="apple-input mt-2"
              placeholder="Как к тебе обращаться"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
            />
          </label>

          <SwipeSlider
            label="Рост"
            value={heightCm}
            onChange={setHeightCm}
            min={140}
            max={210}
            step={1}
            unit="см"
          />

          <SwipeSlider
            label="Вес сейчас"
            value={currentWeightKg}
            onChange={setCurrentWeightKg}
            min={40}
            max={150}
            step={0.5}
            unit="кг"
            formatValue={(n) => n.toFixed(1)}
          />

          <SwipeSlider
            label="Цель веса"
            value={targetWeightKg}
            onChange={setTargetWeightKg}
            min={40}
            max={150}
            step={0.5}
            unit="кг"
            formatValue={(n) => n.toFixed(1)}
          />

          <label className="block">
            <span className="vc-label">Пол</span>
            <select
              className="apple-input mt-2"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="vc-label">Дата рождения</span>
            <input
              type="date"
              className="apple-input mt-2"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="vc-label">Уровень активности</span>
            <select
              className="apple-input mt-2"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as typeof activityLevel)}
            >
              {ACTIVITY_LEVEL_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="vc-label mb-2">Что влияет на расчёты</p>
            <p className="vc-text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              Эти данные нужны для рекомендаций по питанию, движению и воде — мы учтём их в плане
            </p>
            <div className="space-y-2">
              {GENERIC_HEALTH_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={health[opt.key] ?? false}
                    onChange={() => toggleHealth(opt.key)}
                    className="mt-0.5 accent-[var(--accent)]"
                  />
                  <span className="min-w-0">
                    <span className="vc-text-sm font-medium block">{opt.label}</span>
                    <span className="vc-text-xs text-[var(--text-tertiary)]">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-[var(--danger)] bg-[var(--danger-soft)] p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={start}
            disabled={saving}
            className="apple-btn apple-btn-primary w-full font-semibold"
          >
            {saving ? "Запуск…" : "Начать"}
          </button>
        </div>
      </main>
    </div>
  );
}
