/** 15分 = 1枚。予約時間から必要枚数を計算 */
export const TICKET_DURATION_MINUTES = 15;
export const TICKET_UNIT_PRICE_YEN = 500;

export function ticketsRequiredForMinutes(minutes: number) {
  return Math.ceil(minutes / TICKET_DURATION_MINUTES);
}

export type TicketLedgerReason = "purchase" | "reservation" | "refund" | "admin";

export type ReservationStatus = "confirmed" | "completed" | "cancelled";
