import Link from "next/link";
import { DailyCallRoom } from "@/components/DailyCallRoom";
import { getDailyRoomUrl } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通話ルーム | ゆるネスト",
  robots: { index: false, follow: false },
};

type CallPageProps = {
  params: Promise<{ room: string }>;
};

export default async function CallPage({ params }: CallPageProps) {
  const { room } = await params;

  let roomUrl: string;
  try {
    roomUrl = getDailyRoomUrl(room);
  } catch {
    return (
      <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-lg text-base leading-relaxed text-forest-muted">
          通話機能の設定が完了していません（Daily.co のドメイン設定が必要です）。
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-10">
      <div className="border-b border-sage/15 bg-sage/8 px-5 py-8 sm:px-6">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
            CALL
          </p>
          <h1 className="text-xl font-bold text-forest sm:text-2xl">
            通話ルーム
          </h1>
          <p className="mt-3 text-base leading-relaxed text-forest-muted">
            マイクの使用を許可して、静かな通話を始めてください。
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-5 py-8 sm:px-6">
        <DailyCallRoom roomUrl={roomUrl} />
        <p className="mt-6 text-center text-sm leading-relaxed text-forest-muted">
          終了したらブラウザを閉じるか、画面内の退出ボタンを押してください。
        </p>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-base text-sage-dark underline-offset-4 hover:underline"
          >
            トップへ戻る
          </Link>
        </p>
      </main>
    </div>
  );
}
