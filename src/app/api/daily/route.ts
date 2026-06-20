import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDayDate } from "@/lib/dates";
import { getCycleDay, getCyclePhase } from "@/lib/cycle";
import { xpFromDailyLog, xpFromLifeActions, xpFromTasks } from "@/lib/gamification";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "14", 10);
  const from = startOfDayDate(addDays(new Date(), -days));

  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id, date: { gte: from } },
    include: { meals: true, workouts: true, habits: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const date = startOfDayDate(body.date ?? new Date());
  const partial = Boolean(body.partial);

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  const existing = partial
    ? await prisma.dailyLog.findUnique({
        where: { userId_date: { userId: user.id, date } },
        include: { habits: true, workouts: true, meals: true },
      })
    : null;
  const cycleDay =
    body.cycleDay ??
    (profile ? getCycleDay(profile.lastPeriodStart, profile.cycleLength, date) : null);
  const cyclePhase =
    body.cyclePhase ??
    (cycleDay ? getCyclePhase(cycleDay, profile?.cycleLength ?? 28) : null);

  const pick = <T,>(next: T | undefined, prev: T | undefined): T | undefined =>
    partial ? (next !== undefined ? next : prev) : next;

  const log = await prisma.dailyLog.upsert({
    where: {
      userId_date: { userId: user.id, date },
    },
    update: {
      weightKg: pick(body.weightKg, existing?.weightKg),
      waistCm: pick(body.waistCm, existing?.waistCm),
      hipsCm: pick(body.hipsCm, existing?.hipsCm),
      chestCm: pick(body.chestCm, existing?.chestCm),
      cycleDay,
      cyclePhase,
      mealChoices:
        body.mealChoices != null
          ? JSON.stringify(body.mealChoices)
          : partial
            ? existing?.mealChoices
            : undefined,
      workoutChoice: pick(body.workoutChoice, existing?.workoutChoice),
      calories: pick(body.calories, existing?.calories ?? undefined),
      proteinG: pick(body.proteinG, existing?.proteinG ?? undefined),
      fatG: pick(body.fatG, existing?.fatG ?? undefined),
      carbsG: pick(body.carbsG, existing?.carbsG ?? undefined),
      fiberG: pick(body.fiberG, existing?.fiberG ?? undefined),
      waterMl: pick(body.waterMl, existing?.waterMl ?? undefined),
      steps: pick(body.steps, existing?.steps ?? undefined),
      sleepMinutes: pick(body.sleepMinutes, existing?.sleepMinutes ?? undefined),
      sleepQuality: pick(body.sleepQuality, existing?.sleepQuality ?? undefined),
      energy: pick(body.energy, existing?.energy ?? undefined),
      mood: pick(body.mood, existing?.mood ?? undefined),
      stress: pick(body.stress, existing?.stress ?? undefined),
      cortisolFeeling: pick(body.cortisolFeeling, existing?.cortisolFeeling ?? undefined),
      postMealWalks: pick(body.postMealWalks, existing?.postMealWalks ?? undefined),
      thyroidMedTaken: pick(body.thyroidMedTaken, existing?.thyroidMedTaken ?? undefined),
      thyroidMedOnTime: pick(body.thyroidMedOnTime, existing?.thyroidMedOnTime ?? undefined),
      supplementsTaken: pick(body.supplementsTaken, existing?.supplementsTaken ?? undefined),
      leisureJson:
        body.leisure != null
          ? JSON.stringify(body.leisure)
          : partial
            ? existing?.leisureJson
            : undefined,
      intellectJson:
        body.intellect != null
          ? JSON.stringify(body.intellect)
          : partial
            ? existing?.intellectJson
            : undefined,
      leisureMinutes: pick(body.leisureMinutes, existing?.leisureMinutes ?? undefined),
      lifeActionsJson:
        body.lifeActions != null
          ? JSON.stringify(body.lifeActions)
          : partial
            ? existing?.lifeActionsJson
            : undefined,
      workSatisfaction: pick(body.workSatisfaction, existing?.workSatisfaction ?? undefined),
      notes: pick(body.notes, existing?.notes ?? undefined),
      dayPhoto: pick(body.dayPhoto, existing?.dayPhoto ?? undefined),
      dayTagsJson:
        body.dayTags != null
          ? JSON.stringify(body.dayTags)
          : partial
            ? existing?.dayTagsJson
            : undefined,
      softDay: pick(body.softDay, existing?.softDay ?? undefined),
      tasksJson:
        body.tasks != null
          ? JSON.stringify(body.tasks)
          : partial
            ? existing?.tasksJson
            : undefined,
      shoppingJson:
        body.shopping != null
          ? JSON.stringify(body.shopping)
          : partial
            ? existing?.shoppingJson
            : undefined,
    },
    create: {
      userId: user.id,
      date,
      weightKg: body.weightKg,
      waistCm: body.waistCm,
      hipsCm: body.hipsCm,
      chestCm: body.chestCm,
      cycleDay: body.cycleDay,
      cyclePhase: body.cyclePhase,
      calories: body.calories,
      proteinG: body.proteinG,
      fatG: body.fatG,
      carbsG: body.carbsG,
      fiberG: body.fiberG,
      waterMl: body.waterMl,
      steps: body.steps,
      sleepMinutes: body.sleepMinutes,
      sleepQuality: body.sleepQuality,
      energy: body.energy,
      mood: body.mood,
      stress: body.stress,
      cortisolFeeling: body.cortisolFeeling,
      postMealWalks: body.postMealWalks ?? 0,
      thyroidMedTaken: body.thyroidMedTaken ?? false,
      thyroidMedOnTime: body.thyroidMedOnTime ?? false,
      supplementsTaken: body.supplementsTaken ?? false,
      leisureJson: body.leisure ? JSON.stringify(body.leisure) : "[]",
      intellectJson: body.intellect ? JSON.stringify(body.intellect) : "[]",
      leisureMinutes: body.leisureMinutes,
      lifeActionsJson: body.lifeActions ? JSON.stringify(body.lifeActions) : "{}",
      workSatisfaction: body.workSatisfaction,
      notes: body.notes ?? "",
      dayPhoto: body.dayPhoto ?? "",
      dayTagsJson: body.dayTags ? JSON.stringify(body.dayTags) : "[]",
      softDay: body.softDay ?? false,
      tasksJson: body.tasks ? JSON.stringify(body.tasks) : "[]",
      shoppingJson: body.shopping ? JSON.stringify(body.shopping) : "[]",
    },
    include: { meals: true, workouts: true, habits: true },
  });

  if (body.habits && Array.isArray(body.habits)) {
    for (const h of body.habits) {
      await prisma.habitCheck.upsert({
        where: {
          dailyLogId_habitKey: { dailyLogId: log.id, habitKey: h.habitKey },
        },
        update: { completed: h.completed },
        create: { dailyLogId: log.id, habitKey: h.habitKey, completed: h.completed },
      });
    }
  }

  if (body.workouts && Array.isArray(body.workouts)) {
    if (!partial || body.workouts.length > 0) {
      await prisma.workout.deleteMany({ where: { dailyLogId: log.id } });
      if (body.workouts.length > 0) {
        await prisma.workout.createMany({
          data: body.workouts.map((w: Record<string, unknown>) => ({
            dailyLogId: log.id,
            type: w.type as string,
            durationMin: w.durationMin as number,
            intensity: w.intensity as string,
            completed: Boolean(w.completed),
            notes: (w.notes as string) ?? "",
          })),
        });
      }
    }
  }

  if (body.meals && Array.isArray(body.meals)) {
    await prisma.meal.deleteMany({ where: { dailyLogId: log.id } });
    await prisma.meal.createMany({
      data: body.meals.map((m: Record<string, unknown>, i: number) => ({
        dailyLogId: log.id,
        mealType: m.mealType as string,
        description: m.description as string,
        calories: m.calories as number | undefined,
        proteinG: m.proteinG as number | undefined,
        carbsG: m.carbsG as number | undefined,
        fatG: m.fatG as number | undefined,
        hadProtein: Boolean(m.hadProtein ?? true),
        hadVeggies: Boolean(m.hadVeggies),
        hadWalkAfter: Boolean(m.hadWalkAfter),
        orderIndex: i,
      })),
    });
  }

  const updated = await prisma.dailyLog.findUnique({
    where: { id: log.id },
    include: { meals: true, workouts: true, habits: true },
  });

  if (profile && updated) {
    const xpAdd = xpFromDailyLog({
      proteinG: updated.proteinG,
      proteinTarget: profile.proteinTargetG,
      waterMl: updated.waterMl,
      waterTarget: profile.waterTargetMl,
      sleepMinutes: updated.sleepMinutes,
      sleepTarget: profile.sleepTargetMin,
      workouts: updated.workouts,
      leisureJson: updated.leisureJson,
      intellectJson: updated.intellectJson,
      habits: updated.habits,
      mood: updated.mood,
    });
    const lifeXp = xpFromLifeActions(updated.lifeActionsJson);
    const taskXp = xpFromTasks(updated.tasksJson);
    const mergedXp = { ...lifeXp };
    for (const [k, v] of Object.entries(taskXp)) {
      const key = k as keyof typeof mergedXp;
      mergedXp[key] = (mergedXp[key] ?? 0) + (v ?? 0);
    }
    if (Object.keys(xpAdd).length || Object.keys(mergedXp).length) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: {
          xpBody: profile.xpBody + (xpAdd.body ?? 0),
          xpFuel: profile.xpFuel + (xpAdd.fuel ?? 0),
          xpMind: profile.xpMind + (xpAdd.mind ?? 0) + (mergedXp.mind ?? 0),
          xpSoul: profile.xpSoul + (xpAdd.soul ?? 0) + (mergedXp.soul ?? 0),
          xpEnergy: profile.xpEnergy + (xpAdd.energy ?? 0),
          xpBalance: profile.xpBalance + (xpAdd.balance ?? 0) + (mergedXp.balance ?? 0),
          xpCareer: profile.xpCareer + (mergedXp.career ?? 0),
          xpFinance: profile.xpFinance + (mergedXp.finance ?? 0),
          xpRelations: profile.xpRelations + (mergedXp.relations ?? 0),
        },
      });
    }
  }

  return NextResponse.json(updated);
}
