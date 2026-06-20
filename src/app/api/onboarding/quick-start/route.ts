import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { buildProfileFromAssessment } from "@/lib/profile-save";
import { DEFAULT_ASSESSMENT } from "@/lib/onboarding-assessment";
import { GENERIC_PROFILE } from "@/lib/app-config";

/** Быстрый старт без 8 шагов онбординга — универсальный профиль */
export async function POST() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const assessment = {
      ...DEFAULT_ASSESSMENT,
      ...GENERIC_PROFILE,
      name: "",
    };
    const data = buildProfileFromAssessment(assessment);

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("quick-start error:", e);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}
