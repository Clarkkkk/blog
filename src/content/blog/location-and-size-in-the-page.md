---
title: 页面中的位置和大小
author: Aaron Zhou
description: 页面中的位置和大小
pubDatetime: 2021-03-07T13:42:00.000Z
postSlug: location-and-size-in-the-page
featured: false
draft: false
tags:
    - 笔记
    - DOM
---
# 页面中的位置和大小

## 窗口

### 窗口大小

不包含滚动条占用的空间，仅仅是可见视窗的大小：`document.documentElement.clientHeight`、`document.documentElement.clientWidth`。

包含滚动条占用的空间，但不包含浏览器的其他界面：`window.innerHeight`、`window.innerWidth`。

包含状态栏、标题栏等界面的整个浏览器的大小：`window.outerHeight`，`window.outerWidth`。

窗口中整个可滚动页面的实际大小：`document.documentElement.scrollHeight`、`document.documentElement.scrollWidth`。

### 窗口位置

从浏览器视窗的左/上方到屏幕左/上方的距离：`window.screenLeft`、`window.screenTop`（两个等价的属性：`window.screenX`、`window.screenY`）。

窗口水平/垂直滚动的距离：`window.scrollX`、`window.scrollY`（两个等价的属性：`window.pageXOffset`、`window.pageYOffset`）。

## 页面元素

对于块级元素来说，`element.offsetTop`、`element.offsetLeft`、`element.offsetHeight`、`element.offsetWidth`描述了元素相对于`offsetParent`的border box。

而对于行内元素来说，`offsetTop`和`offsetLeft`描述了元素第一个borderbox（如果换行了的话）的位置，即使用`element.getClientRects()`获得的第一个长方形。而`offsetHeight`和`offsetWidth`则描述了bounding border box的尺寸，即使用`element.getBoundingClientRect()`获取的长方形。

### 元素大小

包含内边距，不包含边框：`element.clientHeight`、`element.clientWidth`。对于行内元素，这两个值始终为0。

左/上方边框宽度：`element.clientTop`、`element.clientLeft`。

上述4个属性会将结果舍入为整数。如果需要精确值，可使用`element.getBoundingClientRect()`的属性计算。

包含边框：`element.offsetHeight`、`element.offsetWidth`。

可滚动元素的实际大小：`element.scrollHeight`、`element.scrollWidth`。这两个属性不把绝对定位且超出元素的子元素计算在内。

### 元素位置

**注意：**滚动条的出现可能会意外改变页面元素的位置，尤其是使用JavaScript添加元素时。

相对于`offsetParent`的位置：`element.offsetTop`、`element.offsetLeft`。

相对于视窗的位置：`element.getBoundingClientRect()`，这个方法返回一个`DOMRect`对象，这个对象有4个属性`top`、`left`、`bottom`、`right`，分别表示元素的上、左、下、右边界（包含边框，不含外边距）相对于视窗左/上边界的距离。`element.getClientRects()`方法则返回一个`DOMRect`对象的列表（块级元素只返回一个`DOMRect`对象，行内元素则为每一行都返回一个`DOMRect`对象）。

相对于元素自身整个可滚动内容的位置（没有滚动时为0）：`element.scrollTop`、`element.scrollLeft`。

## 鼠标位置

相对于视窗：`MouseEvent.clientX`、`MouseEvent.clientY`。

相对于整个可滚动的页面：`MouseEvent.scrollX`、`MouseEvent.scrollY`。

相对于目标元素的内边距边缘：`MouseEvent.offsetX`、`MouseEvent.offsetY`。

相对于上一次鼠标事件：`MouseEvent.movementX`、`MouseEvent.movementY`。

相对于屏幕：`MouseEvent.screenX`、`MouseEvent.screenY`。
