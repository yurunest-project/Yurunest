import { auth } from "@/auth";
import {
  getTimeTicketByKind,
  type TicketKindKey,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { email?: string; ticketKind?: string; quantity?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const ticket = body.ticketKind
    ? getTimeTicketByKind(body.ticketKind)
    : undefined;
  const quantity = Number(body.quantity ?? 1);
  if (
    !email ||
    !ticket ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 40
  ) {
    return NextResponse.json(
      { error: "メールアドレス・チケット・枚数を確認してください" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "ユーザーが見つかりません" },
      { status: 404 },
    );
  }

  await prisma.ticket.createMany({
    data: Array.from({ length: quantity }, () => ({
      userId: user.id,
      kind: ticket.kind as TicketKindKey,
      minutes: ticket.minutes,
      source: "admin" as const,
      status: "unused" as const,
    })),
  });
  return NextResponse.json({ ok: true, created: quantity });
}
