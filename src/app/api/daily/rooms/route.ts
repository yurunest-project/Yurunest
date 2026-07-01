import { createDailyRoomForPlan } from "@/lib/daily";
import { type PlanDurationKey, PLAN_DURATION_MINUTES } from "@/lib/constants";
import { NextResponse } from "next/server";

type CreateRoomBody = {
  plan?: PlanDurationKey;
  durationMinutes?: number;
  roomName?: string;
};

function isPlanDurationKey(value: string): value is PlanDurationKey {
  return value in PLAN_DURATION_MINUTES;
}

export async function POST(request: Request) {
  const adminSecret = process.env.DAILY_ROOM_ADMIN_SECRET;
  if (adminSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.DAILY_API_KEY) {
    return NextResponse.json(
      { error: "DAILY_API_KEY is not configured" },
      { status: 503 },
    );
  }

  let body: CreateRoomBody;
  try {
    body = (await request.json()) as CreateRoomBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.plan && isPlanDurationKey(body.plan)) {
      const room = await createDailyRoomForPlan(body.plan);
      return NextResponse.json(room);
    }

    if (typeof body.durationMinutes === "number" && body.durationMinutes > 0) {
      const { createDailyRoom } = await import("@/lib/daily");
      const room = await createDailyRoom({
        durationMinutes: body.durationMinutes,
        roomName: body.roomName,
      });
      return NextResponse.json({
        ...room,
        callPath: `/call/${room.name}`,
        durationMinutes: body.durationMinutes,
      });
    }

    return NextResponse.json(
      {
        error: "Provide `plan` (15min|30min|1hour|3hour|sleep) or `durationMinutes`",
      },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
