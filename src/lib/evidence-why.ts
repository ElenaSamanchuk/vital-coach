/**
 * Доказательные объяснения «почему» — коротко, с источником.
 */

import { CHECKUP } from "./product-copy";

export interface EvidenceBlock {
  title: string;
  why: string;
  source: string;
  action?: string;
}

export function getHealthContextTip(flags: {
  pcosSuspected?: boolean;
  hypothyroidism?: boolean;
  endometriosis?: boolean;
  insulinResistance?: boolean;
  cortisolIssues?: boolean;
  cyclePhase?: string | null;
}): EvidenceBlock | null {
  if (flags.endometriosis && flags.cyclePhase === "menstrual") {
    return {
      title: "Эндометриоз · менструация",
      why: "Прогестагеновая фаза и воспаление снижают толерантность к дефициту и HIIT.",
      source: "ESHRE Guideline endometriosis, 2022",
      action: "Сегодня: мягкое движение, белок 25+ г, без жёсткого голодания.",
    };
  }
  if (flags.pcosSuspected) {
    return {
      title: "СПКЯ",
      why: "Белок и силовая улучшают чувствительность к инсулину сильнее, чем ещё один дефицит калорий.",
      source: "Teede et al., PCOS guideline, 2023",
      action: "Приоритет: белок в каждый приём + ходьба после еды.",
    };
  }
  if (flags.hypothyroidism) {
    return {
      title: "Гипотиреоз",
      why: "При низком ТТГ-контексте агрессивный дефицит снижает конверсию T4→T3 и энергию.",
      source: "ATA Hypothyroidism guidelines",
      action: "Не ниже ~1500 ккал без контроля врача; тироксин натощак.",
    };
  }
  if (flags.insulinResistance) {
    return {
      title: "Инсулинорезистентность",
      why: "Порядок еды (белок/клетчатка → углеводы) и ходьба 10 мин снижают постпрандиальный глюкозный пик.",
      source: "Shukla et al., Diabetes Care, 2015",
      action: "Углеводы — в первой половине дня; ужин — белок + овощи.",
    };
  }
  if (flags.cortisolIssues) {
    return {
      title: "Кортизол / стресс",
      why: "При хроническом стрессе жёсткий дефицит повышает кортизол и мешает снижению веса.",
      source: "Tomiyama et al., Psychosom Med, 2010",
      action: "Сон + йога/прогулка важнее «догнать» калории.",
    };
  }
  return null;
}

const WORKOUT_EVIDENCE: Record<string, EvidenceBlock> = {
  bike: {
    title: "Велосипед",
    why: "Аэробная нагрузка зоны 2 улучшает чувствительность к инсулину без ударного стресса на суставы.",
    source: "Colberg et al., ACSM position stand",
  },
  pool: {
    title: "Бассейн",
    why: "Горизонтальная нагрузка снижает компрессию таза — релевантно при эндометриозе и восстановлении.",
    source: "ACSM aquatic exercise guidelines",
  },
  walk: {
    title: "Ходьба",
    why: "120 мин/нед на природе снижают субъективный стресс и улучшают настроение (эффект размером с лёгкую терапию).",
    source: "Barton & Pretty, Environ Sci Technol, 2010",
  },
  yoga: {
    title: "Йога",
    why: "Регулярная йога снижает кортизол и тревогу у женщин с гормональными нарушениями.",
    source: "Pascoe et al., Mental Health Phys Act meta-analysis",
  },
  strength: {
    title: "Силовая",
    why: "Силовая 2–3×/нед повышает мышечную массу → выше базовый расход и чувствительность к глюкозе.",
    source: "Westcott, ACSM Health & Fitness Journal",
  },
};

export function getWorkoutEvidence(type?: string): EvidenceBlock | null {
  if (!type) return null;
  return WORKOUT_EVIDENCE[type] ?? null;
}

const LAB_EVIDENCE: { match: RegExp; block: EvidenceBlock }[] = [
  {
    match: /ттг|tsh/i,
    block: {
      title: "ТТГ",
      why: "При гипотиреозе ТТГ и симптомы задают безопасный темп дефицита и приоритет белка.",
      source: "ATA / ETA guidelines",
    },
  },
  {
    match: /глюкоз|glucose/i,
    block: {
      title: "Глюкоза натощак",
      why: "Уровень глюкозы определяет, насколько агрессивны углеводы вечером.",
      source: "ADA Standards of Care",
      action: "Сдай натощак 8–12 ч без кофе.",
    },
  },
  {
    match: /витамин\s*d|25\(oh\)d/i,
    block: {
      title: "Витамин D",
      why: "Дефицит D связан с усталостью, настроением и иммунитетом у женщин с аутоиммунными маркерами.",
      source: "Holick, NEJM review",
      action: "Сдай 25(OH)D — дозу назначает врач.",
    },
  },
];

export function getLabEvidence(label: string, urgency: string): EvidenceBlock {
  const hit = LAB_EVIDENCE.find((e) => e.match.test(label));
  if (hit) {
    const action =
      urgency === "overdue"
        ? `Сдай ${hit.block.title} — коуч скорректирует план.`
        : hit.block.action;
    return { ...hit.block, action };
  }
  return {
    title: label || CHECKUP.section,
    why: "Без актуальных маркеров коуч использует средние нормы, а не твои значения.",
    source: "Персонализированная медицина",
    action:
      urgency === "overdue"
        ? CHECKUP.addResultHint
        : "Запланируй сдачу в ближайшие недели.",
  };
}

export function getNutritionDayEvidence(
  principles: string[],
  calorieNote: string,
): EvidenceBlock {
  return {
    title: "Питание сегодня",
    why: principles[0] ?? "Умеренный дефицит сохраняет мышцы и энергию лучше, чем экстремальное ограничение.",
    source: "Mediterranean + high-protein weight loss meta-analyses",
    action: calorieNote,
  };
}

export function mealEvidenceBlock(evidence: string, title: string): EvidenceBlock {
  return {
    title,
    why: evidence,
    source: "Nutrition matrix · IR/PCOS/thyroid synthesis",
  };
}
