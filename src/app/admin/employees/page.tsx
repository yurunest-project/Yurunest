import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminEmployeeManager } from "@/components/AdminEmployeeManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "スタッフ管理 | ゆるネスト",
};

export default async function AdminEmployeesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/employees");
  if (session.user.role !== "ADMIN") redirect("/");

  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, isActive: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">ADMIN</p>
        <h1 className="mb-3 text-2xl font-bold text-forest">スタッフ管理</h1>
        <p className="mb-8 text-base text-forest-muted">
          スタッフ登録後に表示される招待リンクを、安全な方法で本人へ共有してください。
        </p>
        <AdminEmployeeManager />
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-forest">登録済みスタッフ</h2>
          <ul className="space-y-3">
            {employees.map((employee) => (
              <li key={employee.id} className="rounded-xl border border-sage/20 bg-white p-4">
                <p className="font-medium text-forest">{employee.name}</p>
                <p className="mt-1 text-sm text-forest-muted">{employee.email}</p>
                <p className="mt-1 text-sm text-forest-muted">
                  {employee.isActive ? "有効" : "停止中"}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 text-center">
          <Link href="/admin/reservations" className="text-sage-dark hover:underline">
            予約管理へ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
