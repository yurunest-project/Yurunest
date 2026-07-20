import { createDailyRoomForPlan } from "@/lib/daily";
import {
  getPlanById,
  getPlanLabel,
  getSiteUrl,
  type PlanDurationKey,
} from "@/lib/constants";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

function isPlanDurationKey(value: string): value is PlanDurationKey {
  return Boolean(getPlanById(value));
}

export async function fulfillBookingFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  const plan = session.metadata?.plan;
  const nickname = session.metadata?.nickname?.trim() || "ゲスト";
  const customerEmail =
    session.customer_email ?? session.customer_details?.email ?? null;

  if (!plan || !isPlanDurationKey(plan)) {
    throw new Error("Checkout session is missing a valid plan");
  }

  if (!customerEmail) {
    throw new Error("Checkout session is missing customer email");
  }

  const room = await createDailyRoomForPlan(plan);
  const siteUrl = getSiteUrl();

  await sendBookingConfirmationEmail({
    to: customerEmail,
    nickname,
    planLabel: getPlanLabel(plan),
    callUrl: room.callUrl,
    siteUrl,
  });

  return {
    plan,
    nickname,
    customerEmail,
    callUrl: room.callUrl,
    callPath: room.callPath,
    roomName: room.name,
  };
}

export async function createCheckoutSession(input: {
  plan: PlanDurationKey;
  nickname: string;
  email: string;
  origin: string;
}) {
  const planInfo = getPlanById(input.plan);
  if (!planInfo) {
    throw new Error("Invalid plan");
  }

  const stripe = getStripe();
  const nickname = input.nickname.trim() || "ゲスト";

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "jpy",
          unit_amount: planInfo.price,
          product_data: {
            name: `ゆるネスト ${planInfo.label}${"subtitle" in planInfo && planInfo.subtitle ? `（${planInfo.subtitle}）` : ""}`,
            description: "ブラウザ完結の1対1通話サービス（税込）",
          },
        },
      },
    ],
    metadata: {
      purpose: "booking",
      plan: input.plan,
      nickname,
    },
    success_url: `${input.origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/book?canceled=1`,
  });
}
