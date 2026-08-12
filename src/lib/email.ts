import { Resend } from "resend";

type BookingEmailInput = {
  to: string;
  nickname: string;
  planLabel: string;
  callUrl: string;
  siteUrl: string;
};

async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const from = process.env.BOOKING_EMAIL_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    console.info("[email:dev-fallback]", input);
    return { id: "dev-fallback", mode: "log" as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html ?? `<p>${input.text.replace(/\n/g, "<br />")}</p>`,
  });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data?.id ?? "sent", mode: "resend" as const };
}

function buildBookingEmail({
  nickname,
  planLabel,
  callUrl,
  siteUrl,
}: Omit<BookingEmailInput, "to">) {
  const subject = "【ゆるネスト】ご予約確定・通話URLのご案内";

  const text = [
    `${nickname} さん`,
    "",
    "ゆるネストをご予約いただきありがとうございます。",
    "お支払いが完了し、ご予約が確定しました。",
    "",
    `プラン：${planLabel}`,
    "",
    "▼ 通話ルームURL（予約時間になったらこちらから入室してください）",
    callUrl,
    "",
    "※ このURLはメールでもう一度ご確認ください。",
    "※ ブラウザ（Chrome / Safari 等）からそのまま通話できます。",
    "",
    `予約内容の確認：${siteUrl}/reservations`,
    "",
    "ご不明点は hitomoshi.official@gmail.com までご連絡ください。",
    "",
    "ゆるネスト",
    "運営：ひともし",
  ].join("\n");

  const html = `
    <p>${nickname} さん</p>
    <p>ゆるネストをご予約いただきありがとうございます。<br />お支払いが完了し、ご予約が確定しました。</p>
    <p><strong>プラン：</strong>${planLabel}</p>
    <p><strong>通話ルームURL</strong><br />
      <a href="${callUrl}">${callUrl}</a>
    </p>
    <p>予約時間になったら、上記URLからブラウザで入室してください。</p>
    <p style="color:#666;font-size:14px;">運営：ひともし</p>
  `;

  return { subject, text, html };
}

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const { subject, text, html } = buildBookingEmail(input);
  return sendEmail({ to: input.to, subject, text, html });
}

export async function sendReservationStatusEmail(input: {
  to: string;
  nickname: string;
  status: "created" | "declined" | "cancelled";
  siteUrl: string;
}) {
  const messages = {
    created: "ご予約を受け付けました。スタッフの承諾をお待ちください。",
    declined: "ご予約はお受けできませんでした。チケットは返還されています。",
    cancelled: "ご予約をキャンセルしました。チケットは返還されています。",
  };
  const text = [
    `${input.nickname} さん`,
    "",
    messages[input.status],
    "",
    `予約一覧：${input.siteUrl}/reservations`,
    "",
    "ゆるネスト",
  ].join("\n");
  return sendEmail({
    to: input.to,
    subject: `【ゆるネスト】${messages[input.status]}`,
    text,
  });
}

export async function sendTicketPurchaseEmail(input: {
  to: string;
  quantity: number;
  ticketLabel: string;
  siteUrl: string;
}) {
  return sendEmail({
    to: input.to,
    subject: "【ゆるネスト】チケット購入完了のお知らせ",
    text: [
      "チケットの購入が完了しました。",
      `購入内容：${input.ticketLabel} × ${input.quantity}枚`,
      "",
      `予約する：${input.siteUrl}/reservations/new`,
      "",
      "ゆるネスト",
    ].join("\n"),
  });
}

export async function sendRefundCompletedEmail(input: {
  to: string;
  reason: string;
  siteUrl: string;
}) {
  return sendEmail({
    to: input.to,
    subject: "【ゆるネスト】返金完了のお知らせ",
    text: [
      "ご購入代金の全額返金処理が完了しました。",
      `理由：${input.reason}`,
      "",
      "カード会社への反映には数日かかる場合があります。",
      `予約一覧：${input.siteUrl}/reservations`,
      "",
      "ゆるネスト",
    ].join("\n"),
  });
}

export async function sendAdminReservationNotification(input: {
  reservationId: string;
  siteUrl: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) return null;
  return sendEmail({
    to: adminEmail,
    subject: "【ゆるネスト】新しい予約を受け付けました",
    text: [
      "新しい予約を受け付けました。",
      `${input.siteUrl}/admin/reservations`,
      `予約ID: ${input.reservationId}`,
    ].join("\n"),
  });
}
