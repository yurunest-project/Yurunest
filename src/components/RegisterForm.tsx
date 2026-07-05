"use client";

import { AuthShell, Field, authInputClassName } from "@/components/AuthShell";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setError(data.error ?? "登録に失敗しました");
      setLoading(false);
      return;
    }

    setMessage(data.message ?? "確認メールを送信しました。");
    setLoading(false);
  }

  return (
    <AuthShell title="新規登録" subtitle="メールアドレスの確認後、ログインできます。">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="nickname" label="ニックネーム">
          <input
            id="nickname"
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={authInputClassName}
            placeholder="呼ばれたいお名前"
          />
        </Field>

        <Field id="email" label="メールアドレス">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClassName}
          />
        </Field>

        <Field id="password" label="パスワード（8文字以上）">
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "送信中..." : "確認メールを送信"}
        </button>

        <p className="text-center text-sm text-forest-muted">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-sage-dark hover:underline">
            ログイン
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
