import { createDailyRoom } from "@/lib/daily";
import {
  sendAdminReservationNotification,
  sendBookingConfirmationEmail,
  sendReservationStatusEmail,
} from "@/lib/email";
import { getSiteUrl } from "@/lib/constants";
import {
  releaseAvailabilitySlots,
  reserveAvailabilitySlots,
} from "@/lib/availability";
import {
  isSlotAligned,
  parseJstDateTime,
  toJstDateString,
} from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import {
  allocateTicketsForReservation,
  revertTicketAllocation,
} from "@/lib/ticket-allocation";

function formatDurationLabel(minutes: number) {
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60}時間`;
  }
  return `${minutes}分`;
}

export async function createReservation(input: {
  userId: string;
  nickname: string;
  startAt: string;
  durationMinutes: number;
  employeeId: string;
}) {
  if (input.durationMinutes < 15 || input.durationMinutes % 15 !== 0) {
    throw new Error("Invalid duration");
  }

  const startAt = new Date(input.startAt);
  if (
    Number.isNaN(startAt.getTime()) ||
    !isSlotAligned(startAt) ||
    startAt <= new Date()
  ) {
    throw new Error("予約日時が正しくありません");
  }
  const desiredDate = parseJstDateTime(toJstDateString(startAt), "00:00");

  const employee = await prisma.employee.findFirst({
    where: { id: input.employeeId, isActive: true },
  });
  if (!employee) {
    throw new Error("選択したスタッフは現在予約できません");
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.create({
      data: {
        userId: input.userId,
        nickname: input.nickname.trim() || "ゲスト",
        desiredDate,
        startAt,
        durationMinutes: input.durationMinutes,
        requestedEmployeeId: input.employeeId,
        status: "pending",
      },
    });

    await reserveAvailabilitySlots(tx, {
      employeeId: input.employeeId,
      startAt,
      durationMinutes: input.durationMinutes,
      reservationId: reservation.id,
    });

    await allocateTicketsForReservation(tx, {
      userId: input.userId,
      reservationId: reservation.id,
      requiredMinutes: input.durationMinutes,
    });

    return reservation;
  });

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true },
  });
  if (user) {
    try {
      await sendReservationStatusEmail({
        to: user.email,
        nickname: reservation.nickname,
        status: "created",
        siteUrl: getSiteUrl(),
      });
    } catch (error) {
      console.error("[reservation-created-email]", error);
    }
  }
  try {
    await sendAdminReservationNotification({
      reservationId: reservation.id,
      siteUrl: getSiteUrl(),
    });
  } catch (error) {
    console.error("[admin-reservation-email]", error);
  }
  return reservation;
}

export async function acceptReservation(input: {
  reservationId: string;
  assignedEmployeeId?: string | null;
}) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: input.reservationId },
    include: {
      user: true,
      tickets: true,
      requestedEmployee: true,
    },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }
  if (reservation.status !== "pending") {
    throw new Error("Reservation is not pending");
  }

  const assignedEmployeeId =
    input.assignedEmployeeId ??
    reservation.requestedEmployeeId ??
    null;

  if (
    reservation.requestedEmployeeId &&
    assignedEmployeeId !== reservation.requestedEmployeeId
  ) {
    throw new Error("予約したスタッフのみ承諾できます");
  }

  if (assignedEmployeeId) {
    const employee = await prisma.employee.findFirst({
      where: { id: assignedEmployeeId, isActive: true },
    });
    if (!employee) {
      throw new Error("Assigned employee not found");
    }
  }

  const room = await createDailyRoom({
    durationMinutes: reservation.durationMinutes,
    startsAt: reservation.startAt ?? undefined,
  });
  const siteUrl = getSiteUrl();
  const planLabel = formatDurationLabel(reservation.durationMinutes);
  const callUrl = `${siteUrl}/call/${room.name}`;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "accepted",
        assignedEmployeeId,
        dailyRoomUrl: callUrl,
        dailyRoomName: room.name,
      },
    });

    await tx.ticket.updateMany({
      where: { reservationId: reservation.id },
      data: { status: "consumed" },
    });
  });

  await sendBookingConfirmationEmail({
    to: reservation.user.email,
    nickname: reservation.nickname,
    planLabel,
    callUrl,
    siteUrl,
  });

  return {
    reservationId: reservation.id,
    callUrl,
    roomName: room.name,
  };
}

export async function declineReservation(input: {
  reservationId: string;
  employeeId?: string | null;
}) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: input.reservationId },
    include: { user: true },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }
  if (reservation.status !== "pending") {
    throw new Error("Reservation is not pending");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "declined" },
    });

    await revertTicketAllocation(tx, reservation.id);
    await releaseAvailabilitySlots(tx, reservation.id);

    if (input.employeeId) {
      await tx.reservationDecline.create({
        data: {
          reservationId: reservation.id,
          employeeId: input.employeeId,
        },
      });
    }

    return { reservationId: reservation.id };
  });
  try {
    await sendReservationStatusEmail({
      to: reservation.user.email,
      nickname: reservation.nickname,
      status: "declined",
      siteUrl: getSiteUrl(),
    });
  } catch (error) {
    console.error("[reservation-declined-email]", error);
  }
  return result;
}

export async function cancelReservation(input: {
  reservationId: string;
  userId: string;
}) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.reservationId, userId: input.userId },
    include: { user: true },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }
  if (reservation.status !== "pending") {
    throw new Error("Only pending reservations can be cancelled");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "cancelled" },
    });

    await revertTicketAllocation(tx, reservation.id);
    await releaseAvailabilitySlots(tx, reservation.id);

    return { reservationId: reservation.id };
  });
  try {
    await sendReservationStatusEmail({
      to: reservation.user.email,
      nickname: reservation.nickname,
      status: "cancelled",
      siteUrl: getSiteUrl(),
    });
  } catch (error) {
    console.error("[reservation-cancelled-email]", error);
  }
  return result;
}
