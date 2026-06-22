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
  BarChart,
  Bar,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card } from "./ui/Card";

interface LogRow {
  date: string;
  dateLabel?: string;
  weightKg?: number;
  calories?: number;
  waterMl?: number;
  sleepMinutes?: number;
  mood?: number;
  workoutChoice?: string;
  workouts?: number;
}

export function PotokAnalytics() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient("/api/analytics?days=30")
      .then((r) => r.json())
      .then((d) => {
        setLogs(
          (d.logs ?? []).map((l: LogRow) => ({
            ...l,
            dateLabel: format(parseISO(l.date.split("T")[0]), "d.M"),
            workouts: l.workoutChoice ? 1 : 0,
          })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>;
  }

  if (logs.length === 0) {
    return (
      <p className="text-center py-12 vc-text-sm text-[var(--text-secondary)]">
        Сохрани несколько дней — здесь появятся графики
      </p>
    );
  }

  const chartProps = {
    grid: <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />,
    x: <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />,
    tooltip: <Tooltip />,
  };

  return (
    <div className="space-y-4 pb-8">
      {logs.some((l) => l.weightKg) && (
        <Card title="Вес">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs.filter((l) => l.weightKg)}>
                {chartProps.grid}
                {chartProps.x}
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                {chartProps.tooltip}
                <Line type="monotone" dataKey="weightKg" stroke="#3D9B6E" name="кг" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.some((l) => l.calories) && (
        <Card title="Питание · ккал">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logs.filter((l) => l.calories)}>
                {chartProps.grid}
                {chartProps.x}
                <YAxis tick={{ fontSize: 11 }} />
                {chartProps.tooltip}
                <Bar dataKey="calories" fill="#3B9B7A" name="ккал" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.some((l) => l.workoutChoice) && (
        <Card title="Тренировки">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logs}>
                {chartProps.grid}
                {chartProps.x}
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 1]} />
                {chartProps.tooltip}
                <Bar dataKey="workouts" fill="#4A90D9" name="день с движением" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.some((l) => l.waterMl) && (
        <Card title="Вода · мл">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs.filter((l) => l.waterMl)}>
                {chartProps.grid}
                {chartProps.x}
                <YAxis tick={{ fontSize: 11 }} />
                {chartProps.tooltip}
                <Line type="monotone" dataKey="waterMl" stroke="#5AC8FA" name="мл" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.some((l) => l.sleepMinutes) && (
        <Card title="Сон · часы">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={logs
                  .filter((l) => l.sleepMinutes)
                  .map((l) => ({ ...l, sleepHours: (l.sleepMinutes ?? 0) / 60 }))}
              >
                {chartProps.grid}
                {chartProps.x}
                <YAxis tick={{ fontSize: 11 }} domain={[0, 12]} />
                {chartProps.tooltip}
                <Line type="monotone" dataKey="sleepHours" stroke="#8E7CC3" name="ч" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {logs.some((l) => l.mood != null) && (
        <Card title="Настроение">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs.filter((l) => l.mood != null)}>
                {chartProps.grid}
                {chartProps.x}
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                {chartProps.tooltip}
                <Line type="monotone" dataKey="mood" stroke="#FF9500" name="балл" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
