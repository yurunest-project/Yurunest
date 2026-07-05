import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "パスワード再設定 | ゆるネスト",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
