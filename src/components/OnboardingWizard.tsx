"use client";

import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ShieldCheck, Leaf } from "lucide-react";
import { DEFAULT_ASSESSMENT } from "@/lib/onboarding-assessment";
import { APP_NAME, APP_TAGLINE, GENERIC_PROFILE } from "@/lib/app-config";
import { APP_FLOW, UI } from "@/lib/product-copy";
import { BRAND_GRADIENT } from "@/lib/design-tokens";
import { ProfileNumberField } from "@/components/ui/ProfileNumberField";
import { ApkDownloadCard } from "@/components/ApkDownloadCard";

const SLIDE_COUNT = UI.onboardingSlides.length;

/** Слайды + имя → старт без регистрации */
export function OnboardingWizard() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState("");
  const [heightCm, setHeightCm] = useState<number | undefined>();
  const [currentWeightKg, setCurrentWeightKg] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onForm = slide >= SLIDE_COUNT;

  const start = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        ...DEFAULT_ASSESSMENT,
        ...GENERIC_PROFILE,
        name: name.trim(),
        ...(heightCm != null && heightCm > 0 ? { heightCm } : {}),
        ...(currentWeightKg != null && currentWeightKg > 0
          ? { currentWeightKg, targetWeightKg: Math.max(50, currentWeightKg - 5) }
          : {}),
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
      <main className="vc-app-main flex flex-col justify-center px-4 py-8 pb-14 vc-header-safe">
        <div className="vc-surface p-5 space-y-5 w-full">
          <div className="text-center">
            <div
              className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
              style={{ background: BRAND_GRADIENT }}
            >
              <Leaf className="text-white" size={28} />
            </div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-full mb-3">
              <ShieldCheck size={14} />
              {UI.onboardingBadge}
            </p>
            {!onForm ? (
              <>
                <h1 className="vc-display text-[1.375rem]">{UI.onboardingSlides[slide].title}</h1>
                <p className="vc-subtitle mt-2 leading-relaxed">{UI.onboardingSlides[slide].desc}</p>
              </>
            ) : (
              <>
                <h1 className="vc-display text-[1.375rem]">{UI.onboardingTitle}</h1>
                <p className="vc-subtitle mt-2">
                  {APP_NAME} · {APP_TAGLINE}
                </p>
              </>
            )}
          </div>

          {!onForm && (
            <>
              <div className="flex justify-center gap-1.5">
                {UI.onboardingSlides.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slide ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-[var(--border)]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {slide > 0 && (
                  <button
                    type="button"
                    onClick={() => setSlide((s) => s - 1)}
                    className="apple-btn apple-btn-secondary flex-1 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Назад
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSlide((s) => s + 1)}
                  className="apple-btn apple-btn-primary flex-1 flex items-center justify-center gap-1"
                >
                  {slide < SLIDE_COUNT - 1 ? UI.onboardingNext : UI.onboardingCta}
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSlide(SLIDE_COUNT)}
                className="w-full text-[12px] text-[var(--text-tertiary)]"
              >
                {UI.onboardingSkipSlides}
              </button>
            </>
          )}

          {onForm && (
            <>
              <label className="block">
                <span className="vc-label">{UI.onboardingName}</span>
                <input
                  className="apple-input mt-2"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <ProfileNumberField
                  label={UI.onboardingHeight}
                  value={heightCm}
                  min={120}
                  max={220}
                  onCommit={setHeightCm}
                />
                <ProfileNumberField
                  label={UI.onboardingWeight}
                  value={currentWeightKg}
                  step={0.1}
                  min={30}
                  max={200}
                  onCommit={setCurrentWeightKg}
                />
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] -mt-2">{UI.onboardingBodySkip}</p>

              <p className="text-[12px] text-[var(--text-secondary)] text-center leading-snug">
                {UI.onboardingPrivacy}
              </p>

              <p className="text-[12px] text-[var(--text-secondary)] text-center leading-snug">
                {APP_FLOW.note}
              </p>

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
                {saving ? "Запуск…" : UI.onboardingCta}
              </button>

              <ApkDownloadCard />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
