import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDayDate } from "@/lib/dates";
import { getCycleDay, getCyclePhase } from "@/lib/cycle";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const date = startOfDayDate(body.date ?? new Date());

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const cycleDay = profile
    ? getCycleDay(profile.lastPeriodStart, profile.cycleLength, date)
    : null;
  const cyclePhase = cycleDay ? getCyclePhase(cycleDay, profile?.cycleLength ?? 28) : null;

  const existing = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  let mealChoicesObj: Record<string, string> = {};
  try {
    mealChoicesObj = JSON.parse(
      body.mealChoices != null ? JSON.stringify(body.mealChoices) : existing?.mealChoices ?? "{}",
    ) as Record<string, string>;
  } catch {
    mealChoicesObj = {};
  }
  delete mealChoicesObj._softDay;
  const mealChoices = JSON.stringify(mealChoicesObj);
  const workoutChoice = body.workoutChoice ?? existing?.workoutChoice ?? "";
  const softDay = body.softDay === true;

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { mealChoices, workoutChoice, cycleDay, cyclePhase, softDay },
    create: {
      userId: user.id,
      date,
      mealChoices,
      workoutChoice,
      cycleDay,
      cyclePhase,
      softDay,
    },
  });

  return NextResponse.json(log);
}
