---
title: 'React Native 2019年の振り返りと今後について'
date: '2019-12-03T13:47:58.582Z'
---

この記事は [React Native アドベントカレンダー][qiita-react-native-advent-calendar]の 3 日目の記事です。

どうも、Naturalclar([@natural_clar][twitter-account]) です。
普段の業務では、[Expo][expo] ではなく `react-native init` で作成された、いわゆる素の React Native で開発しています。

先日の[ハムカツさんの記事][qiita-prev]が今年の Expo に対する振り返りをやっていたので。
自分の方は素の React Native についての2019年の振り返りと、React Native の未来について語ろうと思います。

## 2019/01

#### 1/25 React Native v0.58 リリース

v0.58 が今年最初のReact Native のリリースとなりました。
この辺から React Native でも TypeScript のサポートが増えてきた感触です。

今年は日本で [TypeScript Meetup][connpass-typescript-meetup] が開催されたり、国内で TypeScript が爆発的に広まってきた一年でしたね。

今では[react-native-typescript-template][react-native-typescript-template]を使って、コマンド一つで typescript 対応済みの react-native プロジェクトが作成できます。

```
npx react-native init MyApp --template react-native-template-typescript
```

## 2019/02

#### 2/3 React Native Lean Core

React Native のリポジトリに [Lean Core][lean-core-issue] の Issue が立ちました。

Lean Core とは React Native の意向の一つで肥大化する React Native のリポジトリを軽くしようという試みです。
Checkbox, Async-Storage, WebView, Cli 等、必ずしも本体に含まれていなくても良い Package を React Native Community に移管して、React Native 本体から削減されていくことになります。

Umbrella 方式の `Good first issue` として立ち上がり、自分も参加コメントをしたのですが、まだ Native Component 周りの自信がなく、チキってしまったため、やれずじまいでした。

ここで Contribute して、分割された Package のメンテナーに名乗り出た人はもれなく React Native Community のメンバーになれて、Core Team の Discord にも招待されていたので、ここでやっていきを見せなかったことは今年一番の後悔した点です。

## 2019/03

#### 3/12 React Native v0.59 リリース

v0.59 の目玉はなんと言っても Hooks ですね。
Hooks を導入した React 16.8 が React-native にも入ったので、多くの React Native 開発者が待ち焦がれていたのではないかと思います。

上述の Lean Core の Package も徐々にリリースされはじめました。
Lean Core に含まれている Package を React Native 本体から使っていた場合、Deprecation Warning が表示されていました。

また、React Native のアップグレードをするにあたって非常に便利なツールであった、[pvinis氏][github-pvinis] の [rn-diff-purge][rn-diff-purge] が react-native 公式でも勧められるようになりました。
rn-diff-purge は react native community に移管され、それを元に作成された GUIツールの [upgrade-helper][upgrade-helper] も実装されました。

React Native のアップグレードには毎回苦労されており、その度に rn-diff-purge にはお世話になったので、それが公式化されたことは個人的にとても喜ばしかったです。

## 2019/07

#### 7/3 React Native v0.60 リリース

v0.60では、Native Module周りの仕様が大幅に変わりました。
Androidの方は すべての Package が Android X 対応され、Jetifier が React Native に自動的に組み込むようになりました。
iOS の方は Native Modules をすべて CocoaPods を使って組み込むようになりました。

今まで、`react-native link` を使ってつなぎ込んでいた Native Modules が Android では自動的に、iOS の方では `pod install` を実行するだけですべてが揃う様になりました。
このアップデートで Native Modules とのつなぎ込みはだいぶ楽になりました。

また、Android の方は Facebook が新規実装した JS のエンジンである [Hermes][hermes] が試験的に導入されました。
Android の実行速度がこれにより格段に速くなりました。

前の Version で Deprecation Warning が表示されていた、 Lean Core で分割されたパッケージはここから React Native 本体からは外されました。

#### 7/11 react-navigation-hooks

react-native の主要 Routing ライブラリの一つである [react-navigation][react-navigation] が、Hooks ライブラリの [react-navigation-hooks][react-navigation-hooks] をリリースしました。
これによって、今まで props で渡していた navigation を `useNavigation` を使って、Context内のどのComponentからも取得することができるようになりました。
より汎用的なnavigationが行えるようになり、とても便利になりましたね。

#### 7/11 react-redux v7.1.0

同日に、[react-redux][react-redux] の7.1.0もリリースされました。

このアップデートでは `useSelector`や`useDispatch`が追加され、redux と繋ぎこむのに `connect` は不要の時代となりました。

`redux-thunk` や `redux-saga` も hooks でリプレイス出来るようなった、まさに大Hooks時代の幕開けと言えたでしょう。

### 2019/08

#### 8/27 React Native v0.61 リリース

v0.61にて、Fast Refreshが実装されました。
エミュレータ上で開発する上で、ファイルの変更の反映がかなり爆速になったので、Emulatorでそのまま実装するのも苦ではなくなりました。
自分は [react-native-web][react-native-web] と [Storybook][storybook] を駆使して、Emulator を立ち上げずに react-native の実装を行っていたのですが、このバージョンからは Emulator 上でもサクサク実装出来るので、どっちも使うようになりました。

また、地味に Metro Bundler が `console.log` を出力するようになったので、[react-native-debugger][react-native-debugger] などを立ち上げなくても debug が容易になりました。

この二つの変更と、v0.60 での Native Module の繋ぎこみがだいぶ楽になったおかげで、自分は正直Expoはもう使わなくても良いのではないかと思うくらい、素のReact Nativeでの開発が快適になったように感じます。

実際、Expo では共通の Expo サーバを使ったアプリのビルド待ちがあるため、Expo よりも React Native での開発のほうが効率的とさえ思います。

以上が、今年の React Native の大まかな振り返りとなります。

## React Nativeの今後について

この一年で React Native は大幅に変更が加わり、開発体験もかなり良くなってきたと感じています。
では、これからの React Native はどうなっていくのでしょうか？

#### 次回のReact Native リリース

次の React Native v0.62では、先日新調された [react-devtools][react-devtools] が組み込めるようになり、 Nest が深い Component もだいぶ見やすくなる見込みです。

#### React Navigation のアップデート

[React Navigation][react-navigation-next]は v5 が絶賛開発されています。
v5では今までの形と大幅に変わり、React-routerに近い形の使い方になるみたいです。
自分は今までのReact-navigationの形は悪くないと思っていたのですが、どういう風に変わっていくのか期待と不安が半々といったところです。

いまでも[react-navigation@next][react-navigation-next]で試せるので、興味があったらぜひ使ってみてください！

#### Reason React Native の活動再開

[Reason][reasonml] と React Native の Bridge であった `bs-react-native` は、主な使用者であった Callstack が使用するのをやめてしまったため、しばらく動きが無い状態でした。
ですが、最近 [reason-react-native][reason-react-native] として活動を復活されたので、個人的にはとても注目しています。

React Native v0.60が出た頃に活動が見受けられ、先日 v0.61 対応のアップデートが入りました。

Reason で書かれたコードはビルド時間も高速になり、開発体験がとても良い、今後の成長が期待出来る言語です。
Reason React Nativeはまだまだ人が少なくサポートも少ないので、自分が中の人になれるチャンスも大きくあると思っています。
今後自分でもライブラリのサポートやライブラリ自体に貢献していこうと思っています。

#### モバイル以外にも広がっていく React Native

React Native は基本的に iOS や Android のモバイルアプリを作成するものとして使われてきましたが、他にも色々な可能性を秘めています。

Chain React Confで発表された、[MicrosoftがForkしたReact Nativeのリポジトリ][react-native-microsoft]も注目しています。
Microsoftでは[react-native-windows][react-native-windows]を使ってOffice 365等のデスクトップアプリを一部React Native を用いて開発しています。
この Microsoft が Fork した React Native のリポジトリでは、React Native を使って Mac OS のネイティブアプリを作れるように変更を加えていくとのこと。
Facebook, Microsoft, Appleの夢のコラボです。

AppleはAppleで、iPad用のアプリをMac OSのネイティブアプリに変換する[Mac Catalyst][mac-catalyst]を発表しました。
React Native で iPadのアプリを開発すれば、それもMac Catalystを使ってネイティブアプリに変換できる模様。
夢が広がりますね。

#### 更に未来へ

React Native は今後、さらなる変更を控えています。

JavaScript を C++ に変換してさらなるマルチプラットフォームを狙う `JSI`、
Native Modules との繋ぎこみを加速し、さらなるネイティブの体験を提供していく `Turbo Modules`、
JS と Native Modules の繋ぎこみを自動化する `CodeGen`。
これらは [React Native Fabric][react-fabric] というプロジェクトで今後実装されていく予定のものです。

詳しくは先日、React Advanced にて React Native Community の Core Memberである Kelset が発表した React Native の未来にて語られています。
これからの React Native にもかなり期待できると個人的に思っています。

https://www.youtube.com/watch?v=7gm0owyO8HU

React Native: the Past, the Present and the Future - Lorenzo Sciandra

## 最後に

今年は React Native 本体や Cli などの周辺ツールに小さい Contribute をしてきましたが、
来年は本腰をいれて React Native Community の一員になるために活動していくつもりです。
React Native Communityにある何かしらのLibraryのMaintainerを目指していきます。

滑り込みの記事ですみません。Naturalclarでした。

React Native Advent Calendar, 4 日目は キッチハイクの ariiyuさん([@ariiyu][twitter-ariiyu])です。

[react-native-microsoft]: https://github.com/microsoft/react-native
[reason-react-native]: https://reason-react-native.github.io/en/docs/
[hermes]: https://github.com/facebook/hermes
[react-fabric]: https://github.com/react-native-community/discussions-and-proposals/issues/4
[react-devtools]: https://github.com/facebook/react/tree/master/packages/react-devtools
[react-navigation-next]: https://reactnavigation.org/docs/en/next/getting-started.html
[lean-core-issue]: https://github.com/facebook/react-native/issues/23313
[rn-diff-purge]: https://github.com/react-native-community/rn-diff-purge
[upgrade-helper]: https://react-native-community.github.io/upgrade-helper/
[github-pvinis]: https://github.com/pvinis
[qiita-react-native-advent-calendar]: https://qiita.com/advent-calendar/2019/react-native
[qiita-prev]: https://qiita.com/watanabe_yu/items/e59008eda79356d23918
[twitter-account]: https://twitter.com/natural_clar
[react-native]: https://facebook.github.io/react-native/
[expo]: https://expo.io/
[react-native-typescript-template]: https://github.com/react-native-community/react-native-template-typescript
[connpass-typescript-meetup]: https://typescript-jp.connpass.com/
[react-native-web]: https://github.com/necolas/react-native-web
[storybook]: https://storybook.js.org/
[react-native-debugger]: https://github.com/jhen0409/react-native-debugger
[react-navigation-hooks]: https://github.com/react-navigation/hooks
[react-redux]: https://github.com/reduxjs/react-redux/
[react-native-windows]: https://github.com/microsoft/react-native-windows
[mac-catalyst]: https://developer.apple.com/mac-catalyst/
[twitter-ariiyu]: https://twitter.com/ariiyu
[react-navigation]: https://reactnavigation.org/
[reasonml]: https://reasonml.github.io/
