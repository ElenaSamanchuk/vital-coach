"use client";

import { BookOpen, Clapperboard, Music } from "lucide-react";
import type { pickMedia } from "@/lib/media-picks";

export function MediaPicksCard({
  media,
}: {
  media: ReturnType<typeof pickMedia>;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 space-y-3">
      <p className="text-[12px] font-semibold">
        Тренды для тебя · вайб «{media.vibeLabel}»
      </p>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Clapperboard size={13} className="text-[var(--pink)]" />
          <span className="text-[11px] font-semibold">Кино</span>
        </div>
        {media.movies.map((m) => (
          <p key={m.title} className="text-[11px] text-[var(--text-secondary)] leading-snug mb-1">
            <span className="font-medium text-[var(--text)]">{m.title}</span> — {m.why}
          </p>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Music size={13} className="text-[var(--purple)]" />
          <span className="text-[11px] font-semibold">Музыка</span>
        </div>
        {media.music.map((m) => (
          <p key={m.title} className="text-[11px] text-[var(--text-secondary)] leading-snug mb-1">
            <span className="font-medium text-[var(--text)]">{m.title}</span> — {m.why}
          </p>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <BookOpen size={13} className="text-[var(--accent)]" />
          <span className="text-[11px] font-semibold">Книги</span>
        </div>
        {media.books.map((m) => (
          <p key={m.title} className="text-[11px] text-[var(--text-secondary)] leading-snug mb-1">
            <span className="font-medium text-[var(--text)]">{m.title}</span> — {m.why}
          </p>
        ))}
      </div>
    </div>
  );
}
