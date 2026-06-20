/**
 * Обследования: УЗИ, МРТ, КТ, ЭКГ, эндоскопия, маммография и др.
 * Параллель labs-schedule.ts — анализы крови.
 */
import { addMonths, format, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

export type ExamCategory =
  | "ultrasound"
  | "imaging"
  | "cardio"
  | "gynecology"
  | "endoscopy"
  | "functional"
  | "other";

export type ExamStatus = "scheduled" | "done" | "needs_repeat" | "cancelled";

export interface ExamStudyDef {
  key: string;
  label: string;
  category: ExamCategory;
  description: string;
  when: string;
  preparation: string[];
  retestMonths?: number;
  indications: string[];
  note: string;
}

export interface ExamBundle {
  id: string;
  title: string;
  studies: string[];
  when: string;
  description: string;
}

export interface ScheduledExam {
  studyKey: string;
  label: string;
  category: ExamCategory;
  dueDate: Date;
  urgency: "overdue" | "this_month" | "upcoming" | "ok";
  reason: string;
}

export const EXAM_CATEGORY_LABELS: Record<ExamCategory, string> = {
  ultrasound: "УЗИ",
  imaging: "МРТ / КТ / рентген",
  cardio: "Сердце",
  gynecology: "Гинекология",
  endoscopy: "Эндоскопия",
  functional: "Функциональные",
  other: "Прочее",
};

export const EXAM_STUDIES: ExamStudyDef[] = [
  {
    key: "usg_thyroid",
    label: "УЗИ щитовидной железы",
    category: "ultrasound",
    description: "Структура, узлы, объём",
    when: "При гипотиреозе/узлах — раз в 12 мес; при стабильном ТТГ — по назначению",
    preparation: ["Без особой подготовки"],
    retestMonths: 12,
    indications: ["hypothyroidism", "hormoneIssues"],
    note: "Совместить с контролем ТТГ",
  },
  {
    key: "usg_pelvis",
    label: "УЗИ малого таза (трансвагинальное)",
    category: "gynecology",
    description: "Яичники, эндометрий, миомы, кисты",
    when: "День 5–12 цикла (фолликулярная) или по симптомам",
    preparation: ["Полный мочевой пузырь для трансабдоминального; ТВ-УЗИ — пустой"],
    retestMonths: 12,
    indications: ["pcosSuspected", "endometriosis", "hormoneIssues"],
    note: "Ключевое при СПКЯ и эндометриозе",
  },
  {
    key: "usg_breast",
    label: "УЗИ молочных желёз",
    category: "ultrasound",
    description: "Скрининг плотной ткани",
    when: "Ежегодно с 30–35 лет или по самообследованию",
    preparation: ["День 5–12 цикла предпочтительно"],
    retestMonths: 12,
    indications: ["hormoneIssues"],
    note: "Дополняет маммографию",
  },
  {
    key: "mammography",
    label: "Маммография",
    category: "imaging",
    description: "Рентгенологический скрининг",
    when: "С 40 лет каждые 1–2 года; раньше при семейном анамнезе",
    preparation: ["Без дезодоранта в день исследования"],
    retestMonths: 24,
    indications: [],
    note: "По национальным рекомендациям",
  },
  {
    key: "usg_abdomen",
    label: "УЗИ органов брюшной полости",
    category: "ultrasound",
    description: "Печень, желчный, поджелудочная, селезёнка",
    when: "При нарушении липидов/АЛТ или раз в 2–3 года",
    preparation: ["6–8 ч голодания"],
    retestMonths: 24,
    indications: ["insulinResistance"],
    note: "Желчный — при ИР и жирной пище",
  },
  {
    key: "usg_kidneys",
    label: "УЗИ почек и мочевого",
    category: "ultrasound",
    description: "Камни, структура, остаточная моча",
    when: "По показаниям или раз в 2 года",
    preparation: ["Полный мочевой пузырь"],
    indications: [],
    note: "",
  },
  {
    key: "echo_heart",
    label: "Эхокардиография (ЭхоКГ)",
    category: "cardio",
    description: "Структура и функция сердца",
    when: "При аритмии, одышке, семейном анамнезе ССЗ",
    preparation: ["Без подготовки"],
    retestMonths: 24,
    indications: [],
    note: "Базовый скрининг при нагрузках",
  },
  {
    key: "ecg",
    label: "ЭКГ в покое",
    category: "cardio",
    description: "Ритм, ишемия",
    when: "Ежегодно при активных тренировках; перед силовыми при рисках",
    preparation: ["Спокойно 10 мин до процедуры"],
    retestMonths: 12,
    indications: [],
    note: "Можно в поликлинике",
  },
  {
    key: "holter",
    label: "Холтер (24 ч)",
    category: "cardio",
    description: "Аритмии, вариабельность",
    when: "При перебоях в сердце, плохом сне",
    preparation: ["Обычный день, дневник симптомов"],
    indications: ["cortisolIssues"],
    note: "",
  },
  {
    key: "mri_pelvis",
    label: "МРТ малого таза",
    category: "imaging",
    description: "Золотой стандарт при эндометриозе",
    when: "При боли, подозрении на эндометриоз; не каждый год",
    preparation: ["Убрать металл; сообщить о клипсах"],
    indications: ["endometriosis"],
    note: "Точнее УЗИ при глубоком эндометриозе",
  },
  {
    key: "hsg",
    label: "Гистеросальпингография / Соногистерография",
    category: "gynecology",
    description: "Проходимость труб",
    when: "При планировании беременности",
    preparation: ["День 7–12 цикла, без инфекции"],
    indications: ["hormoneIssues"],
    note: "По назначению репродуктолога",
  },
  {
    key: "colposcopy",
    label: "Кольпоскопия",
    category: "gynecology",
    description: "Шейка матки после Пап-теста",
    when: "При ASCUS/HSIL в цитологии",
    preparation: ["Не во время месячных"],
    retestMonths: 12,
    indications: [],
    note: "Пап — раз в 3 года при норме",
  },
  {
    key: "pap_smear",
    label: "Цитология шейки (Пап-тест)",
    category: "gynecology",
    description: "Скрининг рака шейки",
    when: "Каждые 3 года (21–65 лет) при нормальных результатах",
    preparation: ["Не во время месячных"],
    retestMonths: 36,
    indications: [],
    note: "Обязательный женский скрининг",
  },
  {
    key: "densitometry",
    label: "Денситометрия (DEXA)",
    category: "imaging",
    description: "Плотность костей",
    when: "С 50 лет или раньше при аменорее, длительном дефиците",
    preparation: ["Без кальция за 24 ч"],
    retestMonths: 24,
    indications: ["hormoneIssues"],
    note: "",
  },
  {
    key: "fgds",
    label: "ФГДС (гастроскопия)",
    category: "endoscopy",
    description: "Желудок, Helicobacter",
    when: "При боли, изжоге, дефиците B12",
    preparation: ["Натощак 8 ч"],
    indications: ["b12Deficiency", "vitaminAbsorption"],
    note: "При низком B12 несмотря на приём",
  },
  {
    key: "colonoscopy",
    label: "Колоноскопия",
    category: "endoscopy",
    description: "Толстый кишечник",
    when: "С 45 лет каждые 10 лет; раньше при симптомах",
    preparation: ["Очистка кишечника по протоколу"],
    retestMonths: 120,
    indications: [],
    note: "Скрининг колоректального рака",
  },
  {
    key: "spirometry",
    label: "Спирометрия",
    category: "functional",
    description: "Функция лёгких",
    when: "При одышке, курении в анамнезе",
    preparation: ["Не курить 2 ч до"],
    indications: [],
    note: "",
  },
  {
    key: "sleep_study",
    label: "Полисомнография",
    category: "functional",
    description: "Апноэ, качество сна",
    when: "Храп, дневная сонливость, плохое восстановление",
    preparation: ["Обычный сон в лаборатории"],
    indications: ["cortisolIssues"],
    note: "Влияет на вес и кортизол",
  },
];

export const EXAM_BUNDLES: ExamBundle[] = [
  {
    id: "exam-women-base",
    title: "Базовый женский чекап",
    studies: ["usg_thyroid", "usg_pelvis", "pap_smear", "usg_breast", "ecg"],
    when: "Раз в год; УЗИ таза — день 5–12 цикла",
    description: "Щитовидка + гинекология + сердце",
  },
  {
    id: "exam-metabolic",
    title: "Метаболизм и ИР",
    studies: ["usg_abdomen", "usg_thyroid"],
    when: "При ИР, СПКЯ, нарушении липидов",
    description: "Печень, желчный, щитовидка",
  },
  {
    id: "exam-endo",
    title: "Эндометриоз / боль",
    studies: ["usg_pelvis", "mri_pelvis"],
    when: "При хронической тазовой боли",
    description: "УЗИ → при сомнениях МРТ",
  },
  {
    id: "exam-sleep-stress",
    title: "Сон и стресс",
    studies: ["sleep_study", "holter"],
    when: "При бессоннице, усталости, тахикардии",
    description: "Исключить апноэ и аритмию",
  },
];

export function getRecommendedStudies(flags: Record<string, boolean>): ExamStudyDef[] {
  return EXAM_STUDIES.filter((s) =>
    s.indications.length === 0
      ? false
      : s.indications.some((ind) => flags[ind]),
  );
}

export function buildExamSchedule(
  lastExams: { studyKey: string; date: Date }[],
  flags: Record<string, boolean>,
): ScheduledExam[] {
  const today = startOfDay(new Date());
  const recommended = getRecommendedStudies(flags);
  const allStudies = [...recommended, ...EXAM_STUDIES.filter((s) => s.key === "pap_smear" || s.key === "ecg")];
  const seen = new Set<string>();
  const scheduled: ScheduledExam[] = [];

  for (const study of allStudies) {
    if (seen.has(study.key)) continue;
    seen.add(study.key);
    const last = lastExams
      .filter((e) => e.studyKey === study.key)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    const due = last && study.retestMonths
      ? addMonths(last.date, study.retestMonths)
      : addMonths(today, 0);

    let urgency: ScheduledExam["urgency"] = "ok";
    if (!last) urgency = "this_month";
    else if (isBefore(due, today)) urgency = "overdue";
    else if (isBefore(due, addMonths(today, 1))) urgency = "this_month";
    else if (isBefore(due, addMonths(today, 3))) urgency = "upcoming";

    if (urgency !== "ok" || !last) {
      scheduled.push({
        studyKey: study.key,
        label: study.label,
        category: study.category,
        dueDate: due,
        urgency,
        reason: last
          ? `Пересдача (${study.retestMonths ?? "?"} мес)`
          : study.indications.length
            ? "Рекомендовано по профилю"
            : "Плановый скрининг",
      });
    }
  }

  return scheduled.sort((a, b) => {
    const order = { overdue: 0, this_month: 1, upcoming: 2, ok: 3 };
    return order[a.urgency] - order[b.urgency];
  });
}

export function formatExamDue(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: ru });
}

export function getDoctorExamOrderText(flags: Record<string, boolean>): string {
  const studies = buildExamSchedule([], flags);
  const lines = ["Направления на обследования:", ""];
  for (const s of studies.slice(0, 12)) {
    const def = EXAM_STUDIES.find((d) => d.key === s.studyKey);
    lines.push(`• ${s.label}${def ? ` — ${def.when}` : ""}`);
  }
  return lines.join("\n");
}
