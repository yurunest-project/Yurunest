import { AvailabilitySlotStatus, Prisma } from "@prisma/client";
import {
  isMinorAt,
  isMinorRestrictedHour,
  isSlotAligned,
  parseJstDateTime,
  SLOT_DURATION_MINUTES,
} from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

const SLOT_DURATION_MS = SLOT_DURATION_MINUTES * 60 * 1000;

type DbClient = Prisma.TransactionClient | typeof prisma;

export type AvailabilityOption = {
  employeeId: string;
  employeeName: string;
  startAt: string;
};

export async function createAvailabilitySlots(input: {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const startAt = parseJstDateTime(input.date, input.startTime);
  const endAt = parseJstDateTime(input.date, input.endTime);

  if (
    !isSlotAligned(startAt) ||
    !isSlotAligned(endAt) ||
    startAt >= endAt ||
    startAt <= new Date()
  ) {
    throw new Error("開始・終了時刻は未来の15分単位で入力してください");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: input.employeeId },
    select: { id: true, birthDate: true, isActive: true },
  });
  if (!employee?.isActive) {
    throw new Error("有効なスタッフを選択してください");
  }

  const isMinor = employee.birthDate ? isMinorAt(employee.birthDate) : false;
  const slots = [];
  let restricted = 0;
  for (
    let slotStart = startAt;
    slotStart < endAt;
    slotStart = new Date(slotStart.getTime() + SLOT_DURATION_MS)
  ) {
    if (isMinor && isMinorRestrictedHour(slotStart)) {
      restricted += 1;
      continue;
    }
    slots.push({
      employeeId: employee.id,
      startAt: slotStart,
      status: AvailabilitySlotStatus.open,
    });
  }

  const result = await prisma.employeeAvailabilitySlot.createMany({
    data: slots,
    skipDuplicates: true,
  });

  return {
    created: result.count,
    skipped: slots.length - result.count + restricted,
    restricted,
  };
}

export async function listAvailabilitySlots(input: {
  employeeId?: string;
  startAt: Date;
  endAt: Date;
}) {
  return prisma.employeeAvailabilitySlot.findMany({
    where: {
      employeeId: input.employeeId,
      startAt: { gte: input.startAt, lt: input.endAt },
    },
    include: { employee: { select: { name: true } } },
    orderBy: { startAt: "asc" },
  });
}

export async function getAvailableStartTimes(input: {
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  employeeId?: string;
}) {
  const requiredSlots = Math.ceil(input.durationMinutes / SLOT_DURATION_MINUTES);
  if (!Number.isInteger(requiredSlots) || requiredSlots < 1) {
    throw new Error("Invalid duration");
  }

  const slots = await prisma.employeeAvailabilitySlot.findMany({
    where: {
      employeeId: input.employeeId,
      startAt: { gte: input.startAt, lt: input.endAt },
      status: AvailabilitySlotStatus.open,
    },
    include: { employee: { select: { name: true } } },
    orderBy: { startAt: "asc" },
  });

  const byEmployee = new Map<
    string,
    Map<number, (typeof slots)[number]>
  >();
  for (const slot of slots) {
    const employeeSlots = byEmployee.get(slot.employeeId) ?? new Map();
    employeeSlots.set(slot.startAt.getTime(), slot);
    byEmployee.set(slot.employeeId, employeeSlots);
  }

  const available: AvailabilityOption[] = [];
  for (const employeeSlots of byEmployee.values()) {
    for (const slot of employeeSlots.values()) {
      if (slot.startAt <= new Date()) continue;
      const isContinuous = Array.from({ length: requiredSlots }).every(
        (_, index) =>
          employeeSlots.has(slot.startAt.getTime() + index * SLOT_DURATION_MS),
      );
      if (isContinuous) {
        available.push({
          employeeId: slot.employeeId,
          employeeName: slot.employee.name,
          startAt: slot.startAt.toISOString(),
        });
      }
    }
  }

  return available;
}

export async function reserveAvailabilitySlots(
  tx: DbClient,
  input: {
    employeeId: string;
    startAt: Date;
    durationMinutes: number;
    reservationId: string;
  },
) {
  if (!isSlotAligned(input.startAt)) {
    throw new Error("予約時刻は15分単位で指定してください");
  }

  const requiredSlots = Math.ceil(
    input.durationMinutes / SLOT_DURATION_MINUTES,
  );
  const expectedStarts = Array.from(
    { length: requiredSlots },
    (_, index) => new Date(input.startAt.getTime() + index * SLOT_DURATION_MS),
  );

  const slots = await tx.employeeAvailabilitySlot.findMany({
    where: {
      employeeId: input.employeeId,
      startAt: { in: expectedStarts },
      status: AvailabilitySlotStatus.open,
    },
    select: { id: true },
  });
  if (slots.length !== requiredSlots) {
    throw new Error("選択した時間は既に埋まっています。別の時間をお選びください。");
  }

  const updated = await tx.employeeAvailabilitySlot.updateMany({
    where: {
      id: { in: slots.map((slot) => slot.id) },
      status: AvailabilitySlotStatus.open,
    },
    data: {
      status: AvailabilitySlotStatus.reserved,
      reservationId: input.reservationId,
    },
  });
  if (updated.count !== requiredSlots) {
    throw new Error("選択した時間は既に埋まっています。別の時間をお選びください。");
  }
}

export async function releaseAvailabilitySlots(
  tx: DbClient,
  reservationId: string,
) {
  return tx.employeeAvailabilitySlot.updateMany({
    where: { reservationId, status: AvailabilitySlotStatus.reserved },
    data: {
      status: AvailabilitySlotStatus.open,
      reservationId: null,
    },
  });
}
