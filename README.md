# game-DEMO-DEMO-DEMO

HTML游戏引擎半成品的半成品

## 引用：

[lz-string.min.js](https://github.com/pieroxy/lz-string)

魔法斗姬フロスティア的部分资源

## 游戏引擎结构说明

- ### 前言

我是一个唯物主义者，所以在学习一个新事物时，我总会试图构建一个与现实类似的模型去理解它。因此我很喜欢 JavaScript 语言，其 MDN 文档的大多数解释和实例能够帮助我顺利理解 JavaScript 对象。

说回学习 JavaScript 与这个项目的关系。很早以前我曾想做一款自己的游戏，虽然到了现在，这种欲望已不再强烈，但 JavaScript 这门语言吸引到了我。

一来 JavaScript 是一门脚本语言，有利于阅读和检验；二来其主要运行主体是浏览器，其广泛安装在大多数计算机设备上；三是在 JavaScript 中，万物皆对象，而公认最流行的语言Python说是“万物皆对象”，但实际上是“万物皆指针”，对我这个唯物主义者来说体验稍逊一筹。

熟练掌握一门语言的最好方法就是做一个项目，顺便稍微圆一下少时之梦也不错。这就是该项目的由来——主要为了完成使用 JavaScript 的技术积累。

一开始我是准备使用 RPG Maker 制作游戏，但是在学习制作插件时，却屡遭报错，而且也不理解将游戏对象做成类的原因。
（注：当时还没了解 ES5 之前的模拟类的原理，后来才知道是自己学艺不精，RPG Maker 的设计还是很科学的）

但游戏为次，学习 JavaScript 才是主要目的。所以我果断放弃成熟的游戏引擎，决定自己写一个出来。（现在回想起来自己实在是天真，但也确实从中快速掌握了更多的API）

于是，我走上了充满迷雾的道路……

- ### 游戏引擎结构

####  一、`gameManager` 对象（`gameManager` Object）
  
`gameManager` 对象直接作为 `window` 对象的属性，且一般包含了 game-DEMO-DEMO-DEMO 游戏引擎（以下简称“引擎”）的所有数据，所以可以在控制台中直接访问，方便在 DEBUG 时查看引擎实时数据。

```
console.log(window.gameManager); // {...}
console.log(gameManager); // {...}
```

  ####  二、元素节点与人（`elementNode` & `person`）
  
HTML 文件中的内容如果要显示在页面中，无论如何都绕不开元素节点。所以，我将出现在 HTML 页面的主要元素节点抽象为引擎的某些对象之中，当然，这些对象都包含在`gameManager`对象当中。

这些对象都真实地出现在了页面中，而非仅仅作为内存中的数据，所以我称它们为“人”（`person`），其本身（`self`）正是某些元素节点（`elementNode`）。即：
```
person.self = elementNode;
'self' in person; // true
person.self instanceof HTMLElement; // true
```
这些对象整体并非一成不变，如果想实时了解“有哪些‘人’，其本身都是什么类型的元素节点”，可以使用 `searchSelf()` 函数，其将返回一个对象，以便了解这些“人”：
```
searchSelf();
```
```
// return below: [...]
// [pathStr]: Element
_: 28
gameManager.gameBody: div
gameManager.gameBody.gameTip: div"
gameManager.gameBody.menuBoard: div"
...
gameManager.undertaleManager.fighterBoard.fighterSkill: div
gameManager.undertaleManager.fighterBoard.fighterItem: div
gameManager.undertaleManager.fighterBoard.fighterPartner: div
[[Prototype]]: Object
```
因此没有 `self` 属性的对象（包括 `gameManager` 对象）并不会直接出现在 HTML 页面中，而是通过这些“人”体现在 HTML 页面中。

  ####  三、指挥“人”让其根据属性和参数使用方法
  
人有特征，“人”有属性；人懂方法，“人”也有方法。“人”可以接收我们的指挥（参数），然后根据其属性，使用其方法，以实现我们的目的。

> 人与人之间迥然不同，“人”与“人”之间亦然，更何况“人”与非“人”，所以本“人”的方法只能由本“人”使用，如果需要回调某“人”的方法，请这样使用：
> ```
> foo( ()=>person.method(...) );
> function foo(callback){
>     ...
>     callback();
>     ...
> }
> ```
> 这样，给人的感觉就是“某‘人’使用了方法”，而非“执行某‘人’的方法”。
  
  ####  四、 `gameManager` 对象中的非“人”对象（`notPerson` Object）
  
非“人”（`notPerson`）对象虽然没有 self 属性，但也有属性甚至方法。因此我将包含方法的非“人”称作“法人”（artificial person，简称 `artPerson`），意为模仿“人”的类“人”；将不含方法的非“人”称作“非人”（`nonPerson`）。
```
'self' in notPerson; // false
artPerson.method();
for(let key in nonPerson){
    nonPerson[key](); // Uncaught TypeError: nonPerson[key] is not a function
}
```
> 回调“法人”的方法时应当遵循“人”的规则：本“人”的方法只能由本“人”使用。

  ##### “法人”介绍
  
“法人”有很多，但并不需要清楚到底有多少。我们只需要了解几个最重要的“法人”—— `gameManager` 对象和它的属性“法人”：
```
for(let artPerson in window.gameManager){
    window.gameManager[artPerson].constructor === Object
    ? window.gameManager[artPerson].self
    ? undefined
    : console.log('gameManager.'+artPerson)
    : undefined;
}
// 或者
for(let artPerson of Object.keys(window.gameManager)){
    window.gameManager[artPerson].constructor === Object
    && !window.gameManager[artPerson].self
    && console.log('gameManager.'+artPerson);
}
```
  - “法人” `gameManager` 的方法
    
`gameManager` 目前只有两个方法：`setGameInterval()` 和 `bgs()`。

`setGameInterval(type,timeSep)` 能够创建或者刷新一个循环定时器，这个定时器的 `ID` 被保存在属性“法人” `gameManager[type]` 中。每过 `timeSep` 毫秒后，该定时器会指挥 `gameManager[type]`。
> 默认有五个保管着循环定时器 `ID` 的“法人”—— `gameManager.globalProcess`, `gameManager.dialogueProcess`, `gameManager.tempProcess`, `gameManager.playerMove`, `gameManager.autoSL`。
> 下面以“法人” `gameManager.playerMove`（简写为 `playerMove` ）举例来说明循环定时器会如何指挥：
> ```
> playerMove.promise = await playerMove.promise; // playerMove 等待它的 promise 兑现
> if(playerMove.paused){ return; } // playerMove 根据它的 paused 属性决定是否工作
> playerMove.onEvent?.() // playerMove 尝试使用 onEvent 方法
> (playerMove.nowFn &&= playerMove.nowFn?.()) || temp.defaultFn?.()
> // playerMove 尝试使用现在的 nowFn() 方法并得到下一次的 nowFn() 方法
> 如果下一次的 nowFn() 方法可以转变为 false，那么 playerMove 将有空尝试使用 defaultFn() 方法
> ```

  - `gameManager` 的重要属性“非人” `constTemp`
    
“非人” `gameManager.constTemp` 保管着各种重要对象的引用，以便“人”和“法人”在使用方法时能够快速访问一些对象或节省一些性能开销（不确定），同时方便定义新的函数和 DEBUG。

如果想要了解 `gameManager.constTemp` 的属性有什么作用，请先了解使用这些属性的“人”和“法人”，实践是认识的第一步。

  - “法人” `gameManager.gameMap` 介绍
    
`gameManager.gameMap` 负责通过 `mapConcat` 属性并使用 `loader` 方法改造一个游戏场景（“人” `gameManager.gameBody` 的 `self` 本体元素节点），同时提供 `onPointEvent()` 函数（不受 `this` 限制）以判断地图事件的触发。

`gameManager.gameMap.mapConcat` 是一个包含4个 `<canvas>` 元素的数组，这些元素都是 `gameManager.gameBody.self` 的子元素，共同构成游戏场景的地貌。

由于玩家操控的“人” `gameManager.gamePlayer` 和其他作为 NPC 的“人”会在该游戏场景中活动，所以 `gameManager.gameMap` 下辖一个“法人”—— `gameManager.gameMap.objectManager`，让其负责登记管理这些 NPC，并提供 `onDirectionEvent()` 函数（不受 `this` 限制）以便判断玩家与 NPC 的交互。

  ####  五、全局常量对象（由 `Map` 实例构成）

全局常量对象会先于网页和 `gameManager` 对象进行初始化，是 `gameManager` 对象工作时需要用到的数据库。它们作为 js 文件通过 HTML 文件的`<script>`标签实现。

默认的全局常量对象有 `mapDataArray`（./js/map.js）, `objectArray.characterArray`（./js/character.js）, `objectArray.eventArray`（./js/event.js）。

这些全局常量对象不宜在游戏内修改，也不方便存入存档，所以我设计了 `memory` 对象。

`memory` 对象的形式是：
```
{
    mapDataArray: {...},
    characterArray: {...},
    itemList: {
        onceArray: {...},
        twiceArray: {...},
        onfitArray: {...}
    }
}
```
引擎中默认有21个 `memory` 对象，全部由“人” `gameManager.gameInfoSL` 负责管理。

通过 `memoryHandle()` 函数，可以在不破坏全局常量对象的前提下，快捷地读取、修改存档内容。
（注意：`objectArray.eventArray` 不可能，也不允许在游戏内修改，所以并未设计进 `memory` 对象。）

  ####  六、插件编写指南
  - 插件安装位置
 
在 game.html 文件的`<head>`标签中，我们可以看到这样的代码：
```
<!-- 基础模块 -->
<link rel="stylesheet" href="./css/0.css" type="text/css" as="style"/>
<script src="./js/lz-string.min.js" type="text/javascript"></script>
<script src="./js/fn.js" type="text/javascript"></script>
<script src="./js/object.js" type="text/javascript"></script>
<script src="./js/map.js" type="text/javascript"></script>
<script src="./js/default-config-save.js" type="text/javascript"></script>
<script src="./js/main1.js" type="text/javascript"></script>
<!-- 扩展模块 -->
<link rel="stylesheet" href="./css/1.css" type="text/css" as="style"/>
<script src="./js/extension/skill.js" type="text/javascript"></script>
<script src="./js/extension/item.js" type="text/javascript"></script>
<script src="./js/extension/objectArrayUT.js" type="text/javascript"></script>
<script src="./js/extension/mapUT.js" type="text/javascript"></script>
<script src="./js/extension/undertale-like-system.js" type="text/javascript"></script>
```
也就是说，我们只要把写好的 .js（.css）文件通过`<script>`（`<link>`）标签插入到`<!-- 扩展模块 -->`的下文中，就可以实现想要的功能。那么 .css 文件还好，.js 文件应该怎么样写呢？
    
  - .js 插件写法
 
首先我们需要创建一个块并用常量保存并执行原来的 window.onload 函数：
```
{
    const oldWindowOnload = window.onload;
    window.onload = ()=>timeRecord(oldWindowOnload).then(({value: oldGameManager,time})=>{
        console.log('!! OldWindowOnload 用时',time,'ms');
        const gameManager = oldGameManager;
        // myScript start

        ... // Symbol(1)

        // myScript end
        return gameManager.completeSelf('extension/undertale-like-system.js');
    });
}
```
这样我们就可以在确保 `gameManager` 对象生成后在 `Symbol(1)` 处对其进行魔改了。下面我们来预设几种想法：

1. 重写某个方法

实际上我并不推荐新手这样做，即便要这么做也应该先了解“人”与“人”之间是怎么工作的，以免出现 BUG 导致“人”们无法工作。

有经验的开发者都知道怎么重写方法：
```
const oldMethod = person.method;
person.method = function(){
    ...
    const result = oldMethod.apply(this,arguments);
    ...
    return result;
}
```
在这里我推荐一种重写方法的写法：
```
const oldMethod = Symbol('oldMethod'); // 获得标识的同时注释为 'oldMethod'
person[oldMethod] = person.method;
person.method = function(...){
    ...
    const result = this[oldMethod](...);
    ...
    return result;
}
```
虽然略长，但这样一来，此“人”并未遗忘旧方法，只不过是在使用新方法时使用了旧方法，而且旧方法不会出现在闭包处，符合人的直觉。

我更加推荐新手先通过 `document.addEventListener()` 方法来增加交互，或通过（可选：增添 `objectArray.eventArray` 的事件并配合） `gameManager.setGameInterval()` 方法设立定时器“法人”，让其根据“人”的变化做出反应。

等熟悉了“人”与“人”之间是怎么工作的之后，再尝试重写方法。

2. 添加交互、进程

通过 `document.addEventListener()` 方法来增加交互，通过（可选：增添 `objectArray.eventArray` 的事件并配合） `gameManager.setGameInterval()` 方法设立定时器“法人”来模拟进程。

3. 添加新功能、新模块、新元素、新界面

定义若干“人”和非“人”对象，它们直接或间接归同一个“法人”管辖。建议将这个“法人”并入 `gameManager` 作为其属性“法人”，方便统筹规划。
