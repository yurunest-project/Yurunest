"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("この予約をキャンセルしますか？チケットは返還されます。")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "キャンセルに失敗しました");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "キャンセルに失敗しました");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {loading ? "処理中..." : "キャンセル"}
    </button>
  );
}
