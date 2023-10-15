---
title: Vue笔记：v-model
author: Aaron Zhou
description: Vue笔记：v-model
pubDatetime: 2020-09-19T18:00:00.000Z
postSlug: vue-notes-v-model
featured: false
draft: false
tags:
    - 笔记
    - Vue
---
# Vue 笔记：v-model

## 本质是语法糖

`v-model`本质上是语法糖，在原生元素和自定义组件中的用法略有不同。

## 在原生元素上使用时

```html
<input v-model="searchText">
```

等价于

```html
<input
  v-bind:value="searchText"
  v-on:input="searchText = $event.target.value"
>
```

 `v-model`指令常用于`<input>`、`<textarea>`及`<select>`元素上，以创建双向数据绑定。`v-model`会忽略元素自身的初始attribute，使用Vue实例的数据（上述例子中的searchText）作为初始值。

Vue文档中提到，`v-model`在内部为不同的输入元素使用不同的property作为prop并抛出不同的事件：

- text和textarea元素使用`value` property 和`input`事件
- checkbox和radio使用`checked` property和`change`事件
- select 字段使用`value`作为prop并将`change`作为事件

而具体情况则要更复杂一些。

例如对于checkbox，v-model的行为与其绑定的变量类型是布尔值类型还是数组类型有关。

当v-model绑定的是布尔值类型的变量时：

```html
<input type="checkbox" v-model="isChecked">
```

 相当于

```html
<input
	type="checkbox"
  v-bind:checked="checked"
  v-on:change="isChecked = $event.target.checked"
>
```



## 在自定义组件中使用时

```html
<custom-input v-model="searchText"></custom>
```

等价于

```html
<custom-input
  v-bind:value="searchText"
  v-on:input="searchText = $event"
></custom-input>
```

