---
title: 'styles in react-native'
date: '2019-10-02T23:21:16.554Z'
---

[meguro.css #7](https://megurocss.connpass.com/event/145780/)で発表すること。

CSS の勉強会に行くのは初めてなので、今回は基本的なところを抑えようという魂胆。

## react-native とは

- iOS や Android アプリなどのクロスプラットフォーム開発が出来るフレームワーク

- react を知っていれば似たような記法でかける。

- `<div>`や`<p>`等といった Web で良く使うタグの代わりに、`<View>`や`<Text>`など独自のタグを使う。

```jsx
import React from 'react'
import { View, Text } from 'react-native'

export const HelloWorld = () => (
  <View>
    <Text>Hello World!</Text>
  </View>
)
```

## react-native における Style

react-native は Web と同じ様に書くことができますが、CSS ファイルをそのまま使うことはできません。

かわりに、react-native が提供する`[StyleSheet](https://facebook.github.io/react-native/docs/styleSheet )]`という API を使用します。

```jsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  activeTitle: {
    color: 'red',
  },
})

...
```

作成した Style を適応するには`style` prop に入れます。

```jsx
import React from 'react-native'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  isActive: boolean,
}

export const Title = ({ isActive }: Props) => (
  <View style={styles.container}>
    <Text style={[styles.title, isActive && styles.activeTitle]} />
  </View>
)

const styles = StyleSheet.create({...})
```

要は CSS-in-JS ですね。

StyleSheet と Component を分けて共通の Style を使いまわしたり、Component を持つファイルと一緒にして Scope を閉じたりは人それぞれです。私は後者のほうが好きです。

## StyleSheet API

StyleSheet にはいくつか API が提供されています。

### StyleSheet.create(obj)

渡された Object から StyleSheet を作成します。

### StyleSheet.flatten(style)

本来、StyleSheet.create で作成された Style は、参照した時に id を返します。

例えば

```JSX
import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex:1
  }
})

console.log(styles.container) // 3 のような numberが返ってくる。
```

これでは、正しい Style が入っているかのデバッグが難しいです。

`StyleSheet.flatten()`を使用すれば、id から取得した Object が返ってくるので Debug しやすくなります。

```JSX
import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex:1
  }
})

console.log(StyleSheet.flatten(styles.container)) // { flex: 1}
```

また、react-native では、style に配列を渡すことができ、そうした場合は渡した Style が Merge されたものが適応されます。

```jsx
import React from 'react-native'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  isActive: boolean,
}

export const Title = ({ isActive }: Props) => (
  <View style={styles.container}>
    {/* ここで複数のStyleを当てている */}
    <Text style={[styles.title, isActive && styles.activeTitle]} />
  </View>
)

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
  },
  activeTitle: {
    color: 'red',
  },
})
```

この様に配列で Style を渡した時も、`StyleSheet.flatten()`を使えば、Merge された Style の内容が Object として返ってくるので、渡した Style が期待通りになっているかどうかのデバッグが行えます。

```jsx
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
  },
  activeTitle: {
    color: 'red',
  },
})

console.log(StyleSheet.flatten([styles.title, styles.activeTitle])) // { fontSize: 18, color: 'red'}
```

### StyleSheet.hairlineWidth

`StyleSheet.hairlineWidth` は、使用しているプラットフォームが描画可能な最小の width 値を返します。
主に Border を作成する時に使います。

```jsx
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})
```

### StyleSheet.absoluteFill

`position:absolute`で画面全体を覆いたい時に使えるショートハンドです。
以下の要素を持つ Object を返します。
Floating Action Button 画面右下に置きたいときや、キャンセルボタンを画面右上に固定したい時とかに使えますね。

```json
{
  "position": "absolute",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0
}
```

要素自体は Override することができます。

```jsx
const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFill,
    top: 10,
    backgroundColor: 'transparent',
  },
})
```

### StyleSheet.absoluteFillObject

`absoluteFill`と全く同じです。以前はこちらのみが Override 可能でしたが、今では差異はなくなりました。

[参考コード](https://github.com/facebook/react-native/blob/master/Libraries/StyleSheet/StyleSheet.js#L255)

## React-Native と Web の違い

react-native の Style は基本的に Web の CSS と同じように使えますが、結構差異があります。

### Display は基本 `flex`

react-native の画面はすべて、FlexBox で表現します。

これは、react-native が View の部分にて `[yoga](https://github.com/facebook/yoga)`という Facebook 製のクロスプラットフォームで Flexbox を実装するライブラリを使用しているためです。

なので、`display` property は`flex`がデフォルトで、その他対応しているのは`none`のみです。`grid`は使えません。

### flexDirection はデフォルトで`column`

react-native では、基本的に要素が上から下に向かって描かれています。なので、`flexDirection` はデフォルトで`column`になっています。要素を横並びにしたい場合には、`flexDirection`を`row`に設定します。

長く React Native をやっていると、Web で FlexBox を使う時に要素がデフォルトで横になっていることに違和感を覚えます。
（私はこれを「RN 病」と呼んでいます。）

### ショートハンドは使えない

react-native では基本的に　`margin: '10 0'` のようなショートハンドは使えず、基本的に 1 Property に一つの値しか受け付けません。

`margin`を Component 全体に均等に適用したい場合は、`margin: 10`と書けますが、上下左右で別の値を使う場合は、それぞれ`marginRight`, `marginTop`などに設定する必要があります。上下が同じ値、左右が同じ値の場合は`marginVertical`, `marginHorizontal`というプロパティを使えば、記入を少なくできます。

### flex の微妙な差異

通常の CSS では`flex`プロパティは`flex-grow`, `flex-shrink`, `flex-basis`というプロパティのショートハンドです。

WIP

## 参考サイト

- [react-native: StyleSheet](https://facebook.github.io/react-native/docs/stylesheet)
- [react-native: Layout Props](https://facebook.github.io/react-native/docs/layout-props.html))
- [Taming React Native’s ScrollView with flex](https://medium.com/@peterpme/taming-react-natives-scrollview-with-flex-144e6ff76c08)
