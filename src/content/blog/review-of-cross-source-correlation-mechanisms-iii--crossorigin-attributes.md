---
title: 跨源相关机制综述（三）：crossorigin属性
author: Aaron Zhou
description: 跨源相关机制综述（三）：crossorigin属性
pubDatetime: 2023-10-13T17:52:18.165Z
postSlug: review-of-cross-source-correlation-mechanisms-iii--crossorigin-attributes
featured: false
draft: false
tags:
    - temp
---
如前文所述，一些元素允许跨源嵌入，但同源策略保护跨源读取，不允许JavaScript读取其内部信息 。声明crossorigin属性可为元素启用CORS，并定义凭据模式。当然，相应的请求和相应也需要使用正确的CORS首部。可使用crossorigin属性的元素包括<img>、<link>、<audio>、<video>、<script>等。

由于在HTML规范中，内嵌的HTML元素发出的请求与使用Fetch API发出的请求是一个概念 。因此，本节所指的“跨源模式”相当于Request中init对象的mode属性，“凭据模式”相当于Request中init对象的credentials属性。

### 各元素在未启用CORS时的限制

<img>：在canvas中使用drawImage()绘制图像时，若传入未声明crossorigin属性的跨源<img>元素，会使canvas变成污染状态（tainted），此时任何读取canvas数据的操作，如getImageData()、toDataURL()、toBlob()等，均会抛出错误 。

<audio>和<video>：任何可能暴露内容信息的操作都需要设置crossorigin属性，如Web Audio API、在<canvas>或WebGL中使用<audio>或<video>元素等 。此外，根据规范，用于嵌入字幕的<track>元素的跨源状态继承自其父元素<audio>或<video>的crossorigin属性 （以防止字幕内容泄露 ）。

<script>：对于跨源的传统脚本（未声明type=module的脚本），若未声明crossorigin属性，在发生错误时，window.onerror中不会收到详细的错误信息，仅有类似“Script error”这样的简单提示。这样做是因为，即使是错误信息，也有可能暴露用户状态 。

<link>：若未声明crossorigin属性，JavaScript不能访问使用该元素导入的跨源样式表等资源，如document.styleSheets中相应样式表的cssRules、rules属性及insertRule()、deleteRule()等方法均不能访问，否则会抛出错误 。

此外，当<link>和<script>使用integrity属性实现Subresource Integrity 时，为了防止跨源攻击者暴力匹配integrity的值，未启用CORS时，脚本不允许读取元素的integrity值。

### crossrorigin属性的取值

crossorigin可取的值有两个，anonymous和use-credentials。大部分可使用crossorigin的元素都会使用规范中的这个算法 确定跨源模式和凭据模式：

- 未声明该属性时，请求的跨源模式为no-cors，凭据模式为include；
- 声明为anonymous（或其他不合法的字符串）时，将请求的跨源模式设为cors，凭据模式设为same-origin；
- 声明为use-credentials时，将请求的跨源模式设为cors，凭据模式设为include。

### 几个特例

实际上，上述默认算法在一些时候并非最佳实践（如默认发送凭据的行为可被CSRF攻击利用 ），只是为了向后兼容而妥协。设计新的元素类型时，规范制定者才得以抛下历史包袱重新考虑。

### 模块脚本

模块脚本（即<script type="module" ...>）在设计之初就以cors作为默认跨源模式，无论其是否声明crossorigin属性 。

模块脚本的凭据模式一开始是omit，这是为了与Fetch API保持一致。因为在Fetch API发布之初，fetch()默认的凭据模式就是omit。后来，规范设计者考虑到这与XMLHttpRequest接口的默认行为不一致，默认不带凭据问题也比较多，将fetch()的默认凭据模式改为same-origin 。于是，模块脚本的默认凭据模式也一并改为same-origin。

对于模块脚本的预加载，一开始开发者使用<link rel="preload" ...>来实现。因为使用<link rel="preload" ...>预加载启用了CORS的资源时，必须声明与资源的CORS模式相匹配的crossorigin属性。如前所述，模块脚本一开始的默认凭据模式为omit，而<link rel="preload" ...>使用上文的默认算法，无法提供omit凭据模式，因此用它来预加载模块脚本会出现问题 。尽管后来对模块脚本的请求已经默认使用same-origin凭据模式 ，因此可使用<link rel="preload" crossorigin ...>来预加载模块脚本。但这样做仍有缺点 ，这也是引入<link rel="modulepreload" ...>的初衷。

<link rel="modulepreload" ...>与<script type="module" ...>保持一致，即默认跨源模式为cors（同样无需声明crossorigin），默认凭据模式为same-origin。

### Manifest文件

其实大部分<link>元素均使用上文中的算法确定跨源模式和凭据模式。但规范同时规定，一些link类型可使用自己的算法 。目前使用自有算法的有<link rel="manifest" ...>和上文提到的<link rel="modulepreload" ...>。此前，<link rel="manifest" ...>使用的是Web App Manifest规范中的自有算法 。在最近，出于对一致性的考虑 ，最新的Web App Manifest规范将这个算法删去 ，并引用在HTML规范中新添加的算法 ，即默认跨源模式为cors（无需声明crossorigin），默认凭据模式为same-origin。

## 文章目录

[跨源相关机制综述（总）](https://zhuanlan.zhihu.com/p/345005106)

[跨源相关机制综述（一）：同源策略与跨源资源共享](https://zhuanlan.zhihu.com/p/345012141)

[跨源相关机制综述（二）：Fetch与XMLHttpRequest在跨源上的异同](https://zhuanlan.zhihu.com/p/345019873)

跨源相关机制综述（三）：crossorigin属性

跨源相关机制综述（四）：Spectre攻击与跨源机制的改进