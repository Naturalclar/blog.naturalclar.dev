---
title: 'What's new in React Native 0.62'
date: '2020-03-21T08:48:32.044Z'
---

この記事は [React Native Tech Blog #2]() で発表する内容です。

React Native の最新バージョン、0.62 のリリースが迫ってきました。
マイナーバージョンのアップデートは最後に行われたのが 2019年の9月なので半年ぶりのマイナーバージョンアップとなります。

この記事では 0.62 で新しくなったことについてまとめて行きます。

## Flipper のサポート

Facebook が開発している Flipper というデバッグツールがあります。
0.61 の頃から、組み込む設定を手動で行えば使うことができたのですが、0.62 ではデフォルトで組み込まれています。


## LogBox

React Native のエラー画面の見た目が大幅に変更されます。
機能自体は experimental なものなので、`index.js` や `App.js` などのエントリーポイントにて、`unstable_enableLogBox()` を呼び出すことで新しい LogBox の UI が有効化されます。

## Appearance API

`useColorScheme`

## Catalyst を使った MacOS 用のビルド

