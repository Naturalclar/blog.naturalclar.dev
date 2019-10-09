---
title: 'BigInt is now stage-4 in tc39 proposals'
date: '2019-10-09T00:48:38.738Z'
---

## 概要

先日、[BigInt][bigintproposal]が stage-4 に上がった。

[#tc39_study][#tc39_study](申し込んだ当時は stage-2 だった)で話す為に何ができるかをぱっとまとめる。

## BigInt とは

通常、JavaScript で Int を使う場合、安全に使える最大数は `2^53-1` です。数字にすると、`9007199254740991`。9 千兆ですね。5 千兆円より高い。It's Over 9000.

それ以上の数字は、扱うことはできますが、動作が不安定となります。

```js
const a = Number.MAX_SAFE_INTEGER
// 9007199254740991, 2^53-1

const b = a + 1
// 9007199254740992

const c = a + 2
// 9007199254740992 <- 上と値が同じ

const d = a + 4
// 9007199254740996
```

BigInt を使えば、2^53 を超える数字を安定して扱うことができます。

## Syntax

BigInt は、数字の末尾に`n`を付けて定義するか、BigInt のコンストラクタを使って定義できます。String からも Cast できます。

```js
const x = 9007199254740991n
const y = BigInt(9007199254740991) // 9007199254740991n
const z = BigInt('9007199254740991') // 9007199254740991n
```

BigInt では次の演算子が Int と同じ様に `+`, `-` , `*` , `**` , `%` , `/` 使えます。
ただ、BitInt には小数点が存在しないため、`/` の結果はすべて切り捨てられます。
ビット演算子は、`>>>` (0 埋め右シフト)以外は使えます。

```js
// code taken from https://github.com/tc39/proposal-bigint
const previousMaxSafe = BigInt(Number.MAX_SAFE_INTEGER);
// ↪ 9007199254740991

const maxPlusOne = previousMaxSafe + 1n;
// ↪ 9007199254740992n

const theFuture = previousMaxSafe + 2n;
// ↪ 9007199254740993n, this works now!

const multi = previousMaxSafe * 2n;
// ↪ 18014398509481982n

const subtr = multi – 10n;
// ↪ 18014398509481972n

const mod = multi % 10n;
// ↪ 2n

const bigN = 2n ** 54n;
// ↪ 18014398509481984n

bigN * -1n
// ↪ –18014398509481984n

const expected = 4n / 2n;
// ↪ 2n

const rounded = 5n / 2n;
// ↪ 2n, not 2.5n

0n === 0
// ↪ false

0n == 0
// ↪ true

1n < 2
// ↪ true

2n > 1
// ↪ true

2 > 2
// ↪ false

2n > 2
// ↪ false

2n >= 2
// ↪ true
```

BigInt と Int が混合した配列で`sort()`を行った場合、混合した状態で Sort が行われます。

```js
const mixed = [4n, 6, -12n, 10, 4, 0, 0n]
// ↪  [4n, 6, -12n, 10, 4, 0, 0n]

mixed.sort()
// ↪ [-12n, 0, 0n, 10, 4n, 4, 6]
```

## 比較

BigInt と Number の比較について

## ユースケース

BigInt のユースケース

[bigintproposal]: https://github.com/tc39/proposal-bigint
[#tc39_study]: https://web-study.connpass.com/event/147538/
