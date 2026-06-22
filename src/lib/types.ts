import type { BodyBudget } from "./body-budget";
import type { CalorieExplainer } from "./calorie-explainer";
import type { CompensationSummary } from "./compensation-plan";
import type { DayTask } from "./day-tasks";
import type { HealthBrief } from "./health-briefing";
import type { LifeSuggestion } from "./life-recommendations";
import type { pickMedia } from "./media-picks";
import type { RecipeCard } from "./recipes-catalog";
import type { PlaceSpot } from "./places-catalog";
import type { StyleProfile } from "./style-guide";
import type { InflammationLoad } from "./inflammation-score";
import type { LabMealHint } from "./lab-meal-bridge";
import type { NutritionMeta } from "./profile-derivation";
import type { WeeklyExperiment } from "./weekly-experiment";
import type { HorizonPlan } from "./horizon-plan";
import type { TodayLeisurePick } from "./today-picks";
import type { WorkoutOption } from "./fitness";
import type { PersonalizedDayPlan } from "./personalized-day-recs";
import type { WellbeingPlan } from "./wellbeing-coach";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface HealthConditions {
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
}

export interface UserTargets {
  calorieTarget: number;
  proteinTargetG: number;
  fatTargetG: number;
  carbTargetG: number;
  fiberTargetG: number;
  waterTargetMl: number;
  sleepTargetMin: number;
}

export interface CoachTask {
  id: string;
  category: "nutrition" | "workout" | "habit" | "track" | "medication" | "recovery" | "labs" | "psychology" | "tasks";
  title: string;
  description: string;
  priority: "must" | "should" | "optional";
  completed?: boolean;
  logKey?: string;
}

export interface MealSuggestion {
  mealType: string;
  title: string;
  description: string;
  proteinG: number;
  calories: number;
  tips: string[];
  labBoost?: boolean;
  /** Мотивация: нутриент → эффект → горизонт */
  impact?: string;
}

export interface MealSlotPlan {
  slot: string;
  slotLabel: string;
  options: MealSuggestion[];
  selected: MealSuggestion & { id?: string; evidence?: string; tags?: string[] };
}

export interface WorkoutSuggestion {
  type: string;
  title: string;
  durationMin: number;
  intensity: string;
  notes: string;
  id?: string;
  moodBoost?: string;
  leisureNote?: string;
  impact?: string;
}

export interface WorkoutPlanBlock {
  rationale: string;
  recommended: WorkoutSuggestion;
  alternatives: WorkoutSuggestion[];
}

export interface PsychologyBlock {
  headline: string;
  message: string;
  reframe: string;
  minimumDay: boolean;
  habits: string[];
  avoid: string[];
}

export interface NutritionFrameworkBlock {
  calorieNote: string;
  macroSplit: { protein: string; carbs: string; fat: string };
  principles: string[];
  micronutrientFocus: string[];
  avoid: string[];
  totalsFromMeals: { calories: number; proteinG: number; fatG: number; carbsG: number };
}

export interface LabDueItem {
  label: string;
  dueText: string;
  urgency: string;
  reason: string;
}

export interface DailyCoachPlan {
  greeting: string;
  summary: string;
  cycleDay: number | null;
  cyclePhase: CyclePhase | null;
  cycleNote: string;
  nextPeriodEstimate: string | null;
  nutritionFramework: NutritionFrameworkBlock;
  nutritionFocus: string[];
  mealPlan: MealSlotPlan[];
  workout: WorkoutPlanBlock;
  psychology: PsychologyBlock;
  tasks: CoachTask[];
  warnings: string[];
  dynamicInsights: string[];
  encouragement: string;
  labsDue: LabDueItem[];
  suggestedLabBundle: string | null;
  nutritionMeta: NutritionMeta;
  dayTargets: {
    calorieTarget: number;
    proteinTargetG: number;
    fatTargetG: number;
    carbTargetG: number;
    waterTargetMl: number;
  };
  softDay: boolean;
  suggestSoftDay: boolean;
  wellbeing: WellbeingPlan;
  labCalorieNote?: string;
  bodyBudget: BodyBudget;
  syndromeInsight: { headline: string; tip: string } | null;
  weeklyExperiment: WeeklyExperiment | null;
  labMealHints: LabMealHint[];
  vitalityScore: number;
  calorieExplainer: CalorieExplainer;
  inflammationLoad: InflammationLoad;
  compensation: CompensationSummary;
  healthBriefing: HealthBrief[];
  dayTasks: DayTask[];
  baseCalorieTarget: number;
  lifeSuggestions: LifeSuggestion[];
  mediaPicks: ReturnType<typeof pickMedia>;
  recipePicks: RecipeCard[];
  placePicks: PlaceSpot[];
  styleProfile: StyleProfile;
  horizonPlan: HorizonPlan;
  todayLeisure: TodayLeisurePick[];
  todaySportExtras: WorkoutOption[];
  personalizedRecs: PersonalizedDayPlan;
}

export interface SlippingArea {
  key: string;
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
  message: string;
  action: string;
}

export interface WeeklyInsights {
  avgWeight: number | null;
  weightChange: number | null;
  avgCalories: number | null;
  avgProtein: number | null;
  avgWater: number | null;
  avgSleepHours: number | null;
  avgMood: number | null;
  avgStress: number | null;
  avgEnergy: number | null;
  workoutCount: number;
  habitCompletionRate: number;
  slipping: SlippingArea[];
  wins: string[];
}
