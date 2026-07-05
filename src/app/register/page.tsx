import type { Metadata } from "next";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "新規登録 | ゆるネスト",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
