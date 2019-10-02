---
title: 'new hooks in react-navigation v4'
date: '2019-10-02T23:03:23.363Z'
---

https://github.com/react-navigation/hooks

react-navigation v4 で使える hooks api に新しく hooks が追加されました。

- useFocusEffect
- useIsFocused

## useFocusEffect

`useFocusEffect` は使っている Screen に Focus があたった時、及び Focus が外れた時にサイドエフェクトを起こします。
`useEffect` の Screen 版のようなものですね。

```jsx
function MyScreen() {
  useFocusEffect(
    useCallback(() => {
      console.debug('screen takes focus')
      return () => console.debug('screen loses focus')
    }, [])
  )
  return <View>...</View>
}
```

## useIsFocused

`useIsFocused` は現在 screen が focus されているか否かを boolean で返します。

```jsx
function MyScreen() {
  const isFocused = useIsFocused()
  return <Text>{isFocused ? 'Focused' : 'Not Focused'}</Text>
}
```

react navigation の stack は mount が発火されるタイミングがわかりにくいので、screen 毎の`useEffect`のような hooks がが使える様になったのはありがたいですね。

なお、次に来る react-navigation v5 はフルリライトでガラッと使い方が変わるので、この hooks を活用出来る期間はそう長くはないかもしれません。
