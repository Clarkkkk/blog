---
title: 前端页面性能优化检查清单
author: Aaron Zhou
description: 前端页面性能优化检查清单
pubDatetime: 2023-10-30T09:13:01.871Z
postSlug: front-end-page-performance-optimization-checklist
featured: false
draft: false
tags:
    - 笔记
    - 性能优化
---
*前言：本文只是进行前端页面性能优化时的一份检查清单，不展开叙述，可自行检索相关资料*

## 打包体积

### Tree shaking

Webpack和Rollup可以根据ES Module的import语义在编译时分析哪些代码没有用到，打包时不会将没用到的代码包含进去。依赖库最好满足以下要求：

- 在`package.json`中声明`"sideEffects": false`
- 为没有副作用的函数调用声明`/*#__PURE__*/`注释
- 提供ES Module导出

### 代码分割

- 路由应使用动态引入，以实现页面级的代码分割
- 未立即使用的功能，如果依赖库较大，在不影响体验的情况下可以使用动态引入
- 多个组件或页面共享的依赖库，如果版本较固定，可单独分割为一个块，有利于CDN缓存

### 减少不必要的代码

- 根据实际情况显式指定`.browserslistrc`，减少不必要的polyfill
- 查看使用的依赖，考虑能否替换为体积较小的替代品、或使用原生实现
- 满足需求的前提下，考虑使用tailwind css

## 瀑布流

瀑布流的意思是后面的请求需要等待前面的请求完成才能开始进行，有以下措施可以减少瀑布流：

- script defer、async
- 尽量在顶层组件请求所需要的数据
- preload、prefetch、preconnect
- 启用HTTP/2
- 103 early hints
- 使用服务端渲染

## 渲染

- `loading="lazy"`
- passive scroll listener
- CSS Containment
- 虚拟列表
- 分片渲染
- 减少重绘和重排
- 减少不必要的动画，动画使用transform和opacity

## 压缩

- 代码压缩
- HTTP响应压缩，brotli
- 图片压缩，webp或avif，svgo，sharp

## 图片

- 图片压缩，如上文
- 合理选用图片格式
- 为不同分辨率的设备使用不同分辨率的图片，jampack
- progressive jpeg

## 缓存

- CDN
- 正确实现HTTP缓存
- Service worker

## 框架相关

### React

- 合理使用memo、useMemo、useCallback，减少re-render
- redux使用patch批量更新数据

### Vue

- 避免无意义的响应式，对大对象数据使用shallowRef或shallowReactive

- 合理使用v-memo、v-once

- 使用Composition API的项目可使用`__VUE_OPTIONS_API__: false`去除Options API的代码

  