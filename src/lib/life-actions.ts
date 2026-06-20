/** Парсинг lifeActionsJson из дневника */

export interface LifeActions {
  morning?: string[];
  midday?: string[];
  evening?: string[];
  /** @deprecated используй evening */
  ritual?: string[];
  painLevel?: number;
  painZones?: string[];
  selfcare?: string[];
  home?: string[];
}

export function parseLifeActions(raw: string | null | undefined): LifeActions {
  if (!raw || raw === "{}") return {};
  try {
    return JSON.parse(raw) as LifeActions;
  } catch {
    return {};
  }
}

export function routineDone(actions: LifeActions, phase: "morning" | "midday" | "evening"): string[] {
  if (phase === "evening") {
    return actions.evening ?? actions.ritual ?? [];
  }
  return actions[phase] ?? [];
}
