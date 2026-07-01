import type { Metadata } from "next";
import Link from "next/link";
import { hitomoshiLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "プライバシーポリシー | ゆるネスト",
  description:
    "ゆるネストの個人情報保護方針。詳細は運営母体ひともしのサイトをご確認ください。",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-forest sm:text-2xl">
          プライバシーポリシー
        </h1>
        <p className="text-base leading-loose text-forest-muted">
          ゆるネストの個人情報保護方針は、運営母体「ひともし」のプライバシーポリシーに準拠します。予約・決済時に取得するメールアドレス等は、サービス提供および通話URLの送付に利用します。
        </p>
        <p className="mt-6">
          <a
            href={hitomoshiLinks.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-sage-dark underline-offset-4 hover:underline"
          >
            ひともしのプライバシーポリシーを見る →
          </a>
        </p>
        <p className="mt-8">
          <Link
            href="/"
            className="text-base text-forest-muted underline-offset-4 hover:underline"
          >
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
