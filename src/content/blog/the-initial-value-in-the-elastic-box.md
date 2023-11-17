---
title: 弹性盒中的初始值
author: Aaron Zhou
description: 弹性盒中的初始值
pubDatetime: 2021-01-23T15:02:00.000Z
postSlug: the-initial-value-in-the-elastic-box
featured: false
draft: false
tags:
    - 笔记
    - CSS
---
# 弹性盒中的初始值

align-items的初始值是stretch。如果元素在垂轴方向上显式设置了尺寸（min-height、min-width、max-height、max-width、height或width），则stretch不生效。

justify-content的初始值是flex-start，而align-content的初始值是stretch。

对弹性元素来说，min-width的初始值为auto。对于可滚动容器中的弹性元素，auto为0；对于不可滚动容器中的弹性元素，auto是显式声明尺寸（width或height）和min-content尺寸中的较小值。

flex的初始值为`0 1 auto`。

当不使用flex简写属性，而使用三个独立属性时，flex-grow的初始值为0，flex-shrink的初始值为1，flex-basis的初始值为auto，可以看到，这与flex的初始值一一对应。这也意味着，当既没有声明flex，也没有声明flex-grow、flex-shrink和flex-basis时，相当于只声明了`flex: 0 1 auto`。

flex-basis的初始值为auto。如果声明了width或height，则auto的计算值就是width或height，如果没有声明，则auto的计算值为content。`flex-basis: content`相当于`flex-basis: auto; width(height): auto`，其大小基本相当于max-content。

然而，在使用flex简写属性时，忽略`<flex-grow>`时，其值被重设为1，忽略`<flex-shrink>`时，其值被重设为1，忽略`<flex-basis>`时，其值被重设为0。需要注意的是，`<flex-grow>`和`<flex-basis>`被重设的值与它们自身的初始值不同。

flex可取值的关键字有3个：其中`flex: initial`相当于`0 1 auto`，`flex: auto`相当于`1 1 auto`，`flex: none`相当于`0 0 auto`
