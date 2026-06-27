import Link from "next/link";

const reasons = [
  {
    title: "通話ガチャなし",
    description:
      "身元が保証された優しいひな社員が、いつも同じ安心感で対応します。",
  },
  {
    title: "15分500円から気軽に",
    description:
      "入会金・月会費なし。必要な夜だけ、時間を選んでご利用いただけます。長めのご利用ほど1分あたりの料金もお得になります。",
  },
  {
    title: "安心の【事前決済 ＆ 全額返金保証】",
    description:
      "少しでもご満足いただけなかった場合、理由を問わず全額返金いたします。お金を無駄にするリスクは一切ありません。",
  },
] as const;

const pricingPlans = [
  {
    duration: "15分",
    price: 500,
    unitPrice: "約33円/分",
    note: "まず試したい方に",
    recommended: false,
    featured: false,
  },
  {
    duration: "30分",
    price: 900,
    unitPrice: "30円/分",
    note: "お話しするのにちょうどいい時間です",
    recommended: true,
    featured: false,
  },
  {
    duration: "1時間",
    price: 1600,
    unitPrice: "約26円/分",
    note: null,
    recommended: false,
    featured: false,
  },
  {
    duration: "3時間",
    price: 4500,
    unitPrice: "約25円/分",
    note: null,
    recommended: false,
    featured: false,
  },
  {
    duration: "寝落ちパック",
    subtitle: "5時間以上",
    price: 6500,
    unitPrice: "約21円/分",
    note: "長時間のご利用に",
    recommended: false,
    featured: true,
  },
] as const;

const steps = [
  {
    step: 1,
    title: "予約フォームから日時を選んで前払い",
  },
  {
    step: 2,
    title: "専用のDiscordサーバーへご招待",
  },
  {
    step: 3,
    title: "時間になったらDiscordの静かな通話室でスタート",
  },
] as const;

function SectionHeading({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">{label}</p>
      <h2
        id={id}
        className="border-l-2 border-sage/40 pl-4 text-lg font-medium leading-snug text-forest sm:text-xl"
      >
        {children}
      </h2>
    </div>
  );
}

function formatPrice(yen: number) {
  return yen.toLocaleString("ja-JP");
}

function PricingTable() {
  return (
    <div>
      <p className="mb-5 pl-4 text-base leading-relaxed text-forest-muted">
        入会金・月会費はかかりません。ご希望の時間を選んで、事前決済でご予約ください。
      </p>

      <div className="overflow-hidden rounded-2xl border border-sage/20 bg-white">
        <div
          className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-sage/15 bg-sage/8 px-4 py-3 text-xs font-medium tracking-wide text-forest-muted sm:grid-cols-[1fr_auto_auto] sm:px-5"
          aria-hidden="true"
        >
          <span>プラン</span>
          <span className="text-right">料金（税込）</span>
          <span className="hidden text-right sm:block">1分あたり</span>
        </div>

        <ul role="list">
          {pricingPlans.map((plan) => (
            <li
              key={plan.duration}
              className={`border-b border-sage/10 last:border-b-0 ${
                plan.featured
                  ? "bg-sage/10"
                  : plan.recommended
                    ? "bg-sage/5"
                    : ""
              }`}
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 px-4 py-4 sm:grid-cols-[1fr_auto_auto] sm:gap-x-6 sm:px-5 sm:py-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-forest sm:text-lg">
                      {plan.duration}
                      {"subtitle" in plan && (
                        <span className="ml-1.5 text-sm font-normal text-forest-muted">
                          （{plan.subtitle}）
                        </span>
                      )}
                    </p>
                    {plan.recommended && (
                      <span className="rounded-full bg-sage px-2 py-0.5 text-xs font-medium text-white">
                        おすすめ
                      </span>
                    )}
                    {plan.featured && (
                      <span className="rounded-full border border-sage/40 bg-ivory px-2 py-0.5 text-xs font-medium text-sage-dark">
                        お得
                      </span>
                    )}
                  </div>
                  {plan.note && (
                    <p className="mt-1 text-sm text-forest-muted">{plan.note}</p>
                  )}
                  <p className="mt-1 text-sm text-sage sm:hidden">
                    {plan.unitPrice}
                  </p>
                </div>

                <p className="text-right">
                  <span className="text-xl font-bold tabular-nums text-forest sm:text-2xl">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="ml-0.5 text-sm font-medium text-forest-muted">
                    円
                  </span>
                </p>

                <p className="hidden text-right text-sm tabular-nums text-forest-muted sm:block">
                  {plan.unitPrice}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 pl-4 text-sm leading-relaxed text-forest-muted">
        ※ 長時間ほど1分あたりの料金が下がります。表示価格はすべて税込です。
      </p>
    </div>
  );
}

function ReserveButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href="#"
      className={`group block w-full rounded-xl bg-sage-dark text-center font-bold text-white shadow-[0_6px_24px_rgba(42,52,45,0.18)] ring-2 ring-sage/40 transition-all hover:bg-[#4a6350] hover:shadow-[0_8px_28px_rgba(42,52,45,0.24)] hover:ring-sage/60 active:scale-[0.98] focus-visible:outline-offset-4 ${
        compact
          ? "px-4 py-3.5 text-base"
          : "px-6 py-6 text-lg sm:text-xl"
      } ${className}`}
    >
      <span className="block leading-snug">今夜の安心を予約する</span>
      {!compact && (
        <span className="mt-1 block text-sm font-medium text-white/85 sm:text-base">
          全額返金保証付き · 15分500円〜
        </span>
      )}
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ivory pb-28">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-base focus:text-forest focus:shadow-md"
      >
        メインコンテンツへスキップ
      </a>

      <section
        className="bg-sage px-5 py-20 text-white sm:px-6 sm:py-24"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-lg">
          <h1
            id="hero-heading"
            className="text-[1.625rem] font-bold leading-[1.65] tracking-wide sm:text-[1.875rem] sm:leading-[1.7]"
          >
            誰かの声が聴きたい夜に。
            <br />
            <span className="mt-2 inline-block text-[1.75rem] sm:text-[2rem]">
              実家に帰ったような、
              <br />
              いちばん安心できる15分を。
            </span>
          </h1>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto max-w-lg px-5 py-10 sm:px-6 sm:py-12"
      >
        <section className="mb-14" aria-labelledby="about-heading">
          <SectionHeading id="about-heading" label="ABOUT">
            「ゆるネスト」とは
          </SectionHeading>
          <p className="pl-4 text-base leading-[2] text-forest-muted sm:text-lg">
            夜眠れなくて寂しい「ひなユーザーさん」と、お家から一歩を踏み出したい「ひな社員（スタッフ）」を優しく繋ぐ、安眠基地プラットフォームです。
          </p>
        </section>

        <section className="mb-14" aria-labelledby="reasons-heading">
          <SectionHeading id="reasons-heading" label="REASON">
            選ばれる3つの理由
          </SectionHeading>
          <div className="divide-y divide-sage/15 border-y border-sage/15">
            {reasons.map((reason, index) => (
              <article key={reason.title} className="py-6 first:pt-0 last:pb-0">
                <div className="flex gap-4">
                  <p
                    className="w-8 shrink-0 pt-0.5 text-right text-sm font-medium tabular-nums text-sage"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="mb-2 text-base font-medium text-forest sm:text-lg">
                      {reason.title}
                    </h3>
                    <p className="text-base leading-[1.9] text-forest-muted">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14" aria-labelledby="pricing-heading">
          <SectionHeading id="pricing-heading" label="PRICE">
            料金表
          </SectionHeading>
          <PricingTable />
        </section>

        <section className="mb-14" aria-labelledby="flow-heading">
          <SectionHeading id="flow-heading" label="FLOW">
            ご利用の流れ
          </SectionHeading>
          <div className="relative pl-2">
            {steps.map(({ step, title }, index) => (
              <div
                key={step}
                className={`relative flex gap-4 ${index < steps.length - 1 ? "pb-8" : ""}`}
              >
                {index < steps.length - 1 && (
                  <span
                    className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-sage/30"
                    aria-hidden="true"
                  />
                )}
                <div className="relative z-10 shrink-0">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-sage bg-ivory text-xs font-bold text-sage-dark"
                    aria-hidden="true"
                  >
                    {step}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="mb-1.5 text-xs font-medium tracking-wider text-sage">
                    STEP {step}
                  </p>
                  <p className="relative rounded-2xl rounded-tl-sm bg-white px-4 py-3.5 text-base leading-relaxed text-forest shadow-[0_2px_12px_rgba(110,139,116,0.12)] sm:text-lg">
                    {title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mb-10 rounded-2xl border border-sage/20 bg-white px-5 py-8 shadow-[0_4px_20px_rgba(110,139,116,0.1)] sm:px-6"
          aria-labelledby="cta-heading"
        >
          <h2 id="cta-heading" className="sr-only">
            予約
          </h2>
          <p className="mb-5 text-center text-base leading-relaxed text-forest-muted">
            今夜、誰かの声が必要なら。
            <br />
            まずは予約から、ゆっくり始められます。
          </p>
          <ReserveButton />
        </section>

        <nav
          className="mb-6 flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center sm:gap-6"
          aria-label="法的情報"
        >
          <Link
            href="/tokushoho"
            className="text-base text-forest-muted underline-offset-4 transition-colors hover:text-sage-dark hover:underline"
          >
            特定商取引法に基づく表記
          </Link>
          <Link
            href="/privacy"
            className="text-base text-forest-muted underline-offset-4 transition-colors hover:text-sage-dark hover:underline"
          >
            プライバシーポリシー
          </Link>
        </nav>
      </main>

      <footer className="border-t border-sage/15 bg-ivory px-5 py-6 text-center">
        <p className="text-base text-forest-muted">© 2026 Yurunest Project</p>
      </footer>

      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-sage/15 bg-ivory/95 px-4 py-3 backdrop-blur-sm sm:px-6"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        role="complementary"
        aria-label="予約ボタン"
      >
        <div className="mx-auto max-w-lg">
          <ReserveButton compact />
        </div>
      </div>
    </div>
  );
}
