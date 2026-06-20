"use client";

import { Shirt } from "lucide-react";
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_TIPS,
  CAPSULE_CHECKLIST,
  FACE_SHAPE_TIPS,
  type BodyArchetype,
  type StyleProfile,
} from "@/lib/style-guide";
import { hapticLight } from "@/lib/haptics";

export function StyleCapsuleCard({
  profile,
  onChange,
  onSave,
}: {
  profile: StyleProfile;
  onChange: (p: StyleProfile) => void;
  onSave: () => void;
}) {
  const toggleCapsule = (item: string) => {
    hapticLight();
    const has = profile.capsule.includes(item);
    onChange({
      ...profile,
      capsule: has ? profile.capsule.filter((x) => x !== item) : [...profile.capsule, item],
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shirt size={14} className="text-[var(--pink)]" />
        <span className="text-[12px] font-semibold">Стиль и капсула</span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)]">Тип фигуры</p>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(ARCHETYPE_LABELS) as BodyArchetype[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onChange({ ...profile, archetype: a })}
            className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-medium ${
              profile.archetype === a
                ? "bg-[var(--pink-soft)] border-[var(--pink)]/40 text-[var(--pink)]"
                : "border-[var(--border)]"
            }`}
          >
            {ARCHETYPE_LABELS[a]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
        {ARCHETYPE_TIPS[profile.archetype]}
      </p>
      <p className="text-[11px] font-medium mt-2">Капсульный гардероб</p>
      <div className="space-y-1">
        {CAPSULE_CHECKLIST.map((item) => (
          <label key={item} className="flex items-center gap-2 text-[12px] cursor-pointer">
            <input
              type="checkbox"
              checked={profile.capsule.includes(item)}
              onChange={() => toggleCapsule(item)}
              className="accent-[var(--accent)]"
            />
            {item}
          </label>
        ))}
      </div>
      <select
        className="apple-input text-[12px]"
        value={profile.faceShape ?? ""}
        onChange={(e) => onChange({ ...profile, faceShape: e.target.value || undefined })}
      >
        <option value="">Форма лица (опционально)</option>
        {Object.keys(FACE_SHAPE_TIPS).map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      {profile.faceShape && FACE_SHAPE_TIPS[profile.faceShape] && (
        <p className="text-[10px] text-[var(--text-tertiary)]">
          {FACE_SHAPE_TIPS[profile.faceShape]}
        </p>
      )}
      <button type="button" onClick={onSave} className="apple-btn apple-btn-secondary w-full text-[12px]">
        Сохранить стиль
      </button>
    </div>
  );
}
