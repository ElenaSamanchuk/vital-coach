import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDayDate } from "@/lib/dates";
import { getCycleDay, getCyclePhase } from "@/lib/cycle";
import { parseWellbeingDone } from "@/lib/wellbeing-coach";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const actionId = body.actionId as string;
  if (!actionId) return NextResponse.json({ error: "actionId required" }, { status: 400 });

  const date = startOfDayDate(body.date ?? new Date());
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const cycleDay = profile
    ? getCycleDay(profile.lastPeriodStart, profile.cycleLength, date)
    : null;
  const cyclePhase = cycleDay ? getCyclePhase(cycleDay, profile?.cycleLength ?? 28) : null;

  const existing = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  let lifeActions: Record<string, string[]> = {};
  try {
    lifeActions = JSON.parse(existing?.lifeActionsJson || "{}") as Record<string, string[]>;
  } catch {
    lifeActions = {};
  }

  const wellbeing = lifeActions.wellbeing ?? [];
  const next = wellbeing.includes(actionId)
    ? wellbeing.filter((id) => id !== actionId)
    : [...wellbeing, actionId];
  lifeActions.wellbeing = next;

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { lifeActionsJson: JSON.stringify(lifeActions) },
    create: {
      userId: user.id,
      date,
      cycleDay,
      cyclePhase,
      lifeActionsJson: JSON.stringify(lifeActions),
    },
  });

  return NextResponse.json({
    done: parseWellbeingDone(log.lifeActionsJson),
  });
}
