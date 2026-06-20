"use client";

import { useMemo } from "react";
import { Hourglass } from "lucide-react";
import {
  buildTimeHorizonRings,
  formatDays,
  formatDaysCompact,
  timeHorizonMotivation,
  type TimeHorizonRing,
} from "@/lib/time-horizons";

const SIZE = 76;
const CX = SIZE / 2;
const R = 30;
const SW = 6;

function miniArc(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return "";
  const start = -90;
  const end = start + p * 360;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = CX + R * Math.cos(toRad(start));
  const y1 = CX + R * Math.sin(toRad(start));
  const x2 = CX + R * Math.cos(toRad(end));
  const y2 = CX + R * Math.sin(toRad(end));
  const large = p > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

function HorizonCircle({ ring }: { ring: TimeHorizonRing }) {
  const track = `M ${CX} ${CX - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CX - R}`;
  const fill = miniArc(ring.progress);

  return (
    <div className="flex flex-col items-center min-w-[80px] flex-1">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
        <path
          d={track}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={SW}
          strokeLinecap="round"
        />
        {fill && (
          <path
            d={fill}
            fill="none"
            stroke={ring.color}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        )}
        <text
          x={CX}
          y={CX - 2}
          textAnchor="middle"
          className="fill-[var(--accent)] font-bold"
          style={{ fontSize: ring.daysLeft >= 1000 ? 9 : 11 }}
        >
          {formatDaysCompact(ring.daysLeft)}
        </text>
        <text
          x={CX}
          y={CX + 9}
          textAnchor="middle"
          className="fill-[var(--text-tertiary)]"
          style={{ fontSize: 7 }}
        >
          дн.
        </text>
      </svg>
      <p className="text-[11px] font-semibold mt-0.5 text-center leading-tight">{ring.label}</p>
      <p className="text-[9px] text-[var(--text-secondary)] text-center leading-snug">
        прошло {formatDays(ring.daysPassed)}
      </p>
      <p className="text-[9px] text-[var(--text-tertiary)] text-center">
        из {formatDays(ring.daysTotal)} дн.
      </p>
    </div>
  );
}

export function TimeHorizonRings({ birthYear }: { birthYear?: number }) {
  const rings = useMemo(() => buildTimeHorizonRings({ birthYear }), [birthYear]);
  const motivation = useMemo(() => timeHorizonMotivation(rings), [rings]);

  return (
    <div className="vc-glass-card rounded-3xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Hourglass size={16} className="text-[var(--warning)] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[15px] font-bold">Время</p>
          <p className="text-[10px] text-[var(--text-secondary)] leading-snug mt-0.5">
            {motivation}
          </p>
        </div>
      </div>
      <div className="flex gap-0.5 justify-between -mx-1">
        {rings.map((ring) => (
          <HorizonCircle key={ring.id} ring={ring} />
        ))}
      </div>
      <p className="text-[9px] text-[var(--text-tertiary)] text-center leading-snug">
        В центре — дней осталось · под кольцом — прошло / всего
      </p>
    </div>
  );
}
