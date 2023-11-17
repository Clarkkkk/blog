---
title: JavaScript The Definite Guide 读书笔记：Property和Attribute
author: Aaron Zhou
description: JavaScript The Definite Guide 读书笔记：Property和Attribute
pubDatetime: 2021-01-07T06:05:00.000Z
postSlug: javascript-the-definite-guide-to-reading-notes-property-and-attribute
featured: false
draft: false
tags:
    - 笔记
    - JavaScript
---
# *JavaScript: The Definite Guide* 读书笔记：Property和Attribute

## Property

为属性赋值时，只会在原来的对象上创建或修改属性，不会影响原型链上的对象。

继承只出现在属性查询上，为属性赋值时，若原型链上有同名属性，可以覆盖掉该同名属性。

属性赋值有一个例外情况，假如继承而来的属性是一个访问器属性，并且包含setter方法，则会在这个对象（而非原型对象）上调用setter方法来设置属性值。

属性赋值也可能会失败，有以下几种错误会导致失败：

1. 查询属性时，若该对象为undefined或null，则会抛出TypeError错误，ES2020可以使用?.来避免这个问题

2. 设置属性时，若该对象为undefined或null，同样会抛出TypeError错误
   设置属性时，若：

   - 该属性为只读属性
   - 原型链上的同名属性为只读属性
   - 该对象没有这个属性，原型链上也没有相应setter，且这个对象的extensible为false

   则会设置失败，严格模式下会抛出TypeError。

## Property 枚举

### 枚举方法

- Object.keys() 返回由一个对象的自有可枚举属性名称组成的数组。这个数组不包含不可枚举的属性、继承而来的属性或Symbol属性。
- Object.getOwnPropertyNames() 与 Object.keys() 类似但返回的数组包括不可枚举的自有属性名称，只要这些名称是字符串。
- Object.getOwnPropertySymbols() 返回名称为Symbol的自有属性，无论它们是否可枚举。
- Reflect.ownKeys() 返回所有的自有属性名称，包括可枚举和不可枚举的，也包括字符串和Symbol类型的。
- for-in循环在每个可枚举属性（包括自有属性和继承属性）之间循环。

### 枚举顺序

ES6规定了对象自有属性的枚举顺序，Object.keys()、Object.getOwnPropertyNames()、Object.getOwnPropertySym bols()、Reflect.ownKeys()和相关的方法如JSON.stringify()均以下方的顺序枚举属性：

1. 字符串属性中名称为非负整数的属性会被首先列出，顺序从小到大。这意味着数组和类数组对象会按顺序枚举属性。
2. 在所有类数组索引的属性列举完成以后，列举剩余所有的字符串属性（包括名称为负数或浮点数的属性）。这些属性以它们被添加到对象的顺序列出。对于在对象字面量定义的属性，其顺序与在对象字面量中声明的顺序一致。
3. 最后，以被添加到对象的顺序列出所有Symbol属性。

在ES6发布之初，一些厂商并未规定for-in循环的枚举顺序，Object.keys()和JSON.stringify()使用和for-in循环一样的枚举顺序，因此也不明确。在2020年大部分厂商已实现符合上述枚举顺序的for-in循环，规范里也删去了“Object.keys()和JSON.stringify()方法使用和for-in循环同样枚举顺序”的字句。for-in循环首先按照上述顺序枚举自有属性，再循原型链往上枚举原型对象的属性。注意，若已有相同名称的属性被枚举过了，或同名属性为不可枚举属性，则原型链上的同名属性会被跳过。

## Atrribute

使用Object.defineProperty()创建或修改属性时，违反以下规则会抛出TypeError：

- 不可以为extensible为false的对象添加属性，但可以修改现有属性
- configurable为false时，不可以修改configurable或enumerable
- 如果一个访问器属性的configurable为false，不可以修改它的getter或setter方法，也不可以把它改为数据属性
- 如果一个数据属性的configurable为false，不可以将其改为访问器属性，也不可以将writable从false改为true，但可以将writable从true改为false
- 如果一个数据属性的configurable和wirtable都是false，不可以修改value特性。但如果configurable是true，writable是false，则可以修改value（此时相当于先将writable改为true，再修改value，最后将writable再改回false）
