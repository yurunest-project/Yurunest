"use client";

import { AuthShell, Field, authInputClassName } from "@/components/AuthShell";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setError(data.error ?? "送信に失敗しました");
      setLoading(false);
      return;
    }

    setMessage(data.message ?? "メールを送信しました。");
    setLoading(false);
  }

  return (
    <AuthShell
      title="パスワード再設定"
      subtitle="登録メールアドレスに再設定リンクを送ります。"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="email" label="メールアドレス">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClassName}
          />
        </Field>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-forest">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sage-dark px-4 py-3.5 text-base font-bold text-white hover:bg-[#4a6350] disabled:opacity-60"
        >
          {loading ? "送信中..." : "再設定メールを送信"}
        </button>

        <p className="text-center text-sm">
          <Link href="/login" className="text-sage-dark hover:underline">
            ログインに戻る
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
