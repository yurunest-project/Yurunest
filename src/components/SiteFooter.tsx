import Link from "next/link";
import { hitomoshiLinks } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-sage/15 bg-ivory px-5 py-8 text-center sm:px-6">
      <nav className="mx-auto flex max-w-lg flex-wrap justify-center gap-x-5 gap-y-3 text-sm">
        <Link href="/privacy" className="text-forest-muted hover:text-sage-dark hover:underline">
          プライバシー
        </Link>
        <Link href="/tokushoho" className="text-forest-muted hover:text-sage-dark hover:underline">
          特定商取引法に基づく表記
        </Link>
        <a
          href={hitomoshiLinks.home}
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest-muted hover:text-sage-dark hover:underline"
        >
          ひともし（規約）
        </a>
      </nav>
      <p className="mt-5 text-sm text-forest-muted">© 2026 Yurunest Project</p>
    </footer>
  );
}
