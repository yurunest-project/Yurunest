# www.yurunest.com 本番公開手順（Railway）

Vercel は使わず、Railway + カスタムドメインで公開します。

**正式 URL（アプリ・メール・Stripe 共通）: `https://www.yurunest.com`**  
（末尾スラッシュなし。ルート `yurunest.com` はお名前.com の URL 転送で www へ寄せる）

## 前提

- GitHub リポジトリ: `https://github.com/yurunest-project/Yurunest.git`
- DB: 既存の Prisma Postgres（`DATABASE_URL` をそのまま使う）
- メール: Resend + `info@yurunest.com`（ドメイン認証済みであること）

ローカル開発の `.env.local` は `http://127.0.0.1:3000` のまま変更しない。

---

## 1. コードを GitHub に載せる

未コミットの変更がある場合は、先にデプロイ用ブランチへ push する。

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
- アプリは `npm run build` → `next start --hostname 0.0.0.0`

一時 URL（例: `https://xxxx.up.railway.app`）が表示されたら、Variables 設定後に開けるか確認する。

**Networking の Port** は、Deploy Logs でアプリが待ち受けているポート（例: `8080`）と揃える。ずれていると 502 になる。

---

## 3. 本番環境変数（Railway Variables）— URL 統一

[`.env.production.example`](../.env.production.example) を参照し、少なくとも次を設定する。

| 変数 | 本番の値 |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://www.yurunest.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.yurunest.com` |
| `AUTH_URL` | `https://www.yurunest.com` |
| `AUTH_SECRET` | 新規生成（例: `openssl rand -base64 32`） |
| `NEXTAUTH_SECRET` | `AUTH_SECRET` と同じで可 |
| `DATABASE_URL` など | 既存 Prisma Postgres |
| `RESEND_API_KEY` / `BOOKING_EMAIL_FROM` | 既存（`info@yurunest.com`） |
| Stripe / Daily | 本番またはテストキー |

設定後 **Redeploy** する。メール確認リンク・認証リダイレクト・サイトマップはこれらに依存する。

### URL 統一チェック（いまここ）

- [ ] 上記3つの URL 変数がすべて `https://www.yurunest.com`（www 付き・末尾 `/` なし）
- [ ] Redeploy 完了
- [ ] 確認メールのリンクが `https://www.yurunest.com/api/auth/verify-email?...`
- [ ] Stripe Webhook が `https://www.yurunest.com/api/stripe/webhook`
- [ ] Daily 許可ドメインに `www.yurunest.com`（必要なら）

---

## 4. カスタムドメイン DNS

ドメイン `yurunest.com` の NS は **お名前.com（dnsv.jp）** です。

無料枠でカスタムドメインが1つだけの場合は **`www.yurunest.com` を Railway に登録**する。

1. Railway サービス → **Settings** → **Networking** → **Custom Domain**
2. `www.yurunest.com` を追加
3. Railway が表示するレコードを控える
4. [お名前.com DNS 設定](https://www.onamae.com/) → DNSレコード設定

| 種別 | ホスト名 | VALUE |
|---|---|---|
| CNAME | `www` | Railway のターゲット（例: `xxxx.up.railway.app`） |
| TXT | `_railway-verify` など | Railway が表示する全文 |

5. ルート `yurunest.com` → `https://www.yurunest.com` の **URL転送**（お名前.com）
6. SSL が Active になるまで待つ
7. `https://www.yurunest.com` でサイトが開けることを確認

お名前.com ではホスト名に `@` や空欄が使えないことが多いため、apex 直付けより **www + 転送** が確実。

---

## 5. 外部サービスを本番 URL に合わせる

### Stripe

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Endpoint 追加: `https://www.yurunest.com/api/stripe/webhook`
3. イベント: `checkout.session.completed` など既存実装に合わせる
4. Signing secret（`whsec_...`）を Railway の `STRIPE_WEBHOOK_SECRET` に設定
5. 古い `*.vercel.app` / `yurunest.com`（www なし）エンドポイントは削除可
6. Redeploy

ローカルの `stripe listen` 用 secret とは別物。

### Resend

1. Domains で `yurunest.com` が Verified か確認
2. 送信元 `info@yurunest.com` が使えること
3. 確認メールのリンクが `https://www.yurunest.com/...` になること

### Daily.co

1. Dashboard でドメイン `yurunest`（`NEXT_PUBLIC_DAILY_DOMAIN`）を確認
2. Allowed domains に `www.yurunest.com` を追加（必要なら）

---

## 6. 完了チェック

- [ ] `https://www.yurunest.com` が HTTPS で開く
- [ ] 新規登録 → 確認メールのリンクが www で、スマホからも成功
- [ ] ログイン / ADMIN メニュー
- [ ] Stripe 決済 → webhook が 200 / 戻り先が www
- [ ] 従業員招待リンクも `https://www.yurunest.com/employee/invite?...`
- [ ] `https://www.yurunest.com/sitemap.xml` の URL が www

---

## 補足: Vercel について

Hobby（無料）は非商用のみ。商用なら Pro が必要。このプロジェクトは Railway 方針のため Vercel は使わない。
