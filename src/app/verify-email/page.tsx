import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { ResendVerificationForm } from "@/components/ResendVerificationForm";

export const metadata: Metadata = {
  title: "メール確認 | ゆるネスト",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let title = "メール確認";
  let body = "確認メールのリンクをクリックしてください。";

  if (status === "success") {
    title = "メール確認が完了しました";
    body = "ログインして、チケットの購入や予約を始められます。";
  } else if (status === "expired") {
    title = "リンクの有効期限切れ";
    body =
      "確認リンクの有効期限が切れています。下のフォームから確認メールを再送してください。";
  } else if (status === "invalid") {
    title = "無効なリンク";
    body =
      "確認リンクが正しくありません。下のフォームから確認メールを再送してください。";
  }

  return (
    <AuthShell title={title}>
      <p className="text-base leading-relaxed text-forest-muted">{body}</p>
      {status === "success" ? (
        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-sage-dark px-6 py-3 text-base font-bold text-white hover:bg-[#4a6350]"
          >
            ログインする
          </Link>
        </p>
      ) : (
        <div className="mt-6">
          <Suspense fallback={null}>
            <ResendVerificationForm />
          </Suspense>
        </div>
      )}
    </AuthShell>
  );
}
