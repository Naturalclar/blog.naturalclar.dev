---
title: You might not need thunk
date: '2019-09-01T10:00:00.000Z'
---

状態管理に redux を使っている人は以下の様なことをやりたいことがあるでしょう。

- ログイン処理でフォームを Submit した時に API を叩いて、返ってきた Auth 情報を store に保持する。
- ページを開いた時に API を叩いて、返ってきた Response を store に保持する。

このような非同期処理の結果を redux に保持することが必要な時にはよく `redux-thunk`, または `redux-saga`が採用されていた。
今回は非同期処理に thunk も saga も使う必要なくなったのでは？と言う話です。

なお、筆者は redux-saga についてはそこまで使ったことが無いので、この記事では主に`redux-thunk`のリプレイスについて書きます。

## tl;dr;

- react-redux の hooks api を用いて custom hooks に非同期処理を入れる。
- redux で保持するべきはユーザが必要な情報（Loading は要らない）
- ロジックはすべて custom hooks に閉じ込めよう。

## redux-thunk の流れ

redux-thunk で非同期処理の流れを簡単に書くと：

- 非同期処理を始める前に、画面に「読み込み中‥」などを表示させるために、Loading 状態にする
- 非同期処理を始める。
- 非同期処理が無事終わったら、結果を store に反映させ、Loading 状態を外す
- 非同期処理に何らかの問題が発生したら、その旨を表示させ、Loading 状態を外す

となります。

コードで書くとこういう感じです：

`fooReducer.ts`

```js fooReducer.ts

type FooState = {
  loadng: boolean,
  list: Item[],
  error: stirng
}

const initialState:FooState  = {
  loading: false,
  list: [],
  error: string
}

export const fooReducer = (state:FooState = initialState, action:FooAction) => {
  switch(action.type) {
    case: 'FOO_START':
      return { ...state, loading: true}
    case: 'FOO_SUCCESS':
      return { ...state, loading: false, list: action.result}
    case: 'FOO_FAILED':
      return { ...state, loading: false, error: action.error}
    default:
      return state;
  }
}
```

`fooAction.ts`

```js fooAction.ts
export const fooAction = (): ThunkAction => async (dispatch: Dispatch) => {
  // 非同期処理を開始するため、状態をLoadingにする
  dispatch({ type: 'FOO_START' })
  // 非同期処理を行う
  try {
    const result = await fetch('/getFoo')
    // 成功したら結果をreduxに反映し、Loading状態を外す
    dispatch({ type: 'FOO_SUCCESS', result })
  } catch (e) {
    // エラーが発生したらエラーメッセージを表示させ、Loading状態を外す
    console.error(e)
    dispatch({ type: 'FOO_FAILED', error: e.message })
  }
}
```

## redux-thunk のつらみ

上記の通り、redux-thunk がやっていること自体は単純なのですが、
それを書くのに結構な量のコードを書く必要があります。
上記に加えて、store の状態をもとに処理を分岐させる必要がある場合、thunk 内で getState を呼んだりと、処理が複雑化してきます。

筆者が感じる Issue としては以下のようなことがあります：

- `STARTED`, `SUCCESS`, `FAILED` の 3 つの Action を書く必要があった。
- `Loading`の状態を reducer で持つ必要があった。
- 非同期処理が行われる度に別々の Loading を書く必要があった。
  1 画面で複数の非同期処理が走る際、

つまりやりたいことは：

- Action の発火は必要な状態が変わる一回に済ませたい。
- Loading は redux 外で管理したい。
- 非同期処理の共通部分を使いまわしたい。

## 解決案

react の custom hooks を使えば解決します。
react-redux の v7.1 から、hooks に対応した API が出たのでそれらを使っていきます。

上で書いた redux-thunk の例を custom hooks を使って簡略化することができます。

以下のことをやっていきます。

- loading は useState で保持して、hooks 内で完結させる。
- dispatch を使うのは、非同期処理が終わってからの一回のみで済ませる。

`useFoo.ts`

```js useFoo.ts
import { useState, useCallback } form 'react'
import { useSelector, useDispatch } from 'react-redux'

export const useFoo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const items = useSelector(state=> state.foo.items)
  const dispatch = useDispatch<Dispatch<FooAction>>()

  const getFoo = useCallback(async () => {
    setLoading(true)
    try {
    const result = await fetch('/getFoo')
        setLoading(false)
        dispatch({{type: 'FOO_SUCCESS', result})
    } catch (e) {
        setLoading(false)
        setError(e.message)
    },[loading, error, items])
  }
  return [items, getFoo, loading, error]
}

```

loading と error を持つ必要がなくなったので、reducer も簡略化することができます。

`fooReducer.ts`

```js fooReducer.ts

type FooState = {
  list: Item[],
}

const initialState:FooState  = {
  list: [],
}

export const fooReducer = (state:FooState = initialState, action:FooAction) => {
  switch(action.type) {
    case: 'FOO_SUCCESS':
      return { ...state, list: action.result}
    default:
      return state;
  }
}
```

component での使用例はこんな感じです

`FooList.tsx`

```js FooList.tsx
import React, { useEffect } from 'react'
import { useFoo } from './useFoo'

export const FooList = () => {
  const [items, getFoo, loading, error] = useFoo()
  useEffect(() => {
    getFoo()
  }, [])

  if (loading) {
    return <p>読込中…</p>
  }

  return (
    <div>
      {error ? <p>{error}</p> : null}
      <ul>
        {items.map(item => {
          return <li>{item.contents}</li>
        })}
      </ul>
    </div>
  )
}
```

このような形で、ページ遷移時に非同期で何かを取得してくる処理を thunk 無しでも実現することができます。

また、このように非同期処理のロジックを custom hooks に閉じ込めておくことで、別のページで同じ処理が必要になった時に hooks を使い回すことができます
上の Compnent の例では、useEffect も useFoo の中に入れることで、完全にロジックと Component を分割させることができます。

## あとがき

これはあくまで自分の redux-thunk の使い方なら redux-thunk 使わなくても出来るかなと言う話なので、
redux-thunk や redux-saga じゃないとこれができないよ！みたいなことがあれば教えてほしいです。
