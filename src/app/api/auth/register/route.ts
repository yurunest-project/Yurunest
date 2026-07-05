import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email-auth";
import { createSecureToken, tokenExpiresInHours } from "@/lib/tokens";
import { registerSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";

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
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "このメールアドレスは既に登録されています" },
      { status: 409 },
    );
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

  await sendVerificationEmail({
    to: email,
    nickname: user.nickname,
    token,
  });

  return NextResponse.json({
    ok: true,
    message: "確認メールを送信しました。メール内のリンクをクリックしてください。",
  });
}
