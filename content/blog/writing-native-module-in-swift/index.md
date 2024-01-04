---
title: 'React Native の Native Module を Swift で書く'
date: '2020-12-05T13:00:00.000Z'
---

この記事は [React Native アドベントカレンダー](https://qiita.com/advent-calendar/2020/react-native) の 5 日目の記事です。

この度、iOS 14 で新しく追加された機能である、UIButton に追加できる UIMenu を React Native で使う為の Native Component を作成しました。

[react-native-menu/menu](https://github.com/react-native-menu/menu) で見る事ができて、自分が現在携わっているプロダクトでも活用しています。

今回、このモジュールを Swift で書いたのですが、Swift で Native Module を書くための資料が自分の観測範囲ではかなり少ないので、学びを共有します。

なお、自分は Objective-C や Swift の経験が皆無に等しいので、間違っている箇所がある場合は指摘いただけると助かります。

## プロジェクトのセットアップ

Native Module を新しく作成するためのテンプレートはいくつかあるのですが、自分は[@react-native-community/bob](https://github.com/callstack/react-native-builder-bob)を勧めます。

理由としては以下の通りです。

- Swift/Kotlin のテンプレートが用意されている
- Turbo Module を使った C++ のモジュールのテンプレートも存在する
- 生成されたファイルが TS で書かれている
- publish 時のビルド等の script がテンプレートに含まれている
- 作成したモジュールを試すための Example プロジェクトがテンプレートに含まれている
- react-native のリリースを行っている callstack や react-navigation のメンバーがメンテしている

以下のコマンドでテンプレートが作成されます

```
npx @react-native-community/bob create [プロジェクト名]
```

## 各ファイルの説明

ここからは、自分が作成した React Native Menu に含まれているファイルを一つ一つ解説していきます。コードは 12/05 時点のものなので、アップデート等で変わっている可能性もあります。

### RCTUIMenuManager.m

```objective-c
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTUIMenu, RCTViewManager)

/**
 * title: Short description to be displayed above the menu.
 */
RCT_EXPORT_VIEW_PROPERTY(title, NSString);
/**
 * actions: Array of actions that are included in the menu
 */
RCT_EXPORT_VIEW_PROPERTY(actions, NSArray);
/**
 * onPressAction: callback to be called once user selects an action
 */
RCT_EXPORT_VIEW_PROPERTY(onPressAction, RCTDirectEventBlock);

@end
```

Swift で書くと言いつつ、唯一存在している Objective-C のファイルについて解説します。
このファイルは React Native にて JavaScript と Objective-C を繋ぐためのファイルです。
React Native は Swift のコードをそのまま扱うことができないので、Swift のファイルは一旦 Objective-C に落とし込んでから使用します。

#### RCT_EXTERN_MODULE

普段、Objective-C で React Native の Native Module を書く場合は、以下のように書きます。

```objective-c
@implementation ModuleName
RCT_EXPORT_MODULE();
@end
```

これは、`RCT_EXPORT_MODULE`という関数で`ModuleName`という名前のクラスを JavaScript 側から読み込めるようにします。

しかし、Swift で Module を書く場合は、`RCT_EXTERN_MODULE`を使います。
これは、外部にある Module を JavaScript 側から読み込める用にするための関数です。
上の例では、`RCTUIMenu` という名前のクラスを JavaScript 側から読み込む用にしています。第二引数はクラスの型で、View を持つコンポーネントである場合、`RCTViewManager`、ネイティブの機能を呼び出すだけの場合、`NSObject`を入れます。

JavaScript 側では以下のように Native Module を読み込むことができます。

```ts
import { HostComponent, requireNativeComponent } from 'react-native'
import type { MenuComponentProps } from './types'

const MenuComponent = requireNativeComponent(
  'RCTUIMenu'
) as HostComponent<MenuComponentProps>

export default MenuComponent
```

#### RCT_EXPORT_VIEW_PROPERTY

ここは Swift でも Objective-C でも書き方は変わりません。
Native の View Component を作成する際、props として受け取る値を定義します。
例えば、以下の例では`title` という props を `NSString` 型として受け取り、Native 側に渡します。

```objectve-c
RCT_EXPORT_VIEW_PROPERTY(title, NSString);
```

JavaScript 側では以下のように書けば title が Native 側に渡されます

```tsx
<MenuView title="Hello World!" />
```

### Menu-Bridging-Header.h

```h
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTView.h>
```

`-Bridging-Header.h`という名前の Header ファイルは、Objective-C から Swift へと定義を渡すためのファイルです。

このファイルがあることによって、Swift のファイルでも`RCTView`等のクラスが使用できます。

### RCTUIMenuManager.swift

```swift
@objc(RCTUIMenu)
class RCTUIMenuManager: RCTViewManager {

    @objc var onPressMenuItem: RCTBubblingEventBlock?;

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        if #available(iOS 14.0, *) {
            return MenuView();
        } else {
            return ActionSheetView();
        }
    }
}

```

ここから Swift ファイルの解説です。

class の上にかかれている `@objc(RCTUIMenu)`で、Objective-C 側で Swift のクラスを読み込める用にしています。`RCTUIMenuManager.m`の方で使っていた RCTUIMenu はこのクラスを参照しています。

```swift
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
```

この部分は React Native の UI Component であれば必要な部分です。React Native の Main Thread が立ち上がるまで、この Native Module が呼ばれない用にするもの（だという認識）

```swift
    override func view() -> UIView! {
        if #available(iOS 14.0, *) {
            return MenuView();
        } else {
            return ActionSheetView();
        }
    }
```

ここで別ファイルで定義した View Component を返しています。
UIButton に UIMenu が追加できるようになったのは iOS14 以降のことなので、それ以前の OS では、ActionSheet が表示されるようにしています。

### MenuView.swift

```swift
import UIKit
@available(iOS 14.0, *)
@objc(MenuView)
class MenuView: UIButton {

    private var _actions: [UIAction] = [];
    @objc var actions: [NSDictionary]? {
        didSet {
            guard let actions = self.actions else {
                return
            }
            actions.forEach { menuAction in
                _actions.append(RCTMenuAction(details: menuAction).createUIAction({action in self.sendButtonAction(action)}))
            }
            self.setup()
        }
    }

    ...

    @objc var onPressAction: RCTBubblingEventBlock?

    @objc func sendButtonAction(_ action: UIAction) {
        if let onPress = onPressAction {
            onPress(["event":action.identifier.rawValue])
        }
    }

    ...
}
```

ここが UIMenu を追加できる UIButton の定義となります。実際に Swift で UIMenu を表示する方法などは省略して、ここでは React Native の Bridging で重要なところだけをおさえます。

`@objc` が先頭についている部分は、Objective-C からアクセスできる部分です。React Component の props から渡ってきた部分や、JavaScript の世界に返すものはすべて `@objc`を先頭に付けています。

渡ってきた props の一つ、actions は `NSDictionary` の配列、JavaScript で言えば JSON の配列です。ここでは UIMenu で使う項目の配列を取得して、別ファイルに定義してある RCTMenuAction を受け取った JSON から作成します。

もう一つの props、onPressAction は `RCTBubblingEventBlock`、これは JavaScript の関数が props として渡ってきたものです。ほかに、`RCTDirectEventBlock` もあるんですが、違いは把握してないです、誰か教えてください。

このクラスでは UIMenu が押されたときに、`sendButtonAction`を通して、押された項目の event id を JavaScript 側から渡された onPressAction の引数として返しています。

### RCTMenuItem.swift

```swift
import UIKit;

@available(iOS 13.0, *)
class RCTMenuAction {

    var identifier: UIAction.Identifier?;
    var title: String;
    var subtitle: String?;
    var image: UIImage?
    var attributes: UIAction.Attributes = [];
    var state: UIAction.State = .off

    init(details: NSDictionary){

        if let identifier = details["id"] as? NSString {
            self.identifier = UIAction.Identifier(rawValue: identifier as String);
        }

        if let image = details["image"] as? NSString {
            self.image = UIImage(systemName: image as String);
        }

        if let title = details["title"] as? NSString {
            self.title = title as String;
        } else {
            self.title = "";
        }

        ...

    }

    func createUIAction(_ handler: @escaping UIActionHandler) -> UIAction {
        return UIAction(title: title, image: image, identifier: identifier, discoverabilityTitle: subtitle, attributes: attributes, state: state, handler: handler)
    }
}
```

最後に、RCTMenuAction の解説です。このファイルは、UIMenu で表示する項目、UIAction を定義するためのクラスです。

React Component の Props から渡ってきた JSON を NSDictionary と扱って instance を作成します。
JavaScript から渡された JSON の値を一つ一つ、Swift で使える型に変換して、それをもとに UIAction を作成します。

## まとめ

以上が React Native Menu の Swift 実装の解説となります。
普段 JavaScript しか書かない立場として、ネイティブ側の実装と聞くと身構えてしまいそうですが、一つ一つ紐を解いていくとそんなに複雑なことをしなくても良いということがわかります。

これを期に、Native Module を書いてみるのはいかがでしょうか？

## 参考記事

- [Swift in React Native - the Ultimate Guide Part 1: Modules](https://teabreak.e-spres-oh.com/swift-in-react-native-the-ultimate-guide-part-1-modules-9bb8d054db03)
