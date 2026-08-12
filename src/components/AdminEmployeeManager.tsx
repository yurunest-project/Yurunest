"use client";

import { FormEvent, useState } from "react";

export function AdminEmployeeManager() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInviteUrl(null);
    try {
      const response = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, birthDate: birthDate || undefined }),
      });
      const data = (await response.json()) as { inviteToken?: string; error?: string };
      if (!response.ok || !data.inviteToken) {
        throw new Error(data.error ?? "スタッフを登録できませんでした");
      }
      setInviteUrl(`${window.location.origin}/employee/invite?token=${data.inviteToken}`);
      setName("");
      setEmail("");
      setBirthDate("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "スタッフを登録できませんでした");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)]"
    >
      <label className="block text-sm font-medium text-forest">
        表示名
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      <label className="block text-sm font-medium text-forest">
        メールアドレス
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      <label className="block text-sm font-medium text-forest">
        生年月日（任意）
        <input
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sage-dark px-4 py-3 font-bold text-white disabled:opacity-60"
      >
        {loading ? "登録中..." : "スタッフを登録して招待リンクを作成"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {inviteUrl && (
        <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
          <p className="text-sm text-forest">招待リンク（72時間有効）</p>
          <p className="mt-2 break-all text-sm text-sage-dark">{inviteUrl}</p>
        </div>
      )}
    </form>
  );
}
