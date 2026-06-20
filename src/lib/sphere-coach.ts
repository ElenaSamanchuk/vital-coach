import type { WheelScores, SphereKey, RelationshipStatus } from "./life-spheres";
import { getLowestSpheres, getSphereAdvice, LIFE_SPHERES } from "./life-spheres";
import type { PermaScore } from "./psychology-frameworks";
import { getPermaInsight, getMaslowFocus, hasBigFiveScores, hasPermaScores } from "./psychology-frameworks";
import type { BigFiveTrait } from "./psychology-frameworks";
import { BIG_FIVE_META } from "./psychology-frameworks";

export interface LifeCoachReport {
  prioritySpheres: SphereKey[];
  advice: ReturnType<typeof getSphereAdvice>[];
  maslowFocus: string;
  permaInsights: string[];
  personalityTips: string[];
  weeklyFocus: string;
}

export function buildLifeCoachReport(ctx: {
  wheelScores: WheelScores;
  perma: PermaScore | null;
  bigFive: Record<BigFiveTrait, number> | null;
  occupation: string;
  relationshipStatus: RelationshipStatus;
  pcos: boolean;
  avgStress: number;
}): LifeCoachReport {
  const prioritySpheres = getLowestSpheres(ctx.wheelScores, 3);
  const advice = prioritySpheres.map((key) =>
    getSphereAdvice(key, {
      occupation: ctx.occupation,
      relationshipStatus: ctx.relationshipStatus,
      score: ctx.wheelScores[key] ?? 0,
      pcos: ctx.pcos,
      stressHigh: ctx.avgStress >= 7,
    }),
  );

  const permaInsights = hasPermaScores(ctx.perma) ? getPermaInsight(ctx.perma) : [];
  const maslowFocus = getMaslowFocus(ctx.wheelScores as Record<string, number>);

  const personalityTips: string[] = [];
  if (hasBigFiveScores(ctx.bigFive)) {
    const traits = Object.entries(ctx.bigFive) as [BigFiveTrait, number][];
    const lowest = traits.sort((a, b) => a[1] - b[1])[0];
    const highest = traits.sort((a, b) => b[1] - a[1])[0];
    personalityTips.push(
      `Сильная черта: ${BIG_FIVE_META[highest[0]].label} — ${BIG_FIVE_META[highest[0]].high}`,
    );
    personalityTips.push(BIG_FIVE_META[lowest[0]].careerTip);
    if (ctx.bigFive.N >= 5.5) {
      personalityTips.push("Высокий нейротизм: приоритет сон + не ужесточать дефицит");
    }
    if (ctx.bigFive.C <= 4) {
      personalityTips.push("Низкая добросовестность: дневник и чеклисты — твой внешний мозг");
    }
  }

  const weeklyFocus = prioritySpheres.length
    ? `На этой неделе прокачивай: ${prioritySpheres.map((k) => LIFE_SPHERES.find((s) => s.key === k)?.label).join(", ")}`
    : "Заполни колесо жизни (1–10) — коуч покажет приоритеты";

  return {
    prioritySpheres,
    advice,
    maslowFocus,
    permaInsights,
    personalityTips,
    weeklyFocus,
  };
}

export const FINANCE_ACTIONS = [
  { id: "saved", label: "Отложила", emoji: "🏦" },
  { id: "budget", label: "Обзор бюджета", emoji: "📊" },
  { id: "no_impulse", label: "Без импульсной покупки", emoji: "🛑" },
  { id: "invested", label: "Инвестиция/вклад", emoji: "📈" },
  { id: "learned", label: "Училась финансам", emoji: "📚" },
];

export const WORK_ACTIONS = [
  { id: "deep_work", label: "Глубокая работа 1+ ч", emoji: "🎯" },
  { id: "skill", label: "Новый навык", emoji: "📖" },
  { id: "network", label: "Нетворкинг", emoji: "🔗" },
  { id: "win", label: "Рабочий win", emoji: "✅" },
  { id: "boundary", label: "Граница (нет переработке)", emoji: "🚧" },
];

export const RELATION_ACTIONS = [
  { id: "date", label: "Свидание / качественное время", emoji: "💕" },
  { id: "friend", label: "Встреча с другом", emoji: "☕" },
  { id: "talk", label: "Глубокий разговор", emoji: "💬" },
  { id: "meet_new", label: "Новое знакомство", emoji: "👋" },
  { id: "gratitude", label: "Благодарность близкому", emoji: "💌" },
];

export const SPIRIT_ACTIONS = [
  { id: "meditate", label: "Медитация/тишина", emoji: "🧘" },
  { id: "journal", label: "Дневник благодарности", emoji: "📝" },
  { id: "nature", label: "Природа без телефона", emoji: "🌲" },
  { id: "values", label: "Рефлексия ценностей", emoji: "🕊️" },
];

export const ENVIRONMENT_ACTIONS = [
  { id: "tidy", label: "15 мин порядка", emoji: "🧹" },
  { id: "desk", label: "Чистое рабочее место", emoji: "🖥️" },
  { id: "cozy", label: "Уют (свет, растение)", emoji: "🪴" },
  { id: "declutter", label: "Убрала лишнее", emoji: "📦" },
];

export const CREATIVITY_ACTIONS = [
  { id: "draw", label: "Рисование/скетч", emoji: "🎨" },
  { id: "music", label: "Музыка/пение", emoji: "🎵" },
  { id: "cook", label: "Готовка как творчество", emoji: "👩‍🍳" },
  { id: "craft", label: "Рукоделие/DIY", emoji: "✂️" },
];

export const GROWTH_ACTIONS = [
  { id: "review", label: "Обзор недели", emoji: "📋" },
  { id: "book", label: "Книга/статья", emoji: "📖" },
  { id: "reflect", label: "Рефлексия в дневнике", emoji: "💭" },
  { id: "course", label: "Курс/лекция", emoji: "🎓" },
];
