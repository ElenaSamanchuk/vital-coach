import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db";
import { generateDailyPlan } from "@/lib/coach";
import { requireUser } from "@/lib/session";
import { startOfDayDate } from "@/lib/dates";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const date = startOfDayDate(dateStr ?? new Date());

  let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.profile.create({ data: { userId: user.id } });
  }

  const todayLog = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: user.id, date } },
    include: { habits: true, workouts: true, meals: true },
  });

  const recentLogs = await prisma.dailyLog.findMany({
    where: {
      userId: user.id,
      date: { gte: addDays(date, -21) },
    },
    include: { habits: true, workouts: true },
    orderBy: { date: "desc" },
  });

  const labs = await prisma.labResult.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 50,
  });

  const plan = generateDailyPlan(profile, todayLog, recentLogs, labs);

  let trackingTagsJson = "[]";
  try {
    trackingTagsJson = profile.trackingTagsJson || "[]";
  } catch {
    /* */
  }

  return NextResponse.json({ plan, profile, todayLog, trackingTagsJson });
}
