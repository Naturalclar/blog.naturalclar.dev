---
title: 'React Native アプリで TypeScript の paths alias を適用する'
date: '2024-04-13T13:29:47.565Z'
---

React Native で typescript の paths の alias を適用するにはいくつか方法がありますが、この記事では追加のライブラリを必要としない方法を紹介します。

### Paths Alias とは

typescript における paths の設定は適用すると特定のディレクトリからのインポートを相対的に行わずにかけるようになります。

例えば、`Button` というコンポーネントが `src/components/Button.tsx` にあるとします。

paths alias を適用する前のコード

```js LoginScreen.tsx
// src/screens/LoginScreen.tsx

import * as React from 'react';
import { View } from 'react-native';
import { Button } from '../components/Button';

export const LoginScreen = () => {
  ...
}
```

paths alias を適用した後のコード

```js LoginScreen.tsx
// src/screens/LoginScreen.tsx

import * as React from 'react';
import { View } from 'react-native';
import { Button } from 'app/components/Button';

export const LoginScreen = () => {
  ...
}
```

上記のように、`../components/Button` から `app/components/Button` に変更されます。
今回のケースではそこまで恩恵を感じないかもしれませんが、LoginScreenをより深い階層のディレクトリに移動する場合等にコードの変更を行わずにそのまま利用することができるようになります。

paths alias を適用する場合、`tsconfig.json` では以下のように設定します。

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "app/*": ["src/*"]
    }
  }
}
```

ただ、この設定だけだとVSCode等のエディタ上ではエラーが表示されませんが、実際にReact Nativeのアプリを起動した時にはエラーになります。

アプリを起動した時に設定が反映されるようにする方法はいくつかありますがここでは `metro.config.js` を変更することで解決させます。

```js metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('node:path')

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      app: path.resolve(__dirname, 'src'),
    },
  },
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
```

