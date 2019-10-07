---
title: 'using node-libs in react native'
date: '2019-10-07T09:55:52.285Z'
---

## 概要

react-native/Expo プロジェクトで`path`や`process`などの node 標準で存在するが react-native 上で用意されていないライブラリを使う方法。

## 背景

とあるプロジェクトで、api から取得した HTML の文字列を [`unified`](https://unifiedjs.com/) を使って react-native 用の `Text` component に変換したかった。

だが、`unified` は react-native 上で提供されていない`process.cwd`を使用する為、ランタイムエラーが発生していた。

## 対処法

いくつか方法があるが、手っ取り早いのは、[`node-libs-react-native`](https://github.com/parshap/node-libs-react-native)を組み込んでしまうこと。

`node-libs-react-native`は react-native に node の標準ライブラリの mock を提供を提供するライブラリである。

対象となるライブラリの一覧は[こちら](https://github.com/parshap/node-libs-react-native#modules)に記載されている。

使い方は以下に記載する。

### インストール

```
yarn add node-libs-react-native
```

### metro.config.js の設定

react-native,または expo のプロジェクトが入っているルートディレクトリに、`metro.config.js` というファイルを作成し、以下の内容を入れる。

```js
module.exports = {
  resolver: {
    extraNodeModules: require('node-libs-react-native'),
  },
}
```

`metro.config.js` (旧: `rn-cli.config.js`) とは、react-native が使用している bundler である`metro`の設定ファイルである。

### node-libs-react-native の import

`App.tsx`などのアプリのエントリーポイントに以下の内容を追加する。

```jsx
import 'node-libs-react-native/globals'

...
export default App
```
