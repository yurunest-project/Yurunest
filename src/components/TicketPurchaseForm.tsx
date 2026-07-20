"use client";

import { TICKET_UNIT_PRICE_YEN } from "@/types/ticket";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const PRESETS = [1, 2, 4, 12, 20] as const;

export function TicketPurchaseForm({
  unitPrice = TICKET_UNIT_PRICE_YEN,
}: {
  unitPrice?: number;
}) {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    canceled ? "決済がキャンセルされました。もう一度お試しください。" : null,
  );

  const total = unitPrice * quantity;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
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
        <p className="mb-3 text-sm font-medium text-forest">枚数を選ぶ</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setQuantity(preset)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                quantity === preset
                  ? "bg-sage-dark text-white"
                  : "border border-sage/25 bg-white text-forest hover:bg-sage/10"
              }`}
            >
              {preset}枚
              <span className="ml-1 text-xs opacity-80">
                （約{preset * 15}分）
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="mb-2 block text-sm font-medium text-forest"
        >
          枚数（カスタム）
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={40}
          required
          value={quantity}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) setQuantity(Math.min(40, Math.max(1, value)));
          }}
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        />
        <p className="mt-2 text-sm text-forest-muted">
          1枚 = 15分 / {unitPrice.toLocaleString("ja-JP")}円（税込）
        </p>
      </div>

      <div className="rounded-xl border border-sage/20 bg-sage/5 px-4 py-3">
        <p className="text-sm text-forest-muted">お支払い合計</p>
        <p className="text-2xl font-bold text-forest">
          {total.toLocaleString("ja-JP")}円
          <span className="ml-2 text-sm font-medium text-forest-muted">
            （{quantity}枚）
          </span>
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
          : `Stripeで支払う（${total.toLocaleString("ja-JP")}円）`}
      </button>

      <p className="text-center text-sm text-forest-muted">
        決済は Stripe により安全に処理されます。購入後、希望日を選んで予約できます。
      </p>
    </form>
  );
}
