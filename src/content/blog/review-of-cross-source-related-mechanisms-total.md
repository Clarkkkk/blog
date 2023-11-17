---
title: 跨源相关机制综述（总）
author: Aaron Zhou
description: 跨源相关机制综述（总）
pubDatetime: 2021-01-17T16:15:00.000Z
postSlug: review-of-cross-source-related-mechanisms-total
featured: false
draft: false
tags:
    - 笔记
    - HTTP
    - HTML
    - JavaScript
---
在前端开发中，常常会遇到所谓的“跨域”问题。其实跨域并不准确，因为跨端口或者跨协议也会遇到相同的问题。准确的称呼是跨源（cross origin）。本系列文章将讲述关于跨源的方方面面，并尽可能地厘清相关机制的设计初衷、各机制的局限性及相应的演变等。

本系列文章包括四部分：

[跨源相关机制综述（一）：同源策略与跨源资源共享](https://aaroon.me/blog/posts/review-of-cross-source-correlation-mechanism-1--homologous-policy-and-cross-source-resource-sharing/)

[跨源相关机制综述（二）：Fetch与XMLHttpRequest在跨源上的异同](https://aaroon.me/blog/posts/cross-source-correlation-mechanism-review-2--cross-source-similarities-and-differences-between-fetch-and-xmlhttprequest/)

[跨源相关机制综述（三）：crossorigin属性](https://aaroon.me/blog/posts/review-of-cross-source-correlation-mechanisms-iii--crossorigin-attributes/)

[跨源相关机制综述（四）：Spectre攻击与跨源机制的改进](https://aaroon.me/blog/posts/overview-of-cross-source-related-mechanisms-iv--spectre-attacks-and-improvements-in-cross-source-mechanisms/)

这一系列文章字数超过8000，花了我大约一周多的时间。撰写期间我查阅了大量资料，并悉数附于文后，以供查阅。尽管如此，由于水平所限，难免有纰漏，如有发现，敬请斧正。
