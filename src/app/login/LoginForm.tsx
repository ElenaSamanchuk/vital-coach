"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!res?.ok) {
        setError(
          res?.error === "CredentialsSignin"
            ? "Неверный email или пароль"
            : "Не удалось войти. Обнови страницу и попробуй снова.",
        );
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Ошибка сети. Проверь, что сервер запущен (npm run dev).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4"
            style={{ background: BRAND_GRADIENT }}
          >
            V
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">Vital Coach</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-[15px]">Питание · тренировки · здоровье</p>
        </div>
        <form onSubmit={submit} className="apple-card p-6 space-y-4">
          {error && <p className="text-[var(--danger)] text-[13px]">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="apple-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="apple-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="apple-btn apple-btn-primary w-full py-3 disabled:opacity-60"
          >
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="text-center mt-4 text-[14px] text-[var(--text-secondary)]">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-[var(--accent)] font-medium">
            Регистрация
          </Link>
        </p>
      </div>
    </div>
  );
}
