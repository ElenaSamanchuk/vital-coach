import type { BodyGoal } from "./profile-derivation";

export type LossPace = 0.3 | 0.5 | 0.7;

export interface ProfilePreferences {
  bodyGoal: BodyGoal | "auto";
  lossPaceKgPerWeek: LossPace;
}

export const DEFAULT_PREFERENCES: ProfilePreferences = {
  bodyGoal: "auto",
  lossPaceKgPerWeek: 0.5,
};

export function parseProfilePreferences(assessmentJson?: string | null): ProfilePreferences {
  if (!assessmentJson) return { ...DEFAULT_PREFERENCES };
  try {
    const raw = JSON.parse(assessmentJson) as Partial<ProfilePreferences>;
    return {
      bodyGoal: raw.bodyGoal ?? "auto",
      lossPaceKgPerWeek: raw.lossPaceKgPerWeek ?? 0.5,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function mergePreferencesIntoAssessment(
  assessmentJson: string | null | undefined,
  prefs: Partial<ProfilePreferences>,
): string {
  let base: Record<string, unknown> = {};
  try {
    base = JSON.parse(assessmentJson || "{}") as Record<string, unknown>;
  } catch {
    base = {};
  }
  return JSON.stringify({ ...base, ...prefs });
}
