import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const labs = await prisma.labResult.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(labs);
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lab = await prisma.labResult.create({
    data: {
      userId: user.id,
      date: new Date(body.date),
      marker: body.marker,
      value: body.value,
      unit: body.unit,
      refMin: body.refMin,
      refMax: body.refMax,
      notes: body.notes ?? "",
    },
  });

  return NextResponse.json(lab);
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

  await prisma.labResult.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
