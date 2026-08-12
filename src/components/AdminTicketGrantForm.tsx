"use client";

import { TIME_TICKETS, type TicketKindKey } from "@/lib/constants";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminTicketGrantForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ticketKind, setTicketKind] = useState<TicketKindKey>("min15");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ticketKind, quantity }),
    });
    const data = (await response.json()) as {
      error?: string;
      created?: number;
    };
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "付与できませんでした");
      return;
    }
    setMessage(`${data.created ?? quantity}枚を付与しました。`);
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-sage/20 bg-white p-5"
    >
      <h2 className="text-lg font-bold text-forest">手動付与</h2>
      <label className="block text-sm font-medium text-forest">
        ユーザーのメールアドレス
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      <label className="block text-sm font-medium text-forest">
        チケット
        <select
          value={ticketKind}
          onChange={(event) =>
            setTicketKind(event.target.value as TicketKindKey)
          }
          className="mt-2 w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base"
        >
          {TIME_TICKETS.map((ticket) => (
            <option key={ticket.kind} value={ticket.kind}>
              {ticket.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-forest">
        枚数
        <input
          type="number"
          min={1}
          max={40}
          required
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="mt-2 w-full rounded-xl border border-sage/25 px-4 py-3 text-base"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sage-dark px-4 py-3 font-bold text-white disabled:opacity-60"
      >
        {loading ? "付与中..." : "チケットを付与"}
      </button>
      {message && <p className="text-sm text-forest-muted">{message}</p>}
    </form>
  );
}
