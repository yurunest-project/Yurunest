import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShiftManager } from "@/components/AdminShiftManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "シフト管理 | ゆるネスト",
};

export default async function AdminShiftsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/shifts");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          ADMIN
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">シフト管理</h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          スタッフが対応可能な時間帯を15分単位で登録します。登録した枠だけが予約候補として表示されます。
        </p>
        {employees.length === 0 ? (
          <p className="rounded-2xl border border-sage/20 bg-white p-5 text-forest-muted">
            先にスタッフを登録してください。
          </p>
        ) : (
          <AdminShiftManager employees={employees} />
        )}
        <p className="mt-8 text-center">
          <Link href="/admin/reservations" className="text-sage-dark hover:underline">
            予約管理へ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
