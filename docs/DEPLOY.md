# yurunest.com 本番公開手順（Railway）

Vercel は使わず、Railway + カスタムドメイン `yurunest.com` で公開します。

## 前提

- GitHub リポジトリ: `https://github.com/yurunest-coder/Yurunest.git`
- DB: 既存の Prisma Postgres（`DATABASE_URL` をそのまま使う）
- メール: Resend + `info@yurunest.com`（ドメイン認証済みであること）

ローカル開発の `.env.local` は `http://127.0.0.1:3000` のまま変更しない。

---

## 1. コードを GitHub に載せる

未コミットの変更がある場合は、先に `main`（またはデプロイ用ブランチ）へ push する。

```bash
cd ~/Developer/Yurunest
git status
# 必要なら commit → push
git push -u origin HEAD
```

Railway は GitHub のブランチをデプロイ元にする。

---

## 2. Railway にデプロイ

1. [railway.app](https://railway.app) でアカウント作成 / ログイン
2. **New Project** → **Deploy from GitHub repo** → `Yurunest` を選択
3. ルートディレクトリがリポジトリ直下であることを確認
4. 初回デプロイが走る（ビルド失敗しても次の Variables 設定後に再デプロイすればよい）

設定ファイル:

- [`railway.toml`](../railway.toml) … Build / Start（起動時に `prisma migrate deploy`）
- アプリは `npm run build` → `npm run start`（`next start`）

一時 URL（例: `https://xxxx.up.railway.app`）が表示されたら、Variables 設定後に開けるか確認する。

---

## 3. 本番環境変数（Railway Variables）

[`.env.production.example`](../.env.production.example) を参照し、少なくとも次を設定する。

| 変数 | 本番の値 |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://yurunest.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://yurunest.com` |
| `AUTH_URL` | `https://yurunest.com` |
| `AUTH_SECRET` | 新規生成（例: `openssl rand -base64 32`） |
| `NEXTAUTH_SECRET` | `AUTH_SECRET` と同じで可 |
| `DATABASE_URL` など | 既存 Prisma Postgres |
| `RESEND_API_KEY` / `BOOKING_EMAIL_FROM` | 既存（`info@yurunest.com`） |
| Stripe / Daily | 本番またはテストキー |

設定後 **Redeploy** する。

---

## 4. カスタムドメイン DNS

ドメイン `yurunest.com` の NS は **お名前.com（dnsv.jp）** です。DNS はお名前.com のコントロールパネルで設定する。

1. Railway サービス → **Settings** → **Networking** → **Custom Domain**
2. `yurunest.com` を追加（必要なら `www.yurunest.com` も）
3. Railway が表示するレコードを控える
4. [お名前.com DNS 設定](https://www.onamae.com/) → ドメイン設定 → DNS 関連機能の設定 → DNSレコード設定

よくある設定:

| 種別 | ホスト名 | VALUE（Railway が表示する値） |
|---|---|---|
| CNAME または ALIAS / ANAME | `@`（または空） | Railway のターゲット |
| CNAME | `www` | Railway のターゲット |

お名前.com で apex（`@`）に CNAME が使えない場合は、Railway が表示する **A レコード（IP）** を使う。

5. SSL が Active になるまで待つ（数分〜最大48時間）
6. `https://yurunest.com` でサイトが開けることを確認

`www` と apex はどちらか一方にリダイレクトを揃える（Railway の Domain 設定で可）。

---

## 5. 外部サービスを本番 URL に合わせる

### Stripe

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Endpoint 追加: `https://yurunest.com/api/stripe/webhook`
3. イベント: `checkout.session.completed` など既存実装に合わせる
4. Signing secret（`whsec_...`）を Railway の `STRIPE_WEBHOOK_SECRET` に設定
5. Redeploy

ローカルの `stripe listen` 用 secret とは別物。

### Resend

1. Domains で `yurunest.com` が Verified か確認
2. 送信元 `info@yurunest.com` が使えること
3. 確認メールのリンクが `https://yurunest.com/api/auth/verify-email?...` になること（`NEXT_PUBLIC_APP_URL` 依存）

### Daily.co

1. Dashboard でドメイン `yurunest`（`NEXT_PUBLIC_DAILY_DOMAIN`）を確認
2. 必要なら Allowed domains / 埋め込み許可に `yurunest.com` を追加

---

## 6. 完了チェック

- [ ] `https://yurunest.com` が HTTPS で開く
- [ ] 新規登録 → 確認メールのリンクが `yurunest.com` で、スマホからも成功
- [ ] ログイン / ADMIN メニュー
- [ ] Stripe 決済 → webhook が 200
- [ ] 従業員招待リンクも `https://yurunest.com/employee/invite?...`

---

## 補足: Vercel について

Hobby（無料）は非商用のみ。商用なら Pro が必要。このプロジェクトは Railway 方針のため Vercel は使わない。
