"use client";

import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiClient("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }
    await signIn("credentials", { email, password, callbackUrl: "/onboarding" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: BRAND_GRADIENT }}
          >
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="vc-display">Vital Coach</h1>
          <p className="vc-subtitle mt-2 max-w-xs mx-auto">
            Создай аккаунт — дальше 8-минутный тест настроит всю систему под тебя
          </p>
        </div>
        <form onSubmit={submit} className="vc-surface-elevated p-6 space-y-4">
          {error && <p className="text-[var(--danger)] text-[13px]">{error}</p>}
          <input
            className="apple-input"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="apple-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="apple-input"
            placeholder="Пароль (мин. 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="apple-btn apple-btn-premium w-full py-3.5">
            Создать аккаунт
          </button>
        </form>
        <p className="text-center mt-6 text-[14px] text-[var(--text-secondary)]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[var(--accent)] font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
