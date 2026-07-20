"use client";

import { AuthShell, Field, authInputClassName } from "@/components/AuthShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setError(data.error ?? "更新に失敗しました");
      setLoading(false);
      return;
    }

    setMessage(data.message ?? "パスワードを更新しました。");
    setLoading(false);
  }

  if (!token) {
    return (
      <AuthShell title="パスワード再設定">
        <p className="text-base text-red-700">リンクが無効です。</p>
        <p className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sage-dark hover:underline">
            再設定をやり直す
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="新しいパスワード" subtitle="8文字以上のパスワードを設定してください。">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="password" label="新しいパスワード">
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
            {message}{" "}
            <Link href="/login" className="font-medium text-sage-dark hover:underline">
              ログインする
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || Boolean(message)}
          className="w-full rounded-xl bg-sage-dark px-4 py-3.5 text-base font-bold text-white hover:bg-[#4a6350] disabled:opacity-60"
        >
          {loading ? "更新中..." : "パスワードを更新"}
        </button>
      </form>
    </AuthShell>
  );
}
