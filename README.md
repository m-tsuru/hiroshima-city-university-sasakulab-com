# ichipiro.sasakulab.com

広島市立大学にいるかいないかを記録・公開する Web サイト

<https://ichipiro.sasakulab.com>

## 仕様・使い方

### 判定
- `165.242.0.0/16`, `2001:2f8:1c2` からの接続を学内と判定します
- 設定によって VPN 経由での接続は学内判定される可能性があります。

### 初回登録
- 学内（上記 IP）からのアクセスが必要です
- 登録時にトークンが発行されます
  - 次回以降のアクセスにはトークンが必要です
  - トークンは Cookie に保存されます

### 設定
- ページを上にスクロールすると、以下の設定を編集できます
  - スクリーンネーム、名前、ひとこと
  - 公開状態（公開／非公開／学内限定、一覧への表示、過去の記録の表示）
  - トークン再発行
    - 現行のトークンを失効させ、新たなトークンを発行します

### 記録
- 以下の POST リクエストを送信してください
  ```bash
  curl -X POST https://ichipiro.sasakulab.com/api/checkins \
    -H "Authorization: <YOUR_TOKEN>"
  ```
  - レートリミット（100 回/時間）を設けています
  - IP アドレスは収集されません

#### macOS を使用している場合

launchd を用いて上記コマンドを定期実行できます

1. `com.sasakulab.ichipiro.plist` をダウンロードします
2. `$YOUR_TOKEN` を書き換えた上で `~/Library/LaunchAgents` に保存します
3. `launchctl load ~/Library/LaunchAgents/com.sasakulab.ichipiro.plist` を実行します

### 記録の確認
  - <https://ichipiro.sasakulab.com/@screenname> から確認できます

## 開発

- フロントエンド
  - Vite + React + React Router による SPA として構築します
- バックエンド
  - Hono を用いて構築します
  - `/api` に API を、その他にフロントエンドをルーティングします

```bash
cd frontend
yarn
yarn run watch  # hono/dist に自動ビルド

cd hono
cp wrangler.jsonc.sample wrangler.jsonc
yarn
yarn run dev

# デプロイ
cd frontend
yarn run build

cd hono
yarn run deploy
```

## ライセンス

このスクリプトは MIT LICENSE にしたがって、ささくらりが改変し、運用しています。

Copyright (c) 2025 いなにわうどん, ささくらり.

This script is released under the MIT License, see LICENSE.

MIT ライセンスに従って、自由に使用・再配布等を行うことができます。
