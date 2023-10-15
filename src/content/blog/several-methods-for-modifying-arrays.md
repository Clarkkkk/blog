---
title: 几个修改数组的方法
author: Aaron Zhou
description: 几个修改数组的方法
pubDatetime: 2021-03-04T21:01:00.000Z
postSlug: several-methods-for-modifying-arrays
featured: false
draft: false
tags:
    - 笔记
    - JavaScript
---
# 几个修改数组的方法

## `slice()`

### 语法

```javascript
arr.slice([start[, end]])
```

#### 参数

- `start`（可选）

  从零开始的索引值，表示提取的起始位置。负值表示从数组末尾开始计数（-1为最后一个元素）。如果 `start` 为 undefined，`slice` 从 `0` 开始。如果 `start` 比整个数组索引范围还大，会返回空数组。

- `end`（可选）

  从零开始的索引值，表示提取的结束位置的**后一位**，即 `slice` 提取的位置不包括 `end`。负值同样表示从数组末尾开始计数。`slice(2,-1)` 提取了数组中第三个元素到倒数第二个元素（因为不包括 `end`）。如果 `end` 比整个数组索引范围还大，或者没有传入 `end`，会一直提取到数组末尾。

#### 返回值

新数组。原数组不会被修改。

## `concat()`

### 语法

```javascript
const new_array = old_array.concat([value1[, value2[, ...[, valueN]]]])
```

#### 参数

- `valueN`（可选）

  拼接到新数组的数组或值（传入的数组会被展平一层）。不传入任何值时，这个方法返回原数组的一个拷贝。

#### 返回值

新数组。原数组不会被修改。

## `splice()`

### 语法

```javascript
let arrDeletedItems = array.splice(start[, deleteCount[, item1[, item2[, ...]]]])
```

#### 参数

- `start`

  开始更改数组的索引值。

  如果比数组长度还大，会重设为数组的长度值。在这种情况下，不会有元素被删除，所有传入的元素都会被添加到数组末尾。

  如果是负值，则从数组末尾开始计算，即相当于 `array.length - n`。如果 `array.length + start` 还小于0，则重设为0。

- `deleteCount`（可选）

  表示从`start`开始删除的元素个数。

  如果忽略 `deleteCount`，或此值大于或等于`array.length - start`（即比从 `start` 开始到数组末尾的元素个数还大），则从 `start` 开始到数组末尾的所有元素都会被删除。

  如果 `deleteCount` 是 `0` 或负值，则不会删除元素。

- `item1, item2, ...`（可选）

  加入至数组的元素，从 `start` 开始，即 `item1` 会位于 `start`，原本位于`start`的元素则被往后推。

#### 返回值

包含被删除元素的数组。如果没有元素被删除，则返回空数组。原数组被修改。
