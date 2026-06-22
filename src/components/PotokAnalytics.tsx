"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useMemo, useState } from "react";
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
import { format, parseISO, subDays } from "date-fns";
import { Card } from "./ui/Card";
import { JournalHistoryList } from "./visual/JournalHistoryList";
import { JournalCalendar, navigateToDay } from "./visual/JournalCalendar";
import {
  buildCycleChartData,
  parsePeriodMeta,
  cycleStatus,
} from "@/lib/period-tracking";
import { journalEntries } from "@/lib/day-memories";

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
  notes?: string;
  dayPhoto?: string;
}

export function PotokAnalytics() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [profile, setProfile] = useState<{
    lastPeriodStart?: string | null;
    cycleLength?: number;
    assessmentJson?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient("/api/analytics?days=90"), apiClient("/api/profile")])
      .then(async ([a, p]) => {
        const analytics = await a.json();
        setProfile(await p.json());
        setLogs(
          (analytics.logs ?? []).map((l: LogRow) => ({
            ...l,
            dateLabel: format(parseISO(l.date.split("T")[0]), "d.M"),
            workouts: l.workoutChoice ? 1 : 0,
          })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const periodMeta = useMemo(
    () => parsePeriodMeta(profile?.assessmentJson),
    [profile?.assessmentJson],
  );

  const periodStarts = useMemo(() => {
    const starts = [...periodMeta.periodStarts];
    const last = profile?.lastPeriodStart?.split("T")[0];
    if (last && !starts.includes(last)) starts.unshift(last);
    return starts;
  }, [periodMeta.periodStarts, profile?.lastPeriodStart]);

  const cycleChart = useMemo(() => {
    const to = new Date();
    const from = subDays(to, 89);
    return buildCycleChartData(from, to, periodStarts, periodMeta.periodDays);
  }, [periodStarts, periodMeta.periodDays]);

  const journal = useMemo(() => journalEntries(logs, 24), [logs]);

  const cycleLabel = cycleStatus(
    profile?.lastPeriodStart ?? null,
    profile?.cycleLength ?? 28,
  ).label;

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>;
  }

  if (logs.length === 0 && periodStarts.length === 0) {
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
      <JournalCalendar
        logs={logs}
        onSelectDate={(d) => navigateToDay(d)}
      />

      {periodStarts.length > 0 && (
        <Card title="Цикл" subtitle={cycleLabel}>
          <p className="vc-text-xs text-[var(--text-secondary)] mb-3">
            Розовые столбцы — дни месячных (~{periodMeta.periodDays} дн. от 1-го дня)
          </p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleChart}>
                {chartProps.grid}
                {chartProps.x}
                <YAxis hide domain={[0, 1]} />
                {chartProps.tooltip}
                <Bar dataKey="menstrual" fill="#D4869C" name="месячные" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="vc-text-xs text-[var(--text-tertiary)] mt-2">
            Отмечай 1-й день на «Мой день» — график обновится
          </p>
        </Card>
      )}

      <Card title="Дневник" subtitle="Заметки и фото">
        <JournalHistoryList entries={journal} />
      </Card>

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
