# Dual N-Back

ブラウザで動作する Dual N-Back トレーニングアプリです。

**公開URL**: https://akasataikisiti.github.io/dual-n-back/

---

## Dual N-Back とは

N試行前に提示された刺激と現在の刺激が一致するかを判断する認知トレーニングです。ワーキングメモリや流動性知能の向上に効果があるとされています。

---

## 機能

### ゲーム設定

| 設定項目 | 選択肢 | デフォルト |
|---|---|---|
| N レベル | 1〜9 | 2 |
| 盤面サイズ | 3×3 / 4×4 / 5×5 | 3×3 |
| マッチ種類 | 位置・形・色・音 | 位置のみ |
| 問題数 | 5〜100 | 20 |

- **位置**は常に有効（固定）
- 有効なマッチ種類が増えるほど刺激表示時間が長くなる（反応猶予が伸びる）

### タイミング（自動計算）

| アクティブな種類数 | 刺激表示 | インターバル |
|---|---|---|
| 1種類 | 1.5 秒 | 0.5 秒 |
| 2種類 | 1.8 秒 | 0.6 秒 |
| 3種類 | 2.1 秒 | 0.7 秒 |
| 4種類 | 2.4 秒 | 0.8 秒 |

### スコア計算

```
1試行のスコア = 正解ヒット数 × 10 × Nレベル × アクティブな種類数
```

ミスや誤反応（フォルスアラーム）によるペナルティはなし。

### キーボード操作

デフォルトのキーバインド（設定画面でカスタマイズ可能）：

| キー | 操作 |
|---|---|
| `A` | 位置マッチ |
| `S` | 形マッチ |
| `D` | 色マッチ |
| `F` | 音マッチ |

### その他の機能

- **タイマーバー**: 残り時間の表示オン/オフ切り替え
- **ゲーム中断**: セッション途中でも中断して設定画面に戻れる
- **成長記録**: 直近50セッションをブラウザのローカルストレージに保存
- **スコア推移グラフ**: 直近20セッションの折れ線グラフ（N-levelごとに色分け）

---

## 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **デプロイ**: GitHub Pages（GitHub Actions で自動デプロイ）
- **外部依存**: なし（チャートも SVG で自前実装）
- **データ保存**: localStorage（サーバー不要）

---

## ローカルで動かす

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

```bash
npm run build    # 本番ビルド（dist/ に出力）
npm run preview  # ビルド結果をローカルで確認
```

---

## デプロイ（GitHub Pages）

`main` ブランチへのプッシュで `.github/workflows/deploy.yml` が自動実行され、GitHub Pages へデプロイされます。

初回のみ、リポジトリの **Settings → Pages → Source** を `GitHub Actions` に設定する必要があります。

### Google Analytics 4 を有効化する

1. Google Analytics で Web データストリームを作成し、測定 ID (`G-XXXXXXXXXX`) を取得する
2. GitHub リポジトリの **Settings → Secrets and variables → Actions** で `GA_MEASUREMENT_ID` という Secret を作成する
3. 値に取得した測定 ID を設定する
4. `main` ブランチへ push して GitHub Pages を再デプロイする

このプロジェクトでは、本番ビルド時に `VITE_GA_MEASUREMENT_ID` が設定されている場合だけ Google Analytics を読み込みます。Secret 未設定時は計測コードは動作しません。

現在は以下の独自イベントを送信します。

- `game_started`: セッション開始時の設定値
- `game_completed`: セッション完了時のスコアと正誤集計
- `game_quit`: セッション中断時の設定値
- `history_opened`: 履歴画面を開いた操作元

---

## プロジェクト構成

```
src/
├── components/
│   ├── SetupScreen.tsx      # 設定画面
│   ├── GameScreen.tsx       # ゲーム画面
│   ├── ResultsScreen.tsx    # 結果画面
│   ├── HistoryScreen.tsx    # 成長記録画面
│   ├── Board.tsx            # 盤面コンポーネント
│   ├── AnswerButtons.tsx    # 回答ボタン
│   └── ShapeIcon.tsx        # 形アイコン
├── hooks/
│   ├── useGame.ts           # ゲームロジック（状態管理）
│   └── useAudio.ts          # 音声（Web Audio API + SpeechSynthesis）
├── utils/
│   ├── gameLogic.ts         # 刺激生成・正解判定
│   ├── storage.ts           # localStorage 読み書き
│   └── timing.ts            # タイミング計算
└── types.ts                 # 型定義
```
