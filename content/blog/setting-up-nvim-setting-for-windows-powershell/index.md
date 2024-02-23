---
title: 'Windows の PowerShell で dotfiles にある neovim 用の init.vim を設定する方法'
date: '2024-02-23T15:13:39.303Z'
---

最近 Windows で開発するようになったのでメモ。

普段は自分の`dotfiles`の `.config/nvim/init.vim` に nvim の設定を入れており、mac, linux はそれを読み込むようになっている。

Windows では "$env:USERPROFILE\AppData\Local\nvim\init.vim" においておくことによって nvim 起動時に init.vim が読み込まれる。

今回の目的はPCを買い替えてもすぐに設定が反映されるようにスクリプトを作成すること。

やることはシンプルで、

1. "$env:USERPROFILE\AppData\Local\nvim" が無かったら作成する。
2. "$env:USERPROFILE\AppData\Local\nvim\init.vim" に `dotfiles` にある `init.vim` へのシンボリックリンクを作成する。 

最終的に以下のようなスクリプトになる。

```setup-nvim.ps1
# create directory for init.vim if it doesn't exist

$nvimDir = "$env:USERPROFILE\AppData\Local\nvim"

if (-not (Test-Path $nvimDir)) {
    New-Item -ItemType Directory -Path $nvimDir
}

# create symbolic link to init.vim

$initVim = "$nvimDir\init.vim"

if (-not (Test-Path $initVim)) {
    New-Item -ItemType SymbolicLink -Path $initVim -Value $PSScriptRoot\.config\nvim\init.vim
}
```

dotfiles ディレクトリから作成したスクリプトを実行

```
./setup-nvim.ps1
```

次回nvim起動する時に `init.vim` が読み込まれることを確認。
