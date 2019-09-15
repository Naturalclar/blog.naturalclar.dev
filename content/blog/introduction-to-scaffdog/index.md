---
title: 'テンプレートファイルを楽々作成する'
date: '2019-09-14T02:52:37.526Z'
---

React Native で開発していて、新しい Component を作成するとき、どういうファイルを作成するでしょう。
React を Import するので、当然、全てのファイルには

```jsx
import React from 'react'
```

と入ります。

基本的には`View`で Component を囲むし、何かしらの Style もつけるため、`StyleSheet`も必要となります。

```jsx
import { View, StyleSheet } from 'react-native'
```

class component か、function component にするか、選択の余地があるが、最近は hooks があるので、これから書き始める Component は全て function component でいいでしょう。
何かしら Props が入る可能性は高いので、Props の型も定義しておきます。

```jsx

type Props = {}

const Foo = ({}:Props) = {
  return (
    <View></View>
  )
}
```

これら一連の動作は、ほとんど全ての Component ファイルで行います。
新しいファイルを作るたびにそれらを入力する hotkey が設定されていれば楽かもしれません。
他のファイルからその部分をコピペしてきても、消す手間や命名を変える手間はありますが、まあ許容できるかもしれません（個人的にはコピペするのすら面倒なので嫌です）。

もし、開発に storybook を使っていたり、snapshot test を実施していたりしたらどうなるでしょうか。
作成する Component ファイルの作成が必要な他、`.story.tsx`ファイルや、`.test.ts`ファイルを新たに作成する必要があります。
Component を作成するたびに上記作業を行うのはとても手間になります。

## scaffdog の導入

Component を大量に作成するときに、毎回規定のファイルを作成するのが面倒なので、
自分は [scaffdog](https://github.com/cats-oss/scaffdog) というツールを使用しています。

Scaffdog は markdown 式に Template を作成出来る scaffolding ツールです。
例えば、以下のような markdown のファイルを作成します。

````md
---
name: 'atom'
description: 'Atom component template'
message: 'Please enter the name of component to be created'
root: './src/atoms'
output: '**/*'
ignore: []
---

# `{{ input }}.tsx`

```jsx
import React from 'react'
import { View, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

type Props = {}

export const {{ input }} : React.FC<Props> = ({}: Props):JSX.Element => (
<View style={styles.container}></View>
)


```

# `{{ input }}.story.tsx`

```jsx
import React from 'react';
import { storiesOf } from '@storybook/react';
import {{ input }} from './{{input}}';
import { StorybookContainer } from "../utils";

storiesOf("atoms", module)
  .addDecorator(StorybookContainer)
  .add("{{input}}", () => (
  <{{ input }} />
));
```
````

この markdown と scaffdog を使って、Foo という Component を作成すると、以下のファイルが生成されます。

`Foo.tsx`

```jsx
import React from 'react'
import { View, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

type Props = {}

export const Foo: React.FC<Props> = ({  }: Props): JSX.Element => (
  <View style={styles.container} />
)
```

`Foo.story.tsx`

```jsx
import React from 'react'
import { storiesOf } from '@storybook/react'
import Foo from './Foo'
import { StorybookContainer } from '../utils'

storiesOf('atoms', module)
  .addDecorator(StorybookContainer)
  .add('Foo', () => <Foo />)
```

このように、新しく Component を作成するときに毎回書き出すことを自動的に用意してくれるので、Component 作成が効率よく行えます。

## 使い方

scaffdog の使い方はとてもシンプルです。

まず、プロジェクトに `.scaffdog` というフォルダを作成します。

そして、そのフォルダの中に、先程のような template が書かれた markdown を入れます。

そして、scaffdog を呼び出します。

npx 経由で呼び出す場合、

```
npx scaffdog generate
```

を入力し、作成したい Component の名前を入力します。

自分は、scaffdog をプロジェクトに入れて、`yarn new` で新しく Component を作成出来るようにしています。

## scaffdog の他の活用法

scaffdog は、Component 以外にも、Gatsby で新しく Blog 記事を作成するときや、mdx-deck で新しく Slide を作成するときなど、様々な場面で使用することができます。

自分が使っているものは、以下のリポジトリの`.scaffdog` フォルダに入っているので、ぜひ確認してください。

blog: https://github.com/Naturalclar/blog.naturalclar.dev

slides: https://github.com/Naturalclar/talks

ぜひ、scaffdog を活用してみてください。
