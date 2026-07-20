import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  TICKET_UNIT_PRICE_YEN,
  ticketsRequiredForMinutes,
} from "@/types/ticket";
import Stripe from "stripe";

export { TICKET_UNIT_PRICE_YEN, ticketsRequiredForMinutes };

export async function createTicketCheckoutSession(input: {
  userId: string;
  quantity: number;
  email: string;
  origin: string;
}) {
  if (input.quantity < 1 || input.quantity > 40) {
    throw new Error("Invalid ticket quantity");
  }

  const stripe = getStripe();
  const unitAmount =
    Number(process.env.TICKET_UNIT_PRICE_JPY) || TICKET_UNIT_PRICE_YEN;

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    line_items: [
      {
        quantity: input.quantity,
        price_data: {
          currency: "jpy",
          unit_amount: unitAmount,
          product_data: {
            name: "ゆるネスト 15分チケット",
            description: "1枚あたり約15分の通話に利用できます（税込）",
          },
        },
      },
    ],
    metadata: {
      purpose: "ticket_purchase",
      userId: input.userId,
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
  const quantity = Number(session.metadata?.quantity ?? "0");

  if (!userId) {
    throw new Error("Checkout session is missing userId");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
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
      stripePaymentIntentId: paymentIntentId,
    })),
  });

  return { userId, quantity, paymentIntentId, skipped: false };
}

export async function countUnusedTickets(userId: string) {
  return prisma.ticket.count({
    where: { userId, status: "unused" },
  });
}
