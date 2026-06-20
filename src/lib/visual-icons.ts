import type { LucideIcon } from "lucide-react";
import {
  Sun,
  Coffee,
  Moon,
  Cookie,
  Bike,
  Waves,
  Dumbbell,
  Footprints,
  Flower2,
  Utensils,
  Activity,
  ClipboardPen,
  Map,
  UserRound,
  FlaskConical,
  Heart,
  Sparkles,
  Settings,
  BookOpen,
} from "lucide-react";
import { VC } from "./design-tokens";

/** 4 зоны приложения — визуальная карта */
export const ZONE_VISUAL = [
  {
    href: "/",
    label: "Сегодня",
    role: "Выбор",
    Icon: Sun,
    color: VC.accent,
    bg: VC.accentSoft,
  },
  {
    href: "/log",
    label: "Дневник",
    role: "Динамика",
    Icon: ClipboardPen,
    color: VC.ringLog,
    bg: VC.successSoft,
  },
  {
    href: "/path",
    label: "Путь",
    role: "Перспектива",
    Icon: Map,
    color: VC.accentMuted,
    bg: VC.accentSoft,
  },
  {
    href: "/settings",
    label: "Профиль",
    role: "О себе",
    Icon: UserRound,
    color: VC.accentHover,
    bg: VC.accentSoft,
  },
] as const;

export const TODAY_STEPS = [
  { id: "meals", label: "Еда", Icon: Utensils, color: VC.ringMeals },
  { id: "workout", label: "Движение", Icon: Activity, color: VC.ringMove },
  { id: "diary", label: "Дневник", Icon: ClipboardPen, color: VC.ringLog },
] as const;

const MEAL_ICONS: Record<string, LucideIcon> = {
  breakfast: Sun,
  lunch: Coffee,
  dinner: Moon,
  snack: Cookie,
};

export function mealIcon(slot: string): LucideIcon {
  return MEAL_ICONS[slot] ?? Utensils;
}

const WORKOUT_ICONS: Record<string, LucideIcon> = {
  bike: Bike,
  pool: Waves,
  strength: Dumbbell,
  yoga: Flower2,
  walk: Footprints,
};

export function workoutIcon(type?: string): LucideIcon {
  if (!type) return Activity;
  return WORKOUT_ICONS[type] ?? Activity;
}

export const MOOD_VISUAL = [
  { label: "Отлично", emoji: "😊", energy: 9, mood: 9, stress: 2 },
  { label: "Норм", emoji: "🙂", energy: 7, mood: 7, stress: 5 },
  { label: "Устала", emoji: "😴", energy: 4, mood: 5, stress: 6 },
  { label: "Стресс", emoji: "😰", energy: 5, mood: 4, stress: 8 },
  { label: "Тяжело", emoji: "😔", energy: 3, mood: 3, stress: 9 },
] as const;

export const SETTINGS_TABS = [
  { id: "body", label: "Тело", Icon: Heart, color: VC.accent },
  { id: "life", label: "Жизнь", Icon: Sparkles, color: VC.accentMuted },
  { id: "health", label: "Анализы", Icon: FlaskConical, color: VC.ringLog },
  { id: "system", label: "Ещё", Icon: Settings, color: VC.textSecondary },
] as const;

export const HEALTH_FLAGS_ICONS: Record<string, string> = {
  insulinResistance: "🍬",
  hypothyroidism: "🦋",
  cortisolIssues: "⚡",
  vitaminDDeficiency: "☀️",
  b12Deficiency: "💊",
  hormoneIssues: "🌙",
  pcosSuspected: "🔄",
  endometriosis: "🌸",
  vitaminAbsorption: "🧬",
  surgeryRecovery: "🩹",
};
