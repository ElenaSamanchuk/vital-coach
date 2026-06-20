import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDayDate } from "@/lib/dates";
import { getCycleDay, getCyclePhase } from "@/lib/cycle";

/** Утренний/быстрый чек-ин — только самочувствие, без перезаписи остального дня */
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

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      energy: body.energy ?? existing?.energy,
      mood: body.mood ?? existing?.mood,
      stress: body.stress ?? existing?.stress,
      weightKg: body.weightKg ?? existing?.weightKg,
    },
    create: {
      userId: user.id,
      date,
      energy: body.energy ?? 7,
      mood: body.mood ?? 7,
      stress: body.stress ?? 5,
      weightKg: body.weightKg,
      cycleDay,
      cyclePhase,
    },
  });

  return NextResponse.json(log);
}
