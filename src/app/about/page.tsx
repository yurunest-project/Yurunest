import type { Metadata } from "next";
import Link from "next/link";
import { HITOMOSHI_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "サービスについて | ゆるネスト",
  description:
    "ゆるネストのサービス概要。夜眠れない人と、お家から一歩踏み出したいスタッフを繋ぐブラウザ完結の通話サービスです。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory pb-10">
      <div className="border-b border-sage/15 bg-sage/8 px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-center text-sm font-medium tracking-[0.2em] text-sage">
            ABOUT
          </p>
          <h1 className="text-center text-2xl font-bold leading-relaxed text-forest sm:text-[1.75rem]">
            ゆるネストとは
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-5 py-10 sm:px-6 sm:py-12">
        <section className="mb-10 space-y-6 text-base leading-[2] text-forest-muted sm:text-lg">
          <p>
            夜眠れなくて寂しい「ひなユーザーさん」と、お家から一歩を踏み出したい「ひな社員（スタッフ）」を優しく繋ぐ、ブラウザ完結の1対1通話サービスです。
          </p>
          <p>
            Discord などの追加アプリは不要。予約・決済後に届くURLから、そのままブラウザで通話を始められます。
          </p>
        </section>

        <section className="mb-10 border-t border-sage/15 pt-10">
          <h2 className="mb-4 text-lg font-medium text-forest">こんな方に</h2>
          <ul className="space-y-3 border-l-2 border-sage/40 pl-4 text-base leading-relaxed text-forest-muted">
            <li>夜、誰かの声が聴きたいとき</li>
            <li>重い話をしにくくて、気軽に話したいとき</li>
            <li>15分から、自分のペースで始めたいとき</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-sage/20 bg-white px-5 py-6 text-base leading-relaxed text-forest-muted">
          <p>
            会社概要や代表の想いは、運営母体である
            <a
              href={HITOMOSHI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 text-sage-dark underline-offset-4 hover:underline"
            >
              ひともし
            </a>
            のサイトでご覧いただけます。
          </p>
          <p className="mt-4">
            <Link
              href="/book"
              className="font-medium text-sage-dark underline-offset-4 hover:underline"
            >
              予約・決済ページへ
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
