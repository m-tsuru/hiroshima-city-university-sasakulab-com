# tsukuba.yokohama.dev

接続元の IP アドレスを基に筑波大学にいるかいなかを記録・公開する Web サイト

<https://tsukuba.yokohama.dev>

## 仕様

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
- トークンの再発行を行えます
  - この際、現行のトークンは失効します

### 記録
- 以下の POST リクエストを送信してください
  ```bash
  curl -X POST https://tsukuba.yokohama.dev/api/record \
    -H "Authorization: <発行されたトークン>"
  ```
  - レートリミット（100回/時間）を設けています
- IP アドレスは収集されません

## 開発

React + Hono + Vite によって構成されます。

`/api` に API を、その他にフロントエンドをデプロイします。

```
cd frontend
yarn run watch

cd backend
yarn run dev
```
