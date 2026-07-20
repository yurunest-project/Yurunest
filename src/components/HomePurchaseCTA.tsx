import { auth } from "@/auth";
import Link from "next/link";

const buttonClassName =
  "group block w-full rounded-xl bg-sage-dark text-center font-bold text-white shadow-[0_6px_24px_rgba(42,52,45,0.18)] ring-2 ring-sage/40 transition-all hover:bg-[#4a6350] hover:shadow-[0_8px_28px_rgba(42,52,45,0.24)] hover:ring-sage/60 active:scale-[0.98] focus-visible:outline-offset-4";

export async function HomePurchaseCTA({ compact = false }: { compact?: boolean }) {
  const session = await auth();
  const sizeClass = compact ? "px-4 py-3.5 text-base" : "px-6 py-6 text-lg sm:text-xl";

  if (!session?.user) {
    return (
      <div>
        <Link href="/login" className={`${buttonClassName} ${sizeClass}`}>
          <span className="block leading-snug">ログインしてチケットを購入</span>
          {!compact && (
            <span className="mt-1 block text-sm font-medium text-white/85 sm:text-base">
              購入にはログインが必要です
            </span>
          )}
        </Link>
        <p className={`text-center text-sm text-forest-muted ${compact ? "mt-2" : "mt-3"}`}>
          <Link href="/register" className="text-sage-dark underline-offset-4 hover:underline">
            新規登録はこちら
          </Link>
        </p>
      </div>
    );
  }

  return (
    <Link href="/tickets/buy" className={`${buttonClassName} ${sizeClass}`}>
      <span className="block leading-snug">チケットを購入する</span>
      {!compact && (
        <span className="mt-1 block text-sm font-medium text-white/85 sm:text-base">
          15分500円 · 全額返金保証
        </span>
      )}
    </Link>
  );
}
