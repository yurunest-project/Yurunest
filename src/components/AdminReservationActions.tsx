"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReservationActions({
  reservationId,
  employees,
}: {
  reservationId: string;
  employees: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    employees[0]?.id ?? "",
  );
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "accept" | "decline") {
    setLoading(action);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          assignedEmployeeId: assignedEmployeeId || null,
          employeeId: assignedEmployeeId || null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "処理に失敗しました");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "処理に失敗しました");
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-sage/15 pt-4">
      {employees.length > 0 && (
        <label className="block text-sm text-forest">
          担当スタッフ
          <select
            value={assignedEmployeeId}
            onChange={(event) => setAssignedEmployeeId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-base"
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => run("accept")}
          className="flex-1 rounded-xl bg-sage-dark px-3 py-2.5 text-sm font-bold text-white hover:bg-[#4a6350] disabled:opacity-60"
        >
          {loading === "accept" ? "承諾中..." : "承諾する"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => run("decline")}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-800 disabled:opacity-60"
        >
          {loading === "decline" ? "処理中..." : "お断り"}
        </button>
      </div>
    </div>
  );
}
