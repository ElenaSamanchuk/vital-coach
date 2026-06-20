/**
 * Клиентские обработчики API для standalone-режима (без сервера).
 */
import { addDays } from "date-fns";
import { generateDailyPlan } from "./coach";
import { analyzeWeek } from "./analytics";
import { getCycleDay, getCyclePhase } from "./cycle";
import { startOfDayDate } from "./dates";
import {
  deriveNutritionTargets,
  profileToDerivationInput,
} from "./profile-derivation";
import { computeJourneyProgress, nextRecommendedStep } from "./user-journey";
import { computeForgivingStreak, computeStreak } from "./insights";
import { buildProfileFromAssessment } from "./profile-save";
import { DEFAULT_ASSESSMENT } from "./onboarding-assessment";
import { GENERIC_PROFILE } from "./app-config";
import { parseWellbeingDone } from "./wellbeing-coach";
import { xpFromDailyLog, xpFromLifeActions, xpFromTasks } from "./gamification";
import type { OnboardingAssessment } from "./onboarding-assessment";
import type { Profile } from "@prisma/client";
import * as store from "./local-store";
import { standaloneLifeGet } from "./standalone-life";

const RECALC_KEYS = new Set([
  "currentWeightKg",
  "targetWeightKg",
  "heightCm",
  "birthYear",
  "activityLevel",
  "workActivityLevel",
  "insulinResistance",
  "hypothyroidism",
  "cortisolIssues",
  "pcosSuspected",
  "surgeryRecovery",
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function coachGet(search: URLSearchParams) {
  const profile = await store.ensureProfile();
  const date = startOfDayDate(search.get("date") ?? new Date());
  const todayLog = await store.getDailyLog(date);
  const recentLogs = (await store.getDailyLogs({ from: addDays(date, -21) })).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const labs = (await store.getLabs()).slice(0, 50);
  const plan = generateDailyPlan(profile, todayLog, recentLogs, labs);
  return {
    plan,
    profile,
    todayLog,
    trackingTagsJson: profile.trackingTagsJson || "[]",
  };
}

async function journeyGet() {
  const profile = await store.ensureProfile();
  const logs = await store.getDailyLogs({ limit: 90 });
  const labs = (await store.getLabs()).length;
  const exams = (await store.getExaminations()).length;

  let wheelFilled = false;
  try {
    wheelFilled = Object.keys(JSON.parse(profile.wheelScores || "{}")).length >= 6;
  } catch {
    /* */
  }

  let who5Filled = false;
  let weeklyReviewDone = false;
  try {
    who5Filled = JSON.parse(profile.who5Scores || "{}").cheerful != null;
    const wr = JSON.parse(profile.weeklyReviewJson || "{}");
    weeklyReviewDone = Boolean(wr.wins || wr.nextWeekFocus);
  } catch {
    /* */
  }

  let lifeActionDays = 0;
  let mealChoicesUsed = false;
  for (const l of logs) {
    try {
      const la = JSON.parse(l.lifeActionsJson || "{}") as Record<string, string[]>;
      if (Object.values(la).some((a) => a?.length)) lifeActionDays++;
      if (l.mealChoices && l.mealChoices !== "{}") mealChoicesUsed = true;
    } catch {
      /* */
    }
  }

  const progress = computeJourneyProgress({
    onboardingDone: profile.onboardingDone,
    logCount: logs.length,
    streak: computeStreak(logs.map((l) => new Date(l.date))),
    wheelFilled,
    labCount: labs,
    examCount: exams,
    lifeActionDays,
    who5Filled,
    weeklyReviewDone,
    backupDone: Boolean(profile.lastBackupAt),
    mealChoicesUsed,
  });

  const { streak, freezeUsed } = computeForgivingStreak(logs.map((l) => new Date(l.date)));

  return {
    progress,
    next: nextRecommendedStep(progress.completed),
    relationshipStatus: profile.relationshipStatus,
    streak,
    freezeUsed,
    targetWeightKg: profile.targetWeightKg,
    who5Filled,
  };
}

async function profilePut(body: Record<string, unknown>) {
  const existing = await store.ensureProfile();
  const merged = { ...existing, ...body };
  const needsRecalc =
    Object.keys(body).some((k) => RECALC_KEYS.has(k)) &&
    merged.currentWeightKg &&
    merged.heightCm;
  let patch = { ...body } as Partial<typeof existing>;
  if (needsRecalc) {
    const targets = deriveNutritionTargets(
      profileToDerivationInput(merged as Parameters<typeof profileToDerivationInput>[0]),
    );
    patch = { ...patch, ...targets };
  }
  if (body.onboardingDone !== undefined) patch.onboardingDone = Boolean(body.onboardingDone);
  return await store.saveProfile(patch);
}

async function wheelGet() {
  const profile = await store.ensureProfile();
  const parse = (s: string) => {
    try {
      return JSON.parse(s || "{}");
    } catch {
      return {};
    }
  };
  return {
    wheelScores: parse(profile.wheelScores),
    permaScores: parse(profile.permaScores),
    bigFiveScores: parse(profile.bigFiveScores),
    ikigaiJson: parse(profile.ikigaiJson),
    relationshipStatus: profile.relationshipStatus,
    financeGoal: profile.financeGoal,
    careerGoal: profile.careerGoal,
    who5Scores: parse(profile.who5Scores),
    sdtScores: parse(profile.sdtScores),
    ryffScores: parse(profile.ryffScores),
    coreValuesJson: JSON.parse(profile.coreValuesJson || "[]"),
    weeklyReviewJson: parse(profile.weeklyReviewJson),
  };
}

async function wheelPut(body: Record<string, unknown>) {
  const data: Record<string, string> = {};
  if (body.wheelScores != null) data.wheelScores = JSON.stringify(body.wheelScores);
  if (body.permaScores != null) data.permaScores = JSON.stringify(body.permaScores);
  if (body.bigFiveScores != null) data.bigFiveScores = JSON.stringify(body.bigFiveScores);
  if (body.ikigaiJson != null) data.ikigaiJson = JSON.stringify(body.ikigaiJson);
  if (body.relationshipStatus != null) data.relationshipStatus = body.relationshipStatus as string;
  if (body.financeGoal != null) data.financeGoal = body.financeGoal as string;
  if (body.careerGoal != null) data.careerGoal = body.careerGoal as string;
  if (body.who5Scores != null) data.who5Scores = JSON.stringify(body.who5Scores);
  if (body.sdtScores != null) data.sdtScores = JSON.stringify(body.sdtScores);
  if (body.ryffScores != null) data.ryffScores = JSON.stringify(body.ryffScores);
  if (body.coreValuesJson != null) data.coreValuesJson = JSON.stringify(body.coreValuesJson);
  if (body.weeklyReviewJson != null) data.weeklyReviewJson = JSON.stringify(body.weeklyReviewJson);
  return await store.saveProfile(data as Partial<Profile>);
}

async function dailyPost(body: Record<string, unknown>) {
  const profile = await store.ensureProfile();
  const date = startOfDayDate((body.date as string) ?? new Date());
  const partial = Boolean(body.partial);
  const existing = await store.getDailyLog(date);

  const cycleDay =
    (body.cycleDay as number | undefined) ??
    (profile ? getCycleDay(profile.lastPeriodStart, profile.cycleLength, date) : null);
  const cyclePhase =
    (body.cyclePhase as string | undefined) ??
    (cycleDay ? getCyclePhase(cycleDay, profile?.cycleLength ?? 28) : null);

  const patch: Parameters<typeof store.upsertDailyLog>[1] = {
    partial,
    cycleDay,
    cyclePhase,
    weightKg: body.weightKg as number | undefined,
    waistCm: body.waistCm as number | undefined,
    hipsCm: body.hipsCm as number | undefined,
    chestCm: body.chestCm as number | undefined,
    calories: body.calories as number | undefined,
    proteinG: body.proteinG as number | undefined,
    fatG: body.fatG as number | undefined,
    carbsG: body.carbsG as number | undefined,
    fiberG: body.fiberG as number | undefined,
    waterMl: body.waterMl as number | undefined,
    steps: body.steps as number | undefined,
    sleepMinutes: body.sleepMinutes as number | undefined,
    sleepQuality: body.sleepQuality as number | undefined,
    energy: body.energy as number | undefined,
    mood: body.mood as number | undefined,
    stress: body.stress as number | undefined,
    cortisolFeeling: body.cortisolFeeling as number | undefined,
    postMealWalks: body.postMealWalks as number | undefined,
    thyroidMedTaken: body.thyroidMedTaken as boolean | undefined,
    thyroidMedOnTime: body.thyroidMedOnTime as boolean | undefined,
    supplementsTaken: body.supplementsTaken as boolean | undefined,
    leisureMinutes: body.leisureMinutes as number | undefined,
    workSatisfaction: body.workSatisfaction as number | undefined,
    notes: body.notes as string | undefined,
    dayPhoto: body.dayPhoto as string | undefined,
    softDay: body.softDay as boolean | undefined,
    workoutChoice: body.workoutChoice as string | undefined,
  };

  if (body.mealChoices != null) patch.mealChoices = JSON.stringify(body.mealChoices);
  if (body.leisure != null) patch.leisureJson = JSON.stringify(body.leisure);
  if (body.intellect != null) patch.intellectJson = JSON.stringify(body.intellect);
  if (body.lifeActions != null) patch.lifeActionsJson = JSON.stringify(body.lifeActions);
  if (body.dayTags != null) patch.dayTagsJson = JSON.stringify(body.dayTags);
  if (body.tasks != null) patch.tasksJson = JSON.stringify(body.tasks);
  if (body.shopping != null) patch.shoppingJson = JSON.stringify(body.shopping);
  if (body.workouts != null) patch.workouts = body.workouts as store.StoredDailyLog["workouts"];
  if (body.meals != null) patch.meals = body.meals as store.StoredDailyLog["meals"];
  if (body.habits != null) patch.habits = body.habits as store.StoredDailyLog["habits"];

  const updated = await store.upsertDailyLog(date, patch);

  const xpAdd = xpFromDailyLog({
    proteinG: updated.proteinG,
    proteinTarget: profile.proteinTargetG,
    waterMl: updated.waterMl,
    waterTarget: profile.waterTargetMl,
    sleepMinutes: updated.sleepMinutes,
    sleepTarget: profile.sleepTargetMin,
    workouts: updated.workouts,
    leisureJson: updated.leisureJson,
    intellectJson: updated.intellectJson,
    habits: updated.habits,
    mood: updated.mood,
  });
  const lifeXp = xpFromLifeActions(updated.lifeActionsJson);
  const taskXp = xpFromTasks(updated.tasksJson);
  const mergedXp = { ...lifeXp };
  for (const [k, v] of Object.entries(taskXp)) {
    const key = k as keyof typeof mergedXp;
    mergedXp[key] = (mergedXp[key] ?? 0) + (v ?? 0);
  }
  if (Object.keys(xpAdd).length || Object.keys(mergedXp).length) {
    await store.saveProfile({
      xpBody: profile.xpBody + (xpAdd.body ?? 0),
      xpFuel: profile.xpFuel + (xpAdd.fuel ?? 0),
      xpMind: profile.xpMind + (xpAdd.mind ?? 0) + (mergedXp.mind ?? 0),
      xpSoul: profile.xpSoul + (xpAdd.soul ?? 0) + (mergedXp.soul ?? 0),
      xpEnergy: profile.xpEnergy + (xpAdd.energy ?? 0),
      xpBalance: profile.xpBalance + (xpAdd.balance ?? 0) + (mergedXp.balance ?? 0),
      xpCareer: profile.xpCareer + (mergedXp.career ?? 0),
      xpFinance: profile.xpFinance + (mergedXp.finance ?? 0),
      xpRelations: profile.xpRelations + (mergedXp.relations ?? 0),
    } as Partial<Profile>);
  }

  return updated;
}

export async function handleStandaloneApi(path: string, init?: RequestInit): Promise<Response> {
  const url = new URL(path, "http://local");
  const method = (init?.method ?? "GET").toUpperCase();
  let body: Record<string, unknown> = {};
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }

  try {
    if (path.startsWith("/api/coach") && method === "GET") {
      return json(await coachGet(url.searchParams));
    }
    if (path.startsWith("/api/journey") && method === "GET") {
      return json(await journeyGet());
    }
    if (path.startsWith("/api/profile") && method === "GET") {
      return json(await store.ensureProfile());
    }
    if (path.startsWith("/api/profile") && method === "PUT") {
      return json(await profilePut(body));
    }
    if (path.startsWith("/api/wheel") && method === "GET") {
      return json(await wheelGet());
    }
    if (path.startsWith("/api/wheel") && method === "PUT") {
      return json(await wheelPut(body));
    }
    if (path.startsWith("/api/daily") && method === "GET") {
      const days = parseInt(url.searchParams.get("days") ?? "14", 10);
      const from = startOfDayDate(addDays(new Date(), -days));
      const logs = (await store.getDailyLogs({ from })).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      return json(logs);
    }
    if (path.startsWith("/api/daily") && method === "POST") {
      return json(await dailyPost(body));
    }
    if (path.startsWith("/api/analytics") && method === "GET") {
      const days = parseInt(url.searchParams.get("days") ?? "7", 10);
      const profile = await store.ensureProfile();
      const logs = (await store.getDailyLogs({ from: addDays(new Date(), -days) })).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      return json({ insights: analyzeWeek(logs, profile), logs });
    }
    if (path.startsWith("/api/life") && method === "GET") {
      return json(await standaloneLifeGet());
    }
    if (path.startsWith("/api/labs") && method === "GET") {
      return json(await store.getLabs());
    }
    if (path.startsWith("/api/labs") && method === "POST") {
      return json(await store.addLab(body as Parameters<typeof store.addLab>[0]));
    }
    if (path.startsWith("/api/labs") && method === "DELETE") {
      const id = url.searchParams.get("id");
      if (id) await store.deleteLab(id);
      return json({ ok: true });
    }
    if (path.startsWith("/api/examinations") && method === "GET") {
      return json(await store.getExaminations());
    }
    if (path.startsWith("/api/examinations") && method === "POST") {
      return json(await store.addExamination(body as Parameters<typeof store.addExamination>[0]));
    }
    if (path.startsWith("/api/choices") && method === "POST") {
      const date = startOfDayDate((body.date as string) ?? new Date());
      const existing = await store.getDailyLog(date);
      let mealChoicesObj: Record<string, string> = {};
      try {
        mealChoicesObj = JSON.parse(
          body.mealChoices != null
            ? JSON.stringify(body.mealChoices)
            : (existing?.mealChoices ?? "{}"),
        ) as Record<string, string>;
      } catch {
        mealChoicesObj = {};
      }
      delete mealChoicesObj._softDay;
      return json(
        await store.upsertDailyLog(date, {
          partial: true,
          mealChoices: JSON.stringify(mealChoicesObj),
          workoutChoice: (body.workoutChoice as string) ?? existing?.workoutChoice ?? "",
          softDay: body.softDay === true,
        }),
      );
    }
    if (path.startsWith("/api/wellbeing") && method === "POST") {
      const actionId = body.actionId as string;
      const date = startOfDayDate((body.date as string) ?? new Date());
      const existing = await store.getDailyLog(date);
      let lifeActions: Record<string, string[]> = {};
      try {
        lifeActions = JSON.parse(existing?.lifeActionsJson || "{}") as Record<string, string[]>;
      } catch {
        lifeActions = {};
      }
      const wellbeing = lifeActions.wellbeing ?? [];
      lifeActions.wellbeing = wellbeing.includes(actionId)
        ? wellbeing.filter((id) => id !== actionId)
        : [...wellbeing, actionId];
      const log = await store.upsertDailyLog(date, {
        partial: true,
        lifeActionsJson: JSON.stringify(lifeActions),
      });
      return json({ done: parseWellbeingDone(log.lifeActionsJson) });
    }
    if (path.startsWith("/api/checkin") && method === "POST") {
      const date = startOfDayDate((body.date as string) ?? new Date());
      const existing = await store.getDailyLog(date);
      return json(
        await store.upsertDailyLog(date, {
          partial: true,
          energy: (body.energy as number) ?? existing?.energy,
          mood: (body.mood as number) ?? existing?.mood,
          stress: (body.stress as number) ?? existing?.stress,
          weightKg: (body.weightKg as number) ?? existing?.weightKg,
        }),
      );
    }
    if (path.startsWith("/api/onboarding/quick-start") && method === "POST") {
      const data = buildProfileFromAssessment({
        ...DEFAULT_ASSESSMENT,
        ...GENERIC_PROFILE,
        name: "",
      });
      await store.saveProfile(data as Partial<Profile>);
      return json({ ok: true });
    }
    if (path.startsWith("/api/onboarding/complete") && method === "POST") {
      const data = buildProfileFromAssessment(body as unknown as OnboardingAssessment);
      await store.saveProfile(data as Partial<Profile>);
      return json({ ok: true, onboardingDone: true });
    }
    if (path.startsWith("/api/backup/import") && method === "POST") {
      await store.importBackup(body as store.BackupPayload);
      await store.markBackupDone();
      return json({ ok: true });
    }
    if (path.startsWith("/api/backup") && method === "GET") {
      const payload = await store.exportBackup();
      await store.markBackupDone();
      const text = JSON.stringify(payload, null, 2);
      return new Response(text, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="vital-backup-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }
    return json({ error: "Not found", path, method }, 404);
  } catch (e) {
    console.error("standalone api error:", path, e);
    return json({ error: "Standalone API failed" }, 500);
  }
}
