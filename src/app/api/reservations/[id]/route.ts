import { auth } from "@/auth";
import { cancelReservation } from "@/lib/reservations";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await cancelReservation({
      reservationId: id,
      userId: session.user.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "キャンセルに失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
