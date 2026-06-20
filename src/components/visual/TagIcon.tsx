import {
  Bath,
  Brush,
  Coffee,
  CookingPot,
  Dumbbell,
  Flower2,
  Footprints,
  Frown,
  Hand,
  Home,
  Moon,
  Pill,
  Salad,
  Shirt,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TagIcon as TagIconName } from "@/lib/tracking-tags";

const MAP: Record<TagIconName, LucideIcon> = {
  footprints: Footprints,
  dumbbell: Dumbbell,
  pill: Pill,
  flower: Flower2,
  users: Users,
  coffee: Coffee,
  frown: Frown,
  salad: Salad,
  moon: Moon,
  sparkles: Sparkles,
  bath: Bath,
  hand: Hand,
  brush: Brush,
  home: Home,
  shirt: Shirt,
  cooking: CookingPot,
};

export function TagIconView({ name, size = 14 }: { name?: TagIconName; size?: number }) {
  if (!name) return null;
  const Icon = MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className="shrink-0" />;
}
