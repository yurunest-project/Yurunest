import { fulfillBookingFromCheckoutSession } from "@/lib/booking";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, skipped: "unpaid" });
    }

    try {
      const result = await fulfillBookingFromCheckoutSession(session);
      return NextResponse.json({ received: true, result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fulfill booking";
      console.error("[stripe-webhook]", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
