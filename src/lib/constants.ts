export const HITOMOSHI_URL = "https://hitomoshi-one.vercel.app";

export const BOOKING_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdCbgf1APsrYBaZfIvdm2VBUk9MrK6Ua370wNDPUfclJr2nWA/viewform";

/** プラン名 → 通話時間（分）。予約確定後のルーム作成に使用 */
export const PLAN_DURATION_MINUTES = {
  "15min": 15,
  "30min": 30,
  "1hour": 60,
  "3hour": 180,
  sleep: 300,
} as const;

export type PlanDurationKey = keyof typeof PLAN_DURATION_MINUTES;

/** ルーム有効期限 = 通話時間 + 余裕（分） */
export const ROOM_EXPIRY_BUFFER_MINUTES = 15;

export const BOOKING_PLANS = [
  {
    id: "15min" as const,
    label: "15分",
    price: 500,
    unitPrice: "約33円/分",
    note: "まず試したい方に",
    recommended: false,
    featured: false,
  },
  {
    id: "30min" as const,
    label: "30分",
    price: 900,
    unitPrice: "30円/分",
    note: "お話しするのにちょうどいい時間です",
    recommended: true,
    featured: false,
  },
  {
    id: "1hour" as const,
    label: "1時間",
    price: 1600,
    unitPrice: "約26円/分",
    note: null,
    recommended: false,
    featured: false,
  },
  {
    id: "3hour" as const,
    label: "3時間",
    price: 4500,
    unitPrice: "約25円/分",
    note: null,
    recommended: false,
    featured: false,
  },
  {
    id: "sleep" as const,
    label: "寝落ちパック",
    subtitle: "5時間以上",
    price: 6500,
    unitPrice: "約21円/分",
    note: "長時間のご利用に",
    recommended: false,
    featured: true,
  },
] as const;

export function getPlanById(id: string) {
  return BOOKING_PLANS.find((plan) => plan.id === id);
}

export function getDailyRoomUrl(roomName: string) {
  const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
  if (!domain) {
    throw new Error("NEXT_PUBLIC_DAILY_DOMAIN is not configured");
  }
  return `https://${domain}.daily.co/${roomName}`;
}

export function getPlanLabel(plan: PlanDurationKey) {
  const labels: Record<PlanDurationKey, string> = {
    "15min": "15分プラン",
    "30min": "30分プラン",
    "1hour": "1時間プラン",
    "3hour": "3時間プラン",
    sleep: "寝落ちパック",
  };
  return labels[plan];
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://127.0.0.1:3000"
  );
}
