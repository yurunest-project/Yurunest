"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefundButton({ paymentIntentId }: { paymentIntentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function refund() {
    if (!reason.trim()) {
      setError("返金理由を入力してください。");
      return;
    }
    if (!confirm("この決済を全額返金します。関連する予約はキャンセルされます。")) return;
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId, reason }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "返金に失敗しました");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3">
      <label className="mb-2 block text-sm text-forest">
        返金理由
        <textarea
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 min-h-20 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-base"
        />
      </label>
      <button
        type="button"
        onClick={() => void refund()}
        disabled={loading}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 disabled:opacity-60"
      >
        {loading ? "返金中..." : "全額返金"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
