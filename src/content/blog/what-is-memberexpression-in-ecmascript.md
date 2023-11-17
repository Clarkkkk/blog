---
title: ECMAScript 里的 MemberExpression 是指什么
author: Aaron Zhou
description: ECMAScript 里的 MemberExpression 是指什么
pubDatetime: 2023-11-17T13:43:34.444Z
postSlug: what-is-memberexpression-in-ecmascript
featured: false
draft: false
tags:
    - temp
---
看 ECMAScript 文档很多时候就像玩解谜游戏一样，在反复跳转之间才能弄懂一个名词究竟是什么意思。神奇的是，由于 ECMAScript 采用上下文无关（context-free）的文法编写，每个名词最终都能找到唯一的定义，而不会产生歧义或循环定义。

下面来看文档中 MemberExpression 的语法定义（syntax）：

```
MemberExpression[Yield, Await]:
  PrimaryExpression[?Yield, ?Await]
  MemberExpression[?Yield, ?Await][Expression[+In, ?Yield, ?Await]]
  MemberExpression[?Yield, ?Await].IdentifierName
  MemberExpression[?Yield, ?Await]TemplateLiteral[?Yield, ?Await, +Tagged]
  SuperProperty[?Yield, ?Await]
  MetaProperty
  new MemberExpression[?Yield, ?Await]Arguments[?Yield, ?Await]
```

定义里可以看到，MemberExpression 又出现了，但形式不一样。这是一种递归定义。比如说，a 是一个 MemberExpression，b 是一个 IdentifierName，那么 a.b 本身也构成一个 MemberExpression。跳过递归的部分，我们来看看 PrimaryExpression 是什么：

```
PrimaryExpression[Yield, Await]:
  this
  IdentifierReference[?Yield, ?Await]
  Literal
  ArrayLiteral[?Yield, ?Await]
  ObjectLiteral[?Yield, ?Await]
  FunctionExpression
  ClassExpression[?Yield, ?Await]
  GeneratorExpression
  AsyncFunctionExpression
  AsyncGeneratorExpression
  RegularExpressionLiteral
  TemplateLiteral[?Yield, ?Await, ~Tagged]
  CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
```

PrimaryExpression 的定义让人感觉熟悉多了，第一个就是 this，而数组字面量、对象字面量、函数表达式等概念不用跳转也大概清楚是什么。如果看到有不熟悉的名词，再跳转即可。

一般来说，看到这里就能对什么是 MemberExpression 知道个大概。如果不嫌麻烦，我们也可以继续刨根问底，比如说什么是 IdentifierReference？

这是 IdentifierReference 和相关概念的语法定义（syntax）：

```
IdentifierReference[Yield, Await]:
  Identifier
  [~Yield]yield
  [~Await]await

Identifier:
  IdentifierName but not ReservedWord

IdentifierName::
  IdentifierStart
  IdentifierName IdentifierPart

IdentifierStart::
  UnicodeIDStart
  $
  _
  \UnicodeEscapeSequence

IdentifierPart::
  UnicodeIDContinue
  $
  \UnicodeEscapeSequence
  <ZWNJ>
  <ZWJ>

UnicodeIDStart::
 any Unicode code point with the Unicode property “ID_Start”

UnicodeIDContinue::
  any Unicode code point with the Unicode property “ID_Continue”

UnicodeEscapeSequence::
  u Hex4Digits
  u {CodePoint}
```

上面是 IdentifierReference 的相关跳转结果，仔细研究的话，可以很精确地了解到 IdentifierReference 由什么构成。但这种不讲人话的解释很容易让人一头雾水，最后的跳转结果甚至涉及到了 Unicode 的相关概念（而 Unicode 又是另一个大坑了，[关于 ID_Start 的概念](https://www.zhihu.com/question/348324488/answer/857046978)就看的我头大）。

此外，还可以看看 IdentifierReference 在运行时语义（Runtime Semantics）中怎么求值：

```
12.1.6 Runtime Semantics: Evaluation
IdentifierReference:Identifier
  Return ? ResolveBinding(StringValue of Identifier).
IdentifierReference:yield
  Return ? ResolveBinding("yield").
IdentifierReference:await
  Return ? ResolveBinding("await").

// ResolveBinding 定义
8.3.2 ResolveBinding ( name [ , env ] )
The ResolveBinding abstract operation is used to determine the binding of name 
passed as a String value. The optional argument env can be used to explicitly 
provide the Lexical Environment that is to be searched for the binding. During 
execution of ECMAScript code, ResolveBinding is performed using the following 
algorithm:

1. If env is not present or if env is undefined, then
  a. Set env to the running execution context's LexicalEnvironment.
2. Assert: env is a Lexical Environment.
3. If the code matching the syntactic production that is being evaluated is 
contained in strict mode code, let strict be true; else let strict be false.
4. Return ? GetIdentifierReference(env, name, strict).

// GetIdentifierReference 定义
8.1.2.1 GetIdentifierReference ( lex, name, strict )
The abstract operation GetIdentifierReference is called with a Lexical Environment 
lex, a String name, and a Boolean flag strict. The value of lex may be null. When 
called, the following steps are performed:

1. If lex is the value null, then
  a. Return a value of type Reference whose base value component is undefined, 
  whose referenced name component is name, and whose strict reference flag is strict.
2. Let envRec be lex's EnvironmentRecord.
3. Let exists be ? envRec.HasBinding(name).
4. If exists is true, then
  a. Return a value of type Reference whose base value component is envRec, 
  whose referenced name component is name, and whose strict reference flag is strict.
5. Else,
  a. Let outer be the value of lex's outer environment reference.
  b. Return ? GetIdentifierReference(outer, name, strict).
```

求值过程也佶屈聱牙。囿于篇幅，就不逐行解释了，大意是在当前词法环境中查看是否绑定了这么一个名字，如果有，返回相应的 Reference 类型的值；如果没有，前往外一层的词法环境继续查找。可以看出来，这正是 JavaScript 中标识符的解析过程。

我们还可以反其道而行之，看看 IdentifierReference 会用在什么地方。正好 ECMAScript 文档是单独一个完整的网页，用 Ctrl+F 就能搜索整个文档。比如说，我发现对象字面量的定义中用到了 IdentifierReference：

```
ObjectLiteral[Yield, Await]:
  {}
  {PropertyDefinitionList[?Yield, ?Await]}
  {PropertyDefinitionList[?Yield, ?Await],}
PropertyDefinitionList[Yield, Await]:
  PropertyDefinition[?Yield, ?Await]
  PropertyDefinitionList[?Yield, ?Await],PropertyDefinition[?Yield, ?Await]
PropertyDefinition[Yield, Await]:
  IdentifierReference[?Yield, ?Await] // 在这里
  CoverInitializedName[?Yield, ?Await]
  PropertyName[?Yield, ?Await]:AssignmentExpression[+In, ?Yield, ?Await]
  MethodDefinition[?Yield, ?Await]
  ...AssignmentExpression[+In, ?Yield, ?Await]
PropertyName[Yield, Await]:
  LiteralPropertyName
  ComputedPropertyName[?Yield, ?Await]
```

如果正好熟悉对象字面量的语法，就好办了：

```
let a = 1;
let b = {};
let obj = {
  a,        // IdentifierReference[?Yield, ?Await]
  ...b,     // ...AssignmentExpression[+In, ?Yield, ?Await]
  c: 3,     // PropertyName[?Yield, ?Await]:AssignmentExpression[+In, ?Yield, ?Await]
  d() {},   // MethodDefinition[?Yield, ?Await]
}

let {c = 0} = obj;  // CoverInitializedName[?Yield, ?Await]
```

5 种写法正好对应 5 种语法定义。

凭借自己使用 JavaScript 的经验，结合上文中 IdentifierReference 的语法定义和运行时语义，就可以总结出 IdentifierReference 是什么，怎么用。

同样地，对于 MemberExpression，搞懂 PrimaryExpression、SuperProperty、MetaProperty 等概念，自然就知道 MemberExpression 的含义。

这也说明，ECMAScript 文档需要一定的 JavaScript 经验才能读懂。事实上，这个文档是面向浏览器开发者编写的。对于前端开发者来说，除非实在很纠结某个语法的具体细节，在 MDN、Stackoverflow 等地方又找不到答案，才需要求助 ECMAScript 文档。

如果有兴趣研究 ECMAScript，参考这里的文章吧：

以上。