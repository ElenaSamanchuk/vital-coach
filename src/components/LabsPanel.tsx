"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CHECKUP } from "@/lib/product-copy";
import { Card } from "./ui/Card";
import { LAB_MARKERS } from "@/lib/analytics";
import { LAB_BUNDLES, buildLabSchedule, getDoctorOrderText } from "@/lib/labs-schedule";

interface LabRow {
  id: string;
  date: string;
  marker: string;
  value: number;
  unit: string;
  refMin?: number;
  refMax?: number;
}

interface Profile {
  lastPeriodStart?: string | null;
  cycleLength?: number;
}

export function LabsPanel() {
  const [labs, setLabs] = useState<LabRow[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    marker: "TSH",
    value: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const load = () => {
    Promise.all([apiClient("/api/labs"), apiClient("/api/profile")]).then(async ([l, p]) => {
      setLabs(await l.json());
      setProfile(await p.json());
    });
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const def = LAB_MARKERS.find((m) => m.marker === form.marker);
    if (!form.value || !def) return;
    await apiClient("/api/labs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marker: form.marker,
        value: parseFloat(form.value),
        unit: def.unit,
        refMin: def.refMin,
        refMax: def.refMax,
        date: form.date,
      }),
    });
    setForm({ ...form, value: "" });
    load();
  };

  const status = (lab: LabRow) => {
    if (lab.refMin != null && lab.value < lab.refMin) return "low";
    if (lab.refMax != null && lab.value > lab.refMax) return "high";
    return "ok";
  };

  const schedule = buildLabSchedule(
    labs.map((l) => ({
      marker: l.marker,
      date: new Date(l.date),
      value: l.value,
      refMin: l.refMin,
      refMax: l.refMax,
    })),
    null,
  );

  const urgencyStyle = (u: string) => {
    if (u === "overdue") return "bg-[#fff0f0] text-[#ff3b30]";
    if (u === "this_week") return "bg-[#fff8ed] text-[#ff9500]";
    return "bg-[#fbfbfd]";
  };

  return (
    <div className="space-y-4 pb-8">
      <Card title={CHECKUP.bundlesTitle} subtitle={CHECKUP.bundlesSubtitle}>
        <div className="space-y-3">
          {LAB_BUNDLES.map((bundle) => (
            <div key={bundle.id} className="p-3 bg-[#fbfbfd] rounded-xl">
              <p className="font-semibold text-[14px]">{bundle.title}</p>
              <p className="text-[12px] text-[#86868b] mt-1">{bundle.description}</p>
              <p className="text-[13px] mt-2 text-[#0071e3]">📅 {bundle.when}</p>
              <ul className="text-[12px] text-[#86868b] mt-2 list-disc pl-4">
                {bundle.preparation.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Расписание пересдач" subtitle="Что пора или просрочено">
        {schedule.length === 0 ? (
          <p className="text-[13px] text-[#86868b]">Внеси первые результаты — появится график</p>
        ) : (
          <div className="space-y-2">
            {schedule.slice(0, 10).map((s) => (
              <div
                key={s.marker}
                className={`flex justify-between p-3 rounded-xl text-[13px] ${urgencyStyle(s.urgency)}`}
              >
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className="text-[12px] opacity-80">{s.reason}</p>
                </div>
                <span className="shrink-0 font-medium">
                  {format(s.dueDate, "d.M.yy")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Чеклист маркеров">
        <div className="space-y-2">
          {LAB_MARKERS.map((item) => {
            const latest = labs.find((l) => l.marker === item.marker);
            const st = latest ? status(latest) : "missing";
            return (
              <div
                key={item.marker}
                className={`flex justify-between items-center p-3 rounded-xl text-[13px] ${
                  st === "ok" ? "bg-[#f0fdf4]" : st === "missing" ? "bg-[#fbfbfd]" : "bg-[#fff0f0]"
                }`}
              >
                <span>{item.label}</span>
                <span>
                  {latest ? (
                    <span className={st === "ok" ? "text-[#34c759]" : "text-[#ff3b30]"}>
                      {latest.value} {item.unit}
                    </span>
                  ) : (
                    <span className="text-[#86868b]">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Добавить результат">
        <div className="space-y-3">
          <select
            className="apple-input"
            value={form.marker}
            onChange={(e) => setForm({ ...form, marker: e.target.value })}
          >
            {LAB_MARKERS.map((m) => (
              <option key={m.marker} value={m.marker}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="apple-input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            className="apple-input"
            placeholder="Значение"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          <button type="button" onClick={add} className="apple-btn apple-btn-primary w-full">
            Сохранить
          </button>
        </div>
      </Card>

      <Card title="Текст для врача" subtitle="Скопируй в поликлинику">
        <pre className="text-[11px] text-[#86868b] whitespace-pre-wrap font-sans leading-relaxed">
          {getDoctorOrderText()}
        </pre>
      </Card>
    </div>
  );
}
