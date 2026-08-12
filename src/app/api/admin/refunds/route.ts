import { auth } from "@/auth";
import { releaseAvailabilitySlots } from "@/lib/availability";
import { getSiteUrl } from "@/lib/constants";
import { sendRefundCompletedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { collectTicketDescendantIds } from "@/lib/ticket-allocation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { paymentIntentId?: string; reason?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const reason = body.reason?.trim() ?? "";
  if (!body.paymentIntentId || !reason) {
    return NextResponse.json(
      { error: "決済IDと返金理由が必要です" },
      { status: 400 },
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { stripePaymentIntentId: body.paymentIntentId },
    include: { user: { select: { email: true } } },
  });
  if (tickets.length === 0 || tickets.every((ticket) => ticket.status === "refunded")) {
    return NextResponse.json({ error: "返金可能なチケットがありません" }, { status: 400 });
  }

  try {
    const refund = await getStripe().refunds.create(
      {
        payment_intent: body.paymentIntentId,
        reason: "requested_by_customer",
        metadata: { yurunestReason: reason.slice(0, 500) },
      },
      { idempotencyKey: `yurunest-refund-${body.paymentIntentId}` },
    );
    await prisma.$transaction(async (tx) => {
      const rootIds = tickets.map((ticket) => ticket.id);
      const allIds = await collectTicketDescendantIds(tx, rootIds);
      const descendantIds = allIds.filter((id) => !rootIds.includes(id));
      const affectedTickets = await tx.ticket.findMany({
        where: { id: { in: allIds } },
        select: { reservationId: true, issuedByReservationId: true },
      });
      const reservationIds = [
        ...new Set(
          affectedTickets
            .flatMap((ticket) => [
              ticket.reservationId,
              ticket.issuedByReservationId,
            ])
            .filter(Boolean),
        ),
      ] as string[];

      await tx.ticket.updateMany({
        where: { id: { in: rootIds } },
        data: { status: "refunded" },
      });
      if (descendantIds.length > 0) {
        await tx.ticket.updateMany({
          where: { id: { in: descendantIds } },
          data: { status: "voided" },
        });
      }
      if (reservationIds.length > 0) {
        await tx.reservation.updateMany({
          where: { id: { in: reservationIds }, status: { in: ["pending", "accepted"] } },
          data: { status: "cancelled" },
        });
        await Promise.all(
          reservationIds.map((reservationId) =>
            releaseAvailabilitySlots(tx, reservationId),
          ),
        );
      }
      await tx.refundHistory.create({
        data: {
          userId: tickets[0].userId,
          stripePaymentIntentId: body.paymentIntentId!,
          stripeRefundId: refund.id,
          reason,
          amount: refund.amount ?? null,
        },
      });
    });
    try {
      await sendRefundCompletedEmail({
        to: tickets[0].user.email,
        reason,
        siteUrl: getSiteUrl(),
      });
    } catch (error) {
      console.error("[refund-email]", error);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "返金処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
