---
title: 'React Native で React Compiler を有効にする'
date: '2024-05-26T07:23:20.571Z'
---

先日、React Conf で React Compiler のオープンソース化が発表されました。

React Compiler について、詳しくは[公式ドキュメント](https://react.dev/learn/react-compiler)を参照してください。

簡単に言えば、今まで `useMemo` や `useCallback` を書いてメモ化していたものが react-compiler を用いて自動で行われるようになります。

react compiler を使うには基本的には現状 RC である React v19 が必要になります。ただ、ワークアラウンドを使うことで React v18 でも部分的に使えるようにできます。
React Native で react-compiler を使うには react 18 のまま使う必要があるので今回はその方法を紹介します。

## Babel プラグインのインストール

react-compiler を適用させる為の babel プラグインをインストールします。

```sh
pnpm install babel-plugin-react-compiler
```

`babel.config.js` に以下のように babel プラグインを追加します。

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
+    [
+      'babel-plugin-react-compiler',
+      {
+        runtimeModule: 'react-compiler-runtime',
+      },
+    ],
    'react-native-reanimated/plugin',
  ],
}
```

`runtimeModule` のオプションは react-compiler がメモ化を行う為に使う関数の場所を指定します。
何も指定されていない場合は `react/compiler-runtime` を使用しますが、この関数は react v19 から実装されるものなので react 18 では使えません。
`runtimeModule` が指定されている場合は、該当モジュールから `c` 関数をインポートして使用します。

以下、[babel plugin のコード](https://github.com/facebook/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/Entrypoint/Options.ts)から引用。

````js
/*
  * If enabled, Forget will import `useMemoCache` from the given module
  * instead of `react/compiler-runtime`.
  *
  * ```
  * // If set to "react-compiler-runtime"
  * import {c as useMemoCache} from 'react-compiler-runtime';
  * ```
  */
  runtimeModule?: string | null | undefined;
````

指定されたモジュールを使えるようにするために、`package.json` に以下のようにモジュールを追加します。

```json
{
  ...
  "devDependencies": {
    ...
+   "react-compiler-runtime": "file:./lib/react-compiler-runtime"
  }"
}
```

そして、リポジトリのルートに `lib/react-compiler-runtime` ディレクトリを作成して以下のファイルを作成します。

- `package.json`

```json
{
  "name": "react-compiler-runtime",
  "version": "0.0.1",
  "license": "MIT",
  "main": "index.js",
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

- `index.js`

```js
const React = require('react');
const $empty = Symbol.for("react.memo_cache_sentinel");
/**
 * DANGER: this hook is NEVER meant to be called directly!
 *
 * Note that this is a temporary userspace implementation of this function
 * from React 19. It is not as efficient and may invalidate more frequently
 * than the official API. Please upgrade to React 19 as soon as you can.
 **/
export function c(size: number) {
  return React.useState(() => {
    const $ = new Array(size);
    for (let ii = 0; ii < size; ii++) {
      $[ii] = $empty;
    }
    // @ts-ignore
    $[$empty] = true;
    return $;
  })[0];
}
```

これで react-native や react v18 を使っているプロジェクトで react-compiler を試す事ができます。

## 参考

React 18 で react-compiler を使うためのワークアラウンドのgist - https://gist.github.com/poteto/37c076bf112a07ba39d0e5f0645fec43
React Compiler のソースコード - https://github.com/facebook/react/tree/main/compiler
