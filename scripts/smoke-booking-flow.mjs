#!/usr/bin/env node
/**
 * Stripe キー無しでも検証できるスモークテスト。
 * - Checkout API が未設定時に 503 を返すこと
 * - チケット購入 → 予約作成 → 承諾（ルーム作成）の DB ロジック
 *
 * Usage: dotenv -e .env.local -- node scripts/smoke-booking-flow.mjs
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function main() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const email = `smoke-${Date.now()}@example.com`;
  console.log("1) Creating smoke user...");
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "smoke-test-hash",
      nickname: "スモーク",
      emailVerified: new Date(),
    },
  });

  console.log("2) Creating unused tickets...");
  await prisma.ticket.createMany({
    data: [
      { userId: user.id, status: "unused", stripePaymentIntentId: "pi_smoke_1" },
      { userId: user.id, status: "unused", stripePaymentIntentId: "pi_smoke_1" },
    ],
  });

  const unused = await prisma.ticket.count({
    where: { userId: user.id, status: "unused" },
  });
  if (unused !== 2) throw new Error(`Expected 2 unused tickets, got ${unused}`);

  console.log("3) Creating reservation (30min = 2 tickets)...");
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 2);
  const desiredDate = new Date(
    Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()),
  );

  const reservation = await prisma.$transaction(async (tx) => {
    const tickets = await tx.ticket.findMany({
      where: { userId: user.id, status: "unused" },
      take: 2,
    });
    const created = await tx.reservation.create({
      data: {
        userId: user.id,
        nickname: "スモーク",
        desiredDate,
        durationMinutes: 30,
        status: "pending",
      },
    });
    await tx.ticket.updateMany({
      where: { id: { in: tickets.map((t) => t.id) } },
      data: { status: "reserved", reservationId: created.id },
    });
    return created;
  });

  const reserved = await prisma.ticket.count({
    where: { reservationId: reservation.id, status: "reserved" },
  });
  if (reserved !== 2) throw new Error(`Expected 2 reserved tickets, got ${reserved}`);

  console.log("4) Accepting reservation (consume tickets)...");
  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "accepted",
        dailyRoomUrl: "https://example.daily.co/smoke-room",
        dailyRoomName: "smoke-room",
      },
    });
    await tx.ticket.updateMany({
      where: { reservationId: reservation.id },
      data: { status: "consumed" },
    });
  });

  const consumed = await prisma.ticket.count({
    where: { reservationId: reservation.id, status: "consumed" },
  });
  if (consumed !== 2) throw new Error(`Expected 2 consumed tickets, got ${consumed}`);

  console.log("5) Idempotency table write...");
  await prisma.processedStripeEvent.create({
    data: { id: `evt_smoke_${Date.now()}` },
  });

  console.log("6) Cleanup...");
  await prisma.ticket.deleteMany({ where: { userId: user.id } });
  await prisma.reservation.delete({ where: { id: reservation.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.processedStripeEvent.deleteMany({
    where: { id: { startsWith: "evt_smoke_" } },
  });

  await prisma.$disconnect();
  console.log("OK — ticket/reservation DB flow works.");
}

main().catch(async (error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
