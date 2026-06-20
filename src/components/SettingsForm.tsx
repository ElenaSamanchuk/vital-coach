"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Card } from "./ui/Card";
import { IconSegmentTabs } from "./ui/IconSegmentTabs";
import { SETTINGS_TABS } from "@/lib/visual-icons";
import { TrackingTagsEditor } from "./TrackingTagsEditor";
import { InterestsPicker } from "./visual/InterestsPicker";
import { ReminderSettings } from "./visual/ReminderSettings";
import { StyleCapsuleCard } from "./visual/StyleCapsuleCard";
import { parseStyleProfile } from "@/lib/style-guide";
import type { TrackingTag } from "@/lib/tracking-tags";
import { parseTrackingTags } from "@/lib/tracking-tags";
import { LifeProfileForm } from "./LifeProfileForm";
import { KeyParametersForm } from "./KeyParametersForm";
import { BackupPanel } from "./BackupPanel";
import { HealthHub } from "./HealthHub";
import { WheelOfLife } from "./WheelOfLife";
import type { WheelScores } from "@/lib/life-spheres";
import { Save } from "lucide-react";
import { GENERIC_MODE, STANDALONE_MODE } from "@/lib/app-config";
import { GENERIC_FEATURES } from "@/lib/generic-ui";
import { UI } from "@/lib/product-copy";
import { WeeklyReviewCard } from "./WeeklyReviewCard";
import { AppFlowCard } from "./AppFlowCard";

interface Profile {
  name: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetWaistCm: number;
  targetHipsCm: number;
  targetChestCm: number;
  calorieTarget: number;
  proteinTargetG: number;
  waterTargetMl: number;
  sleepTargetMin: number;
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
  occupation: string;
  workActivityLevel: string;
  cycleLength: number;
  lastPeriodStart: string | null;
  thyroidMedication: string;
  interestsJson?: string;
  notificationPrefsJson?: string;
  styleJson?: string;
}

type Tab = "body" | "life" | "health" | "system";

export function SettingsForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("body");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wheel, setWheel] = useState<WheelScores>({});
  const [saved, setSaved] = useState(false);
  const [savingWheel, setSavingWheel] = useState(false);
  const [trackingTags, setTrackingTags] = useState<TrackingTag[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "health" && GENERIC_MODE && !showAdvanced) return;
    if (t === "life" && GENERIC_MODE && !showAdvanced) return;
    if (t === "health" || t === "life" || t === "body" || t === "system") {
      setTab(t as Tab);
    }
  }, [searchParams, showAdvanced]);

  useEffect(() => {
    apiClient("/api/profile").then((r) => r.json()).then((p) => {
      setProfile(p);
      setTrackingTags(parseTrackingTags(p.trackingTagsJson));
    });
    apiClient("/api/wheel").then((r) => r.json()).then((w) => {
      if (w.wheelScores) setWheel(w.wheelScores);
    });
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, onboardingDone: true }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveWheel = async () => {
    setSavingWheel(true);
    await apiClient("/api/wheel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wheelScores: wheel }),
    });
    setSavingWheel(false);
  };

  const settingsTabs = SETTINGS_TABS.filter((t) => {
    if (!GENERIC_MODE) return true;
    if (t.id === "body" || t.id === "system") return true;
    if (showAdvanced && GENERIC_FEATURES.checkupTab && t.id === "health") return true;
    if (showAdvanced && GENERIC_FEATURES.deepPsychology && t.id === "life") return true;
    return false;
  });

  useEffect(() => {
    if (!settingsTabs.some((t) => t.id === tab)) setTab("body");
  }, [settingsTabs, tab]);

  if (!profile) return <div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>;

  const num = (key: keyof Profile, label: string) => (
    <label className="block">
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <input
        type="number"
        className="apple-input mt-1"
        value={profile[key] as number}
        onChange={(e) =>
          setProfile({ ...profile, [key]: parseFloat(e.target.value) || 0 })
        }
      />
    </label>
  );

  return (
    <div className="space-y-4 pb-8">
      <IconSegmentTabs
        tabs={settingsTabs.map((t) => ({ ...t, id: t.id as Tab }))}
        value={tab}
        onChange={setTab}
      />

      {tab === "body" && (
        <>
          <KeyParametersForm />
          <Card title="Основное" subtitle="Вес и здоровье — в блоке «Ключевые параметры» выше">
            <div className="space-y-3">
              <label className="block">
                <span className="text-[13px] text-[var(--text-secondary)]">Имя</span>
                <input
                  className="apple-input mt-1"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-[var(--text-secondary)]">Работа</span>
                <input
                  className="apple-input mt-1"
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                />
              </label>
              {num("heightCm", "Рост, см")}
            </div>
          </Card>

          <TrackingTagsEditor
            tags={trackingTags}
            onChange={async (tags) => {
              setTrackingTags(tags);
              await apiClient("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackingTagsJson: JSON.stringify(tags) }),
              });
            }}
          />

          {GENERIC_MODE && (
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="apple-btn apple-btn-secondary w-full text-[13px]"
            >
              {showAdvanced ? "Скрыть расширенные настройки" : UI.advancedSettings}
            </button>
          )}

          {(!GENERIC_MODE || showAdvanced) && (
            <>
              <Card title="Цикл">
                {num("cycleLength", "Длина цикла, дней")}
                <label className="block mt-3">
                  <span className="text-[13px] text-[#86868b]">Начало последних месячных</span>
                  <input
                    type="date"
                    className="apple-input mt-1"
                    value={profile.lastPeriodStart?.split("T")[0] ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, lastPeriodStart: e.target.value || null })
                    }
                  />
                </label>
              </Card>

              <Card title="Лекарства">
                <input
                  className="apple-input"
                  placeholder="Тироксин, доза…"
                  value={profile.thyroidMedication}
                  onChange={(e) => setProfile({ ...profile, thyroidMedication: e.target.value })}
                />
              </Card>
            </>
          )}

          <button type="button" onClick={saveProfile} className="apple-btn apple-btn-primary w-full py-4">
            {saved ? "Сохранено ✓" : GENERIC_MODE ? UI.saveProfile : "Сохранить тело"}
          </button>
        </>
      )}

      {tab === "life" && (
        <>
          <Card title="Колесо жизни" subtitle="Единственное место редактирования сфер">
            <WheelOfLife scores={wheel} onChange={setWheel} />
            <button
              type="button"
              onClick={saveWheel}
              disabled={savingWheel}
              className="apple-btn apple-btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {savingWheel ? "Сохраняю…" : "Сохранить колесо"}
            </button>
          </Card>
          <Card title="Интересы" subtitle="Дача · досуг · уход · работа — для рекомендаций">
            <InterestsPicker
              value={profile.interestsJson ?? "[]"}
              onChange={(json) => setProfile({ ...profile, interestsJson: json })}
            />
            <button type="button" onClick={saveProfile} className="apple-btn apple-btn-secondary w-full mt-4">
              Сохранить интересы
            </button>
          </Card>
          <Card title="Стиль" subtitle="Капсульный гардероб">
            <StyleCapsuleCard
              profile={parseStyleProfile(profile.styleJson)}
              onChange={(s) => setProfile({ ...profile, styleJson: JSON.stringify(s) })}
              onSave={saveProfile}
            />
          </Card>
          <WeeklyReviewCard />
          {!GENERIC_MODE && <LifeProfileForm />}
          {GENERIC_MODE && showAdvanced && (
            <Card title="Психология" subtitle="Big Five, PERMA, WHO-5 — по желанию">
              <LifeProfileForm />
            </Card>
          )}
        </>
      )}

      {tab === "health" && <HealthHub />}

      {tab === "system" && (
        <>
          {GENERIC_MODE && <AppFlowCard />}
          <Card title="Напоминания" subtitle="Утро и вечер">
            <ReminderSettings
              value={profile.notificationPrefsJson ?? "{}"}
              onChange={(json) => setProfile({ ...profile, notificationPrefsJson: json })}
              onSave={saveProfile}
            />
          </Card>
          <BackupPanel />
          {!GENERIC_MODE && (
            <Link href="/guide" className="apple-btn apple-btn-secondary w-full text-center">
              Справочник: кейсы и исследования →
            </Link>
          )}
          <Link href="/progress" className="apple-btn apple-btn-secondary w-full text-center">
            Графики динамики →
          </Link>
          {!STANDALONE_MODE && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="apple-btn apple-btn-secondary w-full"
            >
              Выйти
            </button>
          )}
        </>
      )}
    </div>
  );
}
