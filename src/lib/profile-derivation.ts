/**
 * Пересчёт целей: Mifflin BMR, ИМТ, цель тела.
 * При похудении: питание НЕ завышается из-за тренировок (тренировка = доп. расход).
 */
import { GENERIC_MODE } from "./app-config";

export type BodyGoal = "lose" | "gain" | "maintain";
export type ActivityLevel = "low" | "moderate" | "high";
export type WorkActivity = "sedentary" | "mixed" | "active";

export interface DerivationInput {
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  birthYear?: number;
  activityLevel: ActivityLevel;
  workActivityLevel: WorkActivity;
  insulinResistance: boolean;
  hypothyroidism: boolean;
  cortisolIssues: boolean;
  pcosSuspected: boolean;
  surgeryRecovery: boolean;
  bodyGoal?: BodyGoal | "auto";
  lossPaceKgPerWeek?: 0.3 | 0.5 | 0.7;
}

export interface DerivedTargets {
  calorieTarget: number;
  proteinTargetG: number;
  fatTargetG: number;
  carbTargetG: number;
  fiberTargetG: number;
  waterTargetMl: number;
}

export interface NutritionMeta extends DerivedTargets {
  bmi: number;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese";
  bmiLabelRu: string;
  bodyGoal: BodyGoal;
  bodyGoalLabelRu: string;
  bmr: number;
  /** Полный расход с учётом активности */
  tdee: number;
  /** База для расчёта еды при похудении (без «съедать тренировку») */
  dietBase: number;
  deficitOrSurplusKcal: number;
  explanation: string;
}

const GOAL_LABELS: Record<BodyGoal, string> = {
  lose: "снижение веса",
  gain: "набор массы",
  maintain: "удержание веса",
};

const BMI_LABELS: Record<NutritionMeta["bmiCategory"], string> = {
  underweight: "недостаточный вес",
  normal: "норма",
  overweight: "избыточный вес",
  obese: "ожирение",
};

export function computeBmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): NutritionMeta["bmiCategory"] {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export function deriveBodyGoal(
  currentKg: number,
  targetKg: number,
  bmi?: number,
): BodyGoal {
  const diff = targetKg - currentKg;
  if (diff <= -0.5) return "lose";
  if (diff >= 1.5) return "gain";
  if (bmi != null && bmi >= 25 && targetKg < currentKg) return "lose";
  return "maintain";
}

export function bmrMifflin(weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function activityMultiplier(
  activity: ActivityLevel,
  work: WorkActivity,
): number {
  const base: Record<ActivityLevel, number> = {
    low: 1.4,
    moderate: 1.55,
    high: 1.7,
  };
  const workAdd: Record<WorkActivity, number> = {
    sedentary: 0,
    mixed: 0.05,
    active: 0.1,
  };
  return base[activity] + workAdd[work];
}

function ageFromBirthYear(birthYear?: number): number {
  if (!birthYear || birthYear < 1920) return 34;
  return Math.max(16, new Date().getFullYear() - birthYear);
}

/** Вода: ~25 мл/кг, потолок 2.2 л — без завышения «литрами сверху» */
export function deriveWaterTarget(
  weightKg: number,
  activity: ActivityLevel = "moderate",
): number {
  let mlPerKg = 25;
  if (activity === "high") mlPerKg = 28;
  if (activity === "low") mlPerKg = 23;
  const raw = Math.round(weightKg * mlPerKg);
  return Math.min(2200, Math.max(1600, raw));
}

/** База питания при дефиците: лёгкая активность, без разгона от спорта */
function dietBaseCalories(bmr: number): number {
  return Math.round(bmr * 1.38);
}

/** Клинический ориентир: ккал/кг для фазы снижения веса */
function weightBasedLossTarget(
  weightKg: number,
  bmi: number,
  input: DerivationInput,
): number {
  let kcalPerKg = 22;
  if (bmi >= 30) kcalPerKg = 18;
  else if (bmi >= 27) kcalPerKg = 19;
  else if (bmi >= 25) kcalPerKg = 20;

  const pace = input.lossPaceKgPerWeek ?? 0.5;
  if (pace <= 0.3) kcalPerKg -= 1;
  if (pace >= 0.7) kcalPerKg += 1;

  if (input.hypothyroidism && pace >= 0.5) kcalPerKg += 1;
  if (input.surgeryRecovery) kcalPerKg += 1;

  return Math.round(weightKg * Math.max(17, kcalPerKg));
}

function safeCalorieFloor(input: DerivationInput, bmr: number): number {
  if (input.hypothyroidism) return 1400;
  if (input.surgeryRecovery) return 1350;
  return Math.max(1280, Math.round(bmr * 1.05));
}

function deficitFromPace(kgPerWeek: number): number {
  return Math.round((kgPerWeek * 7700) / 7);
}

function deficitForWeightLoss(
  dietBase: number,
  bmi: number,
  input: DerivationInput,
): number {
  const pace = input.lossPaceKgPerWeek ?? 0.5;
  let deficit = deficitFromPace(pace);

  let pctCap = 0.2;
  if (bmi >= 30) pctCap = 0.25;
  else if (bmi >= 27) pctCap = 0.22;
  else if (bmi >= 25) pctCap = 0.2;

  deficit = Math.min(deficit, Math.round(dietBase * pctCap));
  deficit = Math.max(350, Math.min(700, deficit));

  if (input.hypothyroidism) deficit = Math.min(deficit, 380);
  if (input.cortisolIssues) deficit = Math.min(deficit, 420);
  if (input.surgeryRecovery) deficit = Math.min(deficit, 320);

  return deficit;
}

function surplusForGain(tdee: number, bmi: number): number {
  if (bmi >= 25) return 200;
  if (bmi < 20) return 350;
  return 280;
}

export function deriveNutritionMeta(input: DerivationInput): NutritionMeta {
  const age = ageFromBirthYear(input.birthYear);
  const bmi = computeBmi(input.currentWeightKg, input.heightCm);
  const bmiCat = bmiCategory(bmi);
  const autoGoal = deriveBodyGoal(input.currentWeightKg, input.targetWeightKg, bmi);
  let bodyGoal =
    input.bodyGoal && input.bodyGoal !== "auto" ? input.bodyGoal : autoGoal;

  const weightDeltaKg = input.targetWeightKg - input.currentWeightKg;
  let lossPace = input.lossPaceKgPerWeek ?? 0.5;
  if (GENERIC_MODE) {
    if (bmiCat === "normal" && Math.abs(weightDeltaKg) < 2) {
      bodyGoal = "maintain";
    } else if (bodyGoal === "lose" && bmi < 25) {
      lossPace = 0.3;
    }
  }
  const calcInput: DerivationInput = { ...input, lossPaceKgPerWeek: lossPace };

  const bmr = bmrMifflin(calcInput.currentWeightKg, calcInput.heightCm, age);
  const tdee = Math.round(bmr * activityMultiplier(calcInput.activityLevel, calcInput.workActivityLevel));
  const dietBase = dietBaseCalories(bmr);

  let calorieTarget: number;
  let deficitOrSurplus = 0;

  if (bodyGoal === "maintain") {
    calorieTarget = tdee;
  } else if (bodyGoal === "gain") {
    deficitOrSurplus = surplusForGain(tdee, bmi);
    calorieTarget = tdee + deficitOrSurplus;
  } else {
    deficitOrSurplus = deficitForWeightLoss(dietBase, bmi, calcInput);
    const fromDeficit = dietBase - deficitOrSurplus;
    const fromWeight = weightBasedLossTarget(calcInput.currentWeightKg, bmi, calcInput);
    const minRealDeficit = tdee - 450;

    calorieTarget = Math.min(fromDeficit, fromWeight, minRealDeficit);
    const floor = safeCalorieFloor(calcInput, bmr);
    calorieTarget = Math.max(floor, calorieTarget);
    if (GENERIC_MODE && bmi < 25) {
      const mildCap = Math.max(Math.round(bmr * 1.12), 1600);
      calorieTarget = Math.max(calorieTarget, mildCap);
      calorieTarget = Math.min(calorieTarget, tdee - 250);
    }
  }

  let proteinPerKg = 1.7;
  if (bodyGoal === "gain") proteinPerKg = 1.9;
  if (input.insulinResistance || input.pcosSuspected) proteinPerKg = Math.max(proteinPerKg, 1.8);
  if (bodyGoal === "lose" && bmi >= 25) proteinPerKg = 1.9;

  const proteinTargetG = Math.round(input.currentWeightKg * proteinPerKg);
  const fatTargetG = Math.round((calorieTarget * 0.28) / 9);
  const carbTargetG = Math.round(
    (calorieTarget - proteinTargetG * 4 - fatTargetG * 9) / 4,
  );
  const fiberTargetG = input.insulinResistance ? 35 : 30;
  const waterTargetMl = deriveWaterTarget(input.currentWeightKg, input.activityLevel);

  const weightDelta = Math.round(input.targetWeightKg - input.currentWeightKg);
  const deltaStr =
    weightDelta === 0
      ? ""
      : ` · до цели ${weightDelta > 0 ? "+" : ""}${weightDelta} кг`;

  let explanation: string;
  if (bodyGoal === "lose") {
    const pace = lossPace;
    const realDeficit = tdee - calorieTarget;
    explanation =
      `ИМТ ${bmi} (${BMI_LABELS[bmiCat]})${deltaStr} · расход ~${tdee} · еда ${calorieTarget} (минус ~${realDeficit}) · −${pace} кг/нед · спорт не добавляет к еде`;
  } else if (bodyGoal === "gain") {
    explanation =
      `ИМТ ${bmi} (${BMI_LABELS[bmiCat]})${deltaStr} · TDEE ~${tdee} · профицит +${deficitOrSurplus} → ${calorieTarget} ккал`;
  } else {
    explanation = `ИМТ ${bmi} (${BMI_LABELS[bmiCat]}) · удержание ~${tdee} ккал`;
  }

  if (input.hypothyroidism && bodyGoal === "lose") {
    explanation += " · щитовидка: пол не ниже 1400 ккал";
  }

  return {
    calorieTarget,
    proteinTargetG,
    fatTargetG: Math.max(50, fatTargetG),
    carbTargetG: Math.max(bodyGoal === "lose" && input.insulinResistance ? 65 : 75, carbTargetG),
    fiberTargetG,
    waterTargetMl,
    bmi,
    bmiCategory: bmiCat,
    bmiLabelRu: BMI_LABELS[bmiCat],
    bodyGoal,
    bodyGoalLabelRu: GOAL_LABELS[bodyGoal],
    bmr: Math.round(bmr),
    tdee,
    dietBase,
    deficitOrSurplusKcal: deficitOrSurplus,
    explanation,
  };
}

export function deriveNutritionTargets(input: DerivationInput): DerivedTargets {
  const m = deriveNutritionMeta(input);
  return {
    calorieTarget: m.calorieTarget,
    proteinTargetG: m.proteinTargetG,
    fatTargetG: m.fatTargetG,
    carbTargetG: m.carbTargetG,
    fiberTargetG: m.fiberTargetG,
    waterTargetMl: m.waterTargetMl,
  };
}

export function profileToDerivationInput(profile: {
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  birthYear?: number;
  activityLevel: string;
  workActivityLevel: string;
  insulinResistance: boolean;
  hypothyroidism: boolean;
  cortisolIssues: boolean;
  pcosSuspected: boolean;
  surgeryRecovery: boolean;
  assessmentJson?: string | null;
}): DerivationInput {
  let bodyGoal: BodyGoal | "auto" = "auto";
  let lossPaceKgPerWeek: 0.3 | 0.5 | 0.7 = 0.5;
  if (profile.assessmentJson) {
    try {
      const j = JSON.parse(profile.assessmentJson) as {
        bodyGoal?: BodyGoal | "auto";
        lossPaceKgPerWeek?: 0.3 | 0.5 | 0.7;
      };
      if (j.bodyGoal) bodyGoal = j.bodyGoal;
      if (j.lossPaceKgPerWeek) lossPaceKgPerWeek = j.lossPaceKgPerWeek;
    } catch {
      /* */
    }
  }
  return {
    currentWeightKg: profile.currentWeightKg,
    targetWeightKg: profile.targetWeightKg,
    heightCm: profile.heightCm,
    birthYear: profile.birthYear,
    activityLevel: (profile.activityLevel as ActivityLevel) || "moderate",
    workActivityLevel: (profile.workActivityLevel as WorkActivity) || "sedentary",
    insulinResistance: profile.insulinResistance,
    hypothyroidism: profile.hypothyroidism,
    cortisolIssues: profile.cortisolIssues,
    pcosSuspected: profile.pcosSuspected,
    surgeryRecovery: profile.surgeryRecovery,
    bodyGoal,
    lossPaceKgPerWeek,
  };
}

export const KEY_PROFILE_FIELDS = [
  { group: "Здоровье", fields: ["insulinResistance", "hypothyroidism", "pcosSuspected", "endometriosis", "cortisolIssues", "surgeryRecovery"] },
  { group: "Тело", fields: ["currentWeightKg", "targetWeightKg", "heightCm", "activityLevel"] },
  { group: "Цикл", fields: ["lastPeriodStart", "cycleLength"] },
  { group: "Жизнь", fields: ["primaryFocus", "relationshipStatus"] },
] as const;
