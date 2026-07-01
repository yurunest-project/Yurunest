# Yurunest
# gitの使い方
# pushする時
1,ブランチに移動する
git checkout -b branch01
（コードを変更する）
2.更新をコミットする（ここはエディタ上で可能）
git add .
git commit -m "コミットメッセージ"
3.プルリクを出すために自分のローカルの変更をブランチに押し込む
git push origin brainch01
（今は git push のみでOK）

# GitHub の最新をローカルに取り込みたいとき
# 1. まず、手元のPCのブランチを「main」に切り替えます
git switch main

# 2. GitHub（origin）から最新のmainを引っ張ってきます

git pull

# branch01の完成品をmainに反映したいとき
git checkout main
git merge branch01
git push origin main
git checkout branch01
