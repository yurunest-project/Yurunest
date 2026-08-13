import { auth } from "@/auth";
import { createTicketCheckoutSession } from "@/lib/tickets";
import { getTimeTicketByKind, type TicketKindKey } from "@/lib/constants";
import { NextResponse } from "next/server";

type CheckoutBody = {
  quantity?: number;
  ticketKind?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ticketKind = body.ticketKind?.trim() as TicketKindKey | undefined;
  const ticket = ticketKind ? getTimeTicketByKind(ticketKind) : undefined;
  const quantity = Number(body.quantity ?? 1);
  if (
    !ticket ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 40
  ) {
    return NextResponse.json({ error: "Invalid ticket" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://127.0.0.1:3000";

  try {
    const checkout = await createTicketCheckoutSession({
      userId: session.user.id,
      quantity,
      ticketKind: ticket.kind,
      email: session.user.email,
      origin,
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
