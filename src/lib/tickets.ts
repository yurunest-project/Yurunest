import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  getSiteUrl,
  getTimeTicketByKind,
  type TicketKindKey,
} from "@/lib/constants";
import { sendTicketPurchaseEmail } from "@/lib/email";
import Stripe from "stripe";

export async function createTicketCheckoutSession(input: {
  userId: string;
  ticketKind: TicketKindKey;
  quantity: number;
  email: string;
  origin: string;
}) {
  const ticket = getTimeTicketByKind(input.ticketKind);
  if (
    !ticket ||
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 40
  ) {
    throw new Error("Invalid ticket quantity");
  }

  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    line_items: [
      {
        quantity: input.quantity,
        price_data: {
          currency: "jpy",
          unit_amount: ticket.priceYen,
          product_data: {
            name: `ゆるネスト ${ticket.label}`,
            description: `${ticket.shortLabel}の通話に利用できます（税込）`,
          },
        },
      },
    ],
    metadata: {
      purpose: "ticket_purchase",
      userId: input.userId,
      ticketKind: ticket.kind,
      quantity: String(input.quantity),
    },
    success_url: `${input.origin}/tickets/buy/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/tickets/buy?canceled=1`,
  });
}

export async function fulfillTicketPurchaseFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.userId;
  const ticketKind = session.metadata?.ticketKind ?? "min15";
  const quantity = Number(session.metadata?.quantity ?? "0");
  const ticket = getTimeTicketByKind(ticketKind);

  if (!userId) {
    throw new Error("Checkout session is missing userId");
  }
  if (!ticket || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Checkout session has invalid quantity");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found for ticket purchase");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? session.id;

  const existing = await prisma.ticket.count({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (existing > 0) {
    return { userId, quantity: existing, paymentIntentId, skipped: true };
  }

  await prisma.ticket.createMany({
    data: Array.from({ length: quantity }, () => ({
      userId,
      status: "unused" as const,
      kind: ticket.kind,
      minutes: ticket.minutes,
      source: "purchase" as const,
      stripePaymentIntentId: paymentIntentId,
    })),
  });
  try {
    await sendTicketPurchaseEmail({
      to: user.email,
      quantity,
      ticketLabel: ticket.label,
      siteUrl: getSiteUrl(),
    });
  } catch (error) {
    console.error("[ticket-purchase-email]", error);
  }

  return { userId, quantity, paymentIntentId, skipped: false };
}

export async function countUnusedTickets(userId: string) {
  return prisma.ticket.count({
    where: { userId, status: "unused" },
  });
}

export async function getUnusedTicketSummary(userId: string) {
  const tickets = await prisma.ticket.findMany({
    where: {
      userId,
      status: "unused",
      OR: [
        { issuedByReservationId: null },
        { issuedByReservation: { status: "accepted" } },
      ],
    },
    select: { kind: true, minutes: true },
  });
  const byKind = Object.fromEntries(
    Array.from(
      tickets.reduce((map, ticket) => {
        map.set(ticket.kind, (map.get(ticket.kind) ?? 0) + 1);
        return map;
      }, new Map<string, number>()),
    ),
  );
  return {
    count: tickets.length,
    totalMinutes: tickets.reduce((sum, ticket) => sum + ticket.minutes, 0),
    byKind,
  };
}
