import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { EmployeeInviteForm } from "@/components/EmployeeInviteForm";

export const metadata: Metadata = {
  title: "スタッフ招待 | ゆるネスト",
};

export default async function EmployeeInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <AuthShell title="無効な招待リンク">
        <p className="text-forest-muted">招待リンクをご確認ください。</p>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title="スタッフ登録"
      subtitle="パスワードを設定すると、スタッフページへログインできます。"
    >
      <EmployeeInviteForm token={token} />
    </AuthShell>
  );
}
