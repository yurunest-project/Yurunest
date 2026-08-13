import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RefundButton } from "@/components/RefundButton";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "返金管理 | ゆるネスト",
};

export default async function AdminRefundsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/refunds");
  if (session.user.role !== "ADMIN") redirect("/");

  const [tickets, refundHistories] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        stripePaymentIntentId: { not: null },
        status: { not: "refunded" },
      },
      include: { user: { select: { email: true, nickname: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.refundHistory.findMany({
      include: { user: { select: { email: true, nickname: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  const purchases = [...new Map(
    tickets.map((ticket) => [ticket.stripePaymentIntentId!, ticket]),
  ).values()];

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">ADMIN</p>
        <h1 className="mb-3 text-2xl font-bold text-forest">返金管理</h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          返金は購入単位で全額処理されます。処理すると関連するチケットは返金済みになり、未実施の予約はキャンセルされます。
        </p>
        {purchases.length === 0 ? (
          <p className="rounded-2xl border border-sage/20 bg-white p-5 text-forest-muted">
            返金可能な決済はありません。
          </p>
        ) : (
          <ul className="space-y-3">
            {purchases.map((ticket) => (
              <li key={ticket.stripePaymentIntentId} className="rounded-2xl border border-sage/20 bg-white p-5">
                <p className="font-medium text-forest">
                  {ticket.user.nickname || ticket.user.email}
                </p>
                <p className="mt-1 text-sm text-forest-muted">{ticket.user.email}</p>
                <p className="mt-2 break-all text-xs text-forest-muted">
                  {ticket.stripePaymentIntentId}
                </p>
                <RefundButton paymentIntentId={ticket.stripePaymentIntentId!} />
              </li>
            ))}
          </ul>
        )}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-forest">返金履歴</h2>
          {refundHistories.length === 0 ? (
            <p className="text-sm text-forest-muted">返金履歴はありません。</p>
          ) : (
            <ul className="space-y-3">
              {refundHistories.map((history) => (
                <li
                  key={history.id}
                  className="rounded-xl border border-sage/15 bg-white p-4 text-sm"
                >
                  <p className="font-medium text-forest">
                    {history.user.nickname || history.user.email}
                  </p>
                  <p className="mt-1 text-forest-muted">{history.reason}</p>
                  <p className="mt-1 text-xs text-forest-muted">
                    {history.createdAt.toLocaleString("ja-JP")}
                    {history.amount ? ` · ${history.amount.toLocaleString("ja-JP")}円` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-8 text-center">
          <Link href="/admin/reservations" className="text-sage-dark hover:underline">
            予約管理へ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
