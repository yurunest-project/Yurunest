import Image from "next/image";
import Link from "next/link";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="block shrink-0 focus-visible:outline-offset-4"
      aria-label="ゆるネスト ホーム"
    >
      <Image
        src="/logo-yoko.jpg"
        alt=""
        width={2000}
        height={656}
        className="h-9 w-auto rounded-md sm:h-10"
        priority
      />
    </Link>
  );
}
