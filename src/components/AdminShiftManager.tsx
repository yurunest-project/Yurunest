"use client";

import { FormEvent, useEffect, useState } from "react";

type Employee = { id: string; name: string };
type Slot = {
  id: string;
  employeeId: string;
  employeeName: string;
  startAt: string;
  status: "open" | "reserved";
};

function initialDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function AdminShiftManager({
  employees,
  apiBase = "/api/admin/shifts",
  showEmployeeSelect = true,
}: {
  employees: Employee[];
  apiBase?: string;
  showEmployeeSelect?: boolean;
}) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSlots() {
    if (!date) return;
    const params = new URLSearchParams({ date });
    if (employeeId) params.set("employeeId", employeeId);
    const response = await fetch(`${apiBase}?${params}`);
    const data = (await response.json()) as { slots?: Slot[]; error?: string };
    if (response.ok) setSlots(data.slots ?? []);
    else setMessage(data.error ?? "シフトを取得できませんでした");
  }

  useEffect(() => {
    void loadSlots();
  }, [date, employeeId]);

  async function createShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, date, startTime, endTime }),
      });
      const data = (await response.json()) as {
        created?: number;
        skipped?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "シフトを作成できませんでした");
      setMessage(`${data.created ?? 0}枠を作成しました。`);
      await loadSlots();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "シフトを作成できませんでした");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSlot(slotId: string) {
    setMessage(null);
    const response = await fetch(apiBase, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "枠を削除できませんでした");
      return;
    }
    await loadSlots();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={createShift}
        className="space-y-4 rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)]"
      >
        {showEmployeeSelect && <div>
          <label htmlFor="employee" className="mb-2 block text-sm font-medium text-forest">
            スタッフ
          </label>
          <select
            id="employee"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            required
            className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>}
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-forest">
            日付
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-forest">
            開始時刻
            <input
              type="time"
              step="900"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
            />
          </label>
          <label className="text-sm font-medium text-forest">
            終了時刻
            <input
              type="time"
              step="900"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !employeeId}
          className="w-full rounded-xl bg-sage-dark px-4 py-3 font-bold text-white hover:bg-[#4a6350] disabled:opacity-60"
        >
          {loading ? "作成中..." : "15分単位でシフトを作成"}
        </button>
        {message && <p className="text-sm text-forest-muted">{message}</p>}
      </form>

      <section>
        <h2 className="mb-3 text-lg font-bold text-forest">登録済みの時間枠</h2>
        {slots.length === 0 ? (
          <p className="rounded-xl border border-sage/20 bg-white p-4 text-sm text-forest-muted">
            この条件の時間枠はありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between rounded-xl border border-sage/15 bg-white px-4 py-3"
              >
                <span className="text-sm text-forest">
                  {new Intl.DateTimeFormat("ja-JP", {
                    timeZone: "Asia/Tokyo",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  }).format(new Date(slot.startAt))}
                  {" · "}
                  {slot.status === "open" ? "受付可能" : "予約済み"}
                </span>
                {slot.status === "open" && (
                  <button
                    type="button"
                    onClick={() => void deleteSlot(slot.id)}
                    className="text-sm text-red-700 underline"
                  >
                    削除
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
