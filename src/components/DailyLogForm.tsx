"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { IconCard } from "./ui/IconCard";
import { ProgressBar } from "./ui/ProgressBar";
import { SliderField } from "./ui/SliderField";
import { SegmentTabs } from "./ui/SegmentTabs";
import { DAILY_WINS, winsToPayload, payloadToWins } from "@/lib/daily-wins";
import { MOOD_VISUAL } from "@/lib/visual-icons";
import { CARD_ICON } from "@/lib/design-tokens";
import { WeekDots } from "./visual/WeekDots";
import { PlanVsFact } from "./visual/PlanVsFact";
import { CalorieRing } from "./visual/CalorieRing";
import { MacroBars } from "./visual/MacroBars";
import { DayPhotoUpload } from "./visual/DayPhotoUpload";
import { DayTrackerTags } from "./visual/DayTrackerTags";
import { CareHomePanel } from "./visual/CareHomePanel";
import { TaskTrackerPanel } from "./visual/TaskTrackerPanel";
import { HomeSprintTimer } from "./visual/HomeSprintTimer";
import { EveningRitualCard } from "./visual/EveningRitualCard";
import { carryOverTasks, parseDayTasks, type DayTask } from "@/lib/day-tasks";
import { LifeDiscoverPanel } from "./visual/LifeDiscoverPanel";
import { MediaPicksCard } from "./visual/MediaPicksCard";
import { ShoppingPanel } from "./visual/ShoppingPanel";
import { parseShopping, type ShopItem } from "@/lib/shopping-list";
import type { LifeSuggestion } from "@/lib/life-recommendations";
import type { pickMedia } from "@/lib/media-picks";
import { Compass } from "lucide-react";
import { BacklogPanel } from "./visual/BacklogPanel";
import { LeisureQuizCard } from "./visual/LeisureQuizCard";
import { RecipesCard } from "./visual/RecipesCard";
import { PlacesCard } from "./visual/PlacesCard";
import { StyleCapsuleCard } from "./visual/StyleCapsuleCard";
import { parseLeisureQuiz } from "@/lib/leisure-quiz";
import { parseStyleProfile, type StyleProfile } from "@/lib/style-guide";
import { SELF_CARE_ROUTINES } from "@/lib/self-care";
import { HOME_CHORES } from "@/lib/home-chores";
import { parseDayTags, parseTrackingTags } from "@/lib/tracking-tags";
import { MealSlotBars } from "./visual/MealSlotBars";
import { mealSlotsFromPlan } from "@/lib/meal-distribution";
import { EVENING_PROMPTS, appendReflection } from "@/lib/evening-reflection";
import type { MealSlotPlan } from "@/lib/types";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import {
  Smile,
  Scale,
  Droplets,
  Trophy,
  Pill,
  CheckCircle2,
  Moon,
  Flame,
  Camera,
  Tags,
  Footprints,
  Sparkles,
  Briefcase,
} from "lucide-react";

function syncCareTags(selfcare: string[], home: string[], existing: string[]): string[] {
  const careIds = new Set([
    ...SELF_CARE_ROUTINES.map((r) => r.id),
    ...HOME_CHORES.map((c) => c.id),
  ]);
  const base = existing.filter((id) => !careIds.has(id));
  return [...base, ...selfcare, ...home];
}

interface Profile {
  waterTargetMl: number;
  hypothyroidism: boolean;
  calorieTarget: number;
  proteinTargetG: number;
  sleepTargetMin: number;
  trackingTagsJson?: string;
}

interface LogData {
  weightKg?: number;
  waistCm?: number;
  waterMl?: number;
  steps?: number;
  sleepMinutes?: number;
  sleepQuality?: number;
  energy?: number;
  mood?: number;
  stress?: number;
  thyroidMedTaken?: boolean;
  workoutCompleted?: boolean;
  notes?: string;
}

type Tab = "quick" | "tasks" | "life" | "more";

export function DailyLogForm() {
  const [tab, setTab] = useState<Tab>("quick");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LogData>({
    sleepQuality: 7,
    energy: 7,
    mood: 7,
    stress: 5,
    waterMl: 0,
    thyroidMedTaken: false,
    workoutCompleted: false,
  });
  const [wins, setWins] = useState<string[]>([]);
  const [workSatisfaction, setWorkSatisfaction] = useState(6);
  const [autoNutrition, setAutoNutrition] = useState<{ calories?: number; proteinG?: number }>({});
  const [dayTargets, setDayTargets] = useState<{
    calorieTarget: number;
    proteinTargetG: number;
    fatTargetG: number;
    carbTargetG: number;
    waterTargetMl: number;
  } | null>(null);
  const [mealMacros, setMealMacros] = useState({ fatG: 0, carbsG: 0 });
  const [mealPlan, setMealPlan] = useState<MealSlotPlan[]>([]);
  const [reflectionDraft, setReflectionDraft] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [dayPhoto, setDayPhoto] = useState("");
  const [dayTags, setDayTags] = useState<string[]>([]);
  const [trackingTags, setTrackingTags] = useState(parseTrackingTags(null));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [weekLogged, setWeekLogged] = useState<string[]>([]);
  const [selfcare, setSelfcare] = useState<string[]>([]);
  const [home, setHome] = useState<string[]>([]);
  const [dayTasks, setDayTasks] = useState<DayTask[]>([]);
  const [eveningRitual, setEveningRitual] = useState<string[]>([]);
  const [lifeActions, setLifeActions] = useState<Record<string, string[]>>({});
  const [shopping, setShopping] = useState<ShopItem[]>([]);
  const [lifeSuggestions, setLifeSuggestions] = useState<LifeSuggestion[]>([]);
  const [mediaPicks, setMediaPicks] = useState<ReturnType<typeof pickMedia> | null>(null);
  const [recipePicks, setRecipePicks] = useState<import("@/lib/recipes-catalog").RecipeCard[]>([]);
  const [placePicks, setPlacePicks] = useState<import("@/lib/places-catalog").PlaceSpot[]>([]);
  const [leisureQuizJson, setLeisureQuizJson] = useState("{}");
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(parseStyleProfile(null));

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18) setTab("more");
  }, []);

  useEffect(() => {
    Promise.all([
      apiClient("/api/coach"),
      apiClient("/api/analytics?days=7"),
      apiClient("/api/daily?days=3"),
    ]).then(async ([coachRes, analyticsRes, dailyRes]) => {
        const coach = await coachRes.json();
        setProfile(coach.profile);
        setTrackingTags(parseTrackingTags(coach.profile?.trackingTagsJson));
        const totals = coach.plan?.nutritionFramework?.totalsFromMeals;
        if (totals) {
          setAutoNutrition({ calories: totals.calories, proteinG: totals.proteinG });
          setMealMacros({ fatG: totals.fatG ?? 0, carbsG: totals.carbsG ?? 0 });
        }
        if (coach.plan?.dayTargets) setDayTargets(coach.plan.dayTargets);
        if (coach.plan?.mealPlan) setMealPlan(coach.plan.mealPlan);
        if (coach.plan?.lifeSuggestions) setLifeSuggestions(coach.plan.lifeSuggestions);
        if (coach.plan?.mediaPicks) setMediaPicks(coach.plan.mediaPicks);
        if (coach.plan?.recipePicks) setRecipePicks(coach.plan.recipePicks);
        if (coach.plan?.placePicks) setPlacePicks(coach.plan.placePicks);
        if (coach.profile?.leisureQuizJson) setLeisureQuizJson(coach.profile.leisureQuizJson);
        if (coach.profile?.styleJson) setStyleProfile(parseStyleProfile(coach.profile.styleJson));

        const t = coach.todayLog;
        if (t) {
          setLog({
            weightKg: t.weightKg ?? undefined,
            waistCm: t.waistCm ?? undefined,
            waterMl: t.waterMl ?? 0,
          steps: t.steps ?? undefined,
            sleepMinutes: t.sleepMinutes ?? undefined,
            sleepQuality: t.sleepQuality ?? 7,
            energy: t.energy ?? 7,
            mood: t.mood ?? 7,
            stress: t.stress ?? 5,
            thyroidMedTaken: t.thyroidMedTaken ?? false,
            workoutCompleted: t.workouts?.[0]?.completed ?? false,
            notes: t.notes ?? "",
          });
          setDayPhoto(t.dayPhoto ?? "");
          setDayTags(parseDayTags(t.dayTagsJson));
          try {
            const la = JSON.parse(t.lifeActionsJson || "{}");
            const leisure = JSON.parse(t.leisureJson || "[]");
            const intellect = JSON.parse(t.intellectJson || "[]");
            setWins(payloadToWins(la, leisure, intellect));
            setSelfcare(la.selfcare ?? []);
            setHome(la.home ?? []);
            setLifeActions(la);
            setEveningRitual(la.ritual ?? []);
            if (t.workSatisfaction) setWorkSatisfaction(t.workSatisfaction);
          } catch {
            setWins([]);
          }
          let todayTasks = parseDayTasks(t.tasksJson);
          if (dailyRes.ok) {
            const logs = (await dailyRes.json()) as {
              date: string;
              tasksJson?: string;
            }[];
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const past = logs.filter((l) => String(l.date).slice(0, 10) !== todayStr);
            const yesterday = past[past.length - 1];
            if (yesterday) {
              todayTasks = carryOverTasks(
                parseDayTasks(yesterday.tasksJson),
                todayTasks,
              );
            }
          }
          setDayTasks(todayTasks);
          setShopping(parseShopping(t.shoppingJson));
        }

        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          const days = (analytics.logs ?? [])
            .filter(
              (l: { mood?: number; weightKg?: number; energy?: number }) =>
                l.mood != null || l.weightKg != null || l.energy != null,
            )
            .map((l: { date: string }) => String(l.date).slice(0, 10));
          setWeekLogged(days);
        }
      },
    );
  }, []);

  const update = (patch: Partial<LogData>) => setLog((l) => ({ ...l, ...patch }));

  const toggleWin = (id: string) => {
    hapticLight();
    setWins((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev,
    );
  };

  const toggleDayTag = (id: string) => {
    setDayTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const waterTarget = dayTargets?.waterTargetMl ?? profile?.waterTargetMl ?? 2000;
  const calTarget = dayTargets?.calorieTarget ?? profile?.calorieTarget ?? 1600;
  const proteinTarget = dayTargets?.proteinTargetG ?? profile?.proteinTargetG ?? 120;

  const handleSelfcareChange = (next: string[]) => {
    setSelfcare(next);
    setDayTags((prev) => syncCareTags(next, home, prev));
  };

  const handleHomeChange = (next: string[]) => {
    setHome(next);
    setDayTags((prev) => syncCareTags(selfcare, next, prev));
  };

  const save = async () => {
    setSaving(true);
    const { lifeActions, leisure, intellect } = winsToPayload(wins);
    lifeActions.selfcare = [...new Set([...(lifeActions.selfcare ?? []), ...selfcare])];
    lifeActions.home = [...new Set([...(lifeActions.home ?? []), ...home])];
    lifeActions.ritual = eveningRitual;
    await apiClient("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        ...log,
        calories: autoNutrition.calories,
        proteinG: autoNutrition.proteinG,
        dayPhoto,
        dayTags,
        workouts: log.workoutCompleted
          ? [{ type: "walk", durationMin: 30, intensity: "moderate", completed: true, notes: "" }]
          : [],
        lifeActions,
        leisure,
        intellect,
        workSatisfaction,
        tasks: dayTasks,
        shopping,
      }),
    });
    setSaving(false);
    setSaved(true);
    hapticSuccess();
    setWeekLogged((prev) => {
      const today = format(new Date(), "yyyy-MM-dd");
      return prev.includes(today) ? prev : [...prev, today];
    });
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return <div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>;

  const moodMatch = MOOD_VISUAL.find(
    (m) => m.energy === log.energy && m.mood === log.mood && m.stress === log.stress,
  );

  const isEvening = new Date().getHours() >= 18;

  return (
    <div className="space-y-4 pb-8">
      <div className="vc-glass-card rounded-2xl p-4">
        <p className="text-[12px] font-medium text-[var(--text-secondary)] mb-3">Неделя в дневнике</p>
        <WeekDots loggedDays={weekLogged} />
      </div>

      {autoNutrition.calories != null && (
        <IconCard icon={Flame} iconColor={CARD_ICON} title="Калории" subtitle="Как в Lifesum — план vs цель">
          <CalorieRing
            consumed={autoNutrition.calories}
            target={calTarget}
            protein={autoNutrition.proteinG}
            proteinTarget={proteinTarget}
          />
          <MacroBars
            protein={autoNutrition.proteinG ?? 0}
            proteinTarget={proteinTarget}
            fat={mealMacros.fatG}
            fatTarget={dayTargets?.fatTargetG ?? 55}
            carbs={mealMacros.carbsG}
            carbTarget={dayTargets?.carbTargetG ?? 120}
          />
          {mealPlan.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-tertiary)] mb-2 uppercase">По приёмам</p>
              <MealSlotBars slots={mealSlotsFromPlan(mealPlan, calTarget)} />
            </div>
          )}
          <Link href="/" className="text-[12px] text-[var(--accent)] mt-3 inline-block">
            Изменить еду на «Сегодня» →
          </Link>
        </IconCard>
      )}

      <IconCard icon={Trophy} iconColor={CARD_ICON} title="План vs факт" subtitle="Цель коуча на сегодня">
        <PlanVsFact
          planCalories={autoNutrition.calories}
          planProtein={autoNutrition.proteinG}
          targetCalories={calTarget}
          targetProtein={proteinTarget}
          sleepMin={log.sleepMinutes}
          sleepTargetMin={profile.sleepTargetMin}
          waterMl={log.waterMl}
          waterTarget={waterTarget}
        />
      </IconCard>

      <IconCard icon={Camera} iconColor={CARD_ICON} title="Фото дня" subtitle="Daylio-style — один кадр на день">
        <DayPhotoUpload photo={dayPhoto} onChange={setDayPhoto} />
      </IconCard>

      <IconCard icon={Tags} iconColor={CARD_ICON} title="Плашки дня" subtitle="Здоровье · уход · быт · настроение">
        <DayTrackerTags tags={trackingTags} selected={dayTags} onToggle={toggleDayTag} />
      </IconCard>

      <IconCard icon={Sparkles} iconColor={CARD_ICON} title="Уход и быт" subtitle="Маска, массаж, уборка — без идеала">
        <CareHomePanel
          selfcare={selfcare}
          home={home}
          onSelfcareChange={handleSelfcareChange}
          onHomeChange={handleHomeChange}
        />
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <HomeSprintTimer
            onComplete={() => {
              if (!home.includes("clean_15")) handleHomeChange([...home, "clean_15"]);
            }}
          />
        </div>
      </IconCard>

      <SegmentTabs
        tabs={[
          { id: "quick", label: "Быстро" },
          { id: "tasks", label: "Дела" },
          { id: "life", label: "Жизнь" },
          { id: "more", label: isEvening ? "Вечер" : "Подробнее" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "tasks" && (
        <>
          <IconCard icon={Briefcase} iconColor={CARD_ICON} title="Дела" subtitle="Список · канбан · фокус 25 мин">
            <TaskTrackerPanel tasks={dayTasks} onChange={setDayTasks} />
          </IconCard>
          <IconCard icon={Briefcase} iconColor={CARD_ICON} title="Бэклог" subtitle="Долгие проекты — перенос на сегодня">
            <BacklogPanel onMoveToToday={(t) => setDayTasks((prev) => [...prev, t])} />
          </IconCard>
        </>
      )}

      {tab === "life" && (
        <>
          <LeisureQuizCard
            initial={parseLeisureQuiz(leisureQuizJson)}
            onSave={async (answers) => {
              await apiClient("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leisureQuizJson: JSON.stringify(answers) }),
              });
              setLeisureQuizJson(JSON.stringify(answers));
              const c = await apiClient("/api/coach");
              const d = await c.json();
              setLifeSuggestions(d.plan?.lifeSuggestions ?? []);
              setMediaPicks(d.plan?.mediaPicks ?? null);
              setPlacePicks(d.plan?.placePicks ?? []);
            }}
          />
          <IconCard icon={Compass} iconColor={CARD_ICON} title="Жизнь" subtitle="Идеи на сегодня">
            <LifeDiscoverPanel
              suggestions={lifeSuggestions}
              showCatalog
              onAddTask={(task) => setDayTasks((prev) => [...prev, task])}
            />
          </IconCard>
          {placePicks.length > 0 && <PlacesCard places={placePicks} />}
          {mediaPicks && <MediaPicksCard media={mediaPicks} />}
          {recipePicks.length > 0 && <RecipesCard recipes={recipePicks} />}
          <IconCard icon={Compass} iconColor={CARD_ICON} title="Стиль" subtitle="Капсула и тип фигуры">
            <StyleCapsuleCard
              profile={styleProfile}
              onChange={setStyleProfile}
              onSave={async () => {
                await apiClient("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ styleJson: JSON.stringify(styleProfile) }),
                });
              }}
            />
          </IconCard>
          <IconCard icon={Briefcase} iconColor={CARD_ICON} title="Покупки" subtitle="Что купить · что убрать">
            <ShoppingPanel items={shopping} onChange={setShopping} />
          </IconCard>
        </>
      )}

      {tab === "quick" && (
        <>
          <IconCard icon={Smile} iconColor={CARD_ICON} title="Самочувствие" subtitle="Влияет на план завтра">
            <div className="flex justify-between gap-1 mb-4">
              {MOOD_VISUAL.map((preset) => {
                const active = moodMatch?.label === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      update({ energy: preset.energy, mood: preset.mood, stress: preset.stress });
                    }}
                    className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
                      active
                        ? "bg-[var(--accent)] shadow-md scale-105"
                        : "bg-[var(--bg-subtle)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <span className="text-[26px] leading-none">{preset.emoji}</span>
                    <span
                      className={`text-[8px] font-semibold mt-1 ${active ? "text-white" : "text-[var(--text-secondary)]"}`}
                    >
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              <SliderField label="Энергия" value={log.energy ?? 7} onChange={(v) => update({ energy: v })} />
              <SliderField label="Настроение" value={log.mood ?? 7} onChange={(v) => update({ mood: v })} />
            </div>
          </IconCard>

          <IconCard icon={Scale} iconColor={CARD_ICON} title="Вес" subtitle={format(new Date(), "d MMMM")}>
            <input
              type="number"
              step={0.1}
              className="apple-input text-center text-[24px] font-bold"
              placeholder="—"
              value={log.weightKg ?? ""}
              onChange={(e) =>
                update({ weightKg: e.target.value ? parseFloat(e.target.value) : undefined })
              }
            />
            <p className="text-[11px] text-center text-[var(--text-secondary)] mt-1">кг</p>
          </IconCard>

          <IconCard icon={Footprints} iconColor={CARD_ICON} title="Шаги" subtitle="Ручной ввод · позже синк с часами">
            <input
              type="number"
              step={100}
              className="apple-input text-center text-[20px] font-bold"
              placeholder="8000"
              value={log.steps ?? ""}
              onChange={(e) =>
                update({ steps: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
            <div className="flex gap-2 mt-2 justify-center">
              {[2000, 5000, 8000, 10000].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-subtle)]"
                  onClick={() => update({ steps: n })}
                >
                  {n / 1000}k
                </button>
              ))}
            </div>
          </IconCard>

          <IconCard icon={Droplets} iconColor={CARD_ICON} title="Вода" subtitle={`Цель ~${waterTarget} мл`}>
            <div className="flex gap-2 mb-3 justify-center">
              {[200, 250, 500].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  className="flex flex-col items-center rounded-2xl px-4 py-2 bg-[var(--accent-soft)] hover:bg-[var(--accent)]/20 transition-colors"
                  onClick={() => update({ waterMl: (log.waterMl ?? 0) + ml })}
                >
                  <Droplets size={18} className="text-[var(--accent)]" />
                  <span className="text-[11px] font-bold mt-0.5">+{ml}</span>
                </button>
              ))}
            </div>
            <ProgressBar value={log.waterMl ?? 0} max={waterTarget} label="Вода" />
            <p className="text-[10px] text-[var(--text-tertiary)] mt-2 text-center">
              Чай и еда тоже считаются — не нужно «доливать до 3 л»
            </p>
          </IconCard>

          <IconCard icon={Trophy} iconColor={CARD_ICON} title="Победы дня" subtitle="До 5">
            <div className="flex flex-wrap gap-2">
              {DAILY_WINS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWin(w.id)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-all ${
                    wins.includes(w.id)
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-subtle)] text-[var(--text)] border border-[var(--border)]"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </IconCard>

          {profile.hypothyroidism && (
            <IconCard icon={Pill} iconColor={CARD_ICON} title="Тироксин">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={log.thyroidMedTaken}
                  onChange={(e) => update({ thyroidMedTaken: e.target.checked })}
                  className="w-5 h-5 accent-[var(--accent)]"
                />
                <span className="text-[14px]">Приняла натощак</span>
              </label>
            </IconCard>
          )}

          <label className="flex items-center gap-3 vc-glass-card rounded-2xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={log.workoutCompleted}
              onChange={(e) => update({ workoutCompleted: e.target.checked })}
              className="w-5 h-5 accent-[var(--accent)]"
            />
            <CheckCircle2
              size={20}
              className={log.workoutCompleted ? "text-[var(--success)]" : "text-[var(--text-tertiary)]"}
            />
            <span className="text-[14px]">Движение из «Сегодня» сделала</span>
          </label>
        </>
      )}

      {tab === "more" && (
        <>
          <IconCard icon={Moon} iconColor={CARD_ICON} title="Сон и вечер" subtitle="Закрой день за 2 минуты">
            <input
              type="number"
              className="apple-input mb-3"
              placeholder="Минут сна"
              value={log.sleepMinutes ?? ""}
              onChange={(e) =>
                update({
                  sleepMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
            />
            <SliderField
              label="Качество сна"
              value={log.sleepQuality ?? 7}
              onChange={(v) => update({ sleepQuality: v })}
            />
            <SliderField label="Стресс" value={log.stress ?? 5} onChange={(v) => update({ stress: v })} />
          </IconCard>

          <IconCard icon={Scale} iconColor={CARD_ICON} title="Замеры">
            <label>
              <span className="text-[13px] text-[var(--text-secondary)]">Талия, см</span>
              <input
                type="number"
                className="apple-input mt-1"
                value={log.waistCm ?? ""}
                onChange={(e) =>
                  update({ waistCm: e.target.value ? parseFloat(e.target.value) : undefined })
                }
              />
            </label>
          </IconCard>

          <IconCard icon={Smile} iconColor={CARD_ICON} title="Работа">
            <SliderField
              label="Удовлетворённость"
              value={workSatisfaction}
              onChange={setWorkSatisfaction}
            />
          </IconCard>

          <IconCard icon={Droplets} iconColor={CARD_ICON} title="Цикл">
            <button
              type="button"
              className="apple-btn apple-btn-secondary w-full"
              onClick={async () => {
                await apiClient("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ lastPeriodStart: format(new Date(), "yyyy-MM-dd") }),
                });
              }}
            >
              Начались месячные сегодня
            </button>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-2 text-center">
              Длина цикла — в Профиле
            </p>
          </IconCard>

          <EveningRitualCard
            done={eveningRitual}
            onToggle={(id) => {
              setEveningRitual((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              );
            }}
          />

          <IconCard icon={Smile} iconColor={CARD_ICON} title="Вечерняя рефлексия" subtitle="Как Apple Health — 3 вопроса">
            <div className="flex gap-2 mb-3">
              {EVENING_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActivePrompt(p.id);
                    setReflectionDraft("");
                  }}
                  className={`flex-1 rounded-xl py-2 text-[11px] font-semibold ${
                    activePrompt === p.id
                      ? "bg-[var(--purple-soft)] text-[var(--purple)]"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {activePrompt && (
              <div className="flex gap-2 mb-3">
                <input
                  className="apple-input flex-1"
                  placeholder="Коротко…"
                  value={reflectionDraft}
                  onChange={(e) => setReflectionDraft(e.target.value)}
                />
                <button
                  type="button"
                  className="apple-btn apple-btn-secondary px-3"
                  onClick={() => {
                    update({
                      notes: appendReflection(log.notes ?? "", activePrompt, reflectionDraft),
                    });
                    setReflectionDraft("");
                    setActivePrompt(null);
                  }}
                >
                  +
                </button>
              </div>
            )}
            <textarea
              className="apple-input min-h-[80px] resize-none"
              value={log.notes ?? ""}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Помогло / мешало / завтра…"
            />
          </IconCard>
        </>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="apple-btn apple-btn-primary w-full py-4 text-[16px]"
      >
        {saving ? "Сохраняю…" : saved ? "Сохранено ✓" : isEvening ? "Закрыть день" : "Сохранить день"}
      </button>
    </div>
  );
}
