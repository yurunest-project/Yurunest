import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminReservationActions } from "@/components/AdminReservationActions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "予約管理 | ゆるネスト",
};

const statusLabel: Record<string, string> = {
  pending: "承諾待ち",
  accepted: "承諾済み",
  declined: "お断り",
  cancelled: "キャンセル",
};

export default async function AdminReservationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/reservations");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [pending, recent, employees] = await Promise.all([
    prisma.reservation.findMany({
      where: { status: "pending" },
      orderBy: [{ desiredDate: "asc" }, { createdAt: "asc" }],
      include: {
        user: { select: { email: true, nickname: true } },
        requestedEmployee: { select: { id: true, name: true } },
        tickets: { select: { id: true } },
      },
    }),
    prisma.reservation.findMany({
      where: { status: { not: "pending" } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        user: { select: { email: true, nickname: true } },
        assignedEmployee: { select: { name: true } },
        tickets: { select: { id: true } },
      },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          ADMIN
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">予約管理</h1>
        <p className="mb-8 text-base text-forest-muted">
          承諾すると Daily ルームを作成し、お客様へ通話URLをメール送信します。
        </p>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-forest">
            承諾待ち（{pending.length}）
          </h2>
          {pending.length === 0 ? (
            <p className="rounded-2xl border border-sage/20 bg-white px-5 py-6 text-forest-muted">
              承諾待ちの予約はありません。
            </p>
          ) : (
            <ul className="space-y-4">
              {pending.map((reservation) => (
                <li
                  key={reservation.id}
                  className="rounded-2xl border border-sage/20 bg-white p-5"
                >
                  <p className="text-lg font-bold text-forest">
                    {reservation.desiredDate.toISOString().slice(0, 10)}
                  </p>
                  <p className="mt-1 text-sm text-forest-muted">
                    {reservation.durationMinutes}分 · チケット{" "}
                    {reservation.tickets.length}枚
                  </p>
                  <p className="mt-2 text-sm text-forest">
                    {reservation.nickname}（
                    {reservation.user.nickname || reservation.user.email}）
                  </p>
                  <p className="text-sm text-forest-muted">
                    {reservation.user.email}
                  </p>
                  {reservation.requestedEmployee && (
                    <p className="mt-1 text-sm text-forest-muted">
                      希望: {reservation.requestedEmployee.name}
                    </p>
                  )}
                  <AdminReservationActions
                    reservationId={reservation.id}
                    employees={
                      reservation.requestedEmployee
                        ? [
                            reservation.requestedEmployee,
                            ...employees.filter(
                              (e) => e.id !== reservation.requestedEmployee?.id,
                            ),
                          ]
                        : employees
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-forest">最近の処理</h2>
          {recent.length === 0 ? (
            <p className="text-forest-muted">まだ処理済みの予約はありません。</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((reservation) => (
                <li
                  key={reservation.id}
                  className="rounded-xl border border-sage/15 bg-white px-4 py-3 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-forest">
                      {reservation.desiredDate.toISOString().slice(0, 10)}
                    </span>
                    <span className="text-forest-muted">
                      {statusLabel[reservation.status] ?? reservation.status}
                    </span>
                  </div>
                  <p className="mt-1 text-forest-muted">
                    {reservation.user.email}
                    {reservation.assignedEmployee
                      ? ` · ${reservation.assignedEmployee.name}`
                      : ""}
                  </p>
                  {reservation.dailyRoomUrl && (
                    <a
                      href={reservation.dailyRoomUrl}
                      className="mt-1 inline-block text-sage-dark underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      ルームURL
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sage-dark hover:underline">
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
