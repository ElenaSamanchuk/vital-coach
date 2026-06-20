"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface MiniLife {
  avatarLevel: number;
  totalXp: number;
  stats: { emoji: string; level: number; progress: number; color: string }[];
}

export function AvatarStrip() {
  const [data, setData] = useState<MiniLife | null>(null);

  useEffect(() => {
    apiClient("/api/life")
      .then(async (r) => {
        if (!r.ok) return null;
        const text = await r.text();
        return text ? JSON.parse(text) : null;
      })
      .then((d) => {
        if (!d) return;
        setData({
          avatarLevel: d.avatarLevel,
          totalXp: d.totalXp,
          stats: d.stats?.slice(0, 6) ?? [],
        });
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <Link href="/life" className="block mb-4">
      <div className="rounded-2xl p-3 bg-gradient-to-r from-[#5856d6]/10 via-[#0071e3]/10 to-[#30d158]/10 border border-[#0071e3]/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-[#0071e3]">Аватар · ур. {data.avatarLevel}</span>
          <span className="text-[11px] text-[#86868b] flex items-center gap-0.5">
            {data.totalXp} XP <ChevronRight size={12} />
          </span>
        </div>
        <div className="flex gap-1">
          {data.stats.map((s, i) => (
            <div key={i} className="flex-1 h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.progress}%`, backgroundColor: s.color }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {data.stats.map((s, i) => (
            <span key={i} className="text-[9px]">{s.emoji}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
