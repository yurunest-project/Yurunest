import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | ゆるネスト",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-forest sm:text-2xl">
          プライバシーポリシー
        </h1>
        <p className="text-base leading-loose text-forest-muted">
          現在準備中です。公開までしばらくお待ちください。
        </p>
      </div>
    </div>
  );
}
