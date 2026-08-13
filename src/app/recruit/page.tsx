import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "採用情報 | ゆるネスト",
};

export default function RecruitPage() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-forest sm:text-2xl">
          採用情報
        </h1>

        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-forest">私たちの想い</h2>
            <p className="text-base leading-loose text-forest-muted">
              「変わりたい」という微かな意思を、私は全力で肯定します。
            </p>
            <p className="text-base leading-loose text-forest-muted">
              ゆるネストは、夜眠れない人と、お家から一歩を踏み出したい人を繋ぐ安眠基地です。
            </p>
            <p className="text-base leading-loose text-forest-muted">
              「今は学校や仕事についていないけれど、少しずつ社会と繋がってみたい」
              <br />
              「外で働くのは怖いけれど、家から短時間なら…」
              <br />
              「孤独や生きづらさを抱えた経験がある」
            </p>
            <p className="text-base leading-loose text-forest-muted">
              そんなあなたの「最初の一歩」を応援したくて作った、温かい居場所です。
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-base leading-loose text-forest-muted">
              特に私たちが想いを寄せているのは、
              <span className="font-semibold text-forest">誰かの支えになりたいと思う中高生の方</span>
              や、
              <span className="font-semibold text-forest">現在仕事から離れており、少しだけ社会と繋がりたいと思っている方</span>
              です。
              <br />
              <span className="font-semibold text-forest">短時間・低負荷・在宅</span>
              という形で、社会と繋がる練習の場を用意したい——それがゆるネストの出発点です。
            </p>
            <p className="text-base leading-loose text-forest-muted">
              規約や安全面、プライバシーの保護など、安心してスタートできる環境を整えてお待ちしています。
            </p>
          </div>
        </section>

        <div className="mt-10 space-y-6">
          <h2 className="text-lg font-semibold text-forest">募集要項</h2>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-forest">
              職種：ひな社員（通話スタッフ）
            </h3>
            <p className="text-base leading-loose text-forest-muted">
              夜眠れないユーザーさんの「お話し相手」をしていただくお仕事です。特別な資格は必要ありません。
              あなたのこれまでの経験や、誰かに寄り添いたいという気持ちがそのまま活かせます。
            </p>
          </section>

          <section className="rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)]">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-forest">お仕事内容</p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  Webブラウザ上（スマホまたはPC）でのオンライン対話・雑談（1回15分〜）
                </p>
              </div>

              <div>
                <p className="font-semibold text-forest">雇用形態</p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  業務委託（報酬制） ※アルバイト（雇用）のようなシフトの義務や拘束時間は一切ありません
                </p>
              </div>

              <div>
                <p className="font-semibold text-forest">報酬</p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  ユーザー様のお支払い額から、Stripe決済手数料（3.6%）のみを差し引いた金額を、
                  運営の中抜きなくお支払いします（実質 約96%）
                  <br />
                  <br />
                  例）15分 500円の場合 ➔ 約482円
                  <br />
                  例）5時間(寝落ちパック) 6,5000円の場合 ➔ 約6,266円
                </p>
              </div>

              <div>
                <p className="font-semibold text-forest">勤務地</p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  完全在宅（リモートワーク）
                </p>
              </div>

              <div>
                <p className="font-semibold text-forest">応募資格</p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  12歳以上の方
                  <br />
                  <br />
                  ※「学校生活や体調を最優先しながら、無理のない形で少しずつ社会と繋がる練習をしたい」という方を歓迎します。
                  <br />
                  ※時間帯の運用は安全設計にもとづき、規約でご案内します。
                  <br />
                  ※18歳未満の方は、<span className="font-semibold text-forest">親権者（保護者）の同意書</span>
                  が必須です（書類は別途お渡しします）。
                  <br />
                  ※18歳未満の方は、青少年保護育成条例に基づき、
                  <span className="font-semibold text-forest">
                    22:00〜翌朝5:00の間はシステムをご利用いただけません
                  </span>
                  （自動的に受付停止状態となります）。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-forest">
              ゆるネストだけの「絶対の優しさ」（働くメリット）
            </h2>

            <div className="space-y-6 rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)]">
              <div>
                <p className="text-base font-semibold text-forest">
                  1. シフトの縛りは一切なし
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  「気が向いた時」「体調が良い時」だけでOKです。あなたのペースを最優先してください。
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-forest">
                  2. 依頼を断るのも100%自由
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  「今はちょっとお話できる気分じゃないな」という時は、いつでも自由に依頼をスキップできます。
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-forest">
                  3. 中抜きゼロ。決済手数料を除き、ほぼ全額を還元
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  ゆるネストは、代表の佐野が「生きづらさを抱える若者の最初の一歩を応援したい」という想いから、
                  <span className="font-semibold text-forest">
                    利益をスタッフから取らない形
                  </span>
                  で運営している安眠基地です。
                  <br />
                  システム維持費やトラブル補償の原資はすべて代表個人が負担し、システム自体も自動化を進めることで、
                  ユーザー様からの応援を決済手数料を除きほぼ全額（約96%）あなたの元へ届けられる仕組みを目指しています。
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-forest">
                  4. 万が一のトラブル時も、運営が間に入ります
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  お客さまとの間で困ったことやトラブルが発生した場合は、代表の佐野が責任を持って対応します。
                  あなたが一人でリスクを背負ったり、傷ついたりすることはありません。
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-forest">
                  5. 返金が発生しても、運営が責任を持って対応します
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  ゆるネストでは「全額返金保証」を設けています。
                  返金に伴う運用や取扱いは、運営が責任を持って対応します。
                  <span className="block mt-1 text-sm text-forest-muted">
                    ※詳細は、登録時にお渡しする規約・契約書に基づきます。
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-forest">
              契約と税金について（安心して働くために）
            </h2>
            <p className="text-base leading-loose text-forest-muted">
              ゆるネストでは、お互いが対等なパートナーとして「ゆるく、心地よく」繋がれるよう、契約形態として「業務委託」を採用しています。
              お給料ではなく「報酬」としてお支払いします。
            </p>

            <p className="text-base leading-loose text-forest-muted">
              <span className="font-semibold text-forest">税金と確定申告について</span>
              ：稼いだ金額によっては、税金の申告が必要になる場合があります。大まかな目安は以下の通りです（個別事情により異なります）。
            </p>

            <div className="space-y-3">
              <p className="text-base leading-relaxed text-forest-muted">
                <span className="font-semibold text-forest">
                  本業（会社員など）があり、副業として働く方
                </span>
                <br />
                年間の副業利益（報酬から通信費などの経費を引いた額）が20万円を超えた場合、所得税の確定申告が必要になることがあります。
                20万円以下の場合、所得税の申告は不要ですが、住民税の申告が別途必要になる場合があります。
              </p>

              <p className="text-base leading-relaxed text-forest-muted">
                <span className="font-semibold text-forest">
                  本業がない方（学生・求職中など）
                </span>
                <br />
                年間の報酬額や扶養の状況などにより、申告の要否が変わります。少しでも不安な方は、税務窓口や税理士、ご家族にご相談ください。
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-forest">
              12歳から応募できる理由
            </h2>
            <p className="text-base leading-loose text-forest-muted">
              ゆるネストが「12歳」を対象にしているのは、若さゆえに選択肢が狭まり、社会との接点を失ってしまうことがあるからです。
              <br />
              中学生の頃は、心の苦しみを抱えていても、専門的な支援にたどり着きにくいことがあります。
              そのため、成長の機会と未来の選択肢を増やすために、この形の事業が必要だと考えました。
              <br />
              私が救いたいのは、そのような悩みを持つ中高生と、何か挑戦してみたいと思う皆さんです。
              <br />
              その想いのために、年齢を変えずに取り組んでいます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-forest">応募の流れ</h2>

            <div className="space-y-6 rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)]">
              <div>
                <p className="text-base font-semibold text-forest">
                  【STEP 1】公式X（旧Twitter）のDMからご連絡
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  「ちょっと話を聞いてみたい」という気軽な気持ちで大丈夫です。
                  「ひな社員の募集を見ました」と送ってください。
                  <br />
                  連絡先：<span className="font-semibold text-forest">@yurunest</span>
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-forest">
                  【STEP 2】オンラインでのカジュアル面談
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  通話にて、お互いの雰囲気や大切にしたい価値観についてお話しします。
                  面接のような堅苦しいものではありません。
                  <br />
                  ※18歳未満の方は、親権者（保護者）の同席をお願いする場合があります。
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-forest">
                  【STEP 3】ひな社員として登録・お仕事スタート！
                </p>
                <p className="mt-1 text-base leading-relaxed text-forest-muted">
                  環境が整ったら、管理者が登録したシフトの時間帯に、ユーザーからの予約を受け付けられます。
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block rounded-xl bg-sage-dark px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#4a6350]"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
