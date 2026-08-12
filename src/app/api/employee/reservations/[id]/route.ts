import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { acceptReservation, declineReservation } from "@/lib/reservations";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE" || !session.user.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const reservation = await prisma.reservation.findFirst({
    where: { id, requestedEmployeeId: session.user.employeeId },
    select: { id: true },
  });
  if (!reservation) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { action?: "accept" | "decline" };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "accept") {
      const result = await acceptReservation({
        reservationId: id,
        assignedEmployeeId: session.user.employeeId,
      });
      return NextResponse.json(result);
    }
    if (body.action === "decline") {
      const result = await declineReservation({
        reservationId: id,
        employeeId: session.user.employeeId,
      });
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
