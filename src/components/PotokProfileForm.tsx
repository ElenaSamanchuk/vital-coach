"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/Card";
import { SwipeSlider } from "./ui/SwipeSlider";
import { NutritionMetaCard } from "./visual/NutritionMetaCard";
import { BackupPanel } from "./BackupPanel";
import { deriveNutritionMeta, profileToDerivationInput } from "@/lib/profile-derivation";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  GENERIC_HEALTH_OPTIONS,
} from "@/lib/generic-health-options";
import { mergePreferencesIntoAssessment, parseProfilePreferences } from "@/lib/profile-preferences";

interface ProfileData {
  name: string;
  birthYear: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: string;
  workActivityLevel: string;
  assessmentJson: string;
  insulinResistance: boolean;
  hypothyroidism: boolean;
  cortisolIssues: boolean;
  hormoneIssues: boolean;
  pcosSuspected: boolean;
  endometriosis: boolean;
  surgeryRecovery: boolean;
}

function parseExtras(json: string): { gender?: string; birthDate?: string } {
  try {
    const o = JSON.parse(json || "{}") as { gender?: string; birthDate?: string };
    return { gender: o.gender, birthDate: o.birthDate };
  } catch {
    return {};
  }
}

/** Профиль «Поток»: все поля онбординга + резервная копия */
export function PotokProfileForm() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [gender, setGender] = useState("female");
  const [birthDate, setBirthDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient("/api/profile")
      .then((r) => r.json())
      .then((p: ProfileData) => {
        setData(p);
        const ex = parseExtras(p.assessmentJson);
        setGender(ex.gender ?? "female");
        setBirthDate(ex.birthDate ?? `${p.birthYear}-01-01`);
      });
  }, []);

  const preview = useMemo(() => {
    if (!data) return null;
    const prefs = parseProfilePreferences(data.assessmentJson);
    return deriveNutritionMeta({
      ...profileToDerivationInput(data),
      bodyGoal: prefs.bodyGoal,
      lossPaceKgPerWeek: prefs.lossPaceKgPerWeek,
    });
  }, [data]);

  const setHealth = (key: keyof ProfileData, value: boolean) => {
    if (!data) return;
    setData({ ...data, [key]: value });
  };

  const save = async () => {
    if (!data || !preview) return;
    setSaving(true);
    const birthYear = parseInt(birthDate.slice(0, 4), 10) || data.birthYear;
    const assessmentJson = mergePreferencesIntoAssessment(data.assessmentJson, {
      bodyGoal: parseProfilePreferences(data.assessmentJson).bodyGoal,
      lossPaceKgPerWeek: parseProfilePreferences(data.assessmentJson).lossPaceKgPerWeek,
    });
    let merged = assessmentJson;
    try {
      const base = JSON.parse(assessmentJson) as Record<string, unknown>;
      merged = JSON.stringify({ ...base, gender, birthDate });
    } catch {
      merged = JSON.stringify({ gender, birthDate });
    }

    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        birthYear,
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        activityLevel: data.activityLevel,
        assessmentJson: merged,
        insulinResistance: data.insulinResistance,
        hypothyroidism: data.hypothyroidism,
        cortisolIssues: data.cortisolIssues,
        hormoneIssues: data.hormoneIssues,
        pcosSuspected: data.pcosSuspected,
        endometriosis: data.endometriosis,
        calorieTarget: preview.calorieTarget,
        proteinTargetG: preview.proteinTargetG,
        fatTargetG: preview.fatTargetG,
        carbTargetG: preview.carbTargetG,
        fiberTargetG: preview.fiberTargetG,
        waterTargetMl: preview.waterTargetMl,
        onboardingDone: true,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!data) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>;
  }

  return (
    <div className="vc-page space-y-4 pb-8">
      {preview && (
        <Card title="Твой план" subtitle="Калории и белок пересчитываются при сохранении">
          <NutritionMetaCard meta={preview} />
        </Card>
      )}

      <Card title="О себе">
        <div className="space-y-4">
          <label className="block">
            <span className="vc-label">Имя</span>
            <input
              className="apple-input mt-1"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </label>

          <SwipeSlider
            label="Рост"
            value={data.heightCm}
            onChange={(n) => setData({ ...data, heightCm: n })}
            min={140}
            max={210}
            unit="см"
          />

          <SwipeSlider
            label="Вес сейчас"
            value={data.currentWeightKg}
            onChange={(n) => setData({ ...data, currentWeightKg: n })}
            min={40}
            max={150}
            step={0.5}
            unit="кг"
            formatValue={(n) => n.toFixed(1)}
          />

          <SwipeSlider
            label="Цель веса"
            value={data.targetWeightKg}
            onChange={(n) => setData({ ...data, targetWeightKg: n })}
            min={40}
            max={150}
            step={0.5}
            unit="кг"
            formatValue={(n) => n.toFixed(1)}
          />

          <label className="block">
            <span className="vc-label">Пол</span>
            <select className="apple-input mt-1" value={gender} onChange={(e) => setGender(e.target.value)}>
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
              className="apple-input mt-1"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="vc-label">Уровень активности</span>
            <select
              className="apple-input mt-1"
              value={data.activityLevel}
              onChange={(e) => setData({ ...data, activityLevel: e.target.value })}
            >
              {ACTIVITY_LEVEL_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card title="Здоровье" subtitle="Влияет на калории, воду и нагрузку">
        <div className="space-y-2">
          {GENERIC_HEALTH_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data[opt.key as keyof ProfileData] as boolean}
                onChange={(e) => setHealth(opt.key as keyof ProfileData, e.target.checked)}
                className="mt-0.5 accent-[var(--accent)]"
              />
              <span className="min-w-0">
                <span className="vc-text-sm font-medium block">{opt.label}</span>
                <span className="vc-text-xs text-[var(--text-tertiary)]">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card title="Резервная копия">
        <BackupPanel />
      </Card>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="apple-btn apple-btn-primary w-full"
      >
        {saving ? "Сохраняю…" : saved ? "Сохранено ✓" : "Сохранить профиль"}
      </button>
    </div>
  );
}
