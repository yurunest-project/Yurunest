#!/usr/bin/env node
/**
 * Resend 送信設定を確認します（APIキーの値は表示しません）。
 * Usage: npm run email:probe
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resend } from "resend";

const envPath = resolve(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq);
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = value;
}

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.BOOKING_EMAIL_FROM;

if (!apiKey || !from) {
  console.error("RESEND_API_KEY または BOOKING_EMAIL_FROM が未設定です。");
  process.exit(1);
}

console.log("BOOKING_EMAIL_FROM:", from);
console.log("RESEND_API_KEY: set");

const resend = new Resend(apiKey);
const to = process.env.DEV_EMAIL_PROBE_TO ?? "delivered@resend.dev";

const result = await resend.emails.send({
  from,
  to,
  subject: "Yurunest email probe",
  text: "If you receive this, Resend delivery works.",
});

if (result.error) {
  console.error("\nResend error:", result.error.message);
  if (result.error.name) console.error("Name:", result.error.name);
  process.exit(1);
}

console.log("\nResend accepted the message. id:", result.data?.id);
console.log(
  "届かない場合: Resend ダッシュボード → Domains で yurunest.com の認証を確認してください。",
);
