/** Уход за собой — полный ритуал */

export interface CareRoutine {
  id: string;
  label: string;
  minutes: number;
  zone: "face" | "hair" | "body" | "relax";
  hint?: string;
}

export const SELF_CARE_ROUTINES: CareRoutine[] = [
  { id: "face_mask", label: "Маска для лица", minutes: 15, zone: "face", hint: "1–2×/нед" },
  { id: "hair_mask", label: "Маска для волос", minutes: 30, zone: "hair" },
  { id: "hair_wash", label: "Уход за волосами", minutes: 20, zone: "hair" },
  { id: "massage_face", label: "Массаж лица", minutes: 5, zone: "face" },
  { id: "massage_body", label: "Массаж / роллер", minutes: 10, zone: "body" },
  { id: "skincare", label: "Кожа: крем, масло", minutes: 10, zone: "face" },
  { id: "scrub", label: "Скраб", minutes: 10, zone: "body" },
  { id: "bath_ritual", label: "Ванна / душ-ритуал", minutes: 20, zone: "relax", hint: "Свечи, арома" },
  { id: "teeth", label: "Зубы / полоскание", minutes: 5, zone: "face" },
  { id: "ears_nose", label: "Уши / нос", minutes: 5, zone: "face" },
  { id: "nails", label: "Ногти", minutes: 20, zone: "body" },
  { id: "brows_lashes", label: "Брови / ресницы", minutes: 15, zone: "face" },
  { id: "eye_drops", label: "Капли для глаз", minutes: 2, zone: "face" },
  { id: "manicure", label: "Маникюр / руки", minutes: 20, zone: "body" },
  { id: "relax_music", label: "Релакс + музыка", minutes: 15, zone: "relax" },
  { id: "rest_eyes", label: "Отдых для глаз", minutes: 10, zone: "relax" },
];

export const CARE_ZONES = [
  { id: "face", label: "Лицо" },
  { id: "hair", label: "Волосы" },
  { id: "body", label: "Тело" },
  { id: "relax", label: "Релакс" },
] as const;

export function parseSelfCareLog(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw) as string[] | { done?: string[] };
    return Array.isArray(j) ? j : (j.done ?? []);
  } catch {
    return [];
  }
}
