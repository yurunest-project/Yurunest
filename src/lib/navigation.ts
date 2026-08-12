import { HITOMOSHI_URL } from "@/lib/constants";

export const navItems = [
  { href: "/", label: "トップ" },
  { href: "/about", label: "サービスについて" },
  { href: "/tickets/buy", label: "チケット購入" },
  { href: "/reservations", label: "予約" },
  { href: "/recruit", label: "採用情報" },
] as const;

/** ゆるネスト本サイト内の法的ページ */
export const legalLinks = {
  privacy: "/privacy",
  tokushoho: "/tokushoho",
} as const;

/** 運営母体「ひともし」の外部サイト（会社概要・詳細規約） */
export const hitomoshiLinks = {
  home: `${HITOMOSHI_URL}/`,
  privacy: `${HITOMOSHI_URL}/#privacy`,
  tokushoho: `${HITOMOSHI_URL}/#legal`,
} as const;
