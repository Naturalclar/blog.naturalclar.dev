---
title: 'Future of React Native'
date: '2020-02-05T16:37:46.346Z'
---

この記事は [Meguro.es #25](meguro-es) で登壇する内容です。

## はじめに

最近 [React Native Community](react-native-community) の Github org の一員となりました。
Community の一員になれた経緯はまた別の記事で書こうと思います。
Community の一員として Contributors の Discord channel に招待されて、色々な知見が手に入るので、今回はその一部をシェアします。

## The New React Native 

2020年は React Native が大きく変わる年になります。
現在、React Native は内部のプロセスが大きく変わろうとしています。
去年、いくつかの技術カンファレンスにてこれから来る変化についての発表がありました。

[The New React Native - React Native EU](https://www.youtube.com/watch?v=52El0EUI6D0)
[React Native: the Past, the Present and the Future - React Advanced](https://www.youtube.com/watch?v=7gm0owyO8HU)

## いままで

今まで内部的にどう動いていたのか。
まず、JavaScript の方は、見た目を司る React Component、そして、Native 層の Module の呼び出すための Native Module ファイルが存在しています。
一方 Native の方は、UI の情報を持つ ViewManager、そして実際の Native の機能をそれぞれの言語（Obj-C、Java）で実装したコードがあります。
これらはすべて、Bridge と呼ばれるものでつながっており、互いに JSON に変換して、非同期的に通信を行っています。

| JavaScript | | Native |
| --- | --- | --- |
| React Component | | ViewManager |
| | Bridge | |
| Native Modules | | Native Implementation (Obj-C, Java) |

JSC

通信は非同期でバッチされています。つまり、JS側は Native の知識が全くなく、Native もまた JS 側の知識を全く持っていない上程です。
通信がバッチ処理で非同期で行われている以上、どのタイミングでコードが呼び出されるかわからないため、React Native ではスタートアップ時にすべてのコードを Bundle しています。

## JSI

JavaScript Interface

JavaScript と C++ を同期させるための Interface。
Call functions between JS & C++
Create & access JS Object from C++

JavaScript から直接 C++ を呼び出すようになります。

## Turbo Modules

Native Module

Early 2020.

## React Native Fabric

Renderer

UI を同期的に描画します。
Turbo Modules 

Mid 2020.

## Removal of the Bridge

Bridge
Native Startup
JavaScript Initialization
Network + Server
JS Renderer
Native Render

Late 2020

## Codegen





[meguro-es]:https://meguroes.connpass.com/event/159506/
[react-native-community]:https://github.com/react-native-community

[WIP] TalkScript

Future of React Native と言うタイトルで発表させていただきます。
Naturalclar です。アメリカ人です。株式会社 Cure App でエンジニアとして React Native を使って治療アプリを開発しています。
また、React Native Community の Github Org に所属していて、いくつかのパッケージのメンテナンスをしたり、React Native 本体への Contribute を行っています。

今日は、近年 React Native の内部で起きている変化について、そして React Native が今年どこへ向かっているのかについて発表します。

そもそも React Native を使ったことがある人ってどのくらいいますか？

React Native とは、Facebook が開発している、クロスプラットフォームのフレームワークで、React でコードを書いたら、それが iOS や Android といったモバイル環境で動くようになります。

最近は Microsoft が React Native Windows に力を入れていて、Windows のネイティブアプリも React Native でかけるようになっています。
また、最近の iOS のアップデートで、iPad のアプリを macos のネイティブアプリとして使う技術も出てきたので、iPad のアプリをかける React Native は、実質 mac os のネイティブアプリがかけます。

また、React Native Web と言うライブラリもあって、これは、React Native で書かれたコードがウェブ上でも動かせるようになるものです。つまり、ウェブで動く React から モバイルで動く React Native が生まれ、その技術を使って、ウェブで表示しています。ちょっと何言ってるかわからないですね。

つまり、React Native は Learn once, write everywhere, これを学ぶだけでどの環境でも動く、そういったフレームワークであると言うことです。

それが内部的にどう動いていたのか。

まず、JS側は、React で書かれたコードを Metro Bundler という Facebook 独自の webpack のような bundler を使って一つの bundle にしています。 そして、Native 側は iOS なら Objective-c, Android なら java といったネイティブで動かす用のコードが用意されています。これら2つの存在が互いに通信するための Bridge が用意されています。これは Queue のようなもので、JSON を使ってお互いに通信しています。 

2020年は React Native は生まれ変わります。


