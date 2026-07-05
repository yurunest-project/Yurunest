import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

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
    body = "確認リンクの有効期限が切れています。再度新規登録をお試しください。";
  } else if (status === "invalid") {
    title = "無効なリンク";
    body = "確認リンクが正しくありません。";
  }

  return (
    <AuthShell title={title}>
      <p className="text-base leading-relaxed text-forest-muted">{body}</p>
      {status === "success" && (
        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-sage-dark px-6 py-3 text-base font-bold text-white hover:bg-[#4a6350]"
          >
            ログインする
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
