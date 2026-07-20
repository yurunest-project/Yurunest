import { createDailyRoom } from "@/lib/daily";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ticketsRequiredForMinutes } from "@/types/ticket";

function formatDurationLabel(minutes: number) {
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60}時間`;
  }
  return `${minutes}分`;
}

export async function createReservation(input: {
  userId: string;
  nickname: string;
  desiredDate: string;
  durationMinutes: number;
  requestedEmployeeId?: string | null;
}) {
  const required = ticketsRequiredForMinutes(input.durationMinutes);
  if (required < 1) {
    throw new Error("Invalid duration");
  }

  const desiredDate = new Date(`${input.desiredDate}T00:00:00.000Z`);
  if (Number.isNaN(desiredDate.getTime())) {
    throw new Error("Invalid date");
  }

  if (input.requestedEmployeeId) {
    const employee = await prisma.employee.findFirst({
      where: { id: input.requestedEmployeeId, isActive: true },
    });
    if (!employee) {
      throw new Error("Requested employee not found");
    }
  }

  return prisma.$transaction(async (tx) => {
    const unused = await tx.ticket.findMany({
      where: { userId: input.userId, status: "unused" },
      orderBy: { createdAt: "asc" },
      take: required,
    });

    if (unused.length < required) {
      throw new Error(
        `チケットが不足しています（必要: ${required}枚 / 所持: ${unused.length}枚）`,
      );
    }

    const reservation = await tx.reservation.create({
      data: {
        userId: input.userId,
        nickname: input.nickname.trim() || "ゲスト",
        desiredDate,
        durationMinutes: input.durationMinutes,
        requestedEmployeeId: input.requestedEmployeeId || null,
        status: "pending",
      },
    });

    await tx.ticket.updateMany({
      where: { id: { in: unused.map((t) => t.id) } },
      data: {
        status: "reserved",
        reservationId: reservation.id,
      },
    });

    return reservation;
  });
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
  });
  const siteUrl = getSiteUrl();
  const planLabel = formatDurationLabel(reservation.durationMinutes);

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "accepted",
        assignedEmployeeId,
        dailyRoomUrl: room.url,
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
    callUrl: room.url,
    siteUrl,
  });

  return {
    reservationId: reservation.id,
    callUrl: room.url,
    roomName: room.name,
  };
}

export async function declineReservation(input: {
  reservationId: string;
  employeeId?: string | null;
}) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: input.reservationId },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }
  if (reservation.status !== "pending") {
    throw new Error("Reservation is not pending");
  }

  return prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "declined" },
    });

    await tx.ticket.updateMany({
      where: { reservationId: reservation.id, status: "reserved" },
      data: {
        status: "unused",
        reservationId: null,
      },
    });

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
}

export async function cancelReservation(input: {
  reservationId: string;
  userId: string;
}) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.reservationId, userId: input.userId },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }
  if (reservation.status !== "pending") {
    throw new Error("Only pending reservations can be cancelled");
  }

  return prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "cancelled" },
    });

    await tx.ticket.updateMany({
      where: { reservationId: reservation.id, status: "reserved" },
      data: {
        status: "unused",
        reservationId: null,
      },
    });

    return { reservationId: reservation.id };
  });
}
