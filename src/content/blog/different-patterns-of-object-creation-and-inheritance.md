---
title: 对象创建与继承的不同模式
author: Aaron Zhou
description: 对象创建与继承的不同模式
pubDatetime: 2020-12-02T11:08:00.000Z
postSlug: different-patterns-of-object-creation-and-inheritance
featured: false
draft: false
tags:
    - 笔记
    - JavaScript
---
# 对象创建与继承的不同模式

## 创建对象

#### 1. 工厂模式

```javascript
function createPerson(name, age, job) {
  let o = new Object();
  o.name = name;
  o.age = age;
  o.job = job;
  o.sayName = function() {
    console.log(this.name);
  }
  return o;
}
```

可以使用这个函数创建多个相似函数，但没有解决对象识别的问题（无法获知该对象的类型）。

#### 2. 构造函数模式

```javascript
function Person(name, age, job) {
  this.name;
  this.age;
  this.job;
  this.sayName = function() {
    console.log(this.name);
  }
}

let person = new Person('Nicholas', 29, 'Software Engineer');
```

这种模式使用new操作符调用构造函数，会经历以下步骤：

1. 创建一个新对象（new Object()）
2. 将构造函数的作用域赋给新对象（因此this指向新对象）
3. 执行构造函数中的代码
4. 返回新对象

这种模式解决了对象识别的问题：

```javascript
console.log(person.constructor == Person); // true
console.log(person instanceof Object); // true
console.log(person instanceof Person); // true
```

缺点是每个方法都会在每个实例上创建一遍，即`this.sayName = function(){ console.log(this.name); }`等价于`this.sayName = new Function('console.log(this.name)');`。

可以通过把函数定义在构造函数外面来解决这个问题：

```javascript
function Person(name, age, job) {
  this.name;
  this.age;
  this.job;
  this.sayName = sayName;
}

function sayName() {
  console.log(this.name);
}
```

但如此一来，封装就被破坏了。

#### 3. 原型模式

```javascript
function Person() {}
Person.prototype.name = 'Nicholas';
Person.prototype.age = 29;
Person.prototype.job = 'Software Engineer';
Peroson.prototype.sayName = function() {
  console.log(this.name);
};
let person1 = new Person();
let person2 = new Person();
console.log(person1.sayName === person2.sayName); // true
```

原型模式可以让所有对象实例共享原型对象中的属性和方法。

字面量写法：

```javascript
function Person() {}
Person.prototype = {
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  sayName: function() {
    console.log(this.name);
  }
};
```

这样写会使constructor属性不再指向Person：

```javascript
let friend = new Person();
console.log(friend instanceof Person); // true
console.log(friend.constructor); // Object
```

可以在字面量中加入`constructor: Person`，但此时constructor的[Enumerable]为true，与默认设置不同，因此可以使用Object.defineProperty()。

```javascript
function Person() {}
Person.prototype = {
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  sayName: function() {
    console.log(this.name);
  }
};
Object.defineProperty(Person.prototype, 'constructor', {
  enumerable: false,
  value: Person
});
```

原型模式的缺点是原型对象的所有属性都会共享，尤其当包含引用类型值时，共享修改的属性值有可能并非本意。

#### 4. 组合使用构造函数模式和原型模式

```javascript
function Person(name, age, job) {
  this.name;
  this.age;
  this.job;
  this.friends = ['Shelby', 'Court'];
}

Person.prototype = {
  constructor: Person,
  sayName: function() {
    console.log(this.name);
  }
};
```

在这种方式中，构造函数模式用于定义实例属性，原型模式用于定义共享的方法和属性，集两种模式之长。

#### 5. 动态原型模式

上一种方式将构造函数和原型分开，动态原型模式将二者封装在一个构造函数中：

```javascript
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
  if (typeof this.sayName !== 'function') {
    Person.prototype.sayName = function() {
      console.log(this.name);
    }
  }
}
```

#### 6. 寄生构造函数模式

```javascript
function Person(name, age, job) {
  let o = new Object();
  o.name = name;
  o.age = age;
  o.job = job;
  o.sayName = function() {
    console.log(this.name);
  };
  return o;
}
```

在不返回值的情况下，构造函数默认会返回新对象实例。而这里通过显式的return语句重写了构造函数返回的值。注意，使用这个模式创建的实例与构造函数或构造函数的原型属性无关。因此这个模式通常用于扩展内置类型的构造函数。

#### 7. 稳妥构造函数模式

```javascript
function Person(name, age, job) {
  let o = new Object();
  // other properties and methods
  o.sayName = function() {
    console.log(name);
  };
  return o;
}

let friend = Person('Nicholas', 29, 'Software Engineer');
friend.sayName(); // 'Nicholas'
```

这个模式与寄生构造函数模式很相似，但有两点不同：一是新创建对象的实例方法不引用this；二是不使用new操作符调用构造函数。用这个模式创建的实例，name只能用sayName()访问。

## 继承

#### 1. 原型链

```javascript
function SuperType() {
  this.property = true;
}
SuperType.prototype.getSuperValue = function() {
  return this.property;
};

function SubType() {
  this.subproperty = false;
}
SubType.prototype = new SuperType();
SubType.prototype.getValue = function() {
  return this.subproperty;
};

let instance = new SubType();
console.log(instance.getSuperValue()); // true
```

可以通过这几种方法来确定原型和实例的关系：Object.prototype.isPrototypeOf()、Object.getPrototypeOf()、instanceof操作符。

```javascript
console.log(SuperType.prototype.isPrototypeOf(instance)); 
// true
console.log(Object.getPrototypeOf(instance) === SubType.prototype);
// SuperType
console.log(instance instanceof SuperType);
// true
```

其中`instance instanceof SuperType`等价于`SuperType.prototype.isPrototypeOf(instance)`。

直接使用原型链有两个问题，一个是原型实例对象中的引用类型值会共享，第二个是在创建子类型的实例时，不能向超类型的构造函数传递参数。

#### 2. 借用构造函数

```javascript
function SuperType() {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

function SubType() {
  SuperType.call(this);
}

let instance1 = new SubType();
let instance2 = new SubType();
instance1.colors.push('black');
console.log(instance1.colors); // ['red', 'blue', 'green', 'black']
console.log(instance2.colors); // ['red', 'blue', 'green']
```

使用new调用SubType构造函数时，使用call()方法借用了SuperType构造函数，并绑定了this，在这里this指向新对象。所以每一次创建新实例，绑定的colors都不相同。

此外，还可以在子类型构造函数中向超类型构造函数传递参数：

```javascript
function SubType(name) {
  SuperType.call(this, 'Nicholas');
}
let instance = new SubType();
console.log(instance.name); // 'Nicholas'
```

借用构造函数的缺点是在构造函数中定义的方法无法复用，而且，在超类型的原型中定义的方法对子类型也是不可见的：

```javascript
function SuperType(name) {
  this.name = name;
}
SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType() {
  SuperType.call(this, 'Nicholas');
}

let instance = new SubType();
instance.sayName(); // TypeError;
```

#### 3. 组合继承

即组合使用原型链和借用构造函数：

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}
SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, 'Nicholas');
  this.age = age;
}
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function() {
  console.log(this.age);
};
```

组合继承避免了原型链和借用构造函数的缺陷，融合了它们的优点，成为JavaScript中最常用的继承模式。

#### 4. 原型式继承

```javascript
function object(o) {
  function F(){}
  F.prototype = o;
  return new F();
}
```

这个函数返回一个以o为原型的对象，无需新建构造函数。ES5将这种继承方式纳入规范，新增Object.create()方法。这个方法接收两个参数，第一个参数用作新对象的原型对象，第二个参数为可选参数，用于为新对象定义额外属性。

这个方法的缺点与原型链类似，对象中的引用类型值会共享。使用这个方法相当于创建一个对象，其原型为传入的对象，除此之外没有其他属性和方法。

#### 5. 寄生式继承

```javascript
function createAnother(original) {
  let clone = Object.create(original);
  clone.sayHi = function() {
    console.log('Hi');
  };
  return clone;
}
```

寄生式继承在函数内部以某种方式增强对象。Object.create()函数不是必要的，任何可以返回对象的函数都适用这个模式。缺点是添加的函数不能复用。

#### 6. 寄生组合式继承

组合继承也有不足，最大的不足是这种继承方式无论什么时候都会调用两次超类型构造函数。再看一次组合继承的代码：

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}
SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, 'Nicholas'); // 第二次调用SuperType()
  this.age = age;
}
SubType.prototype = new SuperType(); // 第一次调用SuperType()
SubType.prototype.constructor = SubType; 
SubType.prototype.sayAge = function() {
  console.log(this.age);
};
```

第一次调用时，SubType.prototype会得到name和colors，但这并不是必要的。因为创建SubType类型的实例时会第二次调用SuperType()，在实例上重写一次name和colors。即使不考虑第二次调用（即不借用构造函数），通过调用构造函数来改写原型对象，也可能会有副作用（例如超类型的构造函数中可能会修改日志、为this对象添加属性等）。

为了解决这个问题，可以使用寄生组合式继承：

```javascript
function inheritPrototype(subType, SuperType) {
  let prototype = Object.create(SuperType.prototype);
  prototype.constructor = SubType;
  subType.prototype = prototype;
}

function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

inheritPrototype(SubType, SuperType);

SubType.prototype.sayAge = function() {
  console.log(this.age);
}
```

在这种继承方式中，我们更能看到Object.create()的优点：它在函数内部将一个空的构造函数的原型属性改成传入的原型对象，并使用这个构造函数创建实例。这样一来，就可以在改写原型的同时避免调用超类型的构造函数。

ES6新增了Object.setPrototypeOf()方法，可以直接改写原型对象，如

```javascript
function inheritPrototype(subType, SuperType) {
  let prototype = Object.create(superType.prototype);
  prototype.constructor = SubType;
  subType.prototype = prototype;
}
// ES6可以写为：
function inheritPrototype(subType, SuperType) {
  Object.setPrototypeOf(subType, SuperType)；
  prototype.constructor = SubType;
}
```

但Object.setPrototypeOf()方法在浏览器实现中暂时存在性能问题，因此还是建议使用Object.create()，或直接使用ES6的原生继承。
