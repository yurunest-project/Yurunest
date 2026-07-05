import { sendPasswordResetEmail } from "@/lib/email-auth";
import { prisma } from "@/lib/prisma";
import { createSecureToken, tokenExpiresInHours } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "メールアドレスを確認してください" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // ユーザー存在有無を漏らさない
  const okMessage =
    "登録されている場合、パスワード再設定メールを送信しました。";

  if (!user) {
    return NextResponse.json({ ok: true, message: okMessage });
  }

  const token = createSecureToken();

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: tokenExpiresInHours(1),
    },
  });

  await sendPasswordResetEmail({ to: email, token });

  return NextResponse.json({ ok: true, message: okMessage });
}
