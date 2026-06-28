import Image from "next/image";
import Link from "next/link";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="block shrink-0 focus-visible:outline-offset-4"
      aria-label="ゆるネスト ホーム"
    >
      <span className="relative block h-8 w-[5.75rem] overflow-hidden rounded-md sm:h-9 sm:w-[6.5rem]">
        <Image
          src="/logo-yoko.jpg"
          alt=""
          fill
          sizes="(max-width: 640px) 92px, 104px"
          className="object-cover object-center scale-[2.35]"
          priority
        />
      </span>
    </Link>
  );
}
