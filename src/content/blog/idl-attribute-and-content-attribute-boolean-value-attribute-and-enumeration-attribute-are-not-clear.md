---
title: IDL 属性与内容属性、布尔值属性与枚举属性傻傻分不清楚？
author: Aaron Zhou
description: IDL 属性与内容属性、布尔值属性与枚举属性傻傻分不清楚？
pubDatetime: 2023-10-13T17:49:35.458Z
postSlug: idl-attribute-and-content-attribute-boolean-value-attribute-and-enumeration-attribute-are-not-clear
featured: false
draft: false
tags:
    - temp
---
开始之前，先看几个问题：

```
<!-- 以下哪个写法是正确的？ -->
<input type="button" required="required">
<input type="button" required="">
<input type="button" required>
<input type="button" required="true">
<input type="button" required=required>
<!-- 以下哪个写法是正确的？ -->
<div contenteditable>An editable item</div>
<div contenteditable="">An editable item</div>
<div contenteditable="true">An editable item</div>
<div contenteditable="contenteditable">An editable item</div>
```

是不是稍微有点疑惑？再看看这个：

```
// 下面哪个写法是正确的？
let div = document.querySelector('div');
div.contenteditable = true;
div.contentEditable = true;
div.contentEditable = 'true';
div.contentEditable = '';
```

如果对上面的问题有疑惑，正好可以看看这篇文章。

## 布尔值属性

在 HTML 中，有一类属性被称为布尔值属性。当声明了这个属性时，其值为 true；而未声明时，其值为 false。例如上面提到的 required。HTML 规范对这类布尔值属性的写法设定了几个简单的规则：

- 如果声明了属性，其值必须是一个空字符串或一个大小写无关的与属性名严格匹配的字符串（前后都没有空格）。如果没有给这个属性分配值，其值会隐式地与空字符串相同。以上这些值都代表 true。
- 如果需要将属性设置为 false，应该完全不声明这个属性。

所以这几个写法都是符合规范的：

```
<input type="button" required="required">
<input type="button" required="">
<input type="button" required>
```

由于字符串大小写无关，你甚至可以这样写：

```
<input type="button" required="ReQuIred">
```

还有一种写法只在 HTML 中有效，在 XML 中无效：

```
<input type="button" required=required>
```

此外，虽然是布尔值属性，这样写却是不对的：

```
<input type="button" required="false">
```

由于声明了 required 属性，这个属性会被浏览器理解为 true。

## 枚举属性

枚举属性，顾名思义，就是取值是一个由若干关键词组成的枚举集合。例如 input 元素的 autocomplete 属性，这个属性可取值为 username、email、country、tel、url 等等。乍看上去和布尔值属性风马牛不相及。但有一些枚举属性的取值非常让人迷惑，例如上面的 contenteditable。contenteditable 只有两个枚举值："true" 和 "false"。是的，你没看错，就是这么让人疑惑。此外，由于空字符串也代表 "true"，而不分配值时，也与空字符串等价（与布尔值属性很像吧）。因此，以下的写法都代表 "true"：

```
<div contenteditable>An editable item</div>
<div contenteditable="">An editable item</div>
<div contenteditable="true">An editable item</div>
```

而以下写法则代表 "false"：

```
<div contenteditable="false">An editable item</div>
<div contenteditable="abcdefg">An editable item</div>
<div>An editable item</div>
```

因此在学习元素属性时，要仔细看清楚属性的类型和写法，以免出错。

## **IDL 属性和内容属性**

所谓 IDL，即 interface description language，接口描述语言。简单来说，内容属性就是编写 HTML 时写下的属性，IDL 属性即 DOM 提供给编程语言的真正的属性。

例如这里的 contenteditable 就是内容属性：

```
<div contenteditable="true">An editable item</div>
```

而这里的 div.contentEditable 则是 IDL 属性：

```
div.contentEditable = 'true';
```

注意，HTML 元素的属性在 DOM 中通常使用驼峰命名，这里 E 要大写。

内容属性都是字符串，即使里面的值是数字或什么别的类型。内容属性可以通过 HTMLElement 方法 element.setAttribute() 和 element.getAttribute() 来设置。例如给一个 <select> 设置 size，可调用 element.setAttribute('size', '3')，尽管 3 是数字，我们仍用引号括起来，以字符串的形式传入。

IDL 属性则是 JavaScript 中的 property。IDL 属性可以用 DOM 方法直接设置，比如上面的div.contentEditable。这个属性是什么类型就需要传入什么类型的值。例如 contentEditable 需要传入字符串（在 Chrome 中，直接传入布尔值 true 也会生效，但仍不推荐这种不规范的写法），而一个类似的属性 isContentEditable 和上面提到的 required 则需要传入布尔值。

```
div.isContentEditable = true;
```

IDL 属性反映了这个属性真正使用的值，看下面这个例子：

```
input.type = 'foobar';
console.log(input.type);  // 'text'
console.log(input.getAttribute('type'));  // 'foobar'
```

'foobar' 是一个无效的字符串，浏览器会忽略它并将 type 设置为默认值 'text'。

另外，如果给 IDL 属性传入其他不符合要求的类型，则会根据 JavaScript 类型转换规则自动转换成 IDL 属性所需的类型。

虽然 IDL 属性在大多数时候都遵循 [HTML 规范设定的规则](https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes)，反映了内容属性实际使用的值。但由于历史原因，也有一些例外情况（例如 [select.size](https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-size)）。所以在实际使用时，遇到不确定的情况，需要及时参考规范。

由于前端技术正在不断快速发展，相应的规范变化得很快，因此在看书学习时，要尽量结合 MDN Web Docs 和 HTML 规范，相互对照。尽管有这样那样的混乱，目前 Web 开发发展的趋势仍是令人乐观的，总体而言，规范已经越来越系统化、模块化。及时了解这些系统化的理念对学习相当有帮助。

以上。