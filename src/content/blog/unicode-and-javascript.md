---
title: Unicode和JavaScript
author: Aaron Zhou
description: Unicode和JavaScript
pubDatetime: 2021-04-09T09:12:00.000Z
postSlug: unicode-and-javascript
featured: false
draft: false
tags:
    - 笔记
    - JavaScript
    - Unicode
---


# Unicode和JavaScript

*本文译自 Speaking JavaScript 的第 24 章，[原文地址](https://exploringjs.com/es5/ch24.html)，禁止转载。*



本章简要介绍了Unicode和JavaScript处理Unicode的方式。

## Unicode历史

Unicode在1987年由Joe Becker（Xerox）、Lee Collins（Apple）和Mark Davis（Apple）一起提出。他们的想法是建立一个通用的字符集，因为当时有许多互不兼容的纯文本编码标准：多个版本的8比特 ACSCII、大五码（繁体中文）、GB2312（简体中文）等等。在Unicode之前，不存在多语言的纯文本编码标准，不过有富文本系统（如苹果的WorldScript）支持组合不同的编码。

Unicode的第一份草案发布于1988年。此后项目继续进行，工作组也随之扩张。1991年1月3日，Unicode联盟（Unicode Consortium）成立：

- Unicode联盟是一个非盈利组织，致力于开发、维护和推广软件国际化的标准和数据，尤其是Unicode标准。

Unicode 1.0的第一卷在1991年10月发布，第二卷在1992年6月发布。

## 重要的Unicode概念

一个字符似乎就是一个字符，但其实一个字符有很多方面的概念。这就是Unicode标准如此复杂的原因。以下是一些重要的基本概念：

#### 字符（character）和字元（grapheme）

这两个词的意思相近。字符就是数码实体，而字元是书写语言的最小单位（字母、连字、中文字符、发音记号等）。程序员在意的是字符，而用户在意的是字元。有时一个字元使用几个字符来表示。举个例子，我们可以使用o和^（音调符号）组合成ô。

#### 字形（glyph）

这是显示字元的具体方式。有时，一个字元会使用不同的方式显示，取决于上下文或其他因素。例如字元 f 和 i 可以使用字形 f 和 i 的连字字形显示（ﬁ），也可以不使用连字显示（fi）。

#### 码点（code point）

码点是Unicode用于表示其支持的字符的数字。码点的十六进制范围是0x0到0x10FFFF（17乘16比特）。

#### 码元（code unit）

为了储存或传输码点，我们将码点的编码称为码元，即一段或多段固定长度的数据。数据长度的单位是比特，固定长度是多少取决于编码方案。Unicode有几种编码方案，例如UTF-8和UTF16等。名称中的数字就是码元的比特长度。如果一个码点太长，不能用一个码元表示，则要拆开使用多个码元表示。也就是说，一个码点可以使用不同数量的码元来表示。

#### 字节序标记符（BOM，byte order mark）

如果一个码元大于一个字节，则需要考虑字节顺序。BOM是一个位于文本开头的伪字符（可能由几个码元编码），表示码元是大端序（big endian，最高位字节排在前面）还是小端序（little endian，最低位字节排在前面）。没有BOM的文本默认为大端序。BOM还表明正在使用的编码方式，UTF-8、UTF-16等不同编码的BOM都不相同。此外，当浏览器没有关于文本编码的其他信息时，BOM也用作Unicode的标记。然而，BOM并不经常使用，原因如下：

- UTF-8是目前为止最流行的Unicode编码方式，它不需要BOM，因为它只有一种方式排列字节
- 有不少字符编码声明了固定的字节顺序，因此也不需要BOM。例子包括UTF-16BE（UTF-16 big endian）、UTF-16LE（UTF-16 little endian）、UTF-32BE和UTF-32LE。对于处理字节顺序来说，这种方式更安全，因为元数据和数据是分开的，不会混在一起。

#### 规范化（normalization）

有时同样的字元可以用不同的方式表示。例如ö可以用一个码点表示，也可以用o和组合字符¨（分音符）来表示。规范化是把文本转换为正则表示（canonical representation）。等价的码点和码点序列被转换为相同的码点（或码点序列）。这有益于文本处理（如文本搜索）。Unicode规定了几种规范化方式。

#### 字符属性（character property）

规范为每个Unicode字符都分配几个属性，罗列部分如下：

- 名称。一个英语名称，由大写字母A-Z、数字0-9、连字符-和空格组成。两个例子：
  - “λ”的名称是“GREEK SMALL LETTER LAMBDA”
  - “!”的名称是“EXCLAMATION MARK”
- 总类（General category）。将字符分为不同类，如字母、大写字母、数字、发音等。
- 年龄。字符引入Unicode时Unicode的版本（1.0、1.1、2.0等）
- 不推荐。是否不鼓励使用该字符
- 以及更多属性

## 码点

最初，码点的范围只有16比特。在1996年7月，Unicode 2.0发布后，范围扩展了。现在整个范围分为17个平面，编号为0到16。每个平面大小为16比特（十六进制表示为0x0000-0xFFFF）。因此，以十六进制表示的范围中，位于后四位之前的一位数字表示平面的编号。

- 第零平面，基本多文种平面（BMP）：0x0000-0xFFFF
- 第一平面，多文种补充平面（SMP）：0x10000-0x1FFFF
- 第二平面，表意文字补充平面（SIP）：0x20000-0x2FFFF
- 第三至第十三平面，未分配
- 第十四平面，特别用途补充平面（SSP）：0xE0000-0xEFFFF
- 第十五至第十六平面，私用区域补充平面（S PUA A/B）：0x0F0000-0x10FFFF

第一至第十六平面称为补充平面或星界平面（astral plane）。

## Unicode编码

*译者注：这一部分对编码的介绍可能不足以让读者完全理解每种编码方式到底如何运作，如需更深入的了解，参见[笨笨阿林的系列文章](#推荐阅读)*

UTF-32（Unicode Transformation Format 32，即统一码转换格式32）是使用32比特码元的一种格式。任意一个码点都可以编码为单个码元，这使其成为唯一一种有固定长度的编码；对于其他编码来说，编码一个码点使用的码元数量并不固定。

UTF-16是使用16比特码元的一种格式，使用一个或两个码元来表示一个码点。BMP中的码点可以用单个码元表示。更高位的码点为20比特（16乘16比特），编码时减去0x10000（BMP的范围）。这些比特被编码为两个码元（所谓的surrogate pair，代理对）：

**前导代理**：最高位的10比特：在0xD800-0xDBFF范围中储存，也称为高位代理码元（high-surrogate code unit）

**后尾代理**：最低位的10比特：在0xDC00-0xDFFF范围中储存，也称为低位代理码元（low-surrogate code unit）

下面的表格（改变自Unicode标准6.2.0，表格3-5）展示了这些比特如何分配：

| 码点                                             | UTF-16码元                                              |
| ------------------------------------------------ | ------------------------------------------------------- |
| xxxxxxxxxxxxxxxx（16比特）                       | xxxxxxxxxxxxxxxx                                        |
| pppppxxxxxxyyyyyyyyyy<br />（21比特=5+6+10比特） | 110110qqqqxxxxxx 110111yyyyyyyyyy<br />（qqqq=ppppp-1） |

为了使这套方案行之有效，BMP保留了一个未使用的码点范围，0xD800-0xDFFF，因此前导、后尾代理和BMP的码点不会重合，使得程序在解码过程中遇到错误时也能保持健壮。下述函数将一个码点编码为UTF-16（稍后我们有一个例子会使用这个函数）：

```javascript
function toUTF16(codePoint) {
  var TEN_BITS = parseInt('1111111111', 2);
  function u(codeUnit) {
    return '\\u'+codeUnit.toString(16).toUpperCase();
  }
  if (codePoint <= 0xFFFF) {
    return u(codePoint);
  }
  codePoint -= 0x10000;
  
  // Shift right to get to most significant 10 bits
  var leadingSurrogate = 0xD800 | (codePoint >> 10);
  // Mask to get least significant 10 bits
  var trailingSurrogate = 0xDC00 | (codePoint & TEN_BITS);
  return u(leadingSurrogate) + u(trailingSurrogate);
}
```

UCS-2现在是不推荐的格式，使用16比特的码元来表示BMP的码点（只能表示BMP）。因为Unicode的码点范围后来扩展超出了16比特，UCS-2就被UTF-16取代了。

UTF-8有8比特的码元。UTF-8为传统的ASCII编码和Unicode搭建了桥梁。ACSCII只有128个字符，其编号与Unicode前128个码点相同。UFT-8是向后兼容的，因为所有ASCII码都是有效的UTF-8码元。换句话说，0-127范围内的UTF-8码元编码的码点也在同一范围。这些码元的最高位被标为0。另一方面，如果最高位是1，则表示更多的码元，用于编码更高位的码点。编码方案如下：

- 0000-007F：0xxxxxxx（7比特，用1字节储存）
- 0080-07FF：110xxxxx，10xxxxxx（5+6=11比特，用2字节储存）
- 0800-FFFF：1110xxxx，10xxxxxx，10xxxxxx（4+6+6=16比特，用3字节储存）
- 10000-1FFFFF：11110xxx，10xxxxxx，10xxxxxx，10xxxxxx（3+6+6+6=21比特，用4字节储存）。最高的码点是10FFFF，所以UTF-8还有额外的空间。

如果最高位的比特不是0，则第一个0之前的1的数量表示该码元序列中的码元数量。起始码元之后的所有码元的前两位都是10。因此，起始码元和后续码元的范围不会重合，这有助于程序在编码出错时恢复正常运行。

UTF-8已经成为最受欢迎的Unicode格式。最初，其流行是由于向后兼容ASCII。后来，因为UTF-8对跨操作系统、跨编程环境和跨应用具有广泛而一致的支持，这种格式越来越受人们欢迎。

## JavaScript源码和Unicode

JavaScript有两种方式处理Unicode源码：内部的（解析时）和外部的（加载文件时）。

#### 内部源码

在内部，JavaScript源码被当作一个由UTF-16码元组成的序列。根据ECMAScript规范的第六章：

- ECMAScript源文本使用由Unicode编码的字符序列表示，适用于3.0及之后的版本。[...] 根据本规范的目标，ECMAScript源文本应为一个16字节的码元序列。[...] 如果一段真正的源文本没有使用16字节码元的方式编码，其必须像已经事先转换为UTF-16编码一样处理。

在标识符、字符串字面量、正则表达式字面量中，也可以通过Unicode转义序列使用任意码元，格式为\uHHHH，其中HHHH是4个十六进制数。例如：

```javascript
> var f\u006F\u006F = 'abc';
> foo
'abc'

> var λ = 123;
> \u03BB 
123
```

这意味着你可以在字面量和变量名称中使用Unicode字符，而无需离开源码的ASCII范围。

在字符串字面量中，可以使用另一种转义：由两位十六进制数组成的十六进制转义序列，表示0x00-0xFF范围内的码元。例如：

``` javascript
'\xF6' === 'ö'
true
'\xF6' === '\u00F6'
true
```

#### 外部源码

虽然JavaScript内部使用UTF-16，JavaScript源码却常常不是用这种格式储存。当浏览器通过`<script>`标签加载源文件时，编码由下述步骤决定：

- 如果文件以BOM开头，则编码是UTF的一种，种类取决于使用了哪种BOM

- 否则，如果文件通过HTTP(S)加载，则Content-Type头部可以通过charset参数声明一种编码方式，例如：`Content-Type: application/javascript; charset=utf-8`

- 否则，如果`<script>`标签有charset属性，则使用属性声明的编码方式。即使type属性声明了一个有效的媒体类型，类型中也一定不能包含参数charset（像前述的Content-Type头部一样），以保证charset属性和type属性的值不冲突

- 否则，使用`<script>`所在文档的编码。例如，下面是一个HTML5文档的开头，其中的`<meta>`标签声明了该文档使用UTF-8编码：

  - ```html
    <!doctype html> 
    <html> 
      <head>
      <meta charset="UTF-8"> 
        ...
    ```

强烈推荐你总是声明编码方式。如果你不声明，文件会使用一个针对本地的默认编码。换句话说，不同国家的人会看见不同的文件。只有最低位的7个比特能在不同的本地编码中保持相对稳定。

总结一下我的推荐：

- 对于你自己的应用，你可以使用Unicode，但你必须在应用的HTML页面声明编码为UTF-8
- 对于其他库，将代码编码为ASCII（7比特）最安全

一些压缩工具可以把包含超出7比特码元的源码转换成“仅包含7比特”的源码。为了达到这个目的，这些工具将非ASCII字符替换成Unicode转义字符。例如，调用UglifyJS以转换test.js文件：

`uglifyjs -b beautify=false,ascii-only=true test.js`

test.js文件长这样：

`var σ = 'Köln';`

UglifyJS的输出则是这样的：

`var \u03c3="K\xf6ln";`

考虑下面这个反面例子。曾经D3.js库以UTF-8发布。当其从编码不是UTF-8的页面中加载时，就会发生错误，因为库代码中包含类似这样的声明：

`var π = Math.PI, ε = 1e-6;`

标识符 π 和 ε 不能被正确解码，从而不能被识别为变量名。此外，一些字符串字面量因为包含超出7比特范围的码元也不能被正确解码。作为变通，你可以在`<script>`标签中添加合适的charset属性来加载代码：

`<script charset="utf-8" src="d3.js"></script>`

## JavaScript字符串和Unicode

一个JavaScript字符串是一个UTF-16的码元下腭裂。根据ECMAScript规范8.4节：

- 当一个字符串包含真正的文本数据时，每个元素都被看作是一个UTF-16码元

#### 转义序列

如前所述，你可以在字符串字面量中使用Unicode转义序列和十六进制转义序列。例如，你可以组合o和分音符（码点为0x0308）以生成ö：

`> console.log('o\u0308') `

`ö`

这可以用在JavaScript命令行中，例如浏览器的控制台和Node.js的REPL。你也可以将类似的字符串插入到网页的DOM中。

#### 使用转义字符引用星界平面（即补充平面）的字符

网络上有许多很棒的Unicode符号表格，看看Tim Whitlock的[“Emoji Unicode Tables” ](https://apps.timwhitlock.info/emoji/tables/unicode)，了解一下现代Unicode字体中存在多少符号，感到惊讶吧？表格中的符号全都不是图片；它们全都是字体的字形。假设你想通过JavaScript显示一个在星界平面的Unicode字符（当然，这是有风险的，不是所有字体都支持这些符号）。例如，考虑奶牛符号，码点为0x1F404：🐄。

你可以复制这个字符，将其直接粘贴到你的Unicode编码的JavaScript源码中：

`var str = '🐄';`

JavaScript引擎会解码这段源码（通常使用UTF-8编码）然后创建一个有两个UTF-16码元的字符串。此外，你还可以自己计算两个源码，然后使用Unicode转义序列。有一些网页应用可以帮你计算：

- [UTF Converter](https://macchiato.com/unicode/convert.html)
- ["JavaScript escapes" by Mathisa Bynens](https://mothereff.in/js-escapes)

前面定义的函数toUTF16也可以计算：

`> toUTF16(0x1F404)`

`\\uD83D\\uDC04`

这个UTF-16代理对（0xD83D，0xDC04）确实编码了奶牛符号：

`> console.log('\uD83D\uDC04');`

`🐄`

#### 字符计数

如果一个字符串包含一个代理对（两个码元编码一个码点），那么length属性就不再反映子元数量，而是反映码元数量：

```javascript
> var str = '🐄';
> str === '\uD83D\uDC04';
true
> str.length
2
```

这可以用库来修正，例如Mathias Bynens的Punycode.js，这个库在Node.js中使用：

```javascript
> var puny = reqire('punycode');
> puny.ucs2.decode(str).length
1
```

#### Unicode规范化

如果你想搜索或对比字符串，你需要先规范化字符串，例如使用库unorm（来自Bjarke Walling）。

## JavaScript正则表达式和Unicode

JavaScript的正则表达式（见第十九章）对Unicode的支持很有限。例如，没办法匹配一个Unicode分类，如“大写字母”。

行结束符会影响匹配。行结束符有以下4个字符：

| 码元   | 名称   | 字符转义序列 |
| ------ | ------ | ------------ |
| \u000A | 换行符 | \n           |
| \u000D | 回车符 | \r           |
| \u2028 | 分行符 |              |
| \u2029 | 分段符 |              |

下述正则表达式结构基于Unicode：

- \s \S（空白符，非空白符）有基于Unicode的定义：

  - ```javascript
    > /^\s$/.test('\uFEFF')
    true
    ```

- .（点）匹配除行结束符以外的所有码元（不是码点！）。如何匹配任意码点参见下一节。

- 多行模式/m：在多行模式中，^匹配输入的起始位置和行结束符之后的位置，$匹配行结束符之前的位置和输入的结束位置。在非多行模式中，这两个符号只分别匹配输入的起始和结束位置。

其他重要的字符类的定义基于ASCII，而不是Unicode：

- \d \D（数字，非数字）：数字与[0-9]等价

- \w \W （单词字符，非单词字符）：单词字符相当于[A-Za-z0-9\_]

- \b \B （单词边界，非单词边界）：单词是单词字符（[A-Za-z0-9\_]）组成的序列。例如，在字符串'über'中，使用转义字符\b进行匹配，会发现字符b是这个单词的开头：

  - ```javascript
    /\bb/.test('über')
    true
    ```

#### 匹配任意码元和任意码点

匹配任意码元可以使用[\s\S]

匹配任意码点，你需要使用：
([\0-\uD7FF\uE000-\uFFFF]|\[\uD800-\uDBFF][\uDC00-\uDFFF])

这个模式的工作原理如下：
([BMP code point]|\[leading surrogate][trailing surrogate])

#### 库

一些库可以帮助处理JavaScript中的Unicode：

- Regenerate 可以生成类似上文提到的范围，以匹配任意码点。这个库常与其他构建工具一起使用，但也可以动态使用，以试验一些东西。

- XRegExp是一个正则表达式库，提供官方插件以匹配Unicode分类、脚本、区块和属性，有以下3种模式：

  - \p{...} \p{^...} \P{...}

  例如\p{Letter}匹配所有字母表的字母字符，而\p{^Letter}和\P{Letter}则匹配除了这些字母以外的其他所有码点。第三十章包含XRegExp的简要介绍。

- ECMAScript国际化API（参见第三十章的相关章节）提供Unicode相关的校对整理（字符串排序和搜索）和其他功能。

#### 推荐阅读

想获取更多关于Unicode的信息，参见以下资料：

- 维基百科有不少关于[Unicode](https://en.wikipedia.org/wiki/Unicode)及相关术语的优秀词条
- [Unicode.org](https://Unicode.org)是Unicode联盟的官方网站，FAQ部分也是一个很好的资源
- Joel Spolsky的介绍文章很有帮助：[“The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)”](https://www.joelonsoftware.com/articles/Unicode.html)。

更多关于JavaScript中的Unicode支持的信息，参见：

- Mathias Bynens的[“JavaScript’s internal character encoding: UCS-2 or UTF-16?”](https://mathiasbynens.be/notes/javascript-encoding)
- Steven Levithan的[“JavaScript, Regex, and Unicode”](http://blog.stevenlevithan.com/archives/javascript-regex-and-unicode)

译者推荐的资料：

- 本文的[Unicode术语翻译参考](https://zhuanlan.zhihu.com/p/79246427)
- 知乎笨笨阿林的[系列文章](https://zhuanlan.zhihu.com/paogenjiudi)
- 滴滴WebApp架构组的[介绍文章](https://juejin.im/post/5e4262f5f265da5715630304)
- Flavio Copes的介绍文章：[Introduction to Unicode and UTF-8](https://flaviocopes.com/unicode/)
- BOM的[相关问题](https://www.zhihu.com/question/20167122)和字节序的[维基百科页面](https://zh.wikipedia.org/wiki/字节序)
- 关于[为何UTF-16与ASCII不兼容](https://stackoverflow.com/questions/61848142/is-utf-16-a-superset-of-ascii-if-yes-why-is-utf-16-incompatible-with-ascii-acc)
