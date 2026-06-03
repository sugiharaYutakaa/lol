# Rift Pick — LoL ピックアドバイザー

レーンとピック方式（ランダム / カウンター / ファースト / バランス）を選んで、
最適なチャンピオンピックを提案する Web アプリです。
チャンピオンの名前・アイコンは Riot の **Data Dragon**（公式CDN）から取得し、
推奨ロジックのデータは **ローカル CSV**（`/data`）を参照します。DB は使用しません。

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS（Hextech 風 UI）
- papaparse（CSV パース）
- Data Dragon CDN（チャンピオン画像・日本語名）
- デプロイ: Vercel

## ローカル実行

```bash
npm install
npm run dev
# http://localhost:3000
```

## Vercel へのデプロイ

1. このディレクトリを Git リポジトリにして GitHub などへ push。
2. Vercel で「New Project」→ リポジトリを import。
3. フレームワークは自動で **Next.js** が選択されます。設定はデフォルトのまま「Deploy」。

`next.config.js` の `outputFileTracingIncludes` により、`/data` 配下の CSV が
サーバー関数のバンドルへ確実に含まれます。CSV を更新したら再デプロイするだけで反映されます。

## データの差し替え（`/data`）

すべての CSV は 1 行目がヘッダーです。チャンピオン識別子は **Data Dragon のキー**
（例: `Ahri`, `MonkeyKing`, `Kaisa`）で記述してください。画像・名前の解決に使われます。

### `champion_lanes.csv` — ランダムピックの母集団

| 列 | 説明 |
|----|------|
| `lane` | `top` / `jungle` / `mid` / `bot` / `support` |
| `champion` | チャンピオンキー |

### `first_pick.csv` — 先出し安定ピック

| 列 | 説明 |
|----|------|
| `lane` | レーン |
| `pick` | 先出し推奨チャンピオンキー |
| `reason` | 先出し安定の理由（1〜2文） |

### `counters.csv` — カウンターピック

| 列 | 説明 |
|----|------|
| `lane` | レーン |
| `enemy` | 相手チャンピオンキー |
| `pick` | 対面で有利なチャンピオンキー |
| `reason` | カウンター理由（1〜2文） |

同じ `enemy` に複数行を書くと、その敵に対する候補が複数表示されます。

### `balance_pick.csv` — バランスピック（カテゴリ別）

| 列 | 説明 |
|----|------|
| `lane` | レーン |
| `category` | `engage` / `aoe` / `assassin` / `fighter` / `tank` |
| `pick` | チャンピオンキー |
| `reason` | 推奨理由 |

## 画面遷移

```
/                         レーン選択
/pick/[lane]              ピック方式選択
/pick/[lane]/[mode]       結果（mode = random | counter | first | balance）
```

## 注意

- 現在の CSV はモックデータです。本番のチャンピオン相性データへ差し替えてください。
- Data Dragon が一時的に取得できない場合は、キー名をそのまま表示するフォールバックが働きます。
