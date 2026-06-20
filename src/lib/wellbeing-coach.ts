/**
 * Коучинг настроения, энергии и стресса — микро-действия с доказательной базой.
 */
import type { EvidenceBlock } from "./evidence-why";

export type WellbeingFocus = "energy" | "mood" | "stress" | "balance";

export interface WellbeingState {
  energy: number;
  mood: number;
  stress: number;
  cortisolFeeling?: number;
}

export interface WellbeingTrends {
  avgEnergy7d: number | null;
  avgMood7d: number | null;
  avgStress7d: number | null;
  energyTrend: "up" | "down" | "stable";
  moodTrend: "up" | "down" | "stable";
}

export interface WellbeingAction {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  why: string;
  source: string;
}

export interface WellbeingPlan {
  focus: WellbeingFocus;
  focusLabelRu: string;
  headline: string;
  summary: string;
  actions: WellbeingAction[];
  evidence: EvidenceBlock;
  moodLogged: boolean;
  actionsDone: string[];
}

const ACTION_CATALOG: Record<string, Omit<WellbeingAction, "id">> = {
  breathing_478: {
    title: "Дыхание 4-7-8",
    subtitle: "4 мин · снижает тревогу",
    durationMin: 4,
    why: "Медленное дыхание активирует парасимпатику и снижает кортизол уже за одну сессию.",
    source: "Perciavalle et al., Breathe, 2017",
  },
  walk_10: {
    title: "Прогулка 10 мин",
    subtitle: "на улице или у окна",
    durationMin: 10,
    why: "10 мин ходьбы на природе улучшают настроение сравнимо с лёгкой терапией.",
    source: "Barton & Pretty, Environ Sci Technol, 2010",
  },
  sunlight_5: {
    title: "Свет 5 мин",
    subtitle: "утренний или дневной",
    durationMin: 5,
    why: "Яркий свет утром синхронизирует циркадные ритмы и поднимает энергию при гипотиреозе/D-дефиците.",
    source: "Lewy et al., chronotherapy reviews",
  },
  protein_boost: {
    title: "Белок сейчас",
    subtitle: "яйца / творог / рыба",
    durationMin: 5,
    why: "Стабильный белок снижает провалы энергии и тягу к сладкому при ИР и ПМС.",
    source: "Teede PCOS guideline, 2023",
  },
  journal_3: {
    title: "3 строки дневника",
    subtitle: "что чувствую / что помогло",
    durationMin: 3,
    why: "Экспрессивное письмо снижает руминацию и улучшает эмоциональную регуляцию.",
    source: "Pennebaker meta-analyses",
  },
  stretch_8: {
    title: "Мягкая растяжка",
    subtitle: "шея, таз, дыхание",
    durationMin: 8,
    why: "При эндометриозе и стрессе мягкое движение снижает боль и напряжение без кортизолового пика.",
    source: "ESHRE endometriosis self-care",
  },
  sleep_prep: {
    title: "Подготовка ко сну",
    subtitle: "экран off · 30 мин раньше",
    durationMin: 30,
    why: "+30 мин сна улучшают настроение и чувствительность к инсулину на следующий день.",
    source: "Walker, Why We Sleep; sleep extension RCTs",
  },
  social_ping: {
    title: "Короткий контакт",
    subtitle: "сообщение близкому человеку",
    durationMin: 2,
    why: "Социальная связь — один из сильнейших предикторов устойчивого благополучия (PERMA).",
    source: "Seligman PERMA model",
  },
};

function pickFocus(state: WellbeingState, trends: WellbeingTrends): WellbeingFocus {
  const { energy, mood, stress } = state;
  if (stress >= 7 || (trends.avgStress7d ?? 0) >= 6.5) return "stress";
  if (energy <= 4 || trends.energyTrend === "down") return "energy";
  if (mood <= 4 || trends.moodTrend === "down") return "mood";
  return "balance";
}

const FOCUS_LABELS: Record<WellbeingFocus, string> = {
  energy: "Энергия",
  mood: "Настроение",
  stress: "Стресс",
  balance: "Баланс",
};

function actionsForFocus(
  focus: WellbeingFocus,
  cyclePhase: string | null,
  flags: { hypothyroidism?: boolean; endometriosis?: boolean },
): string[] {
  if (focus === "stress") {
    return ["breathing_478", "walk_10", "journal_3"];
  }
  if (focus === "energy") {
    const ids = ["sunlight_5", "protein_boost", "walk_10"];
    if (flags.hypothyroidism) return ["sunlight_5", "protein_boost", "sleep_prep"];
    return ids;
  }
  if (focus === "mood") {
    if (cyclePhase === "luteal" || cyclePhase === "menstrual") {
      return ["stretch_8", "journal_3", "social_ping"];
    }
    return ["walk_10", "journal_3", "social_ping"];
  }
  return ["walk_10", "breathing_478", "journal_3"];
}

export function computeWellbeingTrends(
  logs: { energy?: number | null; mood?: number | null; stress?: number | null }[],
): WellbeingTrends {
  const slice = logs.slice(-7);
  const energies = slice.map((l) => l.energy).filter((v): v is number => v != null);
  const moods = slice.map((l) => l.mood).filter((v): v is number => v != null);
  const stresses = slice.map((l) => l.stress).filter((v): v is number => v != null);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const trend = (arr: number[]): "up" | "down" | "stable" => {
    if (arr.length < 3) return "stable";
    const half = Math.floor(arr.length / 2);
    const a = avg(arr.slice(0, half)) ?? 0;
    const b = avg(arr.slice(half)) ?? 0;
    if (b - a > 0.4) return "up";
    if (a - b > 0.4) return "down";
    return "stable";
  };

  return {
    avgEnergy7d: avg(energies),
    avgMood7d: avg(moods),
    avgStress7d: avg(stresses),
    energyTrend: trend(energies),
    moodTrend: trend(moods),
  };
}

export function buildWellbeingPlan(opts: {
  state: WellbeingState;
  trends: WellbeingTrends;
  cyclePhase: string | null;
  moodLogged: boolean;
  actionsDone: string[];
  flags?: { hypothyroidism?: boolean; endometriosis?: boolean; cortisolIssues?: boolean };
  minimumDay?: boolean;
}): WellbeingPlan {
  const focus = pickFocus(opts.state, opts.trends);
  const ids = actionsForFocus(focus, opts.cyclePhase, opts.flags ?? {});

  if (opts.minimumDay) {
    ids.unshift("breathing_478");
  }

  const uniqueIds = [...new Set(ids)].slice(0, 3);
  const actions = uniqueIds
    .map((id) => {
      const item = ACTION_CATALOG[id];
      if (!item) return null;
      return { id, ...item };
    })
    .filter((a): a is WellbeingAction => a != null);

  let headline = `Фокус: ${FOCUS_LABELS[focus]}`;
  let summary = "Короткие действия ниже — выбери одно и отметь выполнение.";

  if (opts.state.stress >= 7) {
    headline = "Стресс высокий — сначала нервная система";
    summary = "Сегодня приоритет не дефицит, а восстановление. Одно действие = прогресс.";
  } else if (opts.state.energy <= 4) {
    headline = "Энергия низкая — мягкий режим";
    summary = "Белок, свет и короткая прогулка дают больше, чем «дожать» тренировку.";
  } else if (opts.state.mood <= 4) {
    headline = "Настроение просело — это данные, не провал";
    summary = "Запиши 3 строки или выйди на 10 мин — мозг переключится.";
  }

  const evidence: EvidenceBlock = {
    title: `Самочувствие · ${FOCUS_LABELS[focus]}`,
    why:
      focus === "stress"
        ? "Хронический стресс повышает кортизол и мешает снижению веса — сначала регуляция, потом дефицит."
        : focus === "energy"
          ? "Энергия зависит от сна, щитовидки, белка и света — коуч подстраивает нагрузку под твои цифры."
          : "Настроение и цикл связаны: в лютеиновой фазе снижение серотонина — норма, не «слабость».",
    source:
      focus === "stress"
        ? "Tomiyama et al., Psychosom Med"
        : focus === "energy"
          ? "ATA hypothyroidism + sleep hygiene"
          : "Reproductive endocrinology · PMS mood",
    action: actions[0] ? `Старт: ${actions[0].title}` : undefined,
  };

  return {
    focus,
    focusLabelRu: FOCUS_LABELS[focus],
    headline,
    summary,
    actions,
    evidence,
    moodLogged: opts.moodLogged,
    actionsDone: opts.actionsDone,
  };
}

export function parseWellbeingDone(lifeActionsJson?: string | null): string[] {
  if (!lifeActionsJson) return [];
  try {
    const la = JSON.parse(lifeActionsJson) as { wellbeing?: string[] };
    return la.wellbeing ?? [];
  } catch {
    return [];
  }
}
