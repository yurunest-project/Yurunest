import type { Metadata } from "next";
import Link from "next/link";
import { hitomoshiLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | ゆるネスト",
};

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-forest sm:text-2xl">
          特定商取引法に基づく表記
        </h1>
        <p className="text-base leading-loose text-forest-muted">
          法的情報は運営母体「ひともし」のサイトで公開しています。
        </p>
        <p className="mt-6">
          <a
            href={hitomoshiLinks.tokushoho}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-sage-dark underline-offset-4 hover:underline"
          >
            ひともしの表記を見る →
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
