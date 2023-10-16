---
title: 跨源相关机制综述（二）：Fetch与XMLHttpRequest在跨源上的异同
author: Aaron Zhou
description: 跨源相关机制综述（二）：Fetch与XMLHttpRequest在跨源上的异同
pubDatetime: 2021-01-18T18:35:00.000Z
postSlug: cross-source-correlation-mechanism-review-2--cross-source-similarities-and-differences-between-fetch-and-xmlhttprequest
featured: false
draft: false
tags:
    - 笔记
    - HTTP
    - HTML
    - JavaScript
---
### Fetch

fetch(resource, init)函数 接收一个resource参数和一个可选的init对象。其中resource可为URL字符串，也可为一个Request对象。Request对象也提供构造函数Request(resource, init)，其接收的参数与fetch()大致相同，这里先略去。

init对象参数中可声明的属性有很多，下面简要介绍几个与跨源请求相关的属性。

headers：请求首部，为Headers对象或包含首部字符串的对象字面量。出于安全原因，有一部分首部不能在JavaScript中设置（即Forbidden header name）。

mode：请求的跨源模式，可取值为cors、no-cors、same-origin、navigate，默认值为cors。出于安全原因，在Chromium中，no-cors曾一度只在Service Worker中可用，其余环境会直接拒绝相应的promise （后来已经重新可用）。

credentials：请求是否需要带上认证凭据，可取值为omit、same-origin、include，默认值为same-origin。

使用fetch()函数发起的请求遵循上文提到的所有规则。比如说，mode为cors时，浏览器会为请求加上Origin首部；请求不属于简单请求时，浏览器会先发出preflight请求。

使用fetch()函数发出请求后，获得的响应是一个Response对象 ，其主要属性如下。

Response.status：只读，响应的状态码。

Response.type：只读，表示响应的类型。可能的值有：

- basic：表示同源响应，除Set-Cookie和Set-Cookie2（Forbidden response header name）外，所有首部均可访问。
- cors：表示对一个有效跨源请求的响应，可访问的首部受CORS限制。
- error：表示网络错误，状态码为0，首部为空，而且fetch()的promise被拒绝。
- opaque：表示对一个模式为no-cors的跨源请求的响应，Response.status为0，Response.headers为空，Response.body为null。这并不表示响应发生了错误，因为即使响应的状态码是200，Response.status也依旧是0。换句话说，opaque响应只对JavaScript不透明（而对浏览器可见），JavaScript无法读取其内部信息。 
- opaqueredirect：表示对一个带redirect: "manual"属性的请求的响应，Response.status为0，Response.headers为空，Response.body为null。与opaque响应类似，opaqueredirect响应只对JavaScript不透明。

Response.headers：只读，是一个Headers对象，包含响应的首部。如CORS中所述，当Response.type为cors时，只有CORS-safelisted response header和Access-Control-Expose-Headers中声明的首部能通过这个属性对象访问。

上文提到，一些嵌入元素允许使用跨源资源，但在同源策略的限制下，JavaScript不能读取这些资源的内部信息。如果我们使用Fetch API以no-cors模式手动请求这些资源，就会得到一个不透明响应，即类型为opaque的响应。JavaScript既没有办法读取、也没有办法修改这样的响应，因此一般来说，这样的响应用处不大。不过，在Service Worker中，我们仍然可以使用Cache API将这样的不透明响应缓存起来，以加快加载速度，或供离线使用。这样做会有相应的局限。

### XMLHttpRequest

由于IE浏览器不支持Fetch API ，需要兼容IE时，只能使用XMLHttpRequest接口。

这里不讲XMLHttpRequest的用法 ，只说明XMLHttpRequest与Fetch在跨源方面的几处不同：

- XMLHttpRequest的跨源模式只支持cors，不支持no-cors或same-origin。如果请求的跨源资源没有实现CORS，则会抛出INVALID_ACCESS_ERR错误。
- XMLHttpRequest对象的withCredentials属性用于控制跨源请求是否带上凭据，默认值为false。根据规范 ，XMLHttpRequest的凭据模式只有include和same-origin两种。也就是说，withCredentials只用于控制跨源请求的凭据模式，true为include，false为same-origin。而同源请求则一律带上凭据。因此，想要不带凭据地发出同源请求将难以做到（仅Firefox提供了非标准的语法）。
- XMLHttpRequest使用setRequestHeader() 来设置请求的首部。与Fetch一样，有一部分首部（Forbidden header name）不能设置。
- XMLHttpRequest使用getResponseHeader() 来获取响应的首部。获取首部的限制与Fetch一样。
- 当在XMLHttpRequest.upload属性对象 上注册事件或创建的请求不是一个简单请求时，浏览器会发出先preflight请求。

## 文章目录

[跨源相关机制综述（总）](https://aaroon.me/blog/posts/review-of-cross-source-related-mechanisms-total/)

[跨源相关机制综述（一）：同源策略与跨源资源共享](https://aaroon.me/blog/posts/review-of-cross-source-correlation-mechanism-1--homologous-policy-and-cross-source-resource-sharing/)

[跨源相关机制综述（二）：Fetch与XMLHttpRequest在跨源上的异同](https://aaroon.me/blog/posts/cross-source-correlation-mechanism-review-2--cross-source-similarities-and-differences-between-fetch-and-xmlhttprequest/)

[跨源相关机制综述（三）：crossorigin属性](https://aaroon.me/blog/posts/review-of-cross-source-correlation-mechanisms-iii--crossorigin-attributes/)

[跨源相关机制综述（四）：Spectre攻击与跨源机制的改进](https://aaroon.me/blog/posts/overview-of-cross-source-related-mechanisms-iv--spectre-attacks-and-improvements-in-cross-source-mechanisms/)
