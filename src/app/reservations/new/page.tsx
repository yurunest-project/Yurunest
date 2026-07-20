import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReservationForm } from "@/components/ReservationForm";
import { countUnusedTickets } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "新規予約 | ゆるネスト",
};

export default async function NewReservationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reservations/new");
  }

  const [unusedTicketCount, employees] = await Promise.all([
    countUnusedTickets(session.user.id),
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
          NEW BOOKING
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">希望日を予約</h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          未使用チケットを使って希望日を申し込みます。スタッフ承諾後に通話URLをお送りします。
        </p>

        <div className="rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)] sm:p-6">
          <ReservationForm
            employees={employees}
            unusedTicketCount={unusedTicketCount}
            defaultNickname={session.user.nickname || ""}
          />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/reservations" className="text-sage-dark hover:underline">
            予約一覧へ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
