"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { hapticLight } from "@/lib/haptics";

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function DayPhotoUpload({
  photo,
  onChange,
}: {
  photo: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File) => {
    hapticLight();
    const data = await compressImage(file);
    onChange(data);
  };

  return (
    <div>
      {photo ? (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Фото дня" className="w-full max-h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--black-soft)] text-[var(--text)] backdrop-blur-sm"
            aria-label="Удалить фото"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-strong)] py-8 text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          <Camera size={28} className="text-[var(--brown)]" />
          <span className="text-[13px] font-medium">Фото дня</span>
          <span className="text-[10px]">Момент дня — еда или настроение</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
