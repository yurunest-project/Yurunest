import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "チケット購入完了 | ゆるネスト",
};

export default async function TicketsBuySuccessPage() {
  const session = await auth();

  return (
    <AuthShell title="ご購入ありがとうございます">
      <p className="mb-6 text-base leading-relaxed text-forest-muted">
        お支払いが完了しました。チケットの反映には数秒かかることがあります。
        {session?.user
          ? " 続けて希望日を選んで予約できます。"
          : ""}
      </p>
      <div className="space-y-3">
        <Link
          href="/reservations/new"
          className="block rounded-xl bg-sage-dark px-4 py-3.5 text-center font-bold text-white hover:bg-[#4a6350]"
        >
          希望日を予約する
        </Link>
        <Link
          href="/tickets/buy"
          className="block rounded-xl border border-sage/25 px-4 py-3.5 text-center font-medium text-forest hover:bg-sage/10"
        >
          チケットを追加購入
        </Link>
      </div>
    </AuthShell>
  );
}
