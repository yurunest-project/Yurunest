import { auth } from "@/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSecureToken, tokenExpiresInHours } from "@/lib/tokens";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { name?: string; email?: string; birthDate?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!name || !email.includes("@")) {
    return NextResponse.json({ error: "名前と有効なメールアドレスを入力してください" }, { status: 400 });
  }
  const birthDate = body.birthDate ? new Date(`${body.birthDate}T00:00:00.000Z`) : null;
  if (birthDate && Number.isNaN(birthDate.getTime())) {
    return NextResponse.json({ error: "生年月日が正しくありません" }, { status: 400 });
  }
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "このメールアドレスは利用者または管理者として登録されています" },
      { status: 409 },
    );
  }
  try {
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        birthDate,
        passwordHash: body.password ? await hashPassword(body.password) : null,
      },
    });
    const token = createSecureToken();
    await prisma.employeeInviteToken.create({
      data: {
        employeeId: employee.id,
        token,
        expiresAt: tokenExpiresInHours(72),
      },
    });
    return NextResponse.json({ employee, inviteToken: token }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { employeeId?: string; isActive?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.employeeId || typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid employee update" }, { status: 400 });
  }
  await prisma.employee.update({
    where: { id: body.employeeId },
    data: { isActive: body.isActive },
  });
  return NextResponse.json({ ok: true });
}
