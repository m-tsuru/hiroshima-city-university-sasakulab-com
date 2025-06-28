# tsukuba.yokohama.dev

筑波大学にいるかいないかを記録・公開する Web サイト

<https://tsukuba.yokohama.dev>

## 仕様・使い方

### 判定
- `130.158.0.0/16`, `133.51.0.0/16` からの接続を学内と判定します
- VPN 経由での接続は学内判定されません

### 初回登録
- 学内（上記 IP）からのアクセスが必要です
- 登録時にトークンが発行されます
  - 次回以降のアクセスにはトークンが必要です
  - トークンは Cookie に保存されます

### 設定
- 以下の状態を設定できます
  - 公開状態（公開／非公開／学内限定）
  - リストに表示するか
  - 過去の記録を表示するか
- トークンを再発行できます
  - この際、現行のトークンは失効します

### 記録
- 以下の POST リクエストを送信してください
  ```bash
  curl -X POST https://tsukuba.yokohama.dev/api/checkins \
    -H "Authorization: <YOUR_TOKEN>"
  ```
  - レートリミット（100 回/時間）を設けています
  - IP アドレスは収集されません

#### macOS を使用している場合

launchd を用いて上記コマンドを定期実行できます

1. `dev.yokohama.tsukuba.plist` をダウンロードします
2. `$YOUR_TOKEN` を書き換えた上で `~/Library/LaunchAgents` に保存します
3. `launchctl load ~/Library/LaunchAgents/dev.yokohama.tsukuba.plist` を実行します

## 開発

フロントエンドを Vite + React + React Router による SPA として構築します。
また、バックエンドを Hono を用いて構築します。
`/api` に API を、その他にフロントエンドをルーティングします。

```bash
cd frontend
yarn run watch  # hono/dist にビルド

cd hono
yarn run dev
```

### デプロイ

GitHub Actions を用いてデプロイします。

Security and variables > Actions に以下を設定します。

```bash
CF_API_TOKEN=<CF_API_TOKEN>
CF_ACCOUNT_ID=<CF_ACCOUNT_ID>
```

手動でデプロイする場合は、以下のコマンドを実行します。

```bash
cd frontend
yarn run build

cd hono
yarn run deploy
```
