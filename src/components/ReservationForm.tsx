"use client";

import {
  BOOKING_PLANS,
  PLAN_DURATION_MINUTES,
  type PlanDurationKey,
} from "@/lib/constants";
import { ticketsRequiredForMinutes } from "@/types/ticket";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type EmployeeOption = {
  id: string;
  name: string;
};

export function ReservationForm({
  employees,
  unusedTicketCount,
  defaultNickname,
}: {
  employees: EmployeeOption[];
  unusedTicketCount: number;
  defaultNickname: string;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanDurationKey>("30min");
  const [desiredDate, setDesiredDate] = useState("");
  const [nickname, setNickname] = useState(defaultNickname);
  const [requestedEmployeeId, setRequestedEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationMinutes = useMemo(
    () => PLAN_DURATION_MINUTES[planId],
    [planId],
  );

  const requiredTickets = ticketsRequiredForMinutes(durationMinutes);
  const canSubmit = unusedTicketCount >= requiredTickets;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          desiredDate,
          nickname,
          requestedEmployeeId: requestedEmployeeId || null,
        }),
      });

      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "予約の作成に失敗しました");
      }

      router.push("/reservations?created=1");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "予約の作成に失敗しました",
      );
      setLoading(false);
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 text-sm text-forest">
        未使用チケット: <span className="font-bold">{unusedTicketCount}枚</span>
        {" · "}
        この予約で消費: <span className="font-bold">{requiredTickets}枚</span>
      </div>

      {!canSubmit && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          チケットが不足しています。
          <a href="/tickets/buy" className="ml-1 underline">
            チケットを購入する
          </a>
        </p>
      )}

      <div>
        <label htmlFor="plan" className="mb-2 block text-sm font-medium text-forest">
          プラン
        </label>
        <select
          id="plan"
          value={planId}
          onChange={(event) =>
            setPlanId(event.target.value as PlanDurationKey)
          }
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        >
          {BOOKING_PLANS.map((plan) => {
            const tickets = ticketsRequiredForMinutes(
              PLAN_DURATION_MINUTES[plan.id],
            );
            return (
              <option key={plan.id} value={plan.id}>
                {plan.label}
                {"subtitle" in plan && plan.subtitle ? `（${plan.subtitle}）` : ""}{" "}
                — {tickets}枚
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label
          htmlFor="desiredDate"
          className="mb-2 block text-sm font-medium text-forest"
        >
          希望日
        </label>
        <input
          id="desiredDate"
          type="date"
          required
          min={minDate}
          value={desiredDate}
          onChange={(event) => setDesiredDate(event.target.value)}
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        />
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
          type="text"
          required
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
        />
      </div>

      {employees.length > 0 && (
        <div>
          <label
            htmlFor="employee"
            className="mb-2 block text-sm font-medium text-forest"
          >
            希望スタッフ（任意）
          </label>
          <select
            id="employee"
            value={requestedEmployeeId}
            onChange={(event) => setRequestedEmployeeId(event.target.value)}
            className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
          >
            <option value="">指定なし</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="block w-full rounded-xl bg-sage-dark px-6 py-4 text-center text-lg font-bold text-white transition-colors hover:bg-[#4a6350] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "予約送信中..." : "予約を申し込む"}
      </button>

      <p className="text-center text-sm text-forest-muted">
        スタッフが承諾すると、通話URLをメールでお送りします。
      </p>
    </form>
  );
}
