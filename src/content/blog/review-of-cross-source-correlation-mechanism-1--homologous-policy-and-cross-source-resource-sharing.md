---
title: 跨源相关机制综述（一）：同源策略与跨源资源共享
author: Aaron Zhou
description: 跨源相关机制综述（一）：同源策略与跨源资源共享
pubDatetime: 2023-10-13T17:49:37.176Z
postSlug: review-of-cross-source-correlation-mechanism-1--homologous-policy-and-cross-source-resource-sharing
featured: false
draft: false
tags:
    - temp
---
## Same-origin policy

Same-origin policy，即同源策略  ，是浏览器的一个安全机制，用于限制文档和脚本与来自另一个源的资源的交互。这个机制主要用于隔离潜在的有害文档，预防可能的攻击。需要注意，同源策略保护的是资源所在的源，而非请求资源的源。

举一个简单的例子，比如用户登录了一个银行网站，同时打开了另一个恶意网站。如果没有同源策略，恶意网站可通过脚本向银行网站发出请求，由于此时用户是登录状态，恶意网站就能够获取用户的账户信息，或发起转账，盗取用户钱财。

同源的定义是，两个源的协议（scheme）、域名（domain）、端口（port）均相同 。此外，在URL为 about:blank或javascript:的页面上的脚本会继承包含该URL的页面所属的源。但data:类的URL会获得一个全新的、空的安全上下文 。

在IE中，属于Trust Zone中的域不受同源策略限制。并且IE不检查端口号 。

跨源操作包括以下三类：

1. 跨源写入一般是允许的。例如链接、重定向、表单提交等等。一些HTTP请求需要preflight请求。
2. 跨源读取一般是禁止的。但读取权限常常在嵌入中泄露。例如，你可以读取一张嵌入图片的尺寸、读取嵌入脚本的动作等。
3. 跨源嵌入一般也是允许的。例子见下：

- 使用<script src="…"></script>嵌入的JavaScript。对于嵌入脚本，具体的语法error信息只在同源脚本中可见，且跨源脚本禁止使用诸如跨源fetch请求等API（存疑）
- 使用<link rel="stylesheet" href="…">嵌入的CSS。由于对CSS的语法解析规则十分宽松 ，跨源的CSS需要声明一个正确的Content-Type首部
- 使用<img>嵌入的图片
- 使用<video>和<audio>嵌入的媒体
- 使用<object>和<embed>嵌入的其他资源
- 使用@font-face引入的字体。规范要求字体请求必须使用相当于crossorigin="anonymous"的跨源模式，跨源的字体响应要设置合适的Access-Control-Allow-Origin首部 
- 使用<iframe>嵌入的所有资源。站点可使用[X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)响应首部以阻止跨源框架

在同源策略的限制下，浏览器将拒绝读取跨源资源的内部信息（更多限制参见crossorigin属性）。为此，我们需要使用跨源资源共享（CORS）。

## CORS

跨源资源共享（CORS） 是基于HTTP首部的用于在不同的源中获取资源的一个机制。

### 什么请求会用到CORS

- XMLHttpRequest或Fetch API
- 在CSS @font-face中用到的跨源字体
- WebGL纹理
- 在canvas中使用drawImage()绘制的图像或视频帧
- 来源于图像的CSS Shapes
- 可使用crossorigin属性的<img>、<link>、<audio>、<video>、<track>、<script>等元素
- [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)接口

### 简单请求

所谓简单请求，就是不需要预请求（preflight request）的请求，需要满足以下所有条件：

- 请求方法为GET、HEAD或POST
- 除用户代理自动设置的首部（如Connection、User-Agent及规范中定义的禁用首部 ）外，只有这些首部（即CORS-safelisted request header ）可自定义：Accept、Accept-Language、Content-Language、Content-Type 
- 其中Content-Type只可以取这些值：application/x-www-form-urlencoded、multipart/form-data、text/plain
- XMLHttpRequestUpload对象上没有注册任何事件监听器（这个对象通过XMLHttpRequest.upload属性 访问）
- 请求中没有使用任何ReadableStream对象 

对于这类跨源请求，浏览器会自动加上Origin首部（带Origin首部的请求并不一定是跨源请求，因为除HEAD、GET以外的请求也会加上Origin首部）。Origin首部与Referer首部类似，但不包含路径信息。服务器响应报文中应包含Access-Control-Allow-Origin首部，指定允许的源。

### Preflight请求

对于这类请求，浏览器会先使用OPTIONS方法发送一个请求，使用Access-Control-Request-Method、Access-Control-Request-Headers首部分别询问服务器是否允许相应的请求方法和请求首部（使用XMLHttpRequest中的setRequestHeader()方法或Fetch中的headers设置）。

需要注意，preflight请求不会带上认证凭据（如cookies），也就是说，preflight请求的凭据模式（即credentials mode） 是omit。

服务器会在响应中带上Access-Control-Allow-Methods、Access-Control-Allow-Headers首部，表示可使用的请求方法和请求首部，还会带上Access-Control-Max-Age，表示这个响应的有效期。在有效期内，都不需要再次发送OPTIONS请求了。接下来就可以发送真正的请求。

### 带凭据的请求

默认情况下，跨源请求不会带上凭据，需要在XMLHttpRequest中将withCredentials属性设为true，或者在fetch请求体对象中加上credentials: 'include'，以将凭据模式设为include。对应的服务器响应需要包含值为true的Access-Control-Allow-Credentials首部，否则会被浏览器忽略。

注意，响应中的Access-Control-Allow-Origin首部的值不能为*，必须是具体有效的源。同样地，Access-Control-Expose-Headers、Access-Control-Allow-Methods和Access-Control-Allow-Headers在请求的凭据模式为include时，都不能取值为*。

此外，跨源使用的cookies也受到浏览器对于第三方cookies的限制。

### 跨源首部

下面是各个跨源首部的具体用法。

### 请求首部

**Access-Control-Request-Method**

用于preflight请求中，表示后续请求将会使用的请求方法，只声明一个方法。

**Access-Control-Request-Headers**

用于preflight请求中，表示后续请求可能会发送的首部，多个首部以逗号分隔。

### 响应首部

**Access-Control-Allow-Origin**

可取值为*、<origin>、null。

取值为*时，允许任意源访问资源。但请求不能带凭据，否则会发生错误。

取值为<origin>时，只能声明一个源。并且响应还应带上Vary首部，取值为Origin，以表明服务器响应可能会根据源的不同而不同。

null应避免使用。乍看之下，null似乎不允许任何源访问资源，但对于使用 data:或file:协议的源以及沙盒中的文档，其Origin均会被解析为null，很多用户代理也允许这样的文档访问Access-Control-Allow-Origin为null的响应。Origin为null的文档可以是恶意文档，因此不应使用null值。

**Access-Control-Allow-Credentials**

当对应请求的凭据模式为include时，只有该首部的值为true时才将响应暴露给JavaScript。如果对应的请求是一个preflight请求，则该首部表示真正的请求能否使用凭据。该首部唯一的合法取值是true（如不需要，则应直接不带上该首部）。

**Access-Control-Allow-Methods**

用于响应preflight请求，表示允许使用的方法。多个方法以逗号隔开。对于不带认证凭据的请求，可使用通配符*。

**Access-Control-Allow-Headers**

用于响应带有Access-Control-Request-Headers首部的preflight请求，表示允许使用的首部。多个首部以逗号隔开。对于不带认证凭据的请求，可使用通配符*。

CORS-safelisted request header（即Accept、Accept-Language、Content-Language、Content-Type） 不需要声明也可直接使用，但也可以显式声明这些首部，以绕过一些额外的限制 。

**Access-Control-Max-Age**

表示preflight请求的响应可以缓存的时间秒数，在这段时间内，不需要再次发送preflight请求。设为-1表示不允许缓存。该值有最大值，各浏览器有所不同 。

**Access-Control-Expose-Headers**

Access-Control-Expose-Headers是响应首部，用于将首部暴露给浏览器。默认情况下，只有7个响应首部（称为CORS-safelisted response header ）可以直接通过JavaScript访问  ：

- Cache-Control 
- Content-Language 
- Content-Length 
- Content-Type 
- Expires 
- Last-Modified 
- Pragma 

其余首部需要在响应中使用Access-Control-Expose-Headers首部声明后才可以通过脚本访问。

以逗号分隔可声明多个首部。对于不带认证凭据的请求，可使用通配符*。需要注意，通配符*不包含Authencation首部，如需暴露Authencation首部，则需单独显式声明该首部。

## 文章目录

[跨源相关机制综述（总）](https://zhuanlan.zhihu.com/p/345005106)

跨源相关机制综述（一）：同源策略与跨源资源共享

跨源相关机制综述（二）：Fetch与XMLHttpRequest在跨源上的异同

跨源相关机制综述（三）：crossorigin属性

跨源相关机制综述（四）：Spectre攻击与跨源机制的改进