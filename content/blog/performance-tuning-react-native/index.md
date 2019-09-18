---
title: 'Performance Tuning in React Native'
date: '2019-09-13T03:17:00.842Z'
---

React Native で大規模開発を行っていると、各画面遷移や行動毎の動作が遅くなってしまうことがある。
原因の一例として react-navigation などを使っているときに表示していない Stack 等で不必要な Component の Rendering が行われるようなことが考えられる。

## Disclaimer

この記事はパフォーマンスチューニングの厳密な手法について紹介するものではない。
あくまで、普段 react で行っているパフォーマンスチューニングを react-native で行う方法について紹介するものである。
react でのパフォーマンスチューニングの方法は
[この記事](https://calibreapp.com/blog/react-performance-profiling-optimization/)や[この記事](https://recruit-tech.co.jp/blog/2018/09/19/react_spa_performance_tuning/)が参考になる。

```
npx reeact-devtools
```

現在、react-devtools の v4 が出ており、react-native にはまだ対応されていない(2019/09/13 現在)

```
npx react-devtools@^3
```
