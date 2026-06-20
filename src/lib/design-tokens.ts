/** Палитра: белый · зелёный · серый · коричневый · чёрный · фиолетовый · розовый */

export const VC = {
  white: "#FFFFFF",
  black: "#111111",
  gray: "#6B6B6B",
  graySoft: "rgba(107, 107, 107, 0.1)",
  brown: "#8B6F47",
  brownSoft: "rgba(139, 111, 71, 0.12)",
  accent: "#3D9B6E",
  accentHover: "#2F7D58",
  accentSoft: "rgba(61, 155, 110, 0.12)",
  accentMuted: "#6BB892",
  purple: "#7C6BA8",
  purpleSoft: "rgba(124, 107, 168, 0.14)",
  pink: "#D4869C",
  pinkSoft: "rgba(212, 134, 156, 0.14)",

  ringMeals: "#6BB892",
  ringMove: "#3D9B6E",
  ringLog: "#8B6F47",
  ringWellbeing: "#7C6BA8",

  success: "#3D9B6E",
  successSoft: "rgba(61, 155, 110, 0.12)",
  warning: "#8B6F47",
  text: "#111111",
  textSecondary: "#6B6B6B",
  textTertiary: "#9A9A9A",
  surface: "#F5F5F5",
  elevated: "#FFFFFF",
  border: "rgba(17, 17, 17, 0.08)",
} as const;

export const CARD_ICON = VC.accent;

export const BRAND_GRADIENT = `linear-gradient(135deg, ${VC.accentMuted} 0%, ${VC.accent} 100%)`;

export const CYCLE_PHASES = [
  { id: "menstrual", label: "М", full: "Менструация", color: VC.pink },
  { id: "follicular", label: "Ф", full: "Фолликулярная", color: VC.accent },
  { id: "ovulation", label: "О", full: "Овуляция", color: VC.accentMuted },
  { id: "luteal", label: "Л", full: "Лютеиновая", color: VC.purple },
] as const;
