"use client";

import {
  BOOKING_PLANS,
  PLAN_DURATION_MINUTES,
  type PlanDurationKey,
} from "@/lib/constants";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type EmployeeOption = {
  id: string;
  name: string;
};

type AvailabilityOption = {
  employeeId: string;
  employeeName: string;
  startAt: string;
};

export function ReservationForm({
  employees,
  unusedTicketCount,
  unusedTicketMinutes,
  defaultNickname,
}: {
  employees: EmployeeOption[];
  unusedTicketCount: number;
  unusedTicketMinutes: number;
  defaultNickname: string;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanDurationKey>("30min");
  const [desiredDate, setDesiredDate] = useState("");
  const [nickname, setNickname] = useState(defaultNickname);
  const [requestedEmployeeId, setRequestedEmployeeId] = useState("");
  const [availability, setAvailability] = useState<AvailabilityOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationMinutes = useMemo(
    () => PLAN_DURATION_MINUTES[planId],
    [planId],
  );

  const canSubmit =
    unusedTicketMinutes >= durationMinutes && Boolean(selectedSlot);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setSelectedSlot("");
      if (!desiredDate) {
        setAvailability([]);
        return;
      }

      setLoadingAvailability(true);
      try {
        const params = new URLSearchParams({ date: desiredDate, plan: planId });
        if (requestedEmployeeId) {
          params.set("employeeId", requestedEmployeeId);
        }
        const response = await fetch(`/api/availability?${params}`);
        const data = (await response.json()) as {
          options?: AvailabilityOption[];
        };
        if (!cancelled) setAvailability(response.ok ? data.options ?? [] : []);
      } catch {
        if (!cancelled) setAvailability([]);
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    }

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [desiredDate, planId, requestedEmployeeId]);

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
          startAt: selectedSlot.split("|")[1] ?? "",
          nickname,
          employeeId: selectedSlot.split("|")[0] ?? "",
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

  const minDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 text-sm text-forest">
        利用可能: <span className="font-bold">{unusedTicketCount}枚</span>
        {" · "}
        合計 <span className="font-bold">{unusedTicketMinutes}分</span>
        {" · "}
        予約時間: <span className="font-bold">{durationMinutes}分</span>
      </div>

      {!canSubmit && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          利用可能な時間別チケットが不足しています。
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
          {BOOKING_PLANS.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.label}
              {"subtitle" in plan && plan.subtitle
                ? `（${plan.subtitle}）`
                : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="desiredDate"
          className="mb-2 block text-sm font-medium text-forest"
        >
          利用日
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
          htmlFor="start-at"
          className="mb-2 block text-sm font-medium text-forest"
        >
          開始時刻
        </label>
        <select
          id="start-at"
          required
          disabled={!desiredDate || loadingAvailability}
          value={selectedSlot}
          onChange={(event) => setSelectedSlot(event.target.value)}
          className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {loadingAvailability
              ? "予約可能な時間を読み込み中..."
              : "開始時刻を選択してください"}
          </option>
          {availability.map((option) => (
            <option
              key={`${option.employeeId}-${option.startAt}`}
              value={`${option.employeeId}|${option.startAt}`}
            >
              {new Intl.DateTimeFormat("ja-JP", {
                timeZone: "Asia/Tokyo",
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
              }).format(new Date(option.startAt))}
              {" — "}
              {option.employeeName}
            </option>
          ))}
        </select>
        {desiredDate && !loadingAvailability && availability.length === 0 && (
          <p className="mt-2 text-sm text-forest-muted">
            この条件では予約可能な時間がありません。
          </p>
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
          スタッフで絞り込む（任意）
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
        利用可能なチケットを自動で組み合わせます。余った時間は時間別チケットとして返還されます。
      </p>
    </form>
  );
}
