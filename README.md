# slidev-theme-monta

[![NPM version](https://img.shields.io/npm/v/slidev-theme-monta?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-monta)

[Slidev](https://sli.dev) 用の「もんたメソッド」テーマです。

スライドに書いたテキストを画面いっぱいに大きく表示し、`<v-click>` で囲んだ部分を黒塗りで隠します。クリックすると黒塗りが剥がれて文字が現れます。

![もんたメソッド](screenshots/01-title.png)

## 使い方

スライドの headmatter に `theme: monta` を指定します。

```md
---
theme: monta
---

もんた
メソッド

---

スライド文字列の一部を
<v-click>隠して</v-click>見せる手法
```

初回起動時に Slidev からテーマのインストールを促されるので、そのままインストールしてください。
レイアウトの指定を省略すると、自動的に `default`（＝ `monta`）が適用されます。

- Slidev v53 以降
- Node.js 22.12 以降

## 特徴

### 1. フォントサイズの自動最大化

行数と各行の文字数をもとに、各行が不自然に折り返されない範囲でスライドに収まる最大のフォントサイズを自動で調整します。手動で文字サイズを指定する必要はありません。

### 2. Markdown の改行をそのまま反映

空行を入れなくても、改行した位置でそのまま改行して表示されます。

```md
高橋メソッドのある種の応用
クイズのように見せることができて
```

このように書くだけで、そのまま2行で表示されます（空行を入れても構いません）。
なお、見出し・リスト・表・コードブロック・frontmatter は自動改行の対象外です。

![三行のスライド](screenshots/04-three-blackouts.png)

### 3. `v-click` による黒塗りとめくり演出

`<v-click>` で囲んだ部分は、文字の上に黒い帯を被せた状態で表示されます。
クリックすると帯が左から右へ剥がれるように消え、下の文字が現れます。

![黒塗り](screenshots/02-blackout.png)

![ワイプ](screenshots/wipe.gif)

## レイアウト

| レイアウト | 用途 |
| --- | --- |
| `default` / `monta` | 本文用の基本レイアウト（1スライド1メッセージ） |
| `cover` | 表紙用。`# タイトル` の下に書いた `## サブタイトル` は小さめに表示されます |
| `intro` | 章扉（セクションの区切り）用。デザインは `cover` と同じです |

## ダークモード

OS の設定に連動するほか、Slidev のツールバーからもライト／ダークモードを切り替えられます。

![ダークモード](screenshots/05-dark.png)

スライド全体でダークモード（またはライトモード）に固定したい場合は、headmatter で指定してください。

```md
---
theme: monta
colorSchema: dark
---
```

## 開発

```bash
bun install
bun dev          # example.md（5ページのサンプル）をプレビュー
bun run build    # 静的ビルド
bun run typecheck
```

`bun export` や `bun screenshot` を実行する場合は、別途 `playwright-chromium` が必要です。

## 参考

- [高橋メソッド - Wikipedia](https://ja.wikipedia.org/wiki/高橋メソッド) — 2001年に高橋征義氏が考案した、巨大な文字だけで構成するプレゼンテーション手法。
- **もんたメソッド** — 高橋メソッドの派生手法。テレビ番組でみのもんた氏がフリップの文字を紙で隠し、めくりながら解説していた手法に由来します。
