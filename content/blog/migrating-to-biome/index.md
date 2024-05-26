---
title: 'Eslint/Prettier から biome に移行'
date: '2024-05-22T00:26:06.959Z'
---

Eslint/Prettier から biome に移行する際のメモ。

[biome](https://biomejs.dev/) のインストール

```bash
pnpm i -d @biomejs/biome
```

設定ファイルの生成

```bash
pnpm biome init
```

`package.json` の `scripts` に biome のコマンドを追加

```json
{
  "scripts": {
    "format": "biome check --apply ."
  }
}
```
