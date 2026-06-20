import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { EXAM_STUDIES } from "@/lib/examinations-schedule";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exams = await prisma.examination.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const def = EXAM_STUDIES.find((s) => s.key === body.studyKey);
  if (!def) return NextResponse.json({ error: "Unknown study" }, { status: 400 });

  const exam = await prisma.examination.create({
    data: {
      userId: user.id,
      date: new Date(body.date),
      studyKey: body.studyKey,
      category: def.category,
      status: body.status ?? "done",
      resultSummary: body.resultSummary ?? "",
      findings: body.findings ?? "",
      notes: body.notes ?? "",
    },
  });

  return NextResponse.json(exam);
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.examination.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
