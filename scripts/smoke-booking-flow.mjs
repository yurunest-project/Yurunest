#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import {
  allocateTicketsForReservation,
  revertTicketAllocation,
} from "../src/lib/ticket-allocation.ts";
import {
  releaseAvailabilitySlots,
  reserveAvailabilitySlots,
} from "../src/lib/availability.ts";

const prisma = new PrismaClient();

async function main() {
  const stamp = Date.now();
  const employee = await prisma.employee.create({
    data: {
      name: "スモークスタッフ",
      email: `employee-${stamp}@example.com`,
    },
  });
  const user = await prisma.user.create({
    data: {
      email: `smoke-${stamp}@example.com`,
      passwordHash: "smoke-test-hash",
      nickname: "スモーク",
      emailVerified: new Date(),
    },
  });

  console.log("1) Creating a 1-hour ticket...");
  const original = await prisma.ticket.create({
    data: {
      userId: user.id,
      kind: "hour1",
      minutes: 60,
      source: "purchase",
      stripePaymentIntentId: `pi_smoke_${stamp}`,
    },
  });

  const startAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  startAt.setUTCMinutes(Math.ceil(startAt.getUTCMinutes() / 15) * 15, 0, 0);
  const desiredDate = new Date(
    Date.UTC(
      startAt.getUTCFullYear(),
      startAt.getUTCMonth(),
      startAt.getUTCDate(),
    ),
  );
  await prisma.employeeAvailabilitySlot.createMany({
    data: [0, 15].map((minutes) => ({
      employeeId: employee.id,
      startAt: new Date(startAt.getTime() + minutes * 60 * 1000),
    })),
  });

  console.log("2) Reserving 30 minutes and returning the remainder...");
  const reservation = await prisma.$transaction(async (tx) => {
    const created = await tx.reservation.create({
      data: {
        userId: user.id,
        nickname: "スモーク",
        desiredDate,
        startAt,
        durationMinutes: 30,
        requestedEmployeeId: employee.id,
      },
    });
    await reserveAvailabilitySlots(tx, {
      employeeId: employee.id,
      startAt,
      durationMinutes: 30,
      reservationId: created.id,
    });
    await allocateTicketsForReservation(tx, {
      userId: user.id,
      reservationId: created.id,
      requiredMinutes: 30,
    });
    return created;
  });

  const reservedOriginal = await prisma.ticket.findUniqueOrThrow({
    where: { id: original.id },
  });
  if (reservedOriginal.status !== "reserved") {
    throw new Error(`Expected original reserved, got ${reservedOriginal.status}`);
  }
  const change = await prisma.ticket.findFirstOrThrow({
    where: { issuedByReservationId: reservation.id },
  });
  if (change.kind !== "min30" || change.status !== "unused") {
    throw new Error("Expected an unused 30-minute change ticket");
  }

  console.log("3) Cancelling and voiding the returned ticket...");
  await prisma.$transaction(async (tx) => {
    await revertTicketAllocation(tx, reservation.id);
    await releaseAvailabilitySlots(tx, reservation.id);
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "cancelled" },
    });
  });
  const [restoredOriginal, voidedChange] = await Promise.all([
    prisma.ticket.findUniqueOrThrow({ where: { id: original.id } }),
    prisma.ticket.findUniqueOrThrow({ where: { id: change.id } }),
  ]);
  if (restoredOriginal.status !== "unused" || voidedChange.status !== "voided") {
    throw new Error("Cancellation did not restore/void ticket states");
  }

  console.log("4) Cleanup...");
  await prisma.ticketChangeLog.deleteMany({
    where: { reservationId: reservation.id },
  });
  await prisma.ticket.deleteMany({ where: { userId: user.id } });
  await prisma.reservation.delete({ where: { id: reservation.id } });
  await prisma.employee.delete({ where: { id: employee.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.$disconnect();
  console.log("OK — time-ticket reservation and change flow works.");
}

main().catch(async (error) => {
  console.error("FAIL:", error);
  await prisma.$disconnect();
  process.exit(1);
});
