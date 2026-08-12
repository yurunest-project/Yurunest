import { sendVerificationEmail } from "@/lib/email-auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSecureToken, tokenExpiresInHours } from "@/lib/tokens";
import { issueAndSendVerificationEmail } from "@/lib/verification-email";
import { registerSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";

const successMessage =
  "確認メールを送信しました。メール内のリンクをクリックしてください。届かない場合は迷惑メールフォルダもご確認ください。";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const [existingUser, existingEmployee] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.employee.findUnique({ where: { email } }),
  ]);
  if (existingEmployee) {
    return NextResponse.json(
      { error: "このメールアドレスは既に登録されています" },
      { status: 409 },
    );
  }

  if (existingUser) {
    if (existingUser.emailVerified) {
      return NextResponse.json(
        {
          error: "このメールアドレスは既に登録されています。ログインしてください。",
          code: "ALREADY_REGISTERED",
        },
        { status: 409 },
      );
    }

    try {
      const result = await issueAndSendVerificationEmail({
        id: existingUser.id,
        email: existingUser.email,
        nickname: existingUser.nickname,
      });
      if (!result.ok && result.reason === "rate_limited") {
        return NextResponse.json(
          { error: "再送は60秒に1回までです。少し待ってからお試しください。" },
          { status: 429 },
        );
      }
    } catch (error) {
      console.error("[register-resend-verification]", error);
      return NextResponse.json(
        { error: "メールの送信に失敗しました。しばらくしてからお試しください。" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, message: successMessage, resent: true });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const token = createSecureToken();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: parsed.data.nickname.trim(),
      emailVerificationTokens: {
        create: {
          token,
          expiresAt: tokenExpiresInHours(24),
        },
      },
    },
  });

  try {
    await sendVerificationEmail({
      to: email,
      nickname: user.nickname,
      token,
    });
  } catch (error) {
    console.error("[register-verification-email]", error);
    return NextResponse.json(
      { error: "メールの送信に失敗しました。しばらくしてからお試しください。" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: successMessage,
  });
}
