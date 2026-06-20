import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  deriveNutritionTargets,
  profileToDerivationInput,
} from "@/lib/profile-derivation";

const RECALC_KEYS = new Set([
  "currentWeightKg",
  "targetWeightKg",
  "heightCm",
  "birthYear",
  "activityLevel",
  "workActivityLevel",
  "insulinResistance",
  "hypothyroidism",
  "cortisolIssues",
  "pcosSuspected",
  "surgeryRecovery",
]);

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = { ...body };

    if (data.lastPeriodStart === "" || data.lastPeriodStart === null) {
      data.lastPeriodStart = null;
    } else if (data.lastPeriodStart) {
      data.lastPeriodStart = new Date(data.lastPeriodStart);
    }
    if (data.surgeryDate) data.surgeryDate = new Date(data.surgeryDate);
    if (data.onboardingDone !== undefined) data.onboardingDone = Boolean(data.onboardingDone);
    if (data.onboardingVersion !== undefined) data.onboardingVersion = Number(data.onboardingVersion);

    delete data.id;
    delete data.userId;

    const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
    const merged = { ...(existing ?? {}), ...data };

    const needsRecalc =
      Object.keys(body).some((k) => RECALC_KEYS.has(k)) &&
      merged.currentWeightKg &&
      merged.heightCm;

    if (needsRecalc) {
      const targets = deriveNutritionTargets(profileToDerivationInput(merged as Parameters<typeof profileToDerivationInput>[0]));
      Object.assign(data, targets);
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    return NextResponse.json(profile);
  } catch (e) {
    console.error("profile PUT error:", e);
    return NextResponse.json({ error: "Ошибка сохранения профиля" }, { status: 500 });
  }
}
