---
title: 'Cleaning up unavailable XCode simulators'
date: '2019-12-15T12:50:32.429Z'
---

# メモ

最近 Macbook の容量がいっぱいになっていたので、`ncdu` を使って何が容量を食っているかをしらべてみたところ、
XCode の iOS Simulator が容量を食っていることが判明した。

XCode の iOS Simulator 自体は普段の開発で使っているので問題無いとして、どうにかして必要ないものを削減できないかどうか調べていたところ、
XCode の Update 時に発生したであろう、もう既にアクセスできない unavailable な simulator がいくつかあった。

`xcrun simctl list devices` で XCode の Simulator の一覧を表示できるのだが、そのうち unavailable と表示されているものがそうだ。

`xcrun simctl delete unavailable` で使用できない Simulator を消したら30gbくらい空いた。

まあ結局一番容量食ってたの音楽ファイルなんですけどね。

クラウドに保存してローカルはきれいにしてしまおう‥
