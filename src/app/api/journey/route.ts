import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeJourneyProgress, nextRecommendedStep } from "@/lib/user-journey";
import { computeForgivingStreak, computeStreak } from "@/lib/insights";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, logs, labs, exams] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.dailyLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 90,
    }),
    prisma.labResult.count({ where: { userId: user.id } }),
    prisma.examination.count({ where: { userId: user.id } }),
  ]);

  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  let wheelFilled = false;
  try {
    const w = JSON.parse(profile.wheelScores || "{}");
    wheelFilled = Object.keys(w).length >= 6;
  } catch {
    /* */
  }

  let who5Filled = false;
  let weeklyReviewDone = false;
  try {
    const who = JSON.parse(profile.who5Scores || "{}");
    who5Filled = who.cheerful != null;
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
    streak: computeStreak(logs.map((l) => l.date)),
    wheelFilled,
    labCount: labs,
    examCount: exams,
    lifeActionDays,
    who5Filled,
    weeklyReviewDone,
    backupDone: Boolean(profile.lastBackupAt),
    mealChoicesUsed,
  });

  const { streak, freezeUsed } = computeForgivingStreak(logs.map((l) => l.date));

  return NextResponse.json({
    progress,
    next: nextRecommendedStep(progress.completed),
    relationshipStatus: profile.relationshipStatus,
    streak,
    freezeUsed,
    targetWeightKg: profile.targetWeightKg,
    who5Filled,
  });
}
