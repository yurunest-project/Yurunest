#!/usr/bin/env node
/**
 * 決済・予約フローに必要な環境変数の有無を確認します（値は表示しません）。
 * Usage: npm run env:check
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");

if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy from .env.example and fill in values.");
  process.exit(1);
}

const raw = readFileSync(envPath, "utf8");
const vars = new Map();
for (const line of raw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq);
  const value = trimmed.slice(eq + 1).trim();
  vars.set(key, value);
}

const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const recommended = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "BOOKING_EMAIL_FROM",
  "DAILY_API_KEY",
  "NEXT_PUBLIC_DAILY_DOMAIN",
];

let missingRequired = 0;

console.log("Required:");
for (const key of required) {
  const value = vars.get(key) ?? "";
  const ok = value.length > 0;
  if (!ok) missingRequired += 1;
  console.log(`  ${ok ? "OK" : "MISSING"}  ${key}`);
}

console.log("\nRecommended (for full booking flow):");
for (const key of recommended) {
  const value = vars.get(key) ?? "";
  const ok = value.length > 0;
  console.log(`  ${ok ? "OK" : "—"}  ${key}`);
}

if (missingRequired > 0) {
  console.log(
    `\n${missingRequired} required variable(s) missing.\n` +
      "Fill STRIPE_SECRET_KEY from Stripe Dashboard → Developers → API keys.\n" +
      "Fill STRIPE_WEBHOOK_SECRET via: npm run stripe:listen",
  );
  process.exit(1);
}

console.log(
  "\nAll required vars are set. Start webhook forwarding with: npm run stripe:listen",
);
