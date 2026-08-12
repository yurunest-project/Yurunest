"use client";

import { FormEvent, useState } from "react";

export function ResendVerificationForm({
  defaultEmail = "",
  compact = false,
}: {
  defaultEmail?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as { error?: string; message?: string };

    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "再送に失敗しました");
      return;
    }
    setMessage(data.message ?? "確認メールを送信しました。");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "mt-3 space-y-2"
          : "space-y-4 rounded-xl border border-sage/20 bg-sage/5 p-4"
      }
    >
      {!compact && (
        <p className="text-sm text-forest-muted">
          確認メールが届かない、またはリンクの期限が切れた場合は、再送できます。
        </p>
      )}
      <label className="block text-sm font-medium text-forest">
        メールアドレス
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className={
          compact
            ? "text-sm font-medium text-sage-dark underline disabled:opacity-60"
            : "w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base font-medium text-forest hover:bg-sage/10 disabled:opacity-60"
        }
      >
        {loading ? "送信中..." : "確認メールを再送"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="text-sm text-forest">{message}</p>}
    </form>
  );
}
