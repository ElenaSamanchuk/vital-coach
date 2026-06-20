"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "./ui/Card";
import { SegmentTabs } from "./ui/SegmentTabs";
import { StatBar } from "./ui/StatBar";
import { ConditionMatrix } from "./ui/ConditionMatrix";
import { AchievementCard } from "./ui/AchievementCard";
import { WheelOfLife } from "./WheelOfLife";
import { PermaBars, MaslowPyramid } from "./FrameworkPanel";
import { SphereAdviceList } from "./SphereAdviceList";
import { HolisticInsights } from "./HolisticInsights";
import { EvidenceLibrary } from "./EvidenceLibrary";
import { WeeklyReviewCard } from "./WeeklyReviewCard";
import { LifeMatrixBoard } from "./visual/LifeMatrixBoard";
import { ValuesPyramidVisual } from "./visual/ValuesPyramidVisual";
import { PersonalityMap } from "./visual/PersonalityMap";
import type { BigFiveTrait } from "@/lib/psychology-frameworks";
import type { HolisticLifePlan } from "@/lib/life-synthesis";
import type { LifeStat, Achievement } from "@/lib/gamification";
import type { ConditionCard } from "@/lib/health-matrix";
import type { WheelScores } from "@/lib/life-spheres";
import type { PermaScore } from "@/lib/psychology-frameworks";
import type { LifeCoachReport } from "@/lib/sphere-coach";
import { Settings, ChevronRight, Save } from "lucide-react";

interface LifeData {
  stats: LifeStat[];
  extendedXp: { key: string; label: string; xp: number; emoji: string; color: string }[];
  avatarLevel: number;
  totalXp: number;
  achievements: Achievement[];
  matrix: ConditionCard[];
  wheelScores: WheelScores;
  wheelAverage: number;
  perma: PermaScore | null;
  bigFive: Record<string, number> | null;
  coachReport: LifeCoachReport;
  holisticPlan: HolisticLifePlan;
  profile: {
    name: string;
    occupation: string;
    workActivityLevel: string;
    relationshipStatus: string;
    financeGoal: string;
    careerGoal: string;
    ikigaiJson?: Record<string, string>;
  };
  unlockedCount: number;
  totalAchievements: number;
}

type Tab = "overview" | "deep";

export function LifeDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<LifeData | null>(null);
  const [wheelEdit, setWheelEdit] = useState<WheelScores>({});
  const [savingWheel, setSavingWheel] = useState(false);
  const [coreValues, setCoreValues] = useState<string[]>([]);

  const load = () =>
    apiClient("/api/life")
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d));

  useEffect(() => {
    load();
    apiClient("/api/wheel").then((r) => r.json()).then((w) => {
      if (Array.isArray(w.coreValuesJson)) setCoreValues(w.coreValuesJson);
    });
  }, []);

  useEffect(() => {
    if (data?.wheelScores) setWheelEdit(data.wheelScores);
  }, [data?.wheelScores]);

  const saveWheel = async () => {
    setSavingWheel(true);
    await apiClient("/api/wheel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wheelScores: wheelEdit }),
    });
    setSavingWheel(false);
    load();
  };

  if (!data) return <div className="text-center py-12 text-[#86868b]">Загружаю баланс…</div>;

  const unlocked = data.achievements.filter((a) => a.unlocked);
  const locked = data.achievements.filter((a) => !a.unlocked);

  return (
    <div className="space-y-4 pb-8">
      <div className="avatar-hero rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5856d6] via-[#0071e3] to-[#30d158] opacity-90" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-[12px] uppercase tracking-wider">Баланс жизни</p>
              <h2 className="text-[26px] font-bold mt-1">{data.profile.name || "Ты"}</h2>
              <p className="text-white/80 text-[13px] mt-1">
                Колесо {data.wheelAverage || "—"}/10 · {data.totalXp} XP
              </p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur rounded-2xl px-4 py-2">
              <p className="text-[28px] font-black">{data.avatarLevel}</p>
              <p className="text-[10px] uppercase opacity-80">уровень</p>
            </div>
          </div>
        </div>
      </div>

      <SegmentTabs
        tabs={[
          { id: "overview", label: "Обзор" },
          { id: "deep", label: "Глубже" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <>
          <Card title="Фокус недели" subtitle={data.coachReport.weeklyFocus}>
            <p className="text-[13px] text-[#0071e3] p-3 bg-[#e8f2ff] rounded-xl">
              {data.coachReport.maslowFocus}
            </p>
            <HolisticInsights plan={data.holisticPlan} />
          </Card>

          <WeeklyReviewCard />

          <Card title="Колесо жизни" subtitle="Оцени 10 сфер 1–10">
            <WheelOfLife scores={wheelEdit} onChange={setWheelEdit} />
            <button
              type="button"
              onClick={saveWheel}
              disabled={savingWheel}
              className="apple-btn apple-btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {savingWheel ? "Сохраняю…" : "Сохранить"}
            </button>
          </Card>

          <Card title="Матрица сфер">
            <LifeMatrixBoard scores={data.wheelScores} />
          </Card>

          <SphereAdviceList advice={data.coachReport.advice} />

          <Link href="/log" className="apple-btn apple-btn-primary w-full flex items-center justify-center gap-2">
            Записать день <ChevronRight size={16} />
          </Link>
        </>
      )}

      {tab === "deep" && (
        <>
          <Card title="Пирамида ценностей">
            <ValuesPyramidVisual selected={coreValues} />
          </Card>

          {data.perma && (
            <Card title="PERMA" subtitle="5 столпов благополучия">
              <PermaBars perma={data.perma} />
            </Card>
          )}

          <Card title="Пирамида Маслоу">
            <MaslowPyramid focus={data.coachReport.maslowFocus} />
          </Card>

          {data.bigFive && Object.keys(data.bigFive).length >= 5 && (
            <Card title="Карта личности" subtitle="Big Five">
              <PersonalityMap scores={data.bigFive as Record<BigFiveTrait, number>} />
              <Link href="/settings" className="text-[12px] text-[var(--text-secondary)] mt-2 inline-block">
                Пройти тест в профиле
              </Link>
            </Card>
          )}

          {(data.profile.careerGoal || data.profile.financeGoal) && (
            <Card title="Цели">
              {data.profile.careerGoal && <p className="text-[13px] mb-2">💼 {data.profile.careerGoal}</p>}
              {data.profile.financeGoal && <p className="text-[13px]">💰 {data.profile.financeGoal}</p>}
            </Card>
          )}

          <Card title="Прокачка (XP)">
            <div className="space-y-3">
              {data.stats.map(({ key, ...s }) => (
                <StatBar key={key} {...s} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 space-y-2">
              {data.extendedXp.map((x) => (
                <div key={x.key} className="flex justify-between items-center p-2 bg-[#fbfbfd] rounded-xl text-[13px]">
                  <span>{x.emoji} {x.label}</span>
                  <span className="font-bold" style={{ color: x.color }}>{x.xp} XP</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Матрица здоровья">
            <ConditionMatrix conditions={data.matrix} />
          </Card>

          <Card title="Достижения">
            <div className="grid grid-cols-2 gap-2">
              {unlocked.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </div>
            {locked.length > 0 && (
              <details className="mt-3">
                <summary className="text-[12px] text-[#86868b] cursor-pointer">
                  Следующие ({locked.length})
                </summary>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {locked.slice(0, 4).map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </div>
              </details>
            )}
          </Card>

          <Card title="База исследований" subtitle="15 моделей">
            <EvidenceLibrary highlightIds={data.holisticPlan.frameworksToExplore} />
          </Card>

          <Link href="/path" className="apple-btn apple-btn-secondary w-full text-center text-[13px]">
            Кейсы и справка →
          </Link>
          <Link href="/settings" className="text-center text-[13px] text-[#0071e3] flex items-center justify-center gap-1">
            <Settings size={14} /> Профиль и тесты
          </Link>
        </>
      )}
    </div>
  );
}
