import { auth } from "@/auth";
import {
  acceptReservation,
  declineReservation,
} from "@/lib/reservations";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

type Body = {
  action?: "accept" | "decline";
  assignedEmployeeId?: string | null;
  employeeId?: string | null;
};

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "accept") {
      const result = await acceptReservation({
        reservationId: id,
        assignedEmployeeId: body.assignedEmployeeId,
      });
      return NextResponse.json(result);
    }

    if (body.action === "decline") {
      const result = await declineReservation({
        reservationId: id,
        employeeId: body.employeeId,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "処理に失敗しました";
    console.error("[admin-reservation]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
