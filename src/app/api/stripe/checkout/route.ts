import { createCheckoutSession } from "@/lib/booking";
import { getPlanById, type PlanDurationKey } from "@/lib/constants";
import { NextResponse } from "next/server";

type CheckoutBody = {
  plan?: string;
  nickname?: string;
  email?: string;
};

function isPlanDurationKey(value: string): value is PlanDurationKey {
  return Boolean(getPlanById(value));
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
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

  const plan = body.plan ?? "";
  const nickname = body.nickname?.trim() ?? "";
  const email = body.email?.trim() ?? "";

  if (!isPlanDurationKey(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!nickname) {
    return NextResponse.json({ error: "Nickname is required" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://127.0.0.1:3000";

  try {
    const session = await createCheckoutSession({
      plan,
      nickname,
      email,
      origin,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
