import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { CancelReservationButton } from "@/components/CancelReservationButton";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "予約一覧 | ゆるネスト",
};

const statusLabel: Record<string, string> = {
  pending: "承諾待ち",
  accepted: "承諾済み",
  declined: "お断り",
  cancelled: "キャンセル",
};

type PageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function ReservationsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reservations");
  }

  const params = await searchParams;
  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      requestedEmployee: { select: { name: true } },
      assignedEmployee: { select: { name: true } },
      tickets: { select: { id: true } },
    },
  });

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          RESERVATIONS
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">予約一覧</h1>
        <p className="mb-6 text-base text-forest-muted">
          スタッフ承諾後に通話URLがメールで届きます。
        </p>

        {params.created === "1" && (
          <p className="mb-6 rounded-xl border border-sage/20 bg-sage/10 px-4 py-3 text-sm text-forest">
            予約を受け付けました。スタッフの承諾をお待ちください。
          </p>
        )}

        <div className="mb-6 flex gap-3">
          <Link
            href="/reservations/new"
            className="rounded-xl bg-sage-dark px-4 py-3 text-sm font-bold text-white hover:bg-[#4a6350]"
          >
            新規予約
          </Link>
          <Link
            href="/tickets/buy"
            className="rounded-xl border border-sage/25 px-4 py-3 text-sm font-medium text-forest hover:bg-sage/10"
          >
            チケット購入
          </Link>
        </div>

        {reservations.length === 0 ? (
          <p className="rounded-2xl border border-sage/20 bg-white px-5 py-8 text-center text-forest-muted">
            まだ予約がありません。
          </p>
        ) : (
          <ul className="space-y-4">
            {reservations.map((reservation) => (
              <li
                key={reservation.id}
                className="rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-forest">
                      {reservation.desiredDate.toISOString().slice(0, 10)}
                    </p>
                    <p className="mt-1 text-sm text-forest-muted">
                      {reservation.durationMinutes}分 · チケット{" "}
                      {reservation.tickets.length}枚
                    </p>
                  </div>
                  <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-sage-dark">
                    {statusLabel[reservation.status] ?? reservation.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-forest">
                  ニックネーム: {reservation.nickname}
                </p>
                {(reservation.requestedEmployee ||
                  reservation.assignedEmployee) && (
                  <p className="mt-1 text-sm text-forest-muted">
                    スタッフ:{" "}
                    {reservation.assignedEmployee?.name ??
                      reservation.requestedEmployee?.name}
                  </p>
                )}
                {reservation.status === "accepted" && reservation.dailyRoomUrl && (
                  <p className="mt-3">
                    <a
                      href={reservation.dailyRoomUrl}
                      className="text-sm font-medium text-sage-dark underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      通話ルームを開く
                    </a>
                  </p>
                )}
                {reservation.status === "pending" && (
                  <div className="mt-3">
                    <CancelReservationButton reservationId={reservation.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
