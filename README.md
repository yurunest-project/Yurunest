# Yurunest

ブラウザ完結の通話予約サービス（ゆるネスト）。

## 本番公開（www.yurunest.com / Railway）

Vercel ではなく Railway + カスタムドメインで公開する手順は [docs/DEPLOY.md](docs/DEPLOY.md) を参照。

- 本番 URL: `https://www.yurunest.com`
- 環境変数テンプレート: [.env.production.example](.env.production.example)
- デプロイ設定: [railway.toml](railway.toml)

## ローカル開発

```bash
cp .env.example .env.local
# 値を埋める
npm install
npm run dev:clean
```

## gitの使い方

### pushする時
1. ブランチに移動する
```bash
git checkout -b branch01
```
（コードを変更する）
2. 更新をコミットする（ここはエディタ上で可能）
```bash
git add .
git commit -m "コミットメッセージ"
```
3. プルリクを出すために自分のローカルの変更をブランチに押し込む
```bash
git push origin branch01
```
（今は `git push` のみでOK）

### GitHub の最新をローカルに取り込みたいとき
```bash
git switch main
git pull
```

### branch01の完成品をmainに反映したいとき
```bash
git checkout main
git merge branch01
git push origin main
git checkout branch01
```
