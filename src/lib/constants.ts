import { getAppUrl } from "@/lib/app-url";

/** 運営母体「ひともし」のサイト。ゆるネスト本番ドメインとは別。 */
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
export type TicketKindKey = "min15" | "min30" | "hour1" | "hour3" | "sleep5";

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
    label: "5時間",
    subtitle: "寝落ちパック",
    price: 6500,
    unitPrice: "約21円/分",
    note: "長時間のご利用に",
    recommended: false,
    featured: true,
  },
] as const;

const PLAN_TICKET_KIND: Record<PlanDurationKey, TicketKindKey> = {
  "15min": "min15",
  "30min": "min30",
  "1hour": "hour1",
  "3hour": "hour3",
  sleep: "sleep5",
};

export const TIME_TICKETS = BOOKING_PLANS.map((plan) => ({
  kind: PLAN_TICKET_KIND[plan.id],
  planId: plan.id,
  label: `${plan.label}チケット`,
  shortLabel: plan.label,
  subtitle: "subtitle" in plan ? plan.subtitle : undefined,
  minutes: PLAN_DURATION_MINUTES[plan.id],
  priceYen: plan.price,
})) as unknown as readonly {
  kind: TicketKindKey;
  planId: PlanDurationKey;
  label: string;
  shortLabel: string;
  subtitle?: string;
  minutes: number;
  priceYen: number;
}[];

export function getPlanById(id: string) {
  return BOOKING_PLANS.find((plan) => plan.id === id);
}

export function getTimeTicketByKind(kind: string) {
  return TIME_TICKETS.find((ticket) => ticket.kind === kind);
}

export function getTicketKindForMinutes(minutes: number) {
  return TIME_TICKETS.find((ticket) => ticket.minutes === minutes)?.kind;
}

export function getTimeTicketLabel(kind: string) {
  return getTimeTicketByKind(kind)?.label ?? kind;
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
  return getAppUrl();
}
