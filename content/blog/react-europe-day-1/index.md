---
title: 'React Europe Conference Day 1 まとめ'
date: '2020-05-14T09:57:03.315Z'
---

2020/05/14 に開催された [React Europe](https://www.react-europe.org/) を一部視聴していたのでそのレポートを書きます。
最近、この手の技術カンファレンスがオンラインでリアルタイムで見れる用になり、登壇者も世界中から参加できるようになりましたね。

React Europe ではオンラインカンファレンスの他に、２日に渡るオンラインワークショップもあり、React、React Native 関連の強い人からのオンラインハンズオンなどが開催されていたみたいです。

## トークまとめ

各トークの概要やタイムテーブルなどは[公式サイト](https://remote.reactsummit.com/)に記載されています。

ツイッターでは [#ReactEurope](https://twitter.com/hashtag/ReactEurope) のハッシュタグでつぶやかれています。

また、[Discord](​https://discord.gg/r6yjG2g) にて質問を募集していました。

YouTube Live のリンクは[こちら](https://www.youtube.com/watch?v=41Ia291KIvI)

#### The State of React

React Europe カンファレンス最初のトークは、[@johnadetutu93](https://twitter.com/johnadetutu93)による State of React という発表でした。

彼は [react-spring](https://www.react-spring.io/) という React のアニメーションライブラリの開発チームの一員で、発表内容も react-spring にフォーカスしているものでした。

react は [hooks api](https://reactjs.org/docs/hooks-reference.html) が導入されて以来、その便利さに使用者が爆発的に増えています。

react-spring も例外ではなく、`useSpring` や `useTransition`, `useChain` などのカスタムフックが実装され、より便利にアニメーションが作成できるようになりました。

このトークではライブコーディングを交えて、React Spring を hooks でどう動かすかについて紹介していました。

ただ、Reactの性質上、現状のAPIでは、Componentが画面を去る際にアニメーションをつけるのは難しい状態です。
その問題について、[rfc](https://github.com/reactjs/rfcs/issues/128)が上がっていたり、今後の Concurrent Mode でどう変わっていくかには要注目です。

#### On Next.js

２つ目のセッションでは、Vercel (旧ZEIT) のエンジニアである[@timneutkens](https://twitter.com/timneutkens)が Next.js について話していました。

Next は React を使ってアプリを高速で書けるフレームワークです。

このセッションでは、新しくリリースされた Next 9.4 によって追加された機能について、実演を交えながら説明していました。

以下は説明されていた機能の一部です。

- Preview Mode: Nextで立てられたサイト内容を変更した際、デプロイ前の内容を他の人にも見れる様なリンクを作成する

- Incremental Generation: 一度キャッシュされたページからdiffを取ることによって、デプロイ時に変更が高速で本番に反映される機能。

- Fast Refresh: この機能が追加されたことにより、Component の State をリセットすることなく、Component の変更が即時に反映できるようになった。


#### Bringing webgl to react

３つ目のセッションでは、react-springなどのライブラリの作者である[@0xca0a](https://twitter.com/0xca0a)がreact-three-fiberについて話していました。

[React Three Fiber](https://github.com/react-spring/react-three-fiber) は React で Webgl を扱えるようになるライブラリです。[Three.js](https://threejs.org/) をベースとして作られており、Three.js の機能をすべて使うことができます。Three.js の Wrapper では無いので、Three.js に大きな変更があったとしても、React Three Fiber は継続して使用することができます。

React Reconciler をベースとして作られており、DOMを持たないので、Webではもちろん、React Native を使って Mobile でも使うことができるようです。

また、[drei](https://github.com/react-spring/drei)という react-three-fiber のヘルパーについても少し説明されていました。`<HTML/>`というComponentを使うことで、webglの中にhtmlの内容を埋め込めるというのを実演していました。

# Scaling the Web with Gatsby

前半最後のセッションは Gatsby のコアチームの一員である[@chatsidhartha](https://twitter.com/chatsidhartha) が、Gatsby のこれまでと今後について話していました。

[Gatsby](https://www.gatsbyjs.org/) は React を使ってページを作成したり、GraphQLを使ってデータを取得して、少ない手順で静的サイトを作成できるフレームワークです。

このトークは静的サイトジェネレーターの歴史から始まり、それらの利点、そして欠点について話していました。

多くの静的サイトジェネレーターの欠点の一つは、ページ数が多くなるにつれビルド時間がとても長くなることです。これは、デプロイの前にすべてのページをビルドしないといけないために発生します。

Gatsby は Gatsby Cloud というサービスを立ち上げ、その問題を解消しています。Gatsby Cloud を使うことによって、新しく追加したページのみをビルドする、Incremental Build の機能が使えるようになります。

このセッションでは、Incremental Build 機能をつかって、コンテンツの更新から５秒で新しいデプロイが完了していたことを実演していました。

静的サイトジェネレーターが持つもう一つの欠点は、BitCoinや株価の変化、ニュースサイトなどの、更新頻度がとても短いサイトに対応しづらいことです。
これらのサイトは数秒の一回更新をする必要があるため、静的サイトとの相性はよくありませんでした。

Gatsby Cloud では、 Streaming Build という機能があり、Gatsby の設定の中で継続的に新しいデータを取得してそれを数秒毎に更新することができます。

セッション中も、setIntervalを使った、2~3秒毎に新しくデプロイする様子を実演していました。

また、Gatsby の 2020年の予定についても触れていました。
現在、Gatsby の Core のコードはすべて [TypeScript に置き換えられようとしています](https://github.com/gatsbyjs/gatsby/issues/21995)。

また、Gatsby のサイト上でi18nを容易に行うようにするためのAPIも実装中であるとのことです。

現在、Gatsby のドキュメントは様々な言語に[翻訳されています](https://github.com/gatsbyjs/gatsby-ja)。
それらの翻訳も、新しい Gatsby の i18n api によって、Gatsby のドキュメントに組み込まれるようになるとのこと。

### Render Props are Not Dead

休憩明けの最初のセッションは[@erikras](https://twitter.com/erikras)による、render props についてでした。

React でComponent間での state の共有方法は今までいろんな方法が実装されてきました。
Mixin からはじまり、HOC、RenderPropsと時を経て、今では Hooks が主流となっています。

このトークでは、Hooks の前に使われていた render props が hooks の時代の中でもまだ使える用途があるという話をしていました。

Hooks の登場で、多くの状態管理は hooks を通して行う用になりました。
Hooks に変更があった場合、React の Component は rerender が行われます。
useCallbackなどのMemo化によって、Hooksの変更頻度をへらすことはできますが、一度変更があったら、rerenderを止めることはできません。

もし、hooksを使っているComponentの中で、サードパーティ製の重いComponentを使っていたとしたらどうなるでしょうか？

Hooks に変更がある度に、重いComponentのrerenderがはじまってしまいます。
状態の影響範囲が重いComponent以外の箇所にある状況で、重いComponentが一緒にrerenderされるのは望ましいことではありません。

renderPropsを使うことによって、重いComponentを含むComponentの中で、状態の変更に関心がある箇所のみのrerenderをさせて、パフォーマンスの改善を行うことができます。

個人的には重いComponentにuseMemoを使えばよいのでは？と思いますが、renderProps にもまだ活躍の場は作れるのかもしれません。

### Rejecting bongo kittens, achieving 3D blooms, and other lessons learned

次のセッションは Gatsby のコアチームである[@joshwcomeau](https://twitter.com/joshwcomeau)の話でした。

彼の発表内容は[Githubにもまとめられています](https://github.com/joshwcomeau/talk-2020-react-europe)。

Josh は昔から DDR などの音ゲーが好きで、今では Beat Saber を遊んでいます。

Beat Saber ではいろんな楽曲の譜面を落としてきて遊ぶことができます。また、譜面を自分で作って遊ぶことも可能です。

ただ、譜面を作るソフトウェアがUXがとても悪かったり、Windowsにしか対応していなかったりと問題がありました。

このトークでは、Josh が React を使って BeatSaber の譜面エディタを作成、OSSとして公開した時の話をしていました。

Beat Saber の譜面作成には３Dグラフィックスが欠かせません。
なので、ここでも react-three-fiber を使って Three.js を用いた React での Webgl 開発を行っていました。

作成されたものは[beatmapper.app](https://beatmapper.app/)で公開されています。


## まとめ
他にもたくさんのセッションがありましたが、他の用事があったのと眠気に限界が来てしまったので聞けてません。
個人的には[@Baconbrix](https://twitter.com/Baconbrix)の Expo Web についてのセッションが気になるので、明日また見ようと思います。

React Europe は明日も数々のセッションがあるのでお見逃しなく。