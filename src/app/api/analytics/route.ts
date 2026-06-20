import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db";
import { analyzeWeek } from "@/lib/analytics";
import { requireUser } from "@/lib/session";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId: user.id,
      date: { gte: addDays(new Date(), -days) },
    },
    include: { habits: true, workouts: true },
    orderBy: { date: "asc" },
  });

  const insights = analyzeWeek(logs, profile);

  return NextResponse.json({ insights, logs });
}
