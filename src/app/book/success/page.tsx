import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "予約完了 | ゆるネスト",
  description: "ご予約ありがとうございます。通話URLをメールでご確認ください。",
};

export default function BookSuccessPage() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          COMPLETE
        </p>
        <h1 className="mb-4 text-2xl font-bold text-forest">
          ご予約ありがとうございます
        </h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          お支払いが完了しました。通話ルームURLをメールでお送りしています。
          <br />
          届かない場合は迷惑メールフォルダもご確認ください。
        </p>

        <Link
          href="/"
          className="inline-block rounded-xl bg-sage-dark px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#4a6350]"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
