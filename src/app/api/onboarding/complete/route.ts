import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { OnboardingAssessment } from "@/lib/onboarding-assessment";
import { buildProfileFromAssessment } from "@/lib/profile-save";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизована — войди снова" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as OnboardingAssessment;
    const data = buildProfileFromAssessment(body);

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    return NextResponse.json({
      ok: true,
      onboardingDone: profile.onboardingDone,
    });
  } catch (e) {
    console.error("onboarding complete error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Не удалось сохранить профиль. Перезапусти сервер: npm run dev",
        detail: process.env.NODE_ENV === "development" ? msg : undefined,
      },
      { status: 500 },
    );
  }
}
