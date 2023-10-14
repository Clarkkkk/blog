---
title: 跨源相关机制综述（四）：Spectre攻击与跨源机制的改进
author: Aaron Zhou
description: 跨源相关机制综述（四）：Spectre攻击与跨源机制的改进
pubDatetime: 2023-10-13T17:52:19.807Z
postSlug: overview-of-cross-source-related-mechanisms-iv--spectre-attacks-and-improvements-in-cross-source-mechanisms
featured: false
draft: false
tags:
    - temp
---
在2018年，Google的Project Zero团队和其他安全人员相继发现了一个影响世界上绝大多数CPU的安全漏洞，Spectre 。这个漏洞允许一个进程读取其本不允许读取的内存数据。这也使得浏览器变得不安全，因为在浏览器中，不同网站的不同文档可以在同一进程中运行 。恶意网站可能会利用这个漏洞读取用户在其他网站上的信息。为此，Google、Mozilla等浏览器厂商做了很多工作来预防这类问题，其中也包括对跨源机制的改进。

为了防止类似的漏洞，WHATWG工作组先后新增了Cross-Origin-Resource-Policy、Cross-Origin-Opener-Policy和Cross-Origin-Embedder-Policy 3个HTTP响应首部，服务器使用这些首部告诉浏览器保护站点数据。此外，Chromium实现了站点隔离（Site Isolation）机制，保证不同站点独立运行在不同进程中，并阻止敏感数据的传播 。该机制从Chrome 67开始默认启用。相应地，Firefox也正在测试类似机制（Fission） ，Safari则正在跟进 。

### Cross-Origin Read Blocking

Cross-Origin Read Blocking（下称CORB）不是一个HTTP首部，而是站点隔离机制的一部分 。如上文所说，站点隔离可以让不同站点运行在不同进程中，但这样还不够，因为恶意网站仍然可以合法地请求跨源资源。例如，一个恶意网站可以使用一个<img>元素来请求含有敏感信息（如银行余额）的JSON文件：

```
<img src="https://your-bank.example/balance.json">
```

这个JSON文件会出现在该恶意站点的渲染器进程的内存中，渲染器发现这不是一个有效的图片格式，于是不渲染这张图片。在类似Spectre漏洞的帮助下，攻击者可以设法访问这部分内存以获取敏感信息。

CORB正是用于阻止这样的访问。如果一个响应被CORB阻止，这个响应甚至不会到达恶意站点所在的进程中，这比之前 所讲的不透明响应（脚本不能访问，但可出现在渲染器进程中）更严格 。

CORB不会检视以下两类请求：

- 导航请求或各种嵌入请求，例如跨源的<iframe>、<object>、<embed>等。这些嵌入元素本身就有一个独立的安全上下文，在站点隔离的帮助下，其数据与恶意文档的数据分别存于不同进程中，已经足够安全
- 下载请求，这类请求的响应数据直接储存至硬盘，不会经过跨源文档的上下文，不需要CORB保护

CORB会检视其余的请求，包括：

- XHR和fetch()
- ping，navigator.sendBeacon()
- <link rel="prefetch" ...>
- 以下资源的请求：
- 图像请求，如<img>元素，网站图标/favicon.ico，SVG中的<image>，CSS中的background-image等等
- 脚本请求，如<script>、importScripts()、navigator.serviceWorker.register()、audioWorklet.addModule()等等
- 音频、视频和字幕请求
- 字体请求
- 样式请求
- 报告请求，如CSP报告、NEL报告等

CORB的核心理念是，考虑一个资源是否在上述所有情景中**均不适用**，如果这个资源在上述情景中要么产生CORS错误，要么产生语法或解码错误，或生成不透明响应，那么此时CORB就应该阻止这个资源的加载。也就是说，CORB进一步阻止了本来就不可用的资源，本来可用的资源可以照常使用（包括正确实现CORS的跨源资源），因此CORB几乎对兼容性没有影响。

目前，CORB会保护3类内容：JSON、HTML、XML（这里说的保护，就是阻止响应到达恶意站点所在进程）。

Fetch规范规定，在请求的跨源模式为no-cors时 ：

- 未声明Content-Type首部的响应不受CORB保护
- 如果响应状态码为206，Content-Type首部确定的MIME type为HTML、JSON或XML（image/svg+xml除外），则响应受CORB保护
- 如果响应声明了X-Content-Type-Options: nosniff首部，Content-Type首部确定的MIME type为上面三种，或者为text/plain，该响应也受CORB保护

Chromium还加入了嗅探机制，用于进一步确定Content-Type首部声明的类型是否正确（未声明Content-Type首部的响应依旧不受CORB保护），做了比Fetch规范更细致的分类 。由于嗅探机制并非尽善尽美，因此谷歌建议开发者使用正确的Content-Type首部，并声明X-Content-Type-Options: nosniff首部，以避免嗅探 。

此外，WHATWG成员正在讨论将更多内容类型加入到CORB的保护范围中，如pdf、csv等 。

### Cross-Origin-Resource-Policy

由于CORB暂时只保护少数特定类型的内容，规范新增Cross-Origin-Resource-Policy响应首部，服务器可以使用这个首部主动保护任意内容。

该首部可取三个值：same-origin、same-site、cross-origin。same-origin和cross-origin分别表示资源只允许同源加载或允许跨源加载。同源的定义已在之前的文章讲过，那same-site是什么呢？

在此之前，先理解一下什么叫做站点 。.com、.org等域被称之为顶级域（TLD，top level domain），那么一个站点就是顶级域加上前面的二级域，例如URLwww.example.com的站点就是example.com。但有一些域，如.edu.cn、.github.io等，只使用顶级域加二级域不足以构成有效站点，而且也没什么特别的规则来确定这样的域。于是人们定义了“实际顶级域”（eTLD，effective top level domain），维护一个列表来确定哪些是实际顶级域 。那么一个站点就定义为eTLD加上前一个域，简称eTLD+1。比如URLwww.example.com.cn的站点就是example.com.cn。

![img](./overview-of-cross-source-related-mechanisms-iv--spectre-attacks-and-improvements-in-cross-source-mechanisms/v2-d5157f2fb36407e0705ed3deb73a341b_1440w.png)





添加图片注释，不超过 140 字（可选）

same-site的意思则是只有请求来自同一个eTLD+1，才允许加载响应。

该首部同样只保护跨源模式为no-cors的请求对应的响应。响应被阻止时，不会进入相应进程。出于对兼容性的考虑，未声明该首部时，浏览器将其当作Cross-Origin-Resource-Policy: cross-origin。

注意，CORP并没有许可更多权限，符合CORP要求的资源仅能用于跨源嵌入。换句话说，如果没有CORP时，脚本就不能读取该资源的内部信息，那么加上CORP，脚本也不会获取更多的权限 。如果需要更多权限，使用CORS吧。

### Cross-Origin-Embedder-Policy

Cross-Origin-Embedder-Policy是一个响应首部，只有两个取值，require-corp和unsafe-none（默认值）。

将COEP声明为require-corp表示响应需要显式声明Cross-Origin-Resource-Policy: cross-origin以允许跨域加载资源；若未声明Cross-Origin-Resource-Policy首部，则将其当作same-origin。

此外，COEP也扩展了CORP的能力，让CORP能够处理由<iframe>或window.open()等产生的跨源导航请求。也就是说，在启用COEP的情况下，若文档未声明Cross-Origin-Resource-Policy: cross-origin，不可以使用<iframe>或window.open()嵌入该文档。

细心的读者可能会发现，上文不是提到跨源的<iframe>、<object>、<embed>等嵌入元素储存在独立进程中吗？为什么还需要使用COEP禁用跨源嵌入框架？因为实现OOPIFs（即Out-of-Process iframes）会显著增加浏览器的内存使用，并非所有浏览器都有实现计划（如为低内存手机设计的浏览器等）  。而没有相关实现的浏览器可能会在同一进程中加载框架。

需要注意，Cross-Origin-Embedder-Policy: require-corp会递归地对所有子资源和框架生效。也就是说，如果文档嵌入了一个启用了COEP的文档，那么这个子文档中的所有跨源资源也同样需要启用COEP（或CORS）。为了实现跨源隔离，这样的递归生效是必要的，详见下文。

下面讲讲Cross-Origin-Embedder-Policy首部的设计初衷及其与CORP的关系。

如果历史可以重来，同源策略应该设计得更严格，资源应默认仅同源下使用，需要跨源才是例外  。但最初设计同源策略时，人们难以预料到会有Spectre这样的漏洞。可惜木已成舟，我们现在已经不可能重新将Cross-Origin-Resource-Policy首部的默认值设为same-origin（否则大部分网页都会出问题）。

工作组成员希望通过Cross-Origin-Embedder-Policy首部为跨源资源的使用重新设定默认值。在最初的讨论中，COEP曾被暂称为Cross-Origin-Resource-Policy-Policy，意为关于CORP的策略 。该首部旨在提供这样的环境，即当设定Cross-Origin-Embedder-Policy: require-corp时，Cross-Origin-Resource-Policy首部的默认值为same-origin。服务器需要显式为跨源使用的资源声明Cross-Origin-Resource-Policy: cross-origin。这样的策略也表明**安全责任在服务器一方**，即服务器需要分辨哪些请求是安全的，再决定是否为响应加上CORP首部。

### Cross-Origin-Opener-Policy

跨源导航并不安全，至少有两个隐患 ：

1. 恶意网站可使用[Window.open()](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)在新窗口中打开普通网站，再通过新窗口的window对象将其导航至恶意目标网站中（反过来，新打开的窗口也可以访问原窗口的window对象，对此Chrome和Firefox已有措施）  。
2. 由于两个网站共享一个浏览上下文组，可能处于同一进程中，攻击者可利用Spectre等漏洞窃取用户信息

Cross-Origin-Opener-Policy响应首部正是用来应对上述隐患。

可取的值有：

unsafe-none：默认值，表示新打开的文档与原文档处于同一浏览上下文。

same-origin：打开一个声明了same-origin的文档会新建浏览上下文，除非原文档也声明了相同的COOP值，且与新文档同源。不同源的文档间不能相互访问window对象。例如，文档A使用window.open()打开了声明same-origin的跨源文档B，则window.open()的返回值应为null（规范如此规定 ，但目前暂无相应的浏览器实现，Chrome和Firefox均返回一个相当于空白页的window对象），B的window.opener也会是null。

same-origin-allow-popups：与same-origin类似，但若声明该值的文档在辅助浏览上下文中打开（如window.open()），则允许与原文档共享浏览上下文。

由上面可知，文档处于同一浏览上下文的条件是所有文档都声明了相同的COOP值（注意，是完全相同，如same-origin和same-origin-allow-popups则不算相同）。

不同的浏览上下文应处于不同进程中，但不能保证所有浏览器都这样实现 。

### 跨源隔离状态

为了利用Spectre类漏洞，攻击者需要测量从内存中读取特定值所需的时间，为此他们需要一个可靠且精确的计时器 。[performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)和[SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)正好可以用作计时器。因此，Chromium和Firefox相继采取措施，降低了performance.now()的时间精度，并默认禁用了SharedArrayBuffer  。

为了重新启用这些API，规范引入跨源隔离状态。注意，这与前面的站点隔离不完全是一个概念，站点隔离侧重于在进程上隔离站点，而跨源隔离侧重于通过HTTP首部，保证处于同一浏览上下文组的所有文档都来自可信任的源。跨源隔离状态要求不同的上下文组应处于不同进程中。

为了开启跨源隔离状态，一个文档需要同时声明以下两个响应首部 ：

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

如果文档处于跨源隔离状态，全局属性crossOriginIsolated将返回true，此时将重新启用SharedArrayBuffer等API。

经过讨论 ，并非所有平台都能支持多进程，[规范](https://html.spec.whatwg.org/multipage/browsers.html#cross-origin-isolation-mode)决定让用户代理 自行决定是否开启跨源隔离状态  。也就是说，即使声明了正确的COEP和COOP，部分用户代理仍有可能将crossOriginIsolated设为false。是否能使用SharedArrayBuffer等API将取决于crossOriginIsolated，而不止COEP和COOP。

[这个网页](https://resourcepolicy.fyi/) 启用了COEP+COOP，可用于测试crossOriginIsolated。