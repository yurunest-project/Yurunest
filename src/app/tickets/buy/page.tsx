import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { AuthShell } from "@/components/AuthShell";

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

  return (
    <AuthShell
      title="チケット購入"
      subtitle={`${session.user.nickname || session.user.email} さん`}
    >
      <p className="text-base leading-relaxed text-forest-muted">
        Stripe Elements によるチケット購入画面は Step 4 で実装します。
        認証は正常に動作しています。
      </p>
      <p className="mt-6 text-center">
        <Link href="/" className="text-sage-dark hover:underline">
          トップへ戻る
        </Link>
      </p>
    </AuthShell>
  );
}
