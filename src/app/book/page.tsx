import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "予約・決済 | ゆるネスト",
  description:
    "プランを選んで Stripe で事前決済。完了後、通話URLをメールでお送りします。",
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          BOOKING
        </p>
        <h1 className="mb-3 text-2xl font-bold text-forest">予約・事前決済</h1>
        <p className="mb-8 text-base leading-relaxed text-forest-muted">
          プランとお名前を入力し、Stripe でお支払いください。決済完了後、通話ルームURLをメールでお送りします。
        </p>

        <div className="rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)] sm:p-6">
          <Suspense fallback={<p className="text-base text-forest-muted">読み込み中...</p>}>
            <BookingForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
