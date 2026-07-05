import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "新しいパスワード | ゆるネスト",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">読み込み中...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
