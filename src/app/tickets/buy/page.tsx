import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AuthShell } from "@/components/AuthShell";
import { TicketPurchaseForm } from "@/components/TicketPurchaseForm";
import { countUnusedTickets } from "@/lib/tickets";
import { TICKET_UNIT_PRICE_YEN } from "@/types/ticket";

export const metadata: Metadata = {
  title: "チケット購入 | ゆるネスト",
};

export default async function TicketsBuyPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <AuthShell title="ログインが必要です">
        <p className="mb-6 text-base text-forest-muted">
          チケットの購入にはログインが必要です。
        </p>
        <Link
          href="/login?callbackUrl=/tickets/buy"
          className="block rounded-xl bg-sage-dark px-4 py-3.5 text-center font-bold text-white hover:bg-[#4a6350]"
        >
          ログインする
        </Link>
      </AuthShell>
    );
  }

  const unusedCount = await countUnusedTickets(session.user.id);
  const unitPrice =
    Number(process.env.TICKET_UNIT_PRICE_JPY) || TICKET_UNIT_PRICE_YEN;

  return (
    <AuthShell
      title="チケット購入"
      subtitle={`${session.user.nickname || session.user.email} さん`}
    >
      <p className="mb-2 text-base leading-relaxed text-forest-muted">
        15分チケットを Stripe で購入できます。購入後、希望日を選んで予約してください。
      </p>
      <p className="mb-6 rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 text-sm text-forest">
        未使用チケット:{" "}
        <span className="font-bold">{unusedCount}枚</span>
        {unusedCount > 0 && (
          <>
            {" · "}
            <Link href="/reservations/new" className="text-sage-dark underline">
              予約する
            </Link>
          </>
        )}
      </p>

      <Suspense fallback={<p className="text-base text-forest-muted">読み込み中...</p>}>
        <TicketPurchaseForm unitPrice={unitPrice} />
      </Suspense>

      <p className="mt-6 text-center text-sm">
        <Link href="/reservations" className="text-sage-dark hover:underline">
          予約一覧へ
        </Link>
      </p>
    </AuthShell>
  );
}
