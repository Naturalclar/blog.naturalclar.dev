---
title: 'React Native 2020年の振り返り'
date: '2020-12-03T13:00:00.000Z'
---

この記事は [React Native アドベントカレンダー](https://qiita.com/advent-calendar/2020/react-native) の 3 日目の記事です。

去年、[React Native 2019 年の振り返り](https://blog.naturalclar.dev/react-native-review-2019/)を書いたので、今年もやります。

それでは、振り返っていきましょう。

## 2020/01

今年の 1 月は React Native 0.62 の rc リリースを進めていたりと、外部的に目新しいイベントはなかった印象を受けます。
個人的なイベントとしては React Native Community の Org の一員になれたことが大きいです。

前回の記事の最後にて、今年は React Native Community の一員になる！と宣言したのですが、今年入って一週間ちょっとで達成しました。

Community の Discord で facebook や microsoft, callstack のメンバーが議論しているのを見て良い刺激になります。

自分の活動内容としては、[react-native-push-notification-ios](https://github.com/react-native-push-notification-ios/push-notification-ios), [react-native-picker](https://github.com/react-native-picker/picker), [react-native-clipboard](https://github.com/react-native-clipboard/clipboard)、[react-native-progress-view](https://github.com/react-native-progress-view/progress-view) など、元々 React Native の機能の一部として存在していたものを、React Native 本体を軽くするために切り出された Module のメンテナンスを行っています。

他にも react-native 本体や公式ドキュメントの方にもちょくちょく変更を加えています。

## 2020/02

#### 2/5 react-navigation v5 リリース

React Native において画面遷移を行うライブラリの筆頭である、[react-navigation](https://github.com/react-navigation) の v5 がリリースされました。
このリリースでは今までの JSON ベースの設定から React Component ベースの設計にガラッと使い方が変わり、より直感的に使えるようになりました。（その分 Migration も大変だった)
navigation を扱う上で便利な hooks も増え、各画面の設定が楽にできるようになりました。
v5 からは TypeScript で書かれており、v4 と比べて安全に使えるのも魅力的ですね。

#### 2/7 react-native-web v0.12 リリース

[React Native for Web](https://github.com/necolas/react-native-web) とは、React Native のコンポーネントを Web 上でも表示できるライブラリです。
Twitter の Web 版でも使われています。

v0.12 では Lean Core で切り離された React Native の Module の export が廃止されたり、内部で大掃除が起こっています。
また、react-native-web での PropTypes の使用を完全に廃止しており、FlowType が推奨になりました。
長らく更新が入っていない古い React Native のサードパーティモジュール等は、まだ PropTypes を使用しているパッケージもちょくちょくあり、それが Web で使う際に動かないということも発生してしまったりしています。

## 2020/03

#### 3/27 React Native v0.62 リリース

v0.62 が今年最初の React Native のリリースとなりました。
rc は年の初めに出ていたのですが、そこから　 React 関連のイベントがあったり、Flipper の連携などを安定させるため等に結構時間が掛かっていた印象です。

このバージョンの目玉はなんと言っても [Flipper](https://github.com/facebook/flipper) の導入です。これによって React Native のデバッグが格段に楽になりました。

また、React Native のエラー画面も以前の Yellow Box から Log Box に変更され、エラー箇所を特定するのがより楽になりました。

v0.61 から追加された Fast Refresh も相まって、ここから、React Native の開発体験はかなり良いものとなったと感じています。

Appearance Module が追加され、ダークモードの対応が容易になったのもこのバージョンからですね。

#### 3/27 React Native Directory のデザイン変更

[React Native Directory](https://reactnative.directory/) は React Native の周辺モジュールを検索できる便利なサイトです。
以前から存在はしていたのですが、そこまで活発的には使われていませんでした。

この日に大幅なデザインの変更が行われて、React Native の公式ドキュメントに近いデザインになり、検索も使いやすくなりました。

今は [Lean Core](https://github.com/facebook/react-native/issues/23313) の動きもあって、React Native 本体が提供している API を最低限に絞っているので、自分の要求にあったモジュールを探すのに、非常に便利なツールとなっています。

## 2020/04

#### 4/1 Expo SDK 37 のリリース

[Expo](https://expo.io/) は React Native を元に作成されたフレームワークです。

React Native の開発には JavaScript の知識の他に、iOS、Android のビルド知識が一定数必要な場合があるのですが、Expo はそのネイティブのビルド部分等を隠蔽して、JavaScript で完結できる仕組みになっています。

React は書けるけどネイティブ開発の事は何もわからないという人も Expo を使えばより楽にモバイルアプリケーションを書くことができます。

また、Expo は [React Native for Web](https://github.com/necolas/react-native-web) を取り入れており、 React Native で書かれた Web サイトの開発も行うことができます。

Expo SDK 37 では、Web 方面でのサポートをより充実させて、[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler)、や [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) を使ったジェスチャーやアニメーションを含む表示や機能を Web でも使えるようにしています。

## 2020/05

#### React Native Windows + React Native Macos の発表

[MS Build](https://www.youtube.com/watch?v=QMFbrHZnvvw) で Microsoft が React Native Windows + React Native Macos について発表しました。
これ以前から Microsoft Word の一部や Skype の中で React Native が使われていることが判明していたり、microsoft が macos 対応のために react-native の fork を作成していることが話題になっていましたが、この辺から大々的に react-native-windows, react-native-macos の存在を世にプッシュしてきた印象です。

[react-native-webview](https://github.com/react-native-webview/react-native-webview#readme),[react-native-picker](https://github.com/react-native-picker/picker), [react-native-clipboard](https://github.com/react-native-clipboard/clipboard)など、React Native の周辺モジュールにも MacOS や Windows のサポートが追加されています。

javascript を bytecode に変換し処理を高速化する javascript engine である[hermes](https://github.com/facebook/hermes)も windows/macos で使えるようにサポートが入っていて、Electron で作成するよりもパフォーマンスの良いネイティブアプリの開発が期待されます。

## 2020/06

#### 06/20 React Native Reanimated v2-alpha リリース

React Native での描画のアニメーションをネイティブ層で処理することにより、アニメーションを使っていても高いパフォーマンスを維持できるライブラリ、[react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)の v2 のアルファ版がリリースされました。

v2 では、ネイティブ層とのつなぎ込みに [Turbo Modules](https://github.com/react-native-community/discussions-and-proposals/blob/master/proposals/0002-Turbo-Modules.md) の仕組みを使用しており、通常、ネイティブ層とのブリッジで非同期にしか処理できなかったものも、同期的に処理することができるようになり、よりスムーズなアニメーションが実現可能となりました。

Turbo Modules の仕組み自体は、まだ大々的に OSS として切り出せれておらず、サードパーティでの組み込みが厳しい状態となっているなか、それを取り組み始めているサードパーティモジュールの一つとしてとても注目されています。

## 2020/07

#### 07/09 React Native v0.63 リリース

React Native 本体の新しい stable リリースが行われました。
このリリースでは `Pressable` という新しい Component が作成されています。
Pressable は[先日の Advent Calendar の記事](https://zenn.dev/nekoniki/articles/ef304778ada8a6)にも詳しい情報が乗っているのでそちらを参照してみてください。

今まではボタンなど、画面内の要素をタップしたときに何かを実行させるための Component として`TouchableOpacity`など、`Touchable~`系の Component が存在していました。
しかし、`Touchable~` は押したときに独自のアニメーションが掛かっており、プラットフォーム特有のフィードバックを返せていないという問題がありました。
Pressable は押された時の状態を持っていて、押す前と押されたあとで自由に UI を制御できる他、Android で押した時の Ripple Effect 等、ネイティブのボタン機能にも対応しています。
また、`hitSlop` という prop でボタンの押せる範囲を広げたりと、幅広い使い方ができるようになりました。

`Touchable~`系の Component は v0.65 から deprecated される案も出ているので、これからは `Pressable` を優先的に使っていくと良いでしょう。

## 2020/08

#### 08/13 React Native Web v0.13 リリース

React Native Web の v0.13 がリリースされました。
このバージョンでは、 React Native v0.62 で追加された `Apprearance` や、 v0.63 で追加された `Pressable` が追加されています。

## 2020/09

#### 09/03 React Native EU 2020 開催

[React Native EU 2020](https://www.react-native.eu/)という技術カンファレンスが開催されました。
今年はコロナ禍ということもあり、全員リモートでの開催でした。
React Native の最新情報や、React Native を使っている現場がどのように活用しているか等、様々な発表がありました。

自分もこのカンファレンスで Visual Regression Test について発表させていただきました。
このような大きい技術カンファレンスでの発表は初めてだったので良い経験になりました。

## 2020/11

#### 11/10 React Native Web v0.14 リリース

React Native Web の v0.14 がリリースされました。
このバージョンでは、React Native には存在していたが長らく Web でのサポートがなかった Modal Component が Web 対応されました。
自分は Component の開発のために React Native Web と Storybook を組み合わせて使っているのですが、今までは Modal の Component の使用感が Web で確認しづらい状態だったのが、これによって大きく改善されました。

また、前回のリリースで追加された Pressable に、従来の押された状態の他に、Hover された状態や Focus された状態など、Web ならではの状態が追加されました。
この追加によって、React Native  で書かれたコンポーネントでも、より Web に寄り添った体験を手軽に提供できるようになりました。

#### 11/23 React Native v0.64 rc リリース

React Native 本体の rc リリースが行われました。
このバージョンでは iOS でも hermes が使えるようになります。React Native での iOS アプリの開発は Android と比べて、雑にやってもそこそこ良いパフォーマンスが体現できるような印象でしたが、Hermes の使用によってさらなる改善がされるかどうか、注目どころです。

また、hermes のバージョンも上がり、hermes の中で Proxy が使用できるようになりました。Proxy は MobX, Immer (Redux Tool Kit), react-native-firebase など、多くの React Native 開発者が使っているライブラリの中で使われていたので、それらのライブラリを使っていても hermes で動くようになったのはかなり朗報です。

#### 11/26 React Native Reanimated v2-rc リリース

先述の React Native Reanimated v2 の rc 版がリリースされました。Stable リリースされる日も近いかもしれません。
alpha 版では、Turbo Module の対応の為にアプリのネイティブ側のコードの変更が必要だったのですが、その手順が必要なくなっています。
Turbo Module 対応がライブラリ内部で完結できる例として、今後 Turbo Module を他の Modules でも使うようにする側としては、とても参考になります。

#### 11/26 React Native Skia の Linux 対応リリース

[React Native Skia](https://github.com/Kudo/react-native-skia)は[React Native EU 2020](https://www.react-native.eu/)で発表されたライブラリの一つです。
[react-native-v8](https://github.com/Kudo/react-native-v8)の作者、Kudo Chien 氏が JSI 等、React Native の新しいアーキテクチャをフル活用して、React Native 内で Skia を使って画面を描画するといった PoC なのですが、そこになんと、[Linux 上でも描画できるようにする PR](https://github.com/Kudo/react-native-skia/pull/4)が出されました。 まだ PoC の範疇ですが、これをもとに Linux のアプリも React Native で書けるといった未来があるかもしれません。

## 最後に

今年も React Native の開発周りは大きく変更されてきました。
特に、年初のアップデートによりデバッグが快適になったのはそのまま良い開発体験に直結してくると感じています。
React Native で散々遅いと言われてきたパフォーマンス問題に関しても、hermes のアップデートや Turbo Module の普及化によって日々日々改善されており、JavaScript で手軽にアプリが書けるというのは JavaScript を普段から書いている開発者にとってはとても喜ばしいことですね。

Microsoft の参入による Windows、 MacOS のサポートや、React Native Web の開発が少し活発になってきたことによって、React Native の世界は iOS/Android だけに留まらない存在になってきました。

他になにか思いついたら追記します。
