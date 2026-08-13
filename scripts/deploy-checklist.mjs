#!/usr/bin/env node
/**
 * 本番公開前のチェックリストを表示します（値は出しません）。
 * Usage: npm run deploy:checklist
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const examplePath = resolve(process.cwd(), ".env.production.example");
if (!existsSync(examplePath)) {
  console.error("Missing .env.production.example");
  process.exit(1);
}

console.log(`
yurunest.com 本番公開チェックリスト
詳細: docs/DEPLOY.md

[ ] 1. GitHub に最新コードを push
[ ] 2. Railway で GitHub リポジトリを Deploy
[ ] 3. Railway Variables に以下を設定（テンプレ: .env.production.example）
`);

for (const line of readFileSync(examplePath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const key = trimmed.split("=")[0];
  if (key) console.log(`      - ${key}`);
}

console.log(`
[ ] 4. Custom Domain に yurunest.com を追加し、DNS レコードを設定
[ ] 5. https://yurunest.com が開ける（SSL Active）
[ ] 6. Stripe Webhook → https://yurunest.com/api/stripe/webhook
[ ] 7. Resend で yurunest.com ドメイン認証を確認
[ ] 8. Daily.co に yurunest.com を許可（必要なら）
[ ] 9. 新規登録メールのリンクが https://yurunest.com/... になることを確認
`);
