# AGENTS.md

[Slidev](https://sli.dev) のテーマ「monta」。1スライド1メッセージを巨大な文字で表示し、
`v-click` を黒塗りにして、クリックで左からワイプして見せる。

開発用のデッキは [example.md](example.md)（headmatter は `theme: ./`）。README の画像はこのデッキから撮っている。

## 構成

| パス | 役割 |
| --- | --- |
| [setup/unocss.ts](setup/unocss.ts) | 配色・フォント・`monta-*` ショートカット |
| [setup/shiki.ts](setup/shiki.ts) | コードブロックのテーマ |
| [setup/transformers.ts](setup/transformers.ts) | ソースの改行を `<br>` に変換 |
| [components/MontaStage.vue](components/MontaStage.vue) | フォントサイズのフィット、Web フォント待ち、描画後の補正 |
| [layouts/](layouts/) | `default` / `monta` / `cover` / `intro` |
| [styles/index.ts](styles/index.ts) | `layouts-base.css` → `layout.css` の順に import |
| [styles/layout.css](styles/layout.css) | スライド面、巨大表示、黒塗りとワイプ |

`styles/index.ts` の import 順は意味を持つ。逆にすると `@slidev/client` の `p` / `h1` 既定スタイルに負ける。

## 崩してはいけない前提

### フォントサイズは文字数から計算する

[MontaStage.vue](components/MontaStage.vue) は、行数と各行の文字数からサイズを二分探索する（`CHAR_WIDTH` / `LINE_HEIGHT`）。
描画されたレイアウトを実測する方式は試して捨てた。スライド遷移中や Web フォント差し替え中はレイアウトが確定しておらず、
サイズが暴れて 1 枚のスライドが 67px↔64px で振動した。実測に戻すと再発する。

同じ理由で `.monta-content` に `ResizeObserver` を付けない。フィット自身がテキストをリサイズするので、
観測 → 再フィットのループになる。監視してよいのは `.monta-stage` だけ。
はみ出しの安全網は `verifyFit()`（次フレームで実描画を確認し、はみ出していたら 6% ずつ縮める）に閉じ込めてある。

折り返しの扱いも仕様。折り返しを許したサイズと「各行を折り返さない」サイズの両方を出し、
後者が前者の 55% 以上なら後者を採る。これで「…の応 / 用」のような孤立行を避けている。

### 改行は `setup/transformers.ts` が `<br>` に変換する

Markdown の改行はスペースになり、さらに Vue のテンプレートコンパイラがスペースを潰すので、CSS では戻せない。
パース前に各行末へ `<br>` を補っている。

- 末尾 2 スペース（Markdown のハードブレイク）では駄目。`<v-click>` から始まる行は markdown-it では HTML ブロック扱いになり、スペースがただの空白になる。
- 見出し・リスト・表・コードブロック・frontmatter は対象外。対象を増やすときは `SKIP` に条件を足す。
- この変換があるので、`p` は `.monta-content` 内で `display: inline`。Slidev はコンポーネントを含む段落をインラインに潰すため、
  ブロックのままにすると `<br>` と段落境界で行間が二重になる。

### 黒塗りは `::after` のオーバーレイ

[v-click のスタイル](styles/layout.css) は、文字色を透明にするのではなく、`position: absolute` の疑似要素で文字の上を覆う。
色を透明にすると、ワイプの途中で下の文字を出せないため。

- `inset` は上下だけ広げる（`-0.04em 0`）。左右に広げると隣の文字の端を削り、隠れている間だけ隣が細く見える。
- `transform: scaleX()` を `transform-origin: right center` で 1 → 0 にし、左から右へ開く。`transition` は `0.25s cubic-bezier(0.7, 0, 0.84, 0)`。
- `v-click` のクラス変化では再フィットしない（[MutationObserver](components/MontaStage.vue) は `childList` のみ監視）。アニメーション中に折り返しが動くため。

### ダークモード

配色は「紙・インク・黒塗り」の三色で、`html.dark` で CSS 変数を差し替える。黒塗りはインクと同じ色のベタ。
`package.json` の `slidev.colorSchema` は `both`（テーマ側で固定しない）。

## 作業するとき

- 変更は実際にレンダリングして確かめる。`bun dev` で開発サーバを立て、スライドごとに文字サイズと `scrollHeight` が収まっているかを見る。
  見た目を変えたら [screenshots/](screenshots/) を撮り直す（README が参照している）。
- `setup/*.ts` と `package.json` は起動時に読まれるので、変更したら開発サーバを再起動する。CSS・layouts・components は HMR で反映される。
- `bun run typecheck` の対象は `setup/**` と `styles/**` だけ（[tsconfig.json](tsconfig.json)）。`.vue` は型検査されないので、ビルドも通す。
- テーマから `@slidev/client` のサブパスを import しない。`@slidev/client/layoutHelper` は解決できずスライドがエラーになる。ルートから import する。

## 慣習

- コメントは「何をしているか」ではなく「なぜそうしているか」を書く。過去に踏んだ罠（上の前提）は、理由ごと残す。
- スライド本文・README・AGENTS.md は日本語。コードとコメントは英語。
- `example.md` は README の図の元でもあるので、5 ページ構成と `v-click` の位置を変えたら画像も更新する。
