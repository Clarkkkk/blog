---
title: 前端的零碎知识
author: Aaron Zhou
description: 前端的零碎知识
pubDatetime: 2021-03-10T11:20:00.000Z
postSlug: bits-and-pieces-of-front-end-knowledge
featured: false
draft: false
tags:
    - 踩坑记录
---
# 前端的零碎知识

- 使用DOM方法附加一个元素可能意外地使滚动条出现而改变页面元素的位置

- 使用JavaScript创建的元素在附加到文档树之前是没有大小的

- 出于安全原因，JSON中不能使用Infinity、NaN、undefined等常量

- chrome.storage.*.get是异步的，而localStorage是同步的

- Chrome扩展在网页中使用来自扩展的其他资源时，需要先在manifest文件的web_accessible_resources中声明，并使用`string chrome.runtime.getURL(string path)`将相对路径转换为相应的扩展路径（包括在页面中引入外部样式表）。

- `chrome.runtime.sendMessage`不能传输DOM节点，与DOM有关的操作需要在content script中完成

- <fieldset>暂时不支持使用栅格或弹性布局，实在要用可以在其内部加一个容器

- 函数是否采用严格模式取决于其定义的位置，而非调用的位置

- for...in循环中的临时变量只是对象的一个属性名（即字符串），而不是这个属性的引用。

- Chrome的开发者工具不能查看原生函数的属性，也不能查看自定义函数的属性，Firefox可以。

- for...in循环不保证输出顺序；for...of循环则按迭代器的顺序输出，在稀疏数组中，未定义的值会输出为undefined；数组的forEach()按升序为每个元素调用回调函数，但不包括已删除或未定义的元素索引。

- setTimeout中的回调函数的this值在严格模式下仍然指向window，而不是undefined。

- 无论何时，更改对象时，直接将一个对象赋值给这个对象都是一个糟糕的写法。应该逐个更改对象的属性，或者使用Object.assign()来复制对象。

- 外部javascript文件中如用到元素的src等相对路径，则路径是相对于html文件的位置，而非javascript文件所在的位置。

- 谨慎使用有可能陷入无限循环的while循环。

- 一个未解决的promise也可以被正常回收，只要没有代码引用它。

- 在chrome扩展中使用`window.getSelection().getRangeAt(0)`取得shadow DOM中选中的范围是不准确的（怀疑是bug）。

- `<scirpt>`标签共享同一个全局作用域，但JavaScript解释器在执行脚本时，是按块来执行的。通俗地说，就是浏览器在解析HTML文档流时，如果遇到一个`<script>`标签，则JavaScript解释器会等到这个代码块都加载完后，先对代码块进行预编译，然后再执行。执行完毕后，浏览器会继续解析下面的HTML文档流，同时JavaScript解释器也准备好处理下一个代码块。

- 通过javascript使用`top`和`left`修改元素位置时，记得在数字后加上单位`px`

- drag事件的clientx和clienty在各浏览器中的实现似乎有bug。在chrome中，元素首次触发drag事件时，chrome中的clientx和clienty均为实际值的一半，之后的drag事件恢复正常；值得注意的是，dragstart的数据却是正确的。而在firefox中，drag事件的大部分与鼠标位置相关的参数要么为0，要么是一些奇怪的数字。令人唏嘘的是，旧版edge的实现没有上述问题。如需获取鼠标位置，可以使用dragover

- v-for中的$refs数组与v-for本身的数组（有序）的顺序不保证一致

- 触发drag操作时，mousemove会暂停触发

- 回调函数中尽量避免使用this，如需使用，应先 使用bind()绑定this

- For elements whose layout is governed by the CSS box model, any value other than none for the [transform](https://www.w3.org/TR/css-transforms-1/#propdef-transform) property also causes the element to establish a containing block for all descendants. Its padding box will be used to layout for all of its absolute-position descendants, fixed-position descendants, and descendant fixed background attachments.

- photoshop的移动工具似乎会影响网页的drag event

- dragenter经常莫名其妙地在自身触发，需要特别阻止

- npm失败时可能导致缓存有错误文件，再次尝试时可以使用`npm cache clean --force`清除缓存

- 使用`npm install`时，网络缓慢可能会导致超时，可通过在`.npmrc`中添加如`timeout=60000`的语句延长超时的时间。`.npmrc`文件在`C:\Users\{username}\.npmrc`中，也可以直接在项目目录（即`package.json`所在目录）中新建`.npmrc`文件。此外，还可以使用代理加快速度，使用这两条命令：

  ```bash
  $ npm config set proxy http://server:port
  $ npm config set https-proxy http://server:port
  ```

- vue的transition过渡类名不受scoped css限制，如果transition没有name，各个transition会互相影响

- vue的transition中如果需要一个元素移除后，剩余元素以动画形式移动，则需要在被移除的元素的.v-leave-active中加上`position: absolute`，以计算剩余元素移动时的初始位置

- MouseEvent的offsetX直至获取前都是可以变化的（Chrome）

- iOS Safari中如果需要键盘出现search按钮，需要将`<input type="search">`放在`<form action="">`中，且必须具有action属性，如果需要防止提交，可在onsubmit中阻止。

- 一个容器本身也是其父容器的栅格元素时，记得声明宽高，不然其栅格元素的宽高可能会受影响。（如在Chrome中，如果一个置换元素，如图片，的栅格容器自身没有声明宽高，那么这个栅格元素的容纳块，即containing block就不是预期中的所在的栅格区域，而可能是栅格容器自身）。

- 使用better-scroll时，定位是fixed的元素位置会被改变，只出现在移动端，原因暂时未明，可以使用绝对定位来解决。

- webkit中使用3D相关transform的元素会丢失z-index设置，即这个元素会位于所有元素上方（Chrome未发现这个问题），在父容器加入`transform: translate3d(0px, 0px, 0px)`可避免这个元素遮挡父容器以外的其他元素，在兄弟元素加入`transform: translate3d(0px, 0px, n px)`，n比这个元素大，则可以避免这个元素遮挡兄弟元素。且由于这个bug，应用transform作为过渡的容器若设置了border-radius和over-flow: hidden，容器内的元素依旧会溢出（如不受圆角限制），同样可在容器上加入`transform: translate3d(0px, 0px, 0px)`来解决。

- 在Safari中，如果图片采用百分比宽高，其容纳块必须有具体的宽高（包括弹性盒和栅格轨道），否则宽高会被设为auto，详见：https://stackoverflow.com/questions/44770074/css-grid-row-height-safari-bug。

- 打包时生成分析文件应该使用`npm run build -- --report`（详见[这里](https://segmentfault.com/q/1010000018888820)）

- `&&`操作符在第一个操作数为真时返回第二个操作数，第一个操作数为假时返回第一个操作数。`||`操作符则相反。

- 使用Intersection Observer时，rootMargin仅在intersection root生效，如果target被一个不是intersection root的祖先元素裁剪（如`overflow: hidden`或`clip-path`），rootMargin不会影响裁剪后的形状。比方说，如果rootMargin设为50%，而target被一个设置了`overflow: hidden`的祖先元素裁剪后仅在intersection root的内容区可见，则此时的效果就如同rootMargin设为了0%。

- 不是所有字符都可以用作CSS标识符的。In CSS, identifiers (including element names, classes, and IDs in [selectors](https://www.w3.org/TR/CSS21/selector.html)) can contain only the characters [a-zA-Z0-9] and ISO 10646 characters U+00A0 and higher, plus the hyphen (-) and the underscore (_); they cannot start with a digit, two hyphens, or a hyphen followed by a digit. Identifiers can also contain escaped characters and any ISO 10646 character as a numeric code (see next item). For instance, the identifier "B&W?" may be written as "B\&W\?" or "B\26 W\3F".

- Vue实例的activated在初次渲染时也会触发

- 如果需要将Vue应用部署在子目录中，需要修改3个地方：

  - 在`vue.config.js`中修改`publicPath`
  - 在vue router的`index.js`中的配置选项中加上`base`属性，如`const router = new VueRouter({routes, base: '/sub/'});`
  - 如果启用了PWA，在`public`文件夹的`manifest`文件中修改`scope`属性和`start_url`属性
