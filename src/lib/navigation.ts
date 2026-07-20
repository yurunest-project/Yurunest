export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "サービスについて" },
  { href: "/tickets/buy", label: "チケット購入" },
  { href: "/reservations", label: "予約" },
  { href: "/recruit", label: "採用情報" },
] as const;

export const hitomoshiLinks = {
  home: "https://hitomoshi-one.vercel.app/",
  privacy: "https://hitomoshi-one.vercel.app/#privacy",
  tokushoho: "https://hitomoshi-one.vercel.app/#legal",
} as const;
