"use client";

import { BOOKING_PLANS, type PlanDurationKey } from "@/lib/constants";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const planIds = BOOKING_PLANS.map((plan) => plan.id);

function isPlanDurationKey(value: string): value is PlanDurationKey {
  return planIds.includes(value as PlanDurationKey);
}

export function BookingForm({ defaultPlan }: { defaultPlan?: PlanDurationKey }) {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  const initialPlan = useMemo(() => {
    const fromQuery = searchParams.get("plan");
    if (fromQuery && isPlanDurationKey(fromQuery)) return fromQuery;
    return defaultPlan ?? "30min";
  }, [defaultPlan, searchParams]);

  const [plan, setPlan] = useState<PlanDurationKey>(initialPlan);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    canceled ? "決済がキャンセルされました。もう一度お試しください。" : null,
  );

  const selectedPlan = BOOKING_PLANS.find((item) => item.id === plan);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, nickname, email }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "決済ページの作成に失敗しました");
      }

      window.location.href = data.url;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "決済ページの作成に失敗しました",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="plan" className="mb-2 block text-sm font-medium text-forest">
          プラン
        </label>
        <select
          id="plan"
          name="plan"
          value={plan}
          onChange={(event) => {
            const value = event.target.value;
            if (isPlanDurationKey(value)) setPlan(value);
          }}
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        >
          {BOOKING_PLANS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
              {"subtitle" in item && item.subtitle ? `（${item.subtitle}）` : ""} —{" "}
              {item.price.toLocaleString("ja-JP")}円（税込）
            </option>
          ))}
        </select>
        {selectedPlan?.note && (
          <p className="mt-2 text-sm text-forest-muted">{selectedPlan.note}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="nickname"
          className="mb-2 block text-sm font-medium text-forest"
        >
          ニックネーム
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="呼ばれたいお名前"
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-forest">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="example@email.com"
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        />
        <p className="mt-2 text-sm text-forest-muted">
          決済完了後、通話URLをこのメールアドレスにお送りします。
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="block w-full rounded-xl bg-sage-dark px-6 py-4 text-center text-lg font-bold text-white transition-colors hover:bg-[#4a6350] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Stripe決済ページへ移動中..."
          : `Stripeで支払う（${selectedPlan?.price.toLocaleString("ja-JP") ?? ""}円）`}
      </button>

      <p className="text-center text-sm text-forest-muted">
        決済は Stripe により安全に処理されます。
      </p>
    </form>
  );
}
