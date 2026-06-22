import type { OnboardingAssessment } from "./onboarding-assessment";

/** Факторы, влияющие на калории, воду и активность в режиме «Поток» */
export const GENERIC_HEALTH_OPTIONS: {
  key: keyof OnboardingAssessment;
  label: string;
  hint: string;
}[] = [
  { key: "insulinResistance", label: "Инсулинорезистентность", hint: "Стабильнее сахар · больше белка и ходьбы" },
  { key: "hypothyroidism", label: "Щитовидная железа", hint: "Мягче дефицит · контроль энергии" },
  { key: "cortisolIssues", label: "Стресс / кортизол", hint: "Больше воды · без перегруза" },
  { key: "hormoneIssues", label: "Гормональные колебания", hint: "Гибкий план калорий" },
  { key: "pcosSuspected", label: "СПКЯ / половые гормоны", hint: "Белок · силовая · низкий ГИ" },
  { key: "endometriosis", label: "Эндометриоз", hint: "Мягкая нагрузка · восстановление" },
];

export const ACTIVITY_LEVEL_OPTIONS = [
  { id: "low" as const, label: "Мало движения" },
  { id: "moderate" as const, label: "Умеренная" },
  { id: "high" as const, label: "Высокая" },
];

export const GENDER_OPTIONS = [
  { id: "female", label: "Женский" },
  { id: "male", label: "Мужской" },
  { id: "other", label: "Другое / не указывать" },
];
