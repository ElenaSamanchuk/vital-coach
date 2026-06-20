"use client";

import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Leaf } from "lucide-react";
import { DEFAULT_ASSESSMENT } from "@/lib/onboarding-assessment";
import { APP_NAME, APP_TAGLINE, GENERIC_PROFILE } from "@/lib/app-config";
import { APP_FLOW, UI } from "@/lib/product-copy";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

/** Один экран: имя + старт. Без регистрации и пароля. */
export function OnboardingWizard() {
  const router = useRouter();
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
        body: JSON.stringify({ ...DEFAULT_ASSESSMENT, ...GENERIC_PROFILE, name: name.trim() }),
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
      <main className="vc-app-main flex flex-col justify-center px-4 py-10 pb-16 vc-header-safe">
        <div className="vc-surface p-6 space-y-6 w-full">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: BRAND_GRADIENT }}
            >
              <Leaf className="text-white" size={32} />
            </div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-full mb-3">
              <ShieldCheck size={14} />
              {UI.onboardingBadge}
            </p>
            <h1 className="vc-display text-[26px]">{UI.onboardingTitle}</h1>
            <p className="vc-subtitle mt-2">
              {APP_NAME} · {APP_TAGLINE}
            </p>
          </div>

          <ol className="space-y-2 text-[12px] text-[var(--text-secondary)]">
            {APP_FLOW.steps.map((s, i) => (
              <li key={s.label} className="flex gap-2">
                <span className="font-semibold text-[var(--accent)] shrink-0">{i + 1}.</span>
                <span>
                  <strong className="text-[var(--text)]">{s.label}</strong> — {s.desc}
                </span>
              </li>
            ))}
          </ol>

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

          <p className="text-[12px] text-[var(--text-secondary)] text-center leading-snug">
            {UI.onboardingPrivacy}
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
        </div>
      </main>
    </div>
  );
}
