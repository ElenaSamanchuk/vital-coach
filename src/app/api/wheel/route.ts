import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const parse = (s: string) => {
    try {
      return JSON.parse(s || "{}");
    } catch {
      return {};
    }
  };

  return NextResponse.json({
    wheelScores: parse(profile.wheelScores),
    permaScores: parse(profile.permaScores),
    bigFiveScores: parse(profile.bigFiveScores),
    ikigaiJson: parse(profile.ikigaiJson),
    relationshipStatus: profile.relationshipStatus,
    financeGoal: profile.financeGoal,
    careerGoal: profile.careerGoal,
    who5Scores: parse(profile.who5Scores),
    sdtScores: parse(profile.sdtScores),
    ryffScores: parse(profile.ryffScores),
    coreValuesJson: JSON.parse(profile.coreValuesJson || "[]"),
    weeklyReviewJson: parse(profile.weeklyReviewJson),
  });
}

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, string> = {};

  if (body.wheelScores != null) data.wheelScores = JSON.stringify(body.wheelScores);
  if (body.permaScores != null) data.permaScores = JSON.stringify(body.permaScores);
  if (body.bigFiveScores != null) data.bigFiveScores = JSON.stringify(body.bigFiveScores);
  if (body.ikigaiJson != null) data.ikigaiJson = JSON.stringify(body.ikigaiJson);
  if (body.relationshipStatus != null) data.relationshipStatus = body.relationshipStatus;
  if (body.financeGoal != null) data.financeGoal = body.financeGoal;
  if (body.careerGoal != null) data.careerGoal = body.careerGoal;
  if (body.who5Scores != null) data.who5Scores = JSON.stringify(body.who5Scores);
  if (body.sdtScores != null) data.sdtScores = JSON.stringify(body.sdtScores);
  if (body.ryffScores != null) data.ryffScores = JSON.stringify(body.ryffScores);
  if (body.coreValuesJson != null) data.coreValuesJson = JSON.stringify(body.coreValuesJson);
  if (body.weeklyReviewJson != null) data.weeklyReviewJson = JSON.stringify(body.weeklyReviewJson);

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data,
  });

  return NextResponse.json(profile);
}
