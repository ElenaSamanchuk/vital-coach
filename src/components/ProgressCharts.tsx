"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card } from "./ui/Card";
import type { WeeklyInsights } from "@/lib/types";

interface LogRow {
  date: string;
  dateLabel?: string;
  weightKg?: number;
  waistCm?: number;
  calories?: number;
  proteinG?: number;
  waterMl?: number;
  sleepMinutes?: number;
  stress?: number;
}

export function ProgressCharts() {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    apiClient("/api/analytics?days=30")
      .then((r) => r.json())
      .then((d) => {
        setInsights(d.insights);
        setLogs(
          d.logs.map((l: { date: string } & LogRow) => ({
            ...l,
            dateLabel: format(parseISO(l.date.split("T")[0]), "d.M"),
          })),
        );
      });
  }, []);

  if (!insights) return <div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>;

  const chartData = logs.filter((l) => l.weightKg || l.waistCm);

  return (
    <div className="space-y-4 pb-8">
      {insights.wins.length > 0 && (
        <Card title="Что работает" subtitle="Продолжай">
          <ul className="space-y-1">
            {insights.wins.map((w) => (
              <li key={w} className="text-[14px] text-[#34c759]">
                ✓ {w}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {insights.slipping.length > 0 && (
        <Card title="Что проседает" subtitle="Приоритет исправлений">
          <div className="space-y-3">
            {insights.slipping.map((s) => (
              <div key={s.key} className="p-3 bg-[#fff8ed] rounded-xl">
                <p className="font-semibold text-[14px] text-[var(--brown)]">{s.label}</p>
                <p className="text-[13px] mt-1">{s.message}</p>
                <p className="text-[13px] text-[var(--accent)] mt-1">→ {s.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(insights.avgMood != null || insights.avgStress != null) && (
        <Card title="Психология за период">
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            {insights.avgMood != null && (
              <div className="p-3 bg-[#fbfbfd] rounded-xl">
                <p className="text-[#86868b]">Настроение</p>
                <p className="text-[20px] font-bold">{insights.avgMood.toFixed(1)}/10</p>
              </div>
            )}
            {insights.avgStress != null && (
              <div className="p-3 bg-[#fbfbfd] rounded-xl">
                <p className="text-[#86868b]">Стресс</p>
                <p className="text-[20px] font-bold">{insights.avgStress.toFixed(1)}/10</p>
              </div>
            )}
            <div className="p-3 bg-[#fbfbfd] rounded-xl col-span-2">
              <p className="text-[#86868b]">Привычки выполнены</p>
              <p className="text-[20px] font-bold">{Math.round(insights.habitCompletionRate * 100)}%</p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Сводка за 7 дней">
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div className="p-3 bg-[#fbfbfd] rounded-xl">
            <p className="text-[#86868b]">Средний вес</p>
            <p className="text-[20px] font-bold">
              {insights.avgWeight?.toFixed(1) ?? "—"} кг
            </p>
          </div>
          <div className="p-3 bg-[#fbfbfd] rounded-xl">
            <p className="text-[#86868b]">Калории</p>
            <p className="text-[20px] font-bold">
              {insights.avgCalories ? Math.round(insights.avgCalories) : "—"}
            </p>
          </div>
          <div className="p-3 bg-[#fbfbfd] rounded-xl">
            <p className="text-[#86868b]">Белок</p>
            <p className="text-[20px] font-bold">
              {insights.avgProtein ? Math.round(insights.avgProtein) : "—"} г
            </p>
          </div>
          <div className="p-3 bg-[#fbfbfd] rounded-xl">
            <p className="text-[#86868b]">Тренировки</p>
            <p className="text-[20px] font-bold">{insights.workoutCount}</p>
          </div>
        </div>
      </Card>

      {chartData.length > 1 && (
        <Card title="Вес и талия">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="weightKg" stroke="#3D9B6E" name="Вес" dot={false} />
                <Line type="monotone" dataKey="waistCm" stroke="#8B6F47" name="Талия" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.some((l) => l.stress) && (
        <Card title="Стресс">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="stress" stroke="#ff3b30" name="Стресс" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
