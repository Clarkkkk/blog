---
title: 各种对齐方式
author: Aaron Zhou
description: 各种对齐方式
pubDatetime: 2020-07-01T11:29:00.000Z
postSlug: various-alignments
featured: false
draft: false
tags:
    - 笔记
    - CSS
---
# 各种对齐方式

`justify-content` ：定义了在弹性容器的主轴或栅格容器的行内轴方向上的空白如何分配。

`justify-self`：定义了容器中的元素在相应轴的对齐方式。具体如下：

- 在块级布局中，是元素在容纳块的行内轴方向上的对齐方式（调整该值会使元素在行内轴方向上移动）。
- 绝对定位的元素与在块级容纳块中的元素类似，但需要考虑`top`、`left`等偏移量。
- 在栅格布局中，是元素在栅格区域中的行内轴方向上的对齐方式（调整该值会使元素在行内轴方向上移动）。
- 表格布局和弹性布局中的元素会忽略这个属性。

`justify-items`：定义了容器中所有元素的 `justify-self` 值。

`align-content`：定义了在弹性容器的垂轴或栅格容器的块级轴方向上的空白如何分配。

`align-self`：定义了元素在栅格容器的块级轴或弹性容器的垂轴方向上的对齐方式（调整该值会使元素在栅格容器的块级轴或弹性容器的垂轴方向上移动）。

`align-items`：定义了容器中所有元素的 `align-self` 值。

`vertical-align`：规定了行内元素或单元格元素相对于所在行框在与书写方向垂直的方向上的对齐方式。

`text-align`：规定了行内元素或单元格元素相对于所在行框在书写方向上的对齐方式。

`place-*`：分别是相应`align-*`和`justify-*`的缩写，包括`place-content`、`place-items`、`place-self`。

