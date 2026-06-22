/**
 * Полноценный стартовый тест при регистрации.
 * Результаты → Profile + wheel + пересчёт целей.
 */
import type { SphereKey } from "./life-spheres";
import type { RelationshipStatus } from "./life-spheres";
import { deriveNutritionMeta, deriveNutritionTargets } from "./profile-derivation";

export const ONBOARDING_VERSION = 2;

export interface OnboardingAssessment {
  // Step 1 — Identity
  name: string;
  birthYear: number;
  // Step 2 — Body
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetWaistCm: number;
  targetHipsCm: number;
  // Step 3 — Health
  insulinResistance: boolean;
  hypothyroidism: boolean;
  cortisolIssues: boolean;
  vitaminDDeficiency: boolean;
  b12Deficiency: boolean;
  hormoneIssues: boolean;
  pcosSuspected: boolean;
  endometriosis: boolean;
  vitaminAbsorption: boolean;
  surgeryRecovery: boolean;
  // Step 4 — Cycle
  lastPeriodStart: string;
  cycleLength: number;
  // Step 5 — Lifestyle
  occupation: string;
  workActivityLevel: "sedentary" | "mixed" | "active";
  activityLevel: "low" | "moderate" | "high";
  sleepHours: number;
  stressLevel: number;
  // Step 6 — Life wheel quick (1-10)
  wheelQuick: Partial<Record<SphereKey, number>>;
  // Step 7 — Psychology & goals
  relationshipStatus: RelationshipStatus;
  careerGoal: string;
  financeGoal: string;
  primaryFocus: "health" | "balance" | "career" | "relationships";
  leisureInterests: string[];
  intellectInterests: string[];
}

export const DEFAULT_ASSESSMENT: OnboardingAssessment = {
  name: "",
  birthYear: 1991,
  heightCm: 170,
  currentWeightKg: 70,
  targetWeightKg: 70,
  targetWaistCm: 72,
  targetHipsCm: 100,
  insulinResistance: false,
  hypothyroidism: false,
  cortisolIssues: false,
  vitaminDDeficiency: false,
  b12Deficiency: false,
  hormoneIssues: false,
  pcosSuspected: false,
  endometriosis: false,
  vitaminAbsorption: false,
  surgeryRecovery: false,
  lastPeriodStart: "",
  cycleLength: 28,
  occupation: "",
  workActivityLevel: "sedentary",
  activityLevel: "moderate",
  sleepHours: 7,
  stressLevel: 5,
  wheelQuick: {},
  relationshipStatus: "single_open",
  careerGoal: "",
  financeGoal: "",
  primaryFocus: "balance",
  leisureInterests: [],
  intellectInterests: [],
};

export const ONBOARDING_STEPS = [
  { id: "welcome", title: "Добро пожаловать", subtitle: "Система прокачки жизни" },
  { id: "body", title: "Тело", subtitle: "Базовые параметры" },
  { id: "health", title: "Здоровье", subtitle: "Что учитывать в плане" },
  { id: "cycle", title: "Цикл", subtitle: "Гормоны и фазы" },
  { id: "lifestyle", title: "Образ жизни", subtitle: "Работа и активность" },
  { id: "wheel", title: "Колесо жизни", subtitle: "10 сфер — быстрая оценка" },
  { id: "goals", title: "Цели", subtitle: "Отношения, карьера, фокус" },
  { id: "summary", title: "Итог", subtitle: "Твой персональный план" },
] as const;

export const HEALTH_OPTIONS: { key: keyof OnboardingAssessment; label: string; hint: string }[] = [
  { key: "insulinResistance", label: "Инсулинорезистентность", hint: "Питание low-GI, ходьба после еды" },
  { key: "hypothyroidism", label: "Гипотиреоз / щитовидка", hint: "УЗИ + ТТГ, мягкий дефицит" },
  { key: "pcosSuspected", label: "СПКЯ", hint: "УЗИ таза, силовая, день 3 гормоны" },
  { key: "endometriosis", label: "Эндометриоз", hint: "МРТ при боли, мягкая лютеиновая" },
  { key: "cortisolIssues", label: "Стресс / кортизол", hint: "Сон, без HIIT, минимальный день" },
  { key: "vitaminDDeficiency", label: "Дефицит витамина D", hint: "Чекап + доза с врачом" },
  { key: "b12Deficiency", label: "Дефицит B12", hint: "ФГДС при низком несмотря на приём" },
  { key: "vitaminAbsorption", label: "Проблемы всасывания", hint: "Формы витаминов, ФГДС" },
  { key: "hormoneIssues", label: "Гормональные колебания веса", hint: "Панель гормонов день 3/21" },
  { key: "surgeryRecovery", label: "Восстановление после операции", hint: "Постепенное возвращение нагрузки" },
];

export const LEISURE_OPTIONS = [
  { id: "bike", label: "Велосипед", emoji: "🚴" },
  { id: "pool", label: "Бассейн", emoji: "🏊" },
  { id: "yoga", label: "Йога / пилатес", emoji: "🧘" },
  { id: "nature", label: "Природа", emoji: "🌲" },
  { id: "reading", label: "Чтение", emoji: "📖" },
  { id: "cinema", label: "Кино", emoji: "🎬" },
  { id: "cooking", label: "Готовка", emoji: "👩‍🍳" },
  { id: "travel", label: "Путешествия", emoji: "✈️" },
];

export const INTELLECT_OPTIONS = [
  { id: "chess", label: "Шахматы", emoji: "♟️" },
  { id: "english", label: "English", emoji: "🇬🇧" },
  { id: "programming", label: "Программирование", emoji: "💻" },
  { id: "languages", label: "Языки", emoji: "🗣️" },
  { id: "science", label: "Наука", emoji: "🔬" },
];

export function assessmentToProfilePayload(a: OnboardingAssessment) {
  const nutrition = deriveNutritionTargets({
    currentWeightKg: a.currentWeightKg,
    targetWeightKg: a.targetWeightKg,
    heightCm: a.heightCm,
    birthYear: a.birthYear,
    activityLevel: a.activityLevel,
    workActivityLevel: a.workActivityLevel,
    insulinResistance: a.insulinResistance,
    hypothyroidism: a.hypothyroidism,
    cortisolIssues: a.cortisolIssues,
    pcosSuspected: a.pcosSuspected,
    surgeryRecovery: a.surgeryRecovery,
  });

  return {
    name: a.name,
    birthYear: a.birthYear,
    heightCm: a.heightCm,
    currentWeightKg: a.currentWeightKg,
    targetWeightKg: a.targetWeightKg,
    targetWaistCm: a.targetWaistCm,
    targetHipsCm: a.targetHipsCm,
    ...nutrition,
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
    lastPeriodStart: a.lastPeriodStart || null,
    cycleLength: a.cycleLength,
    occupation: a.occupation,
    workActivityLevel: a.workActivityLevel,
    relationshipStatus: a.relationshipStatus,
    careerGoal: a.careerGoal,
    financeGoal: a.financeGoal,
    wheelScores: JSON.stringify(a.wheelQuick),
    leisureFavorites: JSON.stringify(a.leisureInterests),
    intellectFavorites: JSON.stringify(a.intellectInterests),
    activityLevel: a.activityLevel,
    primaryFocus: a.primaryFocus,
    assessmentJson: JSON.stringify({ stressLevel: a.stressLevel, leisureInterests: a.leisureInterests }),
    onboardingDone: true,
    onboardingVersion: ONBOARDING_VERSION,
  };
}

export function getAssessmentSummary(a: OnboardingAssessment): string[] {
  const lines: string[] = [];
  const meta = deriveNutritionMeta({
    currentWeightKg: a.currentWeightKg,
    targetWeightKg: a.targetWeightKg,
    heightCm: a.heightCm,
    birthYear: a.birthYear,
    activityLevel: a.activityLevel,
    workActivityLevel: a.workActivityLevel,
    insulinResistance: a.insulinResistance,
    hypothyroidism: a.hypothyroidism,
    cortisolIssues: a.cortisolIssues,
    pcosSuspected: a.pcosSuspected,
    surgeryRecovery: a.surgeryRecovery,
  });
  lines.push(`${meta.bodyGoalLabelRu}: ${meta.calorieTarget} ккал · Белок: ${meta.proteinTargetG} г`);
  lines.push(meta.explanation);
  const healthCount = HEALTH_OPTIONS.filter((h) => a[h.key as keyof OnboardingAssessment]).length;
  if (healthCount) lines.push(`Учтено ${healthCount} факторов здоровья`);
  const wheelFilled = Object.keys(a.wheelQuick).length;
  if (wheelFilled) lines.push(`Колесо жизни: ${wheelFilled}/10 сфер оценено`);
  if (a.primaryFocus) {
    const focusLabels = { health: "здоровье", balance: "баланс", career: "карьера", relationships: "отношения" };
    lines.push(`Главный фокус: ${focusLabels[a.primaryFocus]}`);
  }
  return lines;
}
