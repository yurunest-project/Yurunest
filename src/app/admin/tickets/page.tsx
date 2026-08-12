import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTicketGrantForm } from "@/components/AdminTicketGrantForm";
import { getTimeTicketLabel } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "チケット管理 | ゆるネスト",
};

export default async function AdminTicketsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/tickets");
  if (session.user.role !== "ADMIN") redirect("/");

  const [tickets, changes] = await Promise.all([
    prisma.ticket.findMany({
      include: {
        user: { select: { email: true, nickname: true } },
        parentTicket: { select: { kind: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.ticketChangeLog.findMany({
      include: {
        consumedTicket: {
          include: { user: { select: { email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          ADMIN
        </p>
        <h1 className="mb-8 text-2xl font-bold text-forest">チケット管理</h1>
        <AdminTicketGrantForm />

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-forest">
            最近のチケット
          </h2>
          <ul className="space-y-3">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-xl border border-sage/15 bg-white p-4 text-sm"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-forest">
                    {getTimeTicketLabel(ticket.kind)}
                  </span>
                  <span className="text-forest-muted">{ticket.status}</span>
                </div>
                <p className="mt-1 text-forest-muted">
                  {ticket.user.nickname || ticket.user.email} · {ticket.source}
                </p>
                {ticket.parentTicket && (
                  <p className="mt-1 text-xs text-forest-muted">
                    返還元: {getTimeTicketLabel(ticket.parentTicket.kind)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-forest">余り返還履歴</h2>
          <ul className="space-y-3">
            {changes.map((change) => (
              <li
                key={change.id}
                className="rounded-xl border border-sage/15 bg-white p-4 text-sm text-forest-muted"
              >
                <p>{change.consumedTicket.user.email}</p>
                <p className="mt-1">
                  使用 {change.usedMinutes}分 / 返還{" "}
                  {change.returnedMinutes}分
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-center">
          <Link
            href="/admin/reservations"
            className="text-sage-dark hover:underline"
          >
            予約管理へ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
