"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function EmployeeInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetch("/api/employee/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "登録できませんでした");
      setLoading(false);
      return;
    }
    router.push("/employee/login");
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-sm font-medium text-forest">
        パスワード（8文字以上）
        <input
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      <label className="block text-sm font-medium text-forest">
        パスワード（確認）
        <input
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sage-dark px-4 py-3.5 font-bold text-white disabled:opacity-60"
      >
        {loading ? "登録中..." : "パスワードを設定する"}
      </button>
    </form>
  );
}
