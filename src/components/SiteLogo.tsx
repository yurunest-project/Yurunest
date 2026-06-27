import Link from "next/link";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="text-lg font-bold tracking-wide text-forest transition-colors hover:text-sage-dark focus-visible:outline-offset-4"
      aria-label="ゆるネスト ホーム"
    >
      {/* 将来: <Image src="..." alt="ゆるネスト" /> に差し替え */}
      ゆるネスト
    </Link>
  );
}
