import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.token || !body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "招待トークンと8文字以上のパスワードを入力してください" },
      { status: 400 },
    );
  }
  const invite = await prisma.employeeInviteToken.findUnique({
    where: { token: body.token },
  });
  if (!invite || invite.usedAt || invite.expiresAt <= new Date()) {
    return NextResponse.json({ error: "招待リンクが無効または期限切れです" }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.employee.update({
      where: { id: invite.employeeId },
      data: { passwordHash: await hashPassword(body.password) },
    }),
    prisma.employeeInviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
