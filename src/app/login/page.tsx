import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | ゆるネスト",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">読み込み中...</p>}>
      <LoginForm />
    </Suspense>
  );
}
