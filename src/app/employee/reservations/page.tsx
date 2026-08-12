import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EmployeeReservationActions } from "@/components/EmployeeReservationActions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "スタッフ予約一覧 | ゆるネスト",
};

export default async function EmployeeReservationsPage() {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE" || !session.user.employeeId) {
    redirect("/employee/login");
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      requestedEmployeeId: session.user.employeeId,
      status: { in: ["pending", "accepted"] },
    },
    include: { user: { select: { nickname: true, email: true } } },
    orderBy: { startAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          STAFF
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">予約一覧</h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          あなたに届いている予約を確認し、対応できるものを承諾してください。
        </p>
        <Link
          href="/employee/shifts"
          className="mb-6 inline-block rounded-xl border border-sage/25 px-4 py-3 text-sm font-medium text-forest hover:bg-sage/10"
        >
          シフトを登録・確認
        </Link>
        {reservations.length === 0 ? (
          <p className="rounded-2xl border border-sage/20 bg-white p-5 text-forest-muted">
            現在、対応が必要な予約はありません。
          </p>
        ) : (
          <ul className="space-y-4">
            {reservations.map((reservation) => (
              <li
                key={reservation.id}
                className="rounded-2xl border border-sage/20 bg-white p-5"
              >
                <p className="text-lg font-bold text-forest">
                  {reservation.startAt
                    ? new Intl.DateTimeFormat("ja-JP", {
                        timeZone: "Asia/Tokyo",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hourCycle: "h23",
                      }).format(reservation.startAt)
                    : reservation.desiredDate.toISOString().slice(0, 10)}
                </p>
                <p className="mt-1 text-sm text-forest-muted">
                  {reservation.durationMinutes}分 · {reservation.nickname}
                </p>
                <p className="mt-1 text-sm text-forest-muted">
                  {reservation.status === "pending" ? "承諾待ち" : "承諾済み"}
                </p>
                {reservation.status === "pending" && (
                  <EmployeeReservationActions reservationId={reservation.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
