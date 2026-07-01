export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "サービスについて" },
  { href: "/book", label: "予約する" },
  { href: "/recruit", label: "採用情報" },
] as const;

export const hitomoshiLinks = {
  home: "https://hitomoshi-one.vercel.app/",
  privacy: "https://hitomoshi-one.vercel.app/#privacy",
  tokushoho: "https://hitomoshi-one.vercel.app/#legal",
} as const;
