import { getAppUrl } from "@/lib/app-url";
import { Resend } from "resend";

async function sendAuthEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const from = process.env.BOOKING_EMAIL_FROM;

  if (!process.env.RESEND_API_KEY || !from) {
    console.info("[auth-email:dev-fallback]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function sendVerificationEmail(input: {
  to: string;
  nickname: string;
  token: string;
}) {
  const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(input.token)}`;
  const subject = "【ゆるネスト】メールアドレスの確認";

  const text = [
    `${input.nickname} さん`,
    "",
    "ゆるネストへのご登録ありがとうございます。",
    "以下のリンクをクリックして、メールアドレスの確認を完了してください。",
    "",
    verifyUrl,
    "",
    "リンクの有効期限は24時間です。",
    "心当たりがない場合はこのメールを破棄してください。",
  ].join("\n");

  const html = `
    <p>${input.nickname} さん</p>
    <p>ゆるネストへのご登録ありがとうございます。</p>
    <p><a href="${verifyUrl}">メールアドレスを確認する</a></p>
    <p style="color:#666;font-size:14px;">リンクの有効期限は24時間です。</p>
  `;

  await sendAuthEmail({ to: input.to, subject, text, html });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  token: string;
}) {
  const resetUrl = `${getAppUrl()}/reset-password?token=${encodeURIComponent(input.token)}`;
  const subject = "【ゆるネスト】パスワード再設定";

  const text = [
    "パスワード再設定のリクエストを受け付けました。",
    "",
    "以下のリンクから新しいパスワードを設定してください。",
    "",
    resetUrl,
    "",
    "リンクの有効期限は1時間です。",
    "心当たりがない場合はこのメールを破棄してください。",
  ].join("\n");

  const html = `
    <p>パスワード再設定のリクエストを受け付けました。</p>
    <p><a href="${resetUrl}">パスワードを再設定する</a></p>
    <p style="color:#666;font-size:14px;">リンクの有効期限は1時間です。</p>
  `;

  await sendAuthEmail({ to: input.to, subject, text, html });
}
