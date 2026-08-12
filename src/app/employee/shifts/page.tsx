import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShiftManager } from "@/components/AdminShiftManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "シフト登録 | ゆるネスト",
};

export default async function EmployeeShiftsPage() {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE" || !session.user.employeeId) {
    redirect("/login?callbackUrl=/employee/shifts");
  }
  const employee = await prisma.employee.findFirst({
    where: { id: session.user.employeeId, isActive: true },
    select: { id: true, name: true },
  });
  if (!employee) redirect("/");

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          STAFF
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">シフト登録</h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          対応できる時間帯を15分単位で登録してください。予約済みの枠は削除できません。
        </p>
        <AdminShiftManager
          employees={[employee]}
          apiBase="/api/employee/shifts"
          showEmployeeSelect={false}
        />
        <p className="mt-8 text-center">
          <Link
            href="/employee/reservations"
            className="text-sage-dark hover:underline"
          >
            予約一覧へ
          </Link>
        </p>
      </div>
    </div>
  );
}
