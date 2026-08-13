function normalizeOrigin(url: string) {
  return url.trim().replace(/\/+$/, "");
}

/**
 * アプリの公開オリジン（末尾スラッシュなし）。
 * 本番では Railway に NEXT_PUBLIC_APP_URL / AUTH_URL = https://www.yurunest.com を設定する。
 */
export function getAppUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://127.0.0.1:3000";
  return normalizeOrigin(raw);
}
