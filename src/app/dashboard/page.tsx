import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/reservations");
  if (session.user.role === "EMPLOYEE") redirect("/employee/reservations");
  redirect("/reservations");
}
