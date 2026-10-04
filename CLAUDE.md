# カルテ（美容師向け顧客カルテ PWA）

iPhoneのホーム画面から使う、依存ゼロの1ファイルPWA。元は claude.ai の Artifact「カルテ」。
公開は GitHub Pages（ユウタクエストと同じ構成）。

## ファイル
- `index.html` … 本体（HTML+CSS+JS すべてインライン）
- `manifest.webmanifest` / `sw.js`（アプリシェルのオフラインキャッシュ） / `icon-*.png` / `apple-touch-icon.png`
- `icon-src/icon.svg` … アイコン原本。`qlmanage -t -s 1024 -o icon-src icon-src/icon.svg` → `sips -z` で各サイズ生成
- ローカル確認: `python3 -m http.server 8124` → http://localhost:8124/

## データ
- すべて端末内の IndexedDB `karte`（store `docs` = パス→ドキュメント, store `blobs` = 写真ID→{type, buf}）
- 画面側は旧ランタイムと同じ形の `DB.doc(path)` / `DB.collection(name)` / `ASSETS` / `DL` を使う（index.html 末尾の LocalDB 等）
- 写真表示は `blobUrl(id)` → Object URL。開いている顧客の分だけ保持し、`preloadPhotos()` で入れ替え時に revoke する
- バックアップ: 登録タブ →「バックアップ」。ZIP（無圧縮・自前実装）に `data.json` と `photos/<id>`

## 変更時のルール
- UIの文言はすべて日本語。常体ではなく丁寧な表現
- データモデル（customers / charts / sales / meta）のスキーマは変更しない
- 部位7種（PARTS）と色（PARTCOLOR）の対応は変更しない
- デザイントークン（:root の配色・角丸・フォント）は勝手に変えない
- 配合オブジェクトは必ず `chemItems()` 経由で読む（単数形 `item` の旧データ互換のため）
- 配合 `{part, items[], dev, ratio, min}` の `dev`（2液）は2026-10-04に追加した任意項目。無い旧データは空として扱う
- ライブラリ追加は事前に相談する。現状は依存ゼロ
- ユーザー入力を innerHTML に入れる箇所は必ず `esc()` を通す
- index.html などシェルを変えたら `sw.js` の `CACHE` の版数を上げる
