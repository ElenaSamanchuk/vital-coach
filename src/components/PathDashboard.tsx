"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Target, TrendingUp } from "lucide-react";
import { EmptyState } from "./ui/EmptyState";
import { GlassCard } from "./ui/GlassCard";
import { JourneyHero } from "./visual/JourneyHero";
import { JourneyTimeline } from "./visual/JourneyTimeline";
import { LifeMatrixBoard } from "./visual/LifeMatrixBoard";
import { WeightSparkline } from "./visual/WeightSparkline";
import { WeeklyDigest } from "./visual/WeeklyDigest";
import { StreakBadge } from "./visual/StreakBadge";
import { WeekSummaryRings } from "./visual/WeekSummaryRings";
import { WellbeingTrend } from "./visual/WellbeingTrend";
import { DaylioCalendar } from "./visual/DaylioCalendar";
import { TagStats } from "./visual/TagStats";
import { TrendArrows } from "./visual/TrendArrows";
import { WeeklyExperimentCard } from "./visual/WeeklyExperimentCard";
import { InflammationScoreCard } from "./visual/InflammationScoreCard";
import { BadgeStrip } from "./visual/BadgeStrip";
import { parseDayTasks, taskStats } from "@/lib/day-tasks";
import { LifeDiscoverPanel } from "./visual/LifeDiscoverPanel";
import { MediaPicksCard } from "./visual/MediaPicksCard";
import type { LifeSuggestion } from "@/lib/life-recommendations";
import type { pickMedia } from "@/lib/media-picks";
import { RecipesCard } from "./visual/RecipesCard";
import { PlacesCard } from "./visual/PlacesCard";
import type { RecipeCard } from "@/lib/recipes-catalog";
import type { PlaceSpot } from "@/lib/places-catalog";
import { logsToCalendarDays, countTagUsage } from "@/lib/day-calendar";
import { parseTrackingTags } from "@/lib/tracking-tags";
import type { TrackingTag } from "@/lib/tracking-tags";
import type { JourneyProgress } from "@/lib/user-journey";
import type { WheelScores } from "@/lib/life-spheres";
import type { WeeklyInsights } from "@/lib/types";
import { GENERIC_FEATURES } from "@/lib/generic-ui";

export function PathDashboard() {
  const [journey, setJourney] = useState<{
    progress: JourneyProgress;
    next: { title: string; href: string; hrefLabel: string; description: string } | null;
    streak: number;
    freezeUsed?: boolean;
    targetWeightKg: number;
    who5Filled?: boolean;
  } | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [wheelScores, setWheelScores] = useState<WheelScores>({});
  const [weightPoints, setWeightPoints] = useState<{ date: string; value: number }[]>([]);
  const [weekly, setWeekly] = useState<WeeklyInsights | null>(null);
  const [weekRings, setWeekRings] = useState({ mealsPct: 0, movePct: 0, logPct: 0 });
  const [wellbeingPoints, setWellbeingPoints] = useState<
    { label: string; energy: number; mood: number; stress: number }[]
  >([]);
  const [calendarDays, setCalendarDays] = useState(logsToCalendarDays([]));
  const [trackingTags, setTrackingTags] = useState<TrackingTag[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [trends, setTrends] = useState<
    { label: string; value: string; trend: "up" | "down" | "stable"; good: boolean }[]
  >([]);
  const [weeklyExp, setWeeklyExp] = useState<import("@/lib/weekly-experiment").WeeklyExperiment | null>(null);
  const [inflammationLoad, setInflammationLoad] = useState<
    import("@/lib/inflammation-score").InflammationLoad | null
  >(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [weekTaskPct, setWeekTaskPct] = useState<number | null>(null);
  const [lifeSuggestions, setLifeSuggestions] = useState<LifeSuggestion[]>([]);
  const [mediaPicks, setMediaPicks] = useState<ReturnType<typeof pickMedia> | null>(null);
  const [recipePicks, setRecipePicks] = useState<RecipeCard[]>([]);
  const [placePicks, setPlacePicks] = useState<PlaceSpot[]>([]);

  useEffect(() => {
    Promise.all([
      apiClient("/api/journey"),
      apiClient("/api/life"),
      apiClient("/api/analytics?days=35"),
      apiClient("/api/profile"),
    ]).then(async ([j, l, a, p]) => {
      setJourney(await j.json());
      if (l.ok) {
        const life = await l.json();
        setWheelScores(life.wheelScores ?? {});
        setInsight(life.holisticPlan?.dailyMicroHabits?.[0] ?? null);
      }
      const analytics = await a.json();
      const profile = p.ok ? await p.json() : null;
      setTrackingTags(parseTrackingTags(profile?.trackingTagsJson));
      const allLogs = (analytics.logs ?? []) as {
        date: string;
        mood?: number;
        energy?: number;
        stress?: number;
        dayTagsJson?: string;
        dayPhoto?: string;
        weightKg?: number;
        mealChoices?: string;
        workoutChoice?: string;
      }[];
      setCalendarDays(logsToCalendarDays(allLogs));
      setTagCounts(countTagUsage(allLogs));

      const weekTaskLogs = allLogs.slice(-7) as { tasksJson?: string }[];
      let taskDone = 0;
      let taskTotal = 0;
      for (const row of weekTaskLogs) {
        const s = taskStats(parseDayTasks(row.tasksJson));
        taskDone += s.done;
        taskTotal += s.total;
      }
      setWeekTaskPct(taskTotal > 0 ? taskDone / taskTotal : null);

      try {
        setBadges(JSON.parse(profile?.unlockedAchievements || "[]") as string[]);
      } catch {
        setBadges([]);
      }

      const weights = allLogs.filter((l) => l.weightKg).map((l) => l.weightKg!);
      const moods = allLogs.filter((l) => l.mood != null).map((l) => l.mood!);
      const wTrend =
        weights.length >= 2
          ? weights[weights.length - 1] - weights[weights.length - 2]
          : 0;
      const mTrend =
        moods.length >= 2 ? moods[moods.length - 1] - moods[moods.length - 2] : 0;
      setTrends([
        {
          label: "Вес",
          value: weights.length ? `${weights[weights.length - 1].toFixed(1)} кг` : "—",
          trend: wTrend < -0.05 ? "down" : wTrend > 0.05 ? "up" : "stable",
          good: wTrend <= 0,
        },
        {
          label: "Настроение",
          value: moods.length ? String(moods[moods.length - 1]) : "—",
          trend: mTrend > 0 ? "up" : mTrend < 0 ? "down" : "stable",
          good: mTrend >= 0,
        },
      ]);

      apiClient("/api/coach").then(async (r) => {
        const c = await r.json();
        setWeeklyExp(c.plan?.weeklyExperiment ?? null);
        setInflammationLoad(c.plan?.inflammationLoad ?? null);
        setLifeSuggestions(c.plan?.lifeSuggestions ?? []);
        setMediaPicks(c.plan?.mediaPicks ?? null);
        setRecipePicks(c.plan?.recipePicks ?? []);
        setPlacePicks(c.plan?.placePicks ?? []);
      });

      setWeekly(analytics.insights ?? null);
      const weekLogs = allLogs.slice(-7) as {
        mealChoices?: string;
        workoutChoice?: string;
        mood?: number;
        energy?: number;
        stress?: number;
        weightKg?: number;
      }[];
      let meals = 0;
      let move = 0;
      let log = 0;
      for (const row of weekLogs) {
        if (row.mealChoices && row.mealChoices !== "{}") meals++;
        if (row.workoutChoice) move++;
        if (row.mood != null || row.weightKg != null) log++;
      }
      setWeekRings({
        mealsPct: meals / 7,
        movePct: move / 7,
        logPct: log / 7,
      });
      setWellbeingPoints(
        weekLogs
          .filter((l) => l.mood != null || l.energy != null)
          .map((l, i) => ({
            label: String(i),
            energy: l.energy ?? 5,
            mood: l.mood ?? 5,
            stress: l.stress ?? 5,
          })),
      );
      const pts = (analytics.logs ?? [])
        .filter((log: { weightKg?: number }) => log.weightKg)
        .map((log: { date: string; weightKg: number }) => ({
          date: log.date,
          value: log.weightKg,
        }))
        .slice(-7);
      setWeightPoints(pts);
    });
  }, []);

  if (!journey) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Загрузка…</div>;
  }

  return (
    <div className="space-y-4 pb-10 vc-stagger">
      <JourneyHero progress={journey.progress} nextTitle={journey.next?.title} />

      <div className="flex items-center gap-2 px-1">
        <StreakBadge days={journey.streak} freezeUsed={journey.freezeUsed} />
      </div>

      {GENERIC_FEATURES.deepPsychology && !journey.who5Filled && (
        <Link href="/settings?tab=life" className="block">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4">
            <p className="text-[13px] font-semibold">WHO-5 — 1 минута</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Короткий опрос настроения помогает не ужесточать план, когда организм на пределе
            </p>
          </div>
        </Link>
      )}

      {trends.length > 0 && (
        <GlassCard title="Тренды" subtitle="Стрелки как Apple Health">
          <TrendArrows items={trends} />
        </GlassCard>
      )}

      {GENERIC_FEATURES.lifeCatalog && lifeSuggestions.length > 0 && (
        <GlassCard title="Компас жизни" subtitle="Что попробовать — из данных и интересов">
          <LifeDiscoverPanel suggestions={lifeSuggestions} showCatalog />
        </GlassCard>
      )}

      {GENERIC_FEATURES.lifeCatalog && mediaPicks && (
        <GlassCard title="Культура" subtitle="Кино · музыка · книги по настроению">
          <MediaPicksCard media={mediaPicks} />
        </GlassCard>
      )}

      {GENERIC_FEATURES.lifeCatalog && recipePicks.length > 0 && (
        <GlassCard title="Рецепты" subtitle="ИР · гипотиреоз">
          <RecipesCard recipes={recipePicks} />
        </GlassCard>
      )}

      {GENERIC_FEATURES.lifeCatalog && placePicks.length > 0 && (
        <GlassCard title="Места" subtitle="Куда сходить">
          <PlacesCard places={placePicks} />
        </GlassCard>
      )}

      {GENERIC_FEATURES.bodyAnalytics && inflammationLoad && (
        <GlassCard title="Нагрузка на тело" subtitle="Стресс · сон · цикл · уход">
          <InflammationScoreCard load={inflammationLoad} />
        </GlassCard>
      )}

      {GENERIC_FEATURES.medical && weeklyExp && <WeeklyExperimentCard exp={weeklyExp} />}

      <GlassCard title="Бейджи" subtitle="За привычки и streak">
        <BadgeStrip unlockedIds={badges} />
      </GlassCard>

      <GlassCard title="Календарь" subtitle="Daylio — цвет по настроению">
        <DaylioCalendar days={calendarDays} tags={trackingTags} />
      </GlassCard>

      <GlassCard title="Плашки" subtitle="За 35 дней">
        <TagStats tags={trackingTags} counts={tagCounts} days={35} />
      </GlassCard>

      <GlassCard title="7 дней" subtitle="Кольца привычек">
        <WeekSummaryRings {...weekRings} />
        {weekTaskPct != null && (
          <p className="text-[11px] text-[var(--text-secondary)] mt-3">
            Дела закрыты на {Math.round(weekTaskPct * 100)}% за неделю
          </p>
        )}
      </GlassCard>

      <GlassCard title="Самочувствие" subtitle="Энергия · настроение · стресс">
        <WellbeingTrend points={wellbeingPoints} />
      </GlassCard>

      <GlassCard title="Вес" subtitle="7 дней">
        <WeightSparkline points={weightPoints} target={journey.targetWeightKg} />
      </GlassCard>

      <GlassCard title="Неделя" subtitle="Авто из дневника">
        {weekly && (weekly.wins.length > 0 || weekly.slipping.length > 0) ? (
          <WeeklyDigest insights={weekly} />
        ) : (
          <EmptyState
            icon={BarChart3}
            title="Неделя только начинается"
            description="После 3–4 записей в дневнике здесь появятся победы и зоны роста с объяснением «почему»."
          />
        )}
      </GlassCard>

      {GENERIC_FEATURES.deepPsychology && insight && (
        <GlassCard title="Фокус" subtitle="Из твоих данных">
          <p className="text-[14px] leading-relaxed">{insight}</p>
        </GlassCard>
      )}

      {GENERIC_FEATURES.deepPsychology && (
        <details className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)]">
          <summary className="p-4 text-[13px] font-semibold cursor-pointer list-none flex items-center justify-between">
            Шаги пути
            {journey.next && (
              <Link href={journey.next.href} className="text-[11px] text-[var(--accent)] font-medium">
                {journey.next.title} →
              </Link>
            )}
          </summary>
          <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
            <JourneyTimeline progress={journey.progress} />
          </div>
        </details>
      )}

      {GENERIC_FEATURES.deepPsychology && Object.keys(wheelScores).length > 0 && (
        <GlassCard title="Сферы" subtitle="Слабые зоны ярче">
          <LifeMatrixBoard scores={wheelScores} />
          <Link href="/settings" className="text-[12px] text-[var(--accent)] mt-3 inline-flex items-center gap-1">
            Изменить в профиле <ArrowRight size={12} />
          </Link>
        </GlassCard>
      )}

      <Link href="/progress" className="flex items-center justify-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <TrendingUp size={14} />
        Подробная динамика
      </Link>
    </div>
  );
}
