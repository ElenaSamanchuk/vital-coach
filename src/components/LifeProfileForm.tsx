"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Card } from "./ui/Card";
import { SliderField } from "./ui/SliderField";
import {
  BIG_FIVE_QUESTIONS,
  scoreBigFive,
  WHO5_QUESTIONS,
  SDT_QUESTIONS,
  RYFF_QUESTIONS,
  CORE_VALUES_OPTIONS,
  who5RawTotal,
  who5NeedsAttention,
  type PermaScore,
  type Who5Score,
  type SdtScore,
  type RyffScore,
} from "@/lib/psychology-frameworks";
import type { RelationshipStatus } from "@/lib/life-spheres";
import { RELATIONSHIP_LABELS } from "@/lib/life-spheres";

export function LifeProfileForm() {
  const [perma, setPerma] = useState<PermaScore>({ P: 5, E: 5, R: 5, M: 5, A: 5 });
  const [bigFiveAns, setBigFiveAns] = useState<Record<string, number>>({});
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>("single_open");
  const [careerGoal, setCareerGoal] = useState("");
  const [financeGoal, setFinanceGoal] = useState("");
  const [ikigai, setIkigai] = useState({ love: "", goodAt: "", paidFor: "", worldNeeds: "" });
  const [who5, setWho5] = useState<Who5Score>({
    cheerful: 3, calm: 3, active: 3, rested: 3, interested: 3,
  });
  const [sdt, setSdt] = useState<SdtScore>({ autonomy: 5, competence: 5, relatedness: 5 });
  const [ryff, setRyff] = useState<RyffScore>({
    autonomy: 5, growth: 5, purpose: 5, relations: 5, selfAcceptance: 5, environment: 5,
  });
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient("/api/wheel").then((r) => r.json()).then((d) => {
      if (d.permaScores?.P) setPerma(d.permaScores);
      if (d.relationshipStatus) setRelationshipStatus(d.relationshipStatus);
      setCareerGoal(d.careerGoal ?? "");
      setFinanceGoal(d.financeGoal ?? "");
      if (d.ikigaiJson) setIkigai({ love: "", goodAt: "", paidFor: "", worldNeeds: "", ...d.ikigaiJson });
      if (d.who5Scores?.cheerful != null) setWho5(d.who5Scores);
      if (d.sdtScores?.autonomy != null) setSdt(d.sdtScores);
      if (d.ryffScores?.autonomy != null) setRyff(d.ryffScores);
      if (Array.isArray(d.coreValuesJson)) setCoreValues(d.coreValuesJson);
    });
  }, []);

  const toggleValue = (id: string) => {
    setCoreValues((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const save = async () => {
    const bigFiveScores = Object.keys(bigFiveAns).length >= 10 ? scoreBigFive(bigFiveAns) : undefined;
    await apiClient("/api/wheel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        permaScores: perma,
        bigFiveScores,
        who5Scores: who5,
        sdtScores: sdt,
        ryffScores: ryff,
        coreValuesJson: coreValues,
        relationshipStatus,
        careerGoal,
        financeGoal,
        ikigaiJson: ikigai,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card title="Отношения" subtitle="Коуч подстроит советы">
        <select
          className="apple-input"
          value={relationshipStatus}
          onChange={(e) => setRelationshipStatus(e.target.value as RelationshipStatus)}
        >
          {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </Card>

      <Card title="Цели карьеры и финансов">
        <div className="space-y-3">
          <input
            className="apple-input"
            placeholder="Карьера: кем хочу стать через год?"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
          />
          <input
            className="apple-input"
            placeholder="Финансы: подушка, доход, инвестиции…"
            value={financeGoal}
            onChange={(e) => setFinanceGoal(e.target.value)}
          />
        </div>
      </Card>

      <Card title="Икигай" subtitle="4 круга смысла">
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {[
            ["love", "❤️ Люблю"],
            ["goodAt", "⭐ Умею"],
            ["paidFor", "💰 Платят"],
            ["worldNeeds", "🌍 Нужно миру"],
          ].map(([key, label]) => (
            <input
              key={key}
              className="apple-input text-[12px]"
              placeholder={label}
              value={ikigai[key as keyof typeof ikigai]}
              onChange={(e) => setIkigai({ ...ikigai, [key]: e.target.value })}
            />
          ))}
        </div>
      </Card>

      <Card title="PERMA-тест" subtitle="Оцени 1–10 каждый столп">
        <div className="space-y-3">
          {(
            [
              ["P", "Позитивные эмоции"],
              ["E", "Вовлечённость (flow)"],
              ["R", "Отношения"],
              ["M", "Смысл"],
              ["A", "Достижения"],
            ] as [keyof PermaScore, string][]
          ).map(([key, label]) => (
            <SliderField
              key={key}
              label={label}
              value={perma[key]}
              onChange={(v) => setPerma({ ...perma, [key]: v })}
            />
          ))}
        </div>
      </Card>

      <Card title="Ценности (ACT)" subtitle="Выбери 3 — коуч свяжет с действиями">
        <div className="flex flex-wrap gap-2">
          {CORE_VALUES_OPTIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => toggleValue(v.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] border ${
                coreValues.includes(v.id)
                  ? "bg-[#0071e3] text-white border-[#0071e3]"
                  : "bg-white border-black/10"
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="WHO-5" subtitle="За последние 2 недели · 0–5 на пункт">
        <div className="space-y-3">
          {WHO5_QUESTIONS.map((q) => (
            <SliderField
              key={q.key}
              label={q.text}
              value={who5[q.key]}
              min={0}
              max={5}
              onChange={(v) => setWho5({ ...who5, [q.key]: v })}
            />
          ))}
        </div>
        <p className={`text-[12px] mt-2 ${who5NeedsAttention(who5RawTotal(who5)) ? "text-[#ff3b30]" : "text-[#34c759]"}`}>
          Балл: {who5RawTotal(who5)}/25 {who5NeedsAttention(who5RawTotal(who5)) ? "— стоит смягчить план" : "— в норме"}
        </p>
      </Card>

      <Card title="SDT — мотивация" subtitle="Ryan & Deci · автономия, мастерство, связи">
        <div className="space-y-3">
          {SDT_QUESTIONS.map((q) => (
            <SliderField
              key={q.key}
              label={q.text}
              value={sdt[q.key]}
              onChange={(v) => setSdt({ ...sdt, [q.key]: v })}
            />
          ))}
        </div>
      </Card>

      <Card title="Ryff — благополучие" subtitle="6 измерений психического здоровья">
        <div className="space-y-3">
          {RYFF_QUESTIONS.map((q) => (
            <SliderField
              key={q.key}
              label={q.text}
              value={ryff[q.key]}
              onChange={(v) => setRyff({ ...ryff, [q.key]: v })}
            />
          ))}
        </div>
      </Card>

      <Card title="Big Five" subtitle="10 вопросов — тип личности">
        <div className="space-y-4">
          {BIG_FIVE_QUESTIONS.map((q) => (
            <SliderField
              key={q.id}
              label={q.text}
              value={bigFiveAns[q.id] ?? 4}
              min={1}
              max={7}
              onChange={(v) => setBigFiveAns({ ...bigFiveAns, [q.id]: v })}
            />
          ))}
        </div>
      </Card>

      <button type="button" onClick={save} className="apple-btn apple-btn-primary w-full py-4">
        {saved ? "Сохранено ✓" : "Сохранить жизненный профиль"}
      </button>
    </div>
  );
}
