"use client";

import { MapPin } from "lucide-react";
import { PLACE_TYPE_LABEL, type PlaceSpot } from "@/lib/places-catalog";

export function PlacesCard({ places }: { places: PlaceSpot[] }) {
  if (places.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--elevated)] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-[var(--accent)]" />
        <span className="text-[12px] font-semibold">Куда сходить</span>
      </div>
      {places.map((p) => (
        <div key={p.id} className="rounded-lg bg-[var(--bg-subtle)] px-3 py-2">
          <p className="text-[12px] font-medium">{p.name}</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            {PLACE_TYPE_LABEL[p.type]} · {p.vibe}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{p.hint}</p>
        </div>
      ))}
      <p className="text-[9px] text-[var(--text-tertiary)]">
        Подставь свои места по названию в 2ГИС / Google Maps
      </p>
    </div>
  );
}
