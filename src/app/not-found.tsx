import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory px-5 py-20 text-center sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="text-sm font-medium tracking-[0.2em] text-sage">404</p>
        <h1 className="mt-3 text-2xl font-bold text-forest">
          ページが見つかりません
        </h1>
        <p className="mt-4 text-base leading-relaxed text-forest-muted">
          お探しのページは移動または削除された可能性があります。
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-sage-dark px-6 py-3 font-bold text-white"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
