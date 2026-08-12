"use client";

import { AuthShell, Field, authInputClassName } from "@/components/AuthShell";
import { ResendVerificationForm } from "@/components/ResendVerificationForm";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({
  provider = "customer",
  title = "ログイン",
  subtitle = "登録済みのメールアドレスでログインしてください。",
}: {
  provider?: "customer" | "employee";
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ??
    (provider === "employee" ? "/employee/reservations" : "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setShowResend(false);

    const result = await signIn(provider, {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const code = (result as { code?: string }).code;
      if (code === "RATE_LIMITED" || result.error === "RATE_LIMITED") {
        setError("ログイン試行回数が多すぎます。15分後に再度お試しください。");
      } else if (code === "EMAIL_NOT_VERIFIED" || result.error === "EMAIL_NOT_VERIFIED") {
        setError("メールアドレスの確認が完了していません。確認メールをご確認ください。");
        setShowResend(true);
      } else {
        setError("メールアドレスまたはパスワードが正しくありません。");
      }
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Field id="password" label="パスワード">
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
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
        {showResend && (
          <ResendVerificationForm defaultEmail={email} compact />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sage-dark px-4 py-3.5 text-base font-bold text-white hover:bg-[#4a6350] disabled:opacity-60"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        {provider === "customer" && (
          <>
            <p className="text-center text-sm text-forest-muted">
              <Link href="/forgot-password" className="text-sage-dark hover:underline">
                パスワードをお忘れですか？
              </Link>
            </p>
            <p className="text-center text-sm text-forest-muted">
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-sage-dark hover:underline">
                新規登録
              </Link>
            </p>
          </>
        )}
      </form>
    </AuthShell>
  );
}
