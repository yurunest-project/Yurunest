import { auth } from "@/auth";
import { getAvailableStartTimes } from "@/lib/availability";
import { PLAN_DURATION_MINUTES, type PlanDurationKey } from "@/lib/constants";
import { parseJstDateTime } from "@/lib/datetime";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date")?.trim() ?? "";
  const plan = searchParams.get("plan") as PlanDurationKey | null;
  const employeeId = searchParams.get("employeeId")?.trim() || undefined;

  if (!date || !plan || !(plan in PLAN_DURATION_MINUTES)) {
    return NextResponse.json({ error: "Invalid availability request" }, { status: 400 });
  }

  try {
    const startAt = parseJstDateTime(date, "00:00");
    const endAt = new Date(startAt.getTime() + 24 * 60 * 60 * 1000);
    const options = await getAvailableStartTimes({
      startAt,
      endAt,
      durationMinutes: PLAN_DURATION_MINUTES[plan],
      employeeId,
    });
    return NextResponse.json({ options });
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
}
