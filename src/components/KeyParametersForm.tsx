"use client";

import { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from "react";
import { apiClient } from "@/lib/api-client";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { NutritionMetaCard } from "./visual/NutritionMetaCard";
import { deriveNutritionMeta, profileToDerivationInput } from "@/lib/profile-derivation";
import type { NutritionMeta } from "@/lib/profile-derivation";
import { HEALTH_OPTIONS } from "@/lib/onboarding-assessment";
import {
  parseProfilePreferences,
  mergePreferencesIntoAssessment,
  type ProfilePreferences,
} from "@/lib/profile-preferences";
import { GENERIC_FEATURES } from "@/lib/generic-ui";
import { GENERIC_MODE } from "@/lib/app-config";
import type { BodyGoal } from "@/lib/profile-derivation";
import { ProfileNumberField } from "./ui/ProfileNumberField";

export type KeyParametersFormHandle = { save: () => Promise<boolean> };

interface KeyProfile {
  assessmentJson: string;
  birthYear: number;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  activityLevel: string;
  workActivityLevel: string;
  primaryFocus: string;
  insulinResistance: boolean;
  hypothyroidism: boolean;
  cortisolIssues: boolean;
  vitaminDDeficiency: boolean;
  b12Deficiency: boolean;
  hormoneIssues: boolean;
  pcosSuspected: boolean;
  endometriosis: boolean;
  vitaminAbsorption: boolean;
  surgeryRecovery: boolean;
  lastPeriodStart: string | null;
  cycleLength: number;
  relationshipStatus: string;
}

const BODY_GOALS: { id: BodyGoal | "auto"; label: string }[] = [
  { id: "auto", label: "Авто (из веса)" },
  { id: "lose", label: "Похудеть" },
  { id: "maintain", label: "Удержать" },
  { id: "gain", label: "Набрать" },
];

const LOSS_PACE = [
  { id: 0.3 as const, label: "−0.3 кг/нед (мягко)" },
  { id: 0.5 as const, label: "−0.5 кг/нед" },
  { id: 0.7 as const, label: "−0.7 кг/нед" },
];

const FOCUS_OPTIONS = [
  { id: "health", label: "Здоровье" },
  { id: "balance", label: "Баланс" },
  { id: "career", label: "Карьера" },
  { id: "relationships", label: "Отношения" },
];

export const KeyParametersForm = forwardRef<
  KeyParametersFormHandle,
  { showAdvanced?: boolean; hideSaveButton?: boolean; onSaved?: () => void }
>(function KeyParametersForm({ showAdvanced = false, hideSaveButton = false, onSaved }, ref) {
  const [data, setData] = useState<KeyProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<ProfilePreferences>({ bodyGoal: "auto", lossPaceKgPerWeek: 0.5 });

  useEffect(() => {
    apiClient("/api/profile").then((r) => r.json()).then((p: KeyProfile) => {
      setData(p);
      setPrefs(parseProfilePreferences(p.assessmentJson));
    });
  }, []);

  const preview = useMemo(() => {
    if (!data) return null;
    return deriveNutritionMeta({
      ...profileToDerivationInput(data),
      bodyGoal: prefs.bodyGoal,
      lossPaceKgPerWeek: prefs.lossPaceKgPerWeek,
    });
  }, [data, prefs]);

  const save = async (): Promise<boolean> => {
    if (!data || !preview) return false;
    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentJson: mergePreferencesIntoAssessment(data.assessmentJson, prefs),
        birthYear: data.birthYear,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        heightCm: data.heightCm,
        activityLevel: data.activityLevel,
        workActivityLevel: data.workActivityLevel,
        primaryFocus: data.primaryFocus,
        insulinResistance: data.insulinResistance,
        hypothyroidism: data.hypothyroidism,
        cortisolIssues: data.cortisolIssues,
        vitaminDDeficiency: data.vitaminDDeficiency,
        b12Deficiency: data.b12Deficiency,
        hormoneIssues: data.hormoneIssues,
        pcosSuspected: data.pcosSuspected,
        endometriosis: data.endometriosis,
        vitaminAbsorption: data.vitaminAbsorption,
        surgeryRecovery: data.surgeryRecovery,
        calorieTarget: preview.calorieTarget,
        proteinTargetG: preview.proteinTargetG,
        fatTargetG: preview.fatTargetG,
        carbTargetG: preview.carbTargetG,
        fiberTargetG: preview.fiberTargetG,
        waterTargetMl: preview.waterTargetMl,
        onboardingDone: true,
      }),
    });
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 2000);
    return true;
  };

  useImperativeHandle(ref, () => ({ save }), [data, preview, prefs]);

  if (!data) return null;

  return (
    <Card
      title="Ключевые параметры"
      subtitle="ИМТ, цель веса и активность → калории и белок"
    >
      {preview && <NutritionMetaCard meta={preview} />}

      <div className="flex flex-wrap gap-2 my-4">
        <Badge variant="accent">{preview?.bodyGoalLabelRu}</Badge>
        {preview && (
          <Badge variant="success">{preview.calorieTarget} ккал · {preview.proteinTargetG} г белка</Badge>
        )}
      </div>

      <p className="vc-label mb-2">Главный фокус</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {FOCUS_OPTIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setData({ ...data, primaryFocus: f.id })}
            className={`p-2 rounded-xl text-[12px] font-medium border ${
              data.primaryFocus === f.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-black/8"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="vc-label mb-2">Цель тела</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {BODY_GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setPrefs({ ...prefs, bodyGoal: g.id })}
            className={`p-2 rounded-xl text-[11px] font-medium border ${
              prefs.bodyGoal === g.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-black/8"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {(prefs.bodyGoal === "lose" || prefs.bodyGoal === "auto") && (
        <>
          <p className="vc-label mb-2">Темп снижения</p>
          <div className="flex flex-col gap-2 mb-4">
            {LOSS_PACE.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPrefs({ ...prefs, lossPaceKgPerWeek: p.id })}
                className={`p-2 rounded-xl text-[12px] font-medium border text-left ${
                  prefs.lossPaceKgPerWeek === p.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-black/8"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <ProfileNumberField
          label="Рост, см"
          value={data.heightCm}
          min={120}
          max={220}
          onCommit={(n) => setData({ ...data, heightCm: n })}
        />
        <ProfileNumberField
          label="Год рождения"
          value={data.birthYear}
          min={1940}
          max={2015}
          onCommit={(n) => setData({ ...data, birthYear: Math.round(n) })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ProfileNumberField
          label="Вес сейчас"
          value={data.currentWeightKg}
          step={0.1}
          min={30}
          max={200}
          onCommit={(n) => setData({ ...data, currentWeightKg: n })}
        />
        <ProfileNumberField
          label="Цель вес"
          value={data.targetWeightKg}
          step={0.1}
          min={30}
          max={200}
          onCommit={(n) => setData({ ...data, targetWeightKg: n })}
        />
      </div>

      <label className="block mb-3">
        <span className="vc-label">Тренировки / спорт</span>
        <select className="apple-input mt-1" value={data.activityLevel}
          onChange={(e) => setData({ ...data, activityLevel: e.target.value })}>
          <option value="low">Низкая (1–2×/нед)</option>
          <option value="moderate">Средняя (3–4×/нед)</option>
          <option value="high">Высокая (5+×/нед)</option>
        </select>
      </label>

      <label className="block mb-4">
        <span className="vc-label">Работа / быт</span>
        <select className="apple-input mt-1" value={data.workActivityLevel}
          onChange={(e) => setData({ ...data, workActivityLevel: e.target.value })}>
          <option value="sedentary">Сидячая</option>
          <option value="mixed">Смешанная</option>
          <option value="active">На ногах</option>
        </select>
      </label>

      {(GENERIC_FEATURES.medical || (GENERIC_MODE && showAdvanced)) && (
        <>
          <p className="vc-label mb-2">Здоровье</p>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {HEALTH_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={data[opt.key as keyof KeyProfile] as boolean}
                  onChange={(e) => setData({ ...data, [opt.key]: e.target.checked } as KeyProfile)}
                  className="accent-[var(--accent)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </>
      )}

      {!hideSaveButton && (
        <button type="button" onClick={() => void save()} className="apple-btn apple-btn-primary w-full">
          {saved ? "Сохранено — план пересчитан ✓" : "Сохранить и пересчитать план"}
        </button>
      )}
    </Card>
  );
});
