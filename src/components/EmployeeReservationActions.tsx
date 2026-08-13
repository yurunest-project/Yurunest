"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmployeeReservationActions({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "accept" | "decline") {
    setLoading(action);
    setError(null);
    const response = await fetch(`/api/employee/reservations/${reservationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "処理に失敗しました");
      setLoading(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-2">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void run("accept")}
          className="flex-1 rounded-xl bg-sage-dark px-3 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading === "accept" ? "承諾中..." : "承諾する"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void run("decline")}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-800 disabled:opacity-60"
        >
          {loading === "decline" ? "処理中..." : "お断り"}
        </button>
      </div>
    </div>
  );
}
