import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "スタッフログイン | ゆるネスト",
};

export default function EmployeeLoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">読み込み中...</p>}>
      <LoginForm
        provider="employee"
        title="スタッフログイン"
        subtitle="ひな社員として招待されたメールアドレスでログインしてください。"
      />
    </Suspense>
  );
}
