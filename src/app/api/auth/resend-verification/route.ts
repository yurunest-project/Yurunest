import { prisma } from "@/lib/prisma";
import { issueAndSendVerificationEmail } from "@/lib/verification-email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "メールアドレスを入力してください" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    try {
      const result = await issueAndSendVerificationEmail({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      });
      if (!result.ok && result.reason === "rate_limited") {
        return NextResponse.json(
          { error: "再送は60秒に1回までです。少し待ってからお試しください。" },
          { status: 429 },
        );
      }
    } catch (error) {
      console.error("[resend-verification-email]", error);
      return NextResponse.json(
        { error: "メールの送信に失敗しました。しばらくしてからお試しください。" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message:
      "確認メールを送信しました。届かない場合は迷惑メールフォルダもご確認ください。",
  });
}
