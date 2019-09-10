---
title: 'noUnusedParametersがtrueでも部分的にignoreできる話'
date: '2019-09-10T01:59:49.395Z'
---

## 背景

[react-native-cli](https://github.com/react-native-community/cli/pull/687) の [good first issue](https://github.com/react-native-community/cli/pull/687) に取り組んでいた時に発見した話

Good first issue の内容は、Flow で書かれていたコードの TS 化である。

## Issue

複数の引数がある関数にて、第 2 引数は使うが、第 1 引数は使いたくないという時にどうすればいいか。

## 例題

例えば以下のようなコードを考える

```ts
function example(dummyParam: any, name: string) {
  return `Hello ${name}`
}
```

tsconfig 上で noUnusedParams が true になっている場合、第一引数を使用しなければ TS でエラーになってしまう。

そもそもそういう設計にするなという話は置いといて、既存 Class の関数を override する時など、こういうケースは結構起こりうる。

## 解決方法

使用しない引数の頭に`_`を追加すれば、noUnusedParams が true の場合でもその引数には適用されない。

```ts
function example(_dummyParam: any, name: string) {
  return `Hello ${name}`
}
```

一番最初の文字が`_`であればいいので、`_`だけにしとけば問題ない。

```ts
function example(_: any, name: string) {
  return `Hello ${name}`
}
```

使用する時は、override している為など、わざわざ使わない引数が存在する理由をコメントで書いて置くと良いだろう。
