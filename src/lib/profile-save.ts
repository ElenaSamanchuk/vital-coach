import type { OnboardingAssessment } from "./onboarding-assessment";
import { deriveNutritionTargets } from "./profile-derivation";

/** Явный маппинг — совместим с Prisma Profile */
export function buildProfileFromAssessment(
  a: OnboardingAssessment & { assessmentExtras?: { gender?: string; birthDate?: string } },
) {
  const nutrition = deriveNutritionTargets({
    currentWeightKg: a.currentWeightKg,
    targetWeightKg: a.targetWeightKg,
    heightCm: a.heightCm,
    birthYear: a.birthYear,
    gender: a.assessmentExtras?.gender as import("./profile-derivation").Gender | undefined,
    activityLevel: a.activityLevel,
    workActivityLevel: a.workActivityLevel,
    insulinResistance: a.insulinResistance,
    hypothyroidism: a.hypothyroidism,
    cortisolIssues: a.cortisolIssues,
    hormoneIssues: a.hormoneIssues,
    endometriosis: a.endometriosis,
    pcosSuspected: a.pcosSuspected,
    surgeryRecovery: a.surgeryRecovery,
  });

  let lastPeriodStart: Date | null = null;
  if (a.lastPeriodStart) {
    lastPeriodStart = new Date(a.lastPeriodStart);
  }

  return {
    name: a.name,
    birthYear: a.birthYear,
    heightCm: a.heightCm,
    currentWeightKg: a.currentWeightKg,
    targetWeightKg: a.targetWeightKg,
    targetWaistCm: a.targetWaistCm,
    targetHipsCm: a.targetHipsCm,
    calorieTarget: nutrition.calorieTarget,
    proteinTargetG: nutrition.proteinTargetG,
    fatTargetG: nutrition.fatTargetG,
    carbTargetG: nutrition.carbTargetG,
    fiberTargetG: nutrition.fiberTargetG,
    waterTargetMl: nutrition.waterTargetMl,
    sleepTargetMin: Math.round(a.sleepHours * 60),
    insulinResistance: a.insulinResistance,
    hypothyroidism: a.hypothyroidism,
    cortisolIssues: a.cortisolIssues,
    vitaminDDeficiency: a.vitaminDDeficiency,
    b12Deficiency: a.b12Deficiency,
    hormoneIssues: a.hormoneIssues,
    pcosSuspected: a.pcosSuspected,
    endometriosis: a.endometriosis,
    vitaminAbsorption: a.vitaminAbsorption,
    surgeryRecovery: a.surgeryRecovery,
    lastPeriodStart,
    cycleLength: a.cycleLength,
    occupation: a.occupation,
    workActivityLevel: a.workActivityLevel,
    activityLevel: a.activityLevel,
    primaryFocus: a.primaryFocus,
    relationshipStatus: a.relationshipStatus,
    careerGoal: a.careerGoal,
    financeGoal: a.financeGoal,
    wheelScores: JSON.stringify(a.wheelQuick),
    leisureFavorites: JSON.stringify(a.leisureInterests),
    intellectFavorites: JSON.stringify(a.intellectInterests),
    assessmentJson: JSON.stringify({
      stressLevel: a.stressLevel,
      leisureInterests: a.leisureInterests,
      ...(a.assessmentExtras ?? {}),
    }),
    onboardingDone: true,
    onboardingVersion: 2,
  };
}
