---
title: 'patching-with-pnpm'
date: '2024-01-06T01:44:03.725Z'
---

## `pnpm` で `node_modules` 内のパッケージにパッチを当てる方法

プロジェクトで `node_modules` の中にある特定のパッケージに変更を加える必要がある場面に直面した。

### `yarn` v1 での対応

以前はパッケージマネージャとして `yarn` v1 を採用していて、その時は [patch-package](https://github.com/ds300/patch-package) を使うことで対応することができた。

`patch-package` を使う際はまず `node_modules` の中身のファイルを必要に応じて書き換えて、その後に以下のコマンドを使うことでパッチファイルが作成できた。

```sh sh
npx patch-package [パッケージ名]
```

パッチを反映させるには、`postinstall` 等のスクリプトで `patch-package` を実行することによって作成したパッチの内容が `node_modules` に反映された。

```json package.json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### `pnpm` での対応

`pnpm` では `node_modules` が symlink で管理されているため `node_modules` を直接書き換える対応は行えない。`patch-package` も `pnpm` には非対応である。

その代わり、`pnpm` は独自のパッチ機構を持っている。

## `pnpm patch`

[pnpm patch](https://pnpm.io/cli/patch)

```sh sh
pnpm patch <pkg name>@<version>
```

実行すると以下の様なメッセージが表示され、パッケージの内容が作成される

```
You can now edit the following folder: /private/var/folders/5t/lpfk4v1s7fqcpf1k1yjnnv3w0000gn/T/d9cfbc08a0261088f439bb943285e960

Once you're done with your changes, run "pnpm patch-commit /private/var/folders/5t/lpfk4v1s7fqcpf1k1yjnnv3w0000gn/T/d9cfbc08a0261088f439bb943285e960"
```

作成されたフォルダの中で必要な変更を行い、以下のコマンドを実行すると

```sh sh
pnpm patch-commit [作成されたフォルダのパス]
```

特に他の指定をしてない場合、プロジェクトに`patches`フォルダが作成され、そこにパッチファイルが生成される。

また、`package.json`に以下のような記述が追記される。

```json package.json
{
  "pnpm": {
    "patchedDependencies": {
      "package@1.0.0": "patches/@package@1.0.0.patch"
    }
  }
}
```

これで次回から`pnpm install`を実行する際にパッチファイルが適用される。
