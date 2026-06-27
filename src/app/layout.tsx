import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "ゆるネスト | 誰かの声が聴きたい夜に",
  description:
    "夜眠れなくて寂しいひなユーザーさんと、お家から一歩を踏み出したいひな社員を優しく繋ぐ、安眠基地プラットフォーム。15分750円・全額返金保証。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
