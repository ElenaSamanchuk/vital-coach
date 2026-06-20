import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  computeStats,
  evaluateAchievements,
  emptyXp,
  totalLevel,
  type XpState,
} from "@/lib/gamification";
import { computeStreak } from "@/lib/insights";
import { countActivityInLogs } from "@/lib/leisure";
import { getConditionMatrix } from "@/lib/health-matrix";
import { buildLifeCoachReport } from "@/lib/sphere-coach";
import type { WheelScores, RelationshipStatus } from "@/lib/life-spheres";
import { getWheelAverage } from "@/lib/life-spheres";
import type { PermaScore, BigFiveTrait, SdtScore, Who5Score, RyffScore } from "@/lib/psychology-frameworks";
import { buildHolisticLifePlan, computeLifeLogSignals } from "@/lib/life-synthesis";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id },
    include: { workouts: true, habits: true },
    orderBy: { date: "desc" },
    take: 90,
  });

  const labs = await prisma.labResult.count({ where: { userId: user.id } });

  const xp: XpState = {
    body: profile.xpBody,
    fuel: profile.xpFuel,
    mind: profile.xpMind,
    soul: profile.xpSoul,
    energy: profile.xpEnergy,
    balance: profile.xpBalance,
  };

  const stats = computeStats(xp);
  const avatarLevel = totalLevel(stats);

  let unlocked: string[] = [];
  try {
    unlocked = JSON.parse(profile.unlockedAchievements || "[]");
  } catch {
    unlocked = [];
  }

  const proteinDays = logs.filter(
    (l) => l.proteinG && l.proteinG >= profile.proteinTargetG * 0.85,
  ).length;
  const waterDays = logs.filter(
    (l) => l.waterMl && l.waterMl >= profile.waterTargetMl * 0.8,
  ).length;
  const leisureDays = logs.filter((l) => {
    try {
      return (JSON.parse(l.leisureJson || "[]") as string[]).length > 0;
    } catch {
      return false;
    }
  }).length;

  const firstWaist = [...logs].reverse().find((l) => l.waistCm)?.waistCm;
  const latestWaist = logs[0]?.waistCm;
  const waistDelta =
    firstWaist && latestWaist ? latestWaist - firstWaist : null;

  const countLifeActionDays = (key: string) =>
    logs.filter((l) => {
      try {
        const a = JSON.parse(l.lifeActionsJson || "{}") as Record<string, string[]>;
        return (a[key]?.length ?? 0) > 0;
      } catch {
        return false;
      }
    }).length;

  let weeklyReviewDone = false;
  try {
    const wr = JSON.parse(profile.weeklyReviewJson || "{}");
    weeklyReviewDone = Boolean(wr.wins || wr.nextWeekFocus);
  } catch {
    /* */
  }

  let wheelFilled = false;
  try {
    const w = JSON.parse(profile.wheelScores || "{}");
    wheelFilled = Object.keys(w).length >= 8;
  } catch {
    /* */
  }

  const achievements = evaluateAchievements(unlocked, {
    logCount: logs.length,
    streak: computeStreak(logs.map((l) => l.date)),
    proteinDays,
    waterDays,
    poolCount: countActivityInLogs(logs, "pool") + logs.filter((l) => l.workouts?.some((w) => w.type === "pool" && w.completed)).length,
    bikeCount: countActivityInLogs(logs, "bike") + logs.filter((l) => l.workouts?.some((w) => w.type === "bike" && w.completed)).length,
    yogaCount: countActivityInLogs(logs, "yoga") + logs.filter((l) => l.workouts?.some((w) => w.type === "yoga" && w.completed)).length,
    chessCount: countActivityInLogs(logs, "chess"),
    englishCount: countActivityInLogs(logs, "english"),
    codeCount: countActivityInLogs(logs, "programming"),
    leisureDays,
    waistDelta,
    labCount: labs,
    pcosWeekOk: profile.pcosSuspected && proteinDays >= 5 && waterDays >= 5,
    minimumDayLogged: logs.some((l) => (l.stress ?? 0) >= 7 && l.calories),
    financeActionDays: countLifeActionDays("finance"),
    careerActionDays: countLifeActionDays("work"),
    relationsActionDays: countLifeActionDays("relations"),
    wheelFilled,
    weeklyReviewDone,
  });

  const newlyUnlocked = achievements.filter((a) => a.unlocked && !unlocked.includes(a.id)).map((a) => a.id);
  if (newlyUnlocked.length) {
    await prisma.profile.update({
      where: { userId: user.id },
      data: { unlockedAchievements: JSON.stringify([...unlocked, ...newlyUnlocked]) },
    });
  }

  const matrix = getConditionMatrix({
    insulinResistance: profile.insulinResistance,
    hypothyroidism: profile.hypothyroidism,
    cortisolIssues: profile.cortisolIssues,
    vitaminDDeficiency: profile.vitaminDDeficiency,
    b12Deficiency: profile.b12Deficiency,
    hormoneIssues: profile.hormoneIssues,
    pcosSuspected: profile.pcosSuspected,
    surgeryRecovery: profile.surgeryRecovery,
    pcos: profile.pcosSuspected,
    endometriosis: profile.endometriosis,
    vitaminAbsorption: profile.vitaminAbsorption,
  });

  const radar = stats.map((s) => ({
    label: s.label,
    value: s.progress,
    color: s.color,
  }));

  const parseJson = <T,>(s: string, fallback: T): T => {
    try {
      return JSON.parse(s || "null") ?? fallback;
    } catch {
      return fallback;
    }
  };

  const wheelScores = parseJson<WheelScores>(profile.wheelScores, {});
  const perma = parseJson<PermaScore | null>(profile.permaScores, null);
  const bigFive = parseJson<Record<BigFiveTrait, number> | null>(profile.bigFiveScores, null);
  const avgStress =
    logs.filter((l) => l.stress).reduce((s, l) => s + (l.stress ?? 0), 0) /
    Math.max(logs.filter((l) => l.stress).length, 1);

  const sdt = parseJson<SdtScore | null>(profile.sdtScores, null);
  const who5 = parseJson<Who5Score | null>(profile.who5Scores, null);
  const ryff = parseJson<RyffScore | null>(profile.ryffScores, null);
  const signals = computeLifeLogSignals(logs);

  const coachReport = buildLifeCoachReport({
    wheelScores,
    perma,
    bigFive,
    occupation: profile.occupation,
    relationshipStatus: profile.relationshipStatus as RelationshipStatus,
    pcos: profile.pcosSuspected,
    avgStress: avgStress || 5,
  });

  const holisticPlan = buildHolisticLifePlan({
    wheelScores,
    perma,
    sdt,
    who5,
    ryff,
    bigFive,
    signals,
    healthFlags: {
      pcos: profile.pcosSuspected,
      hypothyroidism: profile.hypothyroidism,
      cortisolIssues: profile.cortisolIssues,
      endometriosis: profile.endometriosis,
    },
    relationshipStatus: profile.relationshipStatus,
    careerGoal: profile.careerGoal,
    financeGoal: profile.financeGoal,
  });

  const extendedXp = [
    { key: "career", label: "Карьера", xp: profile.xpCareer, emoji: "💼", color: "#5856d6" },
    { key: "finance", label: "Финансы", xp: profile.xpFinance, emoji: "💰", color: "#34c759" },
    { key: "relations", label: "Связи", xp: profile.xpRelations, emoji: "🤝", color: "#ff9500" },
  ];

  return NextResponse.json({
    stats,
    extendedXp,
    avatarLevel,
    totalXp:
      Object.values(xp).reduce((a, b) => a + b, 0) +
      profile.xpCareer +
      profile.xpFinance +
      profile.xpRelations,
    achievements,
    matrix,
    radar,
    wheelScores,
    wheelAverage: getWheelAverage(wheelScores),
    perma,
    bigFive,
    coachReport,
    holisticPlan,
    sdt,
    who5,
    ryff,
    profile: {
      name: profile.name,
      occupation: profile.occupation,
      workActivityLevel: profile.workActivityLevel,
      relationshipStatus: profile.relationshipStatus,
      financeGoal: profile.financeGoal,
      careerGoal: profile.careerGoal,
      ikigaiJson: parseJson(profile.ikigaiJson, {}),
    },
    unlockedCount: achievements.filter((a) => a.unlocked).length,
    totalAchievements: achievements.length,
  });
  } catch (e) {
    console.error("GET /api/life error:", e);
    return NextResponse.json({ error: "Life API failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const add: Partial<XpState> = body.xpAdd ?? {};
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      xpBody: profile.xpBody + (add.body ?? 0),
      xpFuel: profile.xpFuel + (add.fuel ?? 0),
      xpMind: profile.xpMind + (add.mind ?? 0),
      xpSoul: profile.xpSoul + (add.soul ?? 0),
      xpEnergy: profile.xpEnergy + (add.energy ?? 0),
      xpBalance: profile.xpBalance + (add.balance ?? 0),
    },
  });

  return NextResponse.json({ ok: true });
}
