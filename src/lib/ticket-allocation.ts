import { Prisma, TicketKind, TicketStatus } from "@prisma/client";
import {
  getTicketKindForMinutes,
  type TicketKindKey,
} from "@/lib/constants";

type Transaction = Prisma.TransactionClient;

type AllocatableTicket = {
  id: string;
  minutes: number;
  kind: TicketKind;
  createdAt: Date;
};

function compareFifo(
  a: AllocatableTicket[],
  b: AllocatableTicket[],
) {
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    const difference =
      a[index].createdAt.getTime() - b[index].createdAt.getTime();
    if (difference !== 0) return difference;
  }
  return a.length - b.length;
}

export function selectBestTickets(
  tickets: AllocatableTicket[],
  requiredMinutes: number,
) {
  const sorted = [...tickets].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const exact = sorted.find((ticket) => ticket.minutes === requiredMinutes);
  if (exact) return [exact];

  const longer = sorted
    .filter((ticket) => ticket.minutes > requiredMinutes)
    .sort(
      (a, b) =>
        a.minutes - b.minutes ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    )[0];
  if (longer) return [longer];

  const shorter = sorted.filter((ticket) => ticket.minutes < requiredMinutes);
  const maxTotal = requiredMinutes + 300;
  const states = new Map<number, AllocatableTicket[]>([[0, []]]);

  for (const ticket of shorter) {
    const snapshot = [...states.entries()].sort((a, b) => b[0] - a[0]);
    for (const [sum, selected] of snapshot) {
      const nextSum = sum + ticket.minutes;
      if (nextSum > maxTotal) continue;
      const candidate = [...selected, ticket];
      const current = states.get(nextSum);
      if (
        !current ||
        candidate.length < current.length ||
        (candidate.length === current.length &&
          compareFifo(candidate, current) < 0)
      ) {
        states.set(nextSum, candidate);
      }
    }
  }

  const matches = [...states.entries()]
    .filter(([sum]) => sum >= requiredMinutes)
    .map(([sum, selected]) => ({ sum, selected }))
    .sort(
      (a, b) =>
        a.selected.length - b.selected.length ||
        a.sum - b.sum ||
        compareFifo(a.selected, b.selected),
    );

  return matches[0]?.selected ?? [];
}

export function decomposeMinutes(minutes: number): TicketKindKey[] {
  if (minutes < 0 || minutes % 15 !== 0) {
    throw new Error("返還時間は15分単位である必要があります");
  }

  const units: { minutes: number; kind: TicketKindKey }[] = [
    { minutes: 300, kind: "sleep5" },
    { minutes: 180, kind: "hour3" },
    { minutes: 60, kind: "hour1" },
    { minutes: 30, kind: "min30" },
    { minutes: 15, kind: "min15" },
  ];
  const result: TicketKindKey[] = [];
  let remaining = minutes;
  for (const unit of units) {
    while (remaining >= unit.minutes) {
      result.push(unit.kind);
      remaining -= unit.minutes;
    }
  }
  return result;
}

export async function allocateTicketsForReservation(
  tx: Transaction,
  input: {
    userId: string;
    reservationId: string;
    requiredMinutes: number;
  },
) {
  const available = await tx.ticket.findMany({
    where: {
      userId: input.userId,
      status: TicketStatus.unused,
      OR: [
        { issuedByReservationId: null },
        { issuedByReservation: { status: "accepted" } },
      ],
    },
    select: { id: true, minutes: true, kind: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const selected = selectBestTickets(available, input.requiredMinutes);
  const selectedMinutes = selected.reduce(
    (sum, ticket) => sum + ticket.minutes,
    0,
  );
  if (selectedMinutes < input.requiredMinutes) {
    throw new Error(
      `利用可能なチケットが不足しています（必要: ${input.requiredMinutes}分 / 所持: ${available.reduce((sum, ticket) => sum + ticket.minutes, 0)}分）`,
    );
  }

  const updated = await tx.ticket.updateMany({
    where: {
      id: { in: selected.map((ticket) => ticket.id) },
      status: TicketStatus.unused,
    },
    data: {
      status: TicketStatus.reserved,
      reservationId: input.reservationId,
    },
  });
  if (updated.count !== selected.length) {
    throw new Error("チケットの状態が更新されました。もう一度お試しください。");
  }

  const returnedMinutes = selectedMinutes - input.requiredMinutes;
  const returnedKinds = decomposeMinutes(returnedMinutes);
  let remainingForParent = input.requiredMinutes;
  let changeParentIndex = 0;
  selected.forEach((ticket, index) => {
    if (remainingForParent > 0) changeParentIndex = index;
    remainingForParent -= Math.min(ticket.minutes, remainingForParent);
  });
  const parentTicketId = selected[changeParentIndex]?.id;
  if (parentTicketId && returnedKinds.length > 0) {
    await tx.ticket.createMany({
      data: returnedKinds.map((kind) => {
        const minutes =
          kind === "sleep5"
            ? 300
            : kind === "hour3"
              ? 180
              : kind === "hour1"
                ? 60
                : kind === "min30"
                  ? 30
                  : 15;
        return {
          userId: input.userId,
          status: TicketStatus.unused,
          kind,
          minutes,
          source: "change" as const,
          parentTicketId,
          issuedByReservationId: input.reservationId,
        };
      }),
    });
  }

  let remainingUse = input.requiredMinutes;
  await tx.ticketChangeLog.createMany({
    data: selected.map((ticket, index) => {
      const usedMinutes = Math.min(ticket.minutes, remainingUse);
      remainingUse -= usedMinutes;
      return {
        consumedTicketId: ticket.id,
        reservationId: input.reservationId,
        usedMinutes,
        returnedMinutes: index === changeParentIndex ? returnedMinutes : 0,
      };
    }),
  });

  return {
    selected,
    selectedMinutes,
    returnedMinutes,
    returnedKinds,
  };
}

export async function revertTicketAllocation(
  tx: Transaction,
  reservationId: string,
) {
  const changeTickets = await tx.ticket.findMany({
    where: { issuedByReservationId: reservationId },
    select: { id: true, status: true },
  });
  if (
    changeTickets.some(
      (ticket) =>
        ticket.status !== TicketStatus.unused &&
        ticket.status !== TicketStatus.voided,
    )
  ) {
    throw new Error("返還チケットが使用中のため予約を取り消せません");
  }

  await tx.ticket.updateMany({
    where: { issuedByReservationId: reservationId },
    data: { status: TicketStatus.voided },
  });
  await tx.ticket.updateMany({
    where: { reservationId, status: TicketStatus.reserved },
    data: { status: TicketStatus.unused, reservationId: null },
  });
}

export async function collectTicketDescendantIds(
  tx: Transaction,
  rootIds: string[],
) {
  const all = new Set(rootIds);
  let parents = rootIds;
  while (parents.length > 0) {
    const children = await tx.ticket.findMany({
      where: { parentTicketId: { in: parents } },
      select: { id: true },
    });
    const next = children
      .map((ticket) => ticket.id)
      .filter((id) => !all.has(id));
    next.forEach((id) => all.add(id));
    parents = next;
  }
  return [...all];
}

export function kindForMinutes(minutes: number) {
  const kind = getTicketKindForMinutes(minutes);
  if (!kind) throw new Error(`Unsupported ticket duration: ${minutes}`);
  return kind;
}
