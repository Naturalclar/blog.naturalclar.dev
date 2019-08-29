---
title: Chrome Developer ToolsのConsole
date: '2019-08-29T18:00:00.000Z'
---

Chrome Devtool でパッと document 上の全てを検索できるようになりたい人のメモ

[参考](https://developers.google.com/web/tools/chrome-devtools/console/utilities)

## ショートカット

### `command` + `option` + i

検証ツールを開く。

### `command` + `option` + j

検証ツールの console を開く

## Console Command

### \$\_

`$_` は console 上で実行した直近の結果を返す。

### $0 - $4

`$0`, `$1`, `$2`, `$3`, `$4` には最後に検証された DOM Element が入る。
`$0` からは一番最後に検証した DOM Element が帰ってくる。

### \$(selector: string)

`document.querySelector(selector)` の alias

### \$\$(selector: string)

`$$` は `Array.from(document.querySelectorAll(selector))`の alias

document 上の選択した query の配列が帰ってくる。map や filter と一緒に使える。
`$$('div').map(el => el.className)` で div の className の配列が帰ってくる。
`$$('div').forEach(el => el.remove())`で全ての div の表示を隠せる。
