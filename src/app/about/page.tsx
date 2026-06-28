import type { Metadata } from "next";
import { HighlightHeading } from "@/components/HighlightHeading";
import Image from "next/image";

export const metadata: Metadata = {
  title: "私の想い | ゆるネスト",
  description:
    "ゆるネスト代表・佐野より。夜の孤独に寄り添い、小さな一歩を優しく繋ぐサービスが生まれた理由をお伝えします。",
};

const userVoices = [
  "夜になると、急に孤独感に襲われて眠れない",
  "誰かに話を聞いてほしいけれど、友達に重い話をしたら迷惑かも…",
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory pb-10">
      <div className="border-b border-sage/15 bg-sage/8 px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="ゆるネスト"
              width={200}
              height={200}
              className="h-36 w-auto rounded-2xl shadow-[0_4px_20px_rgba(110,139,116,0.2)]"
              priority
            />
          </div>
          <p className="mb-2 text-center text-sm font-medium tracking-[0.2em] text-sage">
            PHILOSOPHY
          </p>
          <h1 className="text-center text-2xl font-bold leading-relaxed text-forest sm:text-[1.75rem]">
            私の想い
            <span className="mt-1 block text-lg font-medium text-forest-muted sm:text-xl">
              〜ゆるネストが生まれた理由〜
            </span>
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-5 py-10 sm:px-6 sm:py-12">
        <section className="mb-12" aria-labelledby="intro-heading">
          <h2 id="intro-heading" className="sr-only">
            はじめに
          </h2>
          <p className="text-base leading-[2] text-forest sm:text-lg">
            こんにちは。ゆるネスト代表の佐野です。
          </p>
          <p className="mt-6 text-base leading-[2] text-forest-muted sm:text-lg">
            突然ですが、あなたは今、こんな気持ちを抱えていませんか？
          </p>

          <ul
            className="my-6 space-y-3 border-l-2 border-sage/40 pl-4"
            role="list"
          >
            {userVoices.map((voice) => (
              <li
                key={voice}
                className="text-base leading-relaxed text-forest sm:text-lg"
              >
                「{voice}」
              </li>
            ))}
          </ul>

          <p className="text-base leading-[2] text-forest-muted sm:text-lg">
            一方で、世界の中では、こう願っている人もいると考えています。
          </p>
          <blockquote className="my-6 border-l-2 border-sage/50 pl-4 text-base leading-relaxed text-forest sm:text-lg">
            「もう一度社会と繋がりたい。でも、外に出て働くのはまだ少し怖い」
          </blockquote>
          <p className="text-base leading-[2] text-forest sm:text-lg">
            このサービスは、そんな二人の「小さな一歩」を優しく繋ぐために生まれました。
          </p>
        </section>

        <section
          className="mb-12 border-t border-sage/15 pt-12"
          aria-labelledby="step-heading"
        >
          <HighlightHeading id="step-heading" index={1}>
            小さな一歩を価値に変え、誰もが「安心」できる場所を。
          </HighlightHeading>
          <div className="space-y-6 text-base leading-[2] text-forest-muted sm:text-lg">
            <p>
              心が元気になってから動くのではなく、小さな行動をほんの少し起こすことで、人は変われる。私はそのエネルギーを信じています。
            </p>
            <p>
              社会の最前線で一生懸命がんばっているあなたの努力を、私は心からリスペクトしています。
              同時に、お家から、15分という短い時間から、それぞれのペースで社会と繋がり直したいと願う人たちの選択肢も、同じくらい大切にしたいのです。
            </p>
            <p>
              傷ついた経験や、孤独と向き合ってきた葛藤があるからこそ、届けられる「本物の優しさ」があります。教科書通りのアドバイスではなく、あなたのありのままの心に寄り添い、全肯定してくれる。そんな温かい居場所をここに用意しました。
            </p>
          </div>
        </section>

        <section
          className="border-t border-sage/15 pt-12"
          aria-labelledby="future-heading"
        >
          <HighlightHeading id="future-heading" index={2}>
            誰もが誰かの「居場所」となり、時には誰かに「甘えられる」未来へ。
          </HighlightHeading>
          <div className="space-y-6 text-base leading-[2] text-forest-muted sm:text-lg">
            <p>
              ゆるネストは、純粋な非営利の精神から生まれたプラットフォームです。
              稼いだお金は、すべて一歩を踏み出したスタッフへ全額バックされます。もし、お話ししてみて少しでも心が軽くならなかったら、いつでも全額を返金します。あなたがリスクを背負う必要は、一切ありません。
            </p>
            <p className="text-forest">
              時には誰かの居場所となり、時には誰かに優しく甘えられる。
              そんな「優しさが循環する、孤立のない社会」を、まずはこの小さな巣（ネスト）から、あなたと一緒に作っていけたら嬉しいです。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
