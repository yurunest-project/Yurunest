import { fulfillBookingFromCheckoutSession } from "@/lib/booking";
import { fulfillTicketPurchaseFromCheckoutSession } from "@/lib/tickets";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const already = await prisma.processedStripeEvent.findUnique({
    where: { id: event.id },
  });
  if (already) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      await prisma.processedStripeEvent.create({
        data: { id: event.id },
      });
      return NextResponse.json({ received: true, skipped: "unpaid" });
    }

    try {
      const purpose = session.metadata?.purpose ?? "booking";
      let result: unknown;

      if (purpose === "ticket_purchase") {
        result = await fulfillTicketPurchaseFromCheckoutSession(session);
      } else {
        result = await fulfillBookingFromCheckoutSession(session);
      }

      await prisma.processedStripeEvent.create({
        data: { id: event.id },
      });

      return NextResponse.json({ received: true, purpose, result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fulfill checkout";
      console.error("[stripe-webhook]", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  await prisma.processedStripeEvent.create({
    data: { id: event.id },
  });

  return NextResponse.json({ received: true });
}
