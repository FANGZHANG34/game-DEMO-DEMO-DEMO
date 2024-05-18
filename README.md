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
  ####  一、gameManager 对象（gameManager Object）
  gameManager 对象直接作为 window 对象的属性，且一般包含了 game-DEMO-DEMO-DEMO 游戏引擎（以下简称“引擎”）的所有数据，所以可以在控制台中直接访问，方便在出现 BUG 时查看游戏引擎实时数据。
  ```
  console.log(window.gameManager); // {...}
  console.log(gameManager); // {...}
  ```
  ####  二、元素节点与人（elementNode & person）
  HTML 文件中的内容如果要显示在页面中，无论如何都绕不开元素节点。所以，我将出现在 HTML 页面的主要元素节点抽象为引擎的某些对象之中，当然，这些对象都包含在 gameManager 对象当中。

  这些对象都真实地出现在了页面中，而非仅仅作为内存中的数据，所以我称它们为“人”（person），其本身（self）正是某些元素节点（elementNode）。即：
  ```
  person.self = elementNode;
  ```
  这些对象整体并非一成不变，如果想实时了解“有哪些‘人’，其本身都是什么类型的元素节点”，可以使用searchSelf()函数，其将返回字符串数组，以便了解这些“人”：
  ```
  searchSelf();
  ```
  ```
  // return below: [...]
  // "gameManager[key]... tagName"
  0: "gameManager.gameBody div"
  1: "gameManager.gameBody.gameTip div"
  2: "gameManager.gameBody.menuBoard div"
  ...
  25: "gameManager.undertaleManager.fighterBoard.fighterSkill div"
  26: "gameManager.undertaleManager.fighterBoard.fighterItem div"
  27: "gameManager.undertaleManager.fighterBoard.fighterPartner div"
  length: 28
  [[Prototype]]: Array(0)
  ```
  因此没有 self 属性的对象（包括 gameManager 对象）并不会直接出现在 HTML 页面中，而是通过这些“人”体现在 HTML 页面中。

  ####  三、通过“人”的属性和方法来指挥“人”
  人有特征，“人”有属性；人懂方法，“人”也有方法。“人”可以接收我们的指挥（参数），根据其属性，通过其方法，以实现我们的目的。

  注意，人与人之间迥然不同，“人”与“人”之间也不同，更何况“人”与非“人”，所以本“人”的方法只能由本“人”使用，如果需要回调某“人”的方法，请这样使用：
  ```
  foo( ()=>{ person.method(...); } );
  function foo(callback){
      ...
  }
  ```
  这样，给人的感觉就是“某‘人’用什么方法”，而非“执行某‘人’的方法”。
  ####  四、 gameManager 对象当中的非“人”
