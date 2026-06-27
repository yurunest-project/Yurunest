import type { Metadata } from "next";

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
        <p className="text-base leading-loose text-forest-muted">
          ひな社員（スタッフ）の募集について、現在準備中です。公開までしばらくお待ちください。
        </p>
      </div>
    </div>
  );
}
