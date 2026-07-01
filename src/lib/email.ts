import { Resend } from "resend";

type BookingEmailInput = {
  to: string;
  nickname: string;
  planLabel: string;
  callUrl: string;
  siteUrl: string;
};

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
    `予約内容の確認：${siteUrl}/book/success`,
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
  const from = process.env.BOOKING_EMAIL_FROM;

  if (!process.env.RESEND_API_KEY || !from) {
    console.info("[booking-email:dev-fallback]", { to: input.to, subject, text });
    return { id: "dev-fallback", mode: "log" as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject,
    text,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { id: result.data?.id ?? "sent", mode: "resend" as const };
}
