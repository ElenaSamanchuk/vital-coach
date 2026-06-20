import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, logs, labs, exams] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.dailyLog.findMany({
      where: { userId: user.id },
      include: { meals: true, workouts: true, habits: true },
      orderBy: { date: "asc" },
    }),
    prisma.labResult.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
    prisma.examination.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId: user.id,
    email: (await prisma.user.findUnique({ where: { id: user.id }, select: { email: true } }))?.email,
    profile,
    dailyLogs: logs,
    labResults: labs,
    examinations: exams,
  };

  await prisma.profile.update({
    where: { userId: user.id },
    data: { lastBackupAt: new Date() },
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vital-coach-backup-${formatDate(new Date())}.json"`,
    },
  });
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
