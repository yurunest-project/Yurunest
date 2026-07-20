import { auth } from "@/auth";
import { createReservation } from "@/lib/reservations";
import { PLAN_DURATION_MINUTES, type PlanDurationKey } from "@/lib/constants";
import { NextResponse } from "next/server";

type Body = {
  desiredDate?: string;
  durationMinutes?: number;
  plan?: string;
  nickname?: string;
  requestedEmployeeId?: string | null;
};

function resolveDurationMinutes(body: Body): number | null {
  if (typeof body.durationMinutes === "number") {
    return body.durationMinutes;
  }
  if (body.plan && body.plan in PLAN_DURATION_MINUTES) {
    return PLAN_DURATION_MINUTES[body.plan as PlanDurationKey];
  }
  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const desiredDate = body.desiredDate?.trim() ?? "";
  const durationMinutes = resolveDurationMinutes(body);
  const nickname =
    body.nickname?.trim() || session.user.nickname || "ゲスト";

  if (!desiredDate) {
    return NextResponse.json({ error: "希望日を入力してください" }, { status: 400 });
  }
  if (!durationMinutes || durationMinutes < 15) {
    return NextResponse.json({ error: "プランを選択してください" }, { status: 400 });
  }

  try {
    const reservation = await createReservation({
      userId: session.user.id,
      nickname,
      desiredDate,
      durationMinutes,
      requestedEmployeeId: body.requestedEmployeeId || null,
    });

    return NextResponse.json({ id: reservation.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "予約の作成に失敗しました";
    const status = message.includes("不足") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
