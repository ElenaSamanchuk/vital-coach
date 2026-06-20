"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CHECKUP } from "@/lib/product-copy";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { LAB_MARKERS } from "@/lib/analytics";
import { LAB_BUNDLES, buildLabSchedule, getDoctorOrderText } from "@/lib/labs-schedule";
import {
  EXAM_STUDIES,
  EXAM_BUNDLES,
  EXAM_CATEGORY_LABELS,
  buildExamSchedule,
  getDoctorExamOrderText,
  type ExamCategory,
} from "@/lib/examinations-schedule";
import { articlesForHealthFlags } from "@/lib/knowledge-base";

type Tab = "labs" | "imaging" | "schedule" | "knowledge";

interface LabRow {
  id: string;
  date: string;
  marker: string;
  value: number;
  unit: string;
  refMin?: number;
  refMax?: number;
}

interface ExamRow {
  id: string;
  date: string;
  studyKey: string;
  category: string;
  resultSummary: string;
  findings: string;
}

interface ProfileFlags {
  insulinResistance?: boolean;
  hypothyroidism?: boolean;
  pcosSuspected?: boolean;
  endometriosis?: boolean;
  cortisolIssues?: boolean;
  b12Deficiency?: boolean;
  hormoneIssues?: boolean;
  vitaminAbsorption?: boolean;
  lastPeriodStart?: string | null;
}

export function HealthHub() {
  const [tab, setTab] = useState<Tab>("schedule");
  const [labs, setLabs] = useState<LabRow[]>([]);
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [profile, setProfile] = useState<ProfileFlags | null>(null);
  const [labForm, setLabForm] = useState({ marker: "TSH", value: "", date: format(new Date(), "yyyy-MM-dd") });
  const [examForm, setExamForm] = useState({
    studyKey: "usg_thyroid",
    date: format(new Date(), "yyyy-MM-dd"),
    resultSummary: "",
    findings: "",
  });

  const load = () => {
    Promise.all([apiClient("/api/labs"), apiClient("/api/examinations"), apiClient("/api/profile")]).then(
      async ([l, e, p]) => {
        setLabs(await l.json());
        setExams(await e.json());
        setProfile(await p.json());
      },
    );
  };

  useEffect(() => {
    load();
  }, []);

  const flags: Record<string, boolean> = {
    insulinResistance: profile?.insulinResistance ?? false,
    hypothyroidism: profile?.hypothyroidism ?? false,
    pcosSuspected: profile?.pcosSuspected ?? false,
    endometriosis: profile?.endometriosis ?? false,
    cortisolIssues: profile?.cortisolIssues ?? false,
    b12Deficiency: profile?.b12Deficiency ?? false,
    hormoneIssues: profile?.hormoneIssues ?? false,
    vitaminAbsorption: profile?.vitaminAbsorption ?? false,
  };

  const addLab = async () => {
    const def = LAB_MARKERS.find((m) => m.marker === labForm.marker);
    if (!labForm.value || !def) return;
    await apiClient("/api/labs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marker: labForm.marker,
        value: parseFloat(labForm.value),
        unit: def.unit,
        refMin: def.refMin,
        refMax: def.refMax,
        date: labForm.date,
      }),
    });
    setLabForm({ ...labForm, value: "" });
    load();
  };

  const addExam = async () => {
    await apiClient("/api/examinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(examForm),
    });
    setExamForm({ ...examForm, resultSummary: "", findings: "" });
    load();
  };

  const labSchedule = buildLabSchedule(
    labs.map((l) => ({ marker: l.marker, date: new Date(l.date), value: l.value, refMin: l.refMin, refMax: l.refMax })),
    null,
  );

  const examSchedule = buildExamSchedule(
    exams.map((e) => ({ studyKey: e.studyKey, date: new Date(e.date) })),
    flags,
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "schedule", label: "План" },
    { id: "labs", label: CHECKUP.markersTab },
    { id: "imaging", label: "УЗИ / обслед." },
    { id: "knowledge", label: "База" },
  ];

  const urgencyVariant = (u: string) =>
    u === "overdue" || u === "this_month" ? "danger" : u === "this_week" ? "warning" : "neutral";

  return (
    <div className="space-y-4 pb-8">
      <div className="flex gap-1 p-1 bg-[#e8e8ed] rounded-xl overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[72px] py-2 px-2 rounded-lg text-[12px] font-semibold transition-colors ${
              tab === t.id ? "bg-white shadow-sm text-[var(--accent)]" : "text-[var(--text-secondary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "schedule" && (
        <>
          <Card title={CHECKUP.bloodScheduleTitle} subtitle={CHECKUP.bloodScheduleSubtitle}>
            {labSchedule.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)]">{CHECKUP.emptySchedule}</p>
            ) : (
              <ul className="space-y-2">
                {labSchedule.slice(0, 6).map((s) => (
                  <li key={s.marker} className="flex justify-between items-start gap-2 p-3 bg-[var(--bg-subtle)] rounded-xl text-[13px]">
                    <span>{s.label}</span>
                    <Badge variant={urgencyVariant(s.urgency) as "danger" | "warning" | "neutral"}>{s.reason}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Обследования" subtitle="УЗИ, МРТ, гинекология">
            {examSchedule.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)]">Нет срочных — отлично</p>
            ) : (
              <ul className="space-y-2">
                {examSchedule.slice(0, 6).map((s) => (
                  <li key={s.studyKey} className="p-3 bg-[var(--bg-subtle)] rounded-xl text-[13px]">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{s.label}</span>
                      <Badge variant={urgencyVariant(s.urgency) as "danger" | "warning" | "neutral"}>
                        {EXAM_CATEGORY_LABELS[s.category]}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{s.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={CHECKUP.visitBundles}>
            {LAB_BUNDLES.slice(0, 4).map((b) => (
              <div key={b.id} className="mb-3 text-[13px]">
                <p className="font-semibold">{b.title}</p>
                <p className="text-[var(--text-secondary)]">{b.when}</p>
              </div>
            ))}
          </Card>
          <Card title="Пакеты обследований">
            {EXAM_BUNDLES.map((b) => (
              <div key={b.id} className="mb-3 text-[13px]">
                <p className="font-semibold">{b.title}</p>
                <p className="text-[var(--text-secondary)]">{b.description} · {b.when}</p>
              </div>
            ))}
          </Card>
          <details className="vc-surface p-4">
            <summary className="vc-title text-[14px] cursor-pointer">{CHECKUP.doctorTextLabs}</summary>
            <pre className="text-[11px] mt-2 whitespace-pre-wrap text-[var(--text-secondary)]">{getDoctorOrderText()}</pre>
          </details>
          <details className="vc-surface p-4">
            <summary className="vc-title text-[14px] cursor-pointer">Текст для врача (УЗИ / обслед.)</summary>
            <pre className="text-[11px] mt-2 whitespace-pre-wrap text-[var(--text-secondary)]">{getDoctorExamOrderText(flags)}</pre>
          </details>
        </>
      )}

      {tab === "labs" && (
        <>
          <Card title={CHECKUP.addMarkerCard}>
            <div className="space-y-3">
              <select className="apple-input" value={labForm.marker} onChange={(e) => setLabForm({ ...labForm, marker: e.target.value })}>
                {LAB_MARKERS.map((m) => (
                  <option key={m.marker} value={m.marker}>{m.label}</option>
                ))}
              </select>
              <input className="apple-input" placeholder="Значение" value={labForm.value} onChange={(e) => setLabForm({ ...labForm, value: e.target.value })} />
              <input type="date" className="apple-input" value={labForm.date} onChange={(e) => setLabForm({ ...labForm, date: e.target.value })} />
              <button type="button" className="apple-btn apple-btn-primary w-full" onClick={addLab}>Сохранить</button>
            </div>
          </Card>
          <Card title="История">
            {labs.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)]">Пока пусто</p>
            ) : (
              <ul className="space-y-2">
                {labs.map((l) => {
                  const def = LAB_MARKERS.find((m) => m.marker === l.marker);
                  const ok = l.refMin != null && l.value < l.refMin ? "low" : l.refMax != null && l.value > l.refMax ? "high" : "ok";
                  return (
                    <li key={l.id} className="flex justify-between p-3 bg-[var(--bg-subtle)] rounded-xl text-[13px]">
                      <span>{def?.label ?? l.marker}</span>
                      <span className={ok !== "ok" ? "text-[var(--danger)] font-semibold" : ""}>
                        {l.value} {l.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      {tab === "imaging" && (
        <>
          <Card title="Добавить обследование" subtitle="УЗИ, МРТ, ЭКГ, гинекология…">
            <div className="space-y-3">
              <select className="apple-input" value={examForm.studyKey} onChange={(e) => setExamForm({ ...examForm, studyKey: e.target.value })}>
                {(Object.keys(EXAM_CATEGORY_LABELS) as ExamCategory[]).map((cat) => (
                  <optgroup key={cat} label={EXAM_CATEGORY_LABELS[cat]}>
                    {EXAM_STUDIES.filter((s) => s.category === cat).map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input type="date" className="apple-input" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} />
              <input className="apple-input" placeholder="Краткий результат" value={examForm.resultSummary} onChange={(e) => setExamForm({ ...examForm, resultSummary: e.target.value })} />
              <textarea className="apple-input" placeholder="Находки / заключение" value={examForm.findings} onChange={(e) => setExamForm({ ...examForm, findings: e.target.value })} />
              <button type="button" className="apple-btn apple-btn-primary w-full" onClick={addExam}>Сохранить</button>
            </div>
          </Card>
          <Card title="Каталог исследований">
            {EXAM_STUDIES.slice(0, 8).map((s) => (
              <details key={s.key} className="mb-2 text-[12px]">
                <summary className="font-medium cursor-pointer">{s.label}</summary>
                <p className="text-[var(--text-secondary)] mt-1">{s.description}</p>
                <p className="mt-1">Когда: {s.when}</p>
              </details>
            ))}
          </Card>
          <Card title="История обследований">
            {exams.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)]">Добавь первое УЗИ или обследование</p>
            ) : (
              <ul className="space-y-2">
                {exams.map((e) => {
                  const def = EXAM_STUDIES.find((s) => s.key === e.studyKey);
                  return (
                    <li key={e.id} className="p-3 bg-[var(--bg-subtle)] rounded-xl text-[13px]">
                      <p className="font-medium">{def?.label ?? e.studyKey}</p>
                      <p className="text-[11px] text-[var(--text-secondary)]">{format(new Date(e.date), "dd.MM.yyyy")}</p>
                      {e.resultSummary && <p className="mt-1">{e.resultSummary}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      {tab === "knowledge" && (
        <Card title="Медицинская база" subtitle="По твоему профилю">
          <div className="space-y-3">
            {articlesForHealthFlags(flags).map((a) => (
              <div key={a.id} className="p-3 bg-[var(--bg-subtle)] rounded-xl">
                <p className="vc-title text-[14px]">{a.title}</p>
                <p className="text-[12px] text-[var(--text-secondary)] mt-1">{a.summary}</p>
                <ul className="mt-2 text-[11px] list-disc pl-4">
                  {a.keyPoints.slice(0, 2).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
