---
title: mouseleave 和 mouseout 的区别
author: Aaron Zhou
description: mouseleave 和 mouseout 的区别
pubDatetime: 2020-05-25T15:19:00.000Z
postSlug: the-difference-between-mouseleave-and-mouseout
featured: false
draft: false
tags:
    - 笔记
    - DOM
---
mouseleave 和 mouseout 均在离开相应元素的 border box 时被触发。

mouseleave 仅在指针离开元素时被触发，不冒泡；而 mouseout 在指针离开元素或进入该元素的子元素时均会被触发，冒泡。来看下面的例子：

**HTML**

```
<div id="div1" style="height: 100px; width: 100px; border: 1px solid">
  <div id="div2" style="height: 50px; width: 50px; margin: 10px auto; border: 1px dashed"></div>
</div>
```

**Javascript**

```
const div1 = document.getElementById('div1');
div1.addEventListener('mouseleave', (event) => {
  event.currentTarget.style.backgroundColor = 'blue';
  setTimeout(() => event.currentTarget.style.backgroundColor = '', 1000);
});
```

此时仅当鼠标从元素移出时 div1 才会变成蓝色，在 div1 和 div2 之间移动时不会触发事件。

将事件改为 mouseout：

```
const div1 = document.getElementById('div1'); 
div1.addEventListener('mouseout',(event)=>{
   event.currentTarget.style.backgroundColor ='blue';
setTimeout(()=> event.currentTarget.style.backgroundColor ='',1000);
});
```

会发现不仅当鼠标从 div1 移出时 div1 会变成蓝色，而且当鼠标从 div1 移动至 div2 内部，或从 div2 内部移动至 div1，div1 都会变蓝。

从 div1 移至 div2 会变蓝是因为考虑到 div2 遮挡了 div1 的可视区域，理应触发 mouseout，所以规范是这么写的：

> it MUST be dispatched when the pointer device moves from an element onto the boundaries of one of its descendent elements.

而从 div2 移动至 div1 会触发变色则是由于冒泡机制。鼠标离开 div2 的边界时会产生一个 mouseout 事件。由于 div2 本身没有绑定任何事件处理程序，因此事件冒泡至 div1，并触发 div1 的事件处理程序。

如果想阻断这种冒泡行为，可在 div2 中使用 stopPropagation() 阻止冒泡：

```
const div2 = document.getElementById('div2');
div2.addEventListener('mouseout',(event) => event.stopPropagation());
```

不过，利用冒泡机制可以实现事件委托——即使用一个事件处理程序处理多个元素的同一事件：

**HTML**

```
<div id="container" style="height: 200px; width: 100px; border: 1px solid">
  <div id="div1" style="height: 50px; width: 50px; margin: 10px auto; border: 1px dashed"></div>
  <div id="div2" style="height: 50px; width: 50px; margin: 10px auto; border: 1px dashed"></div>
  <div id="div3" style="height: 50px; width: 50px; margin: 10px auto; border: 1px dashed"></div>
</div>
```

**Javascript**

```
const container = document.getElementById('container'); 
container.addEventListener('mouseleave',(event) => {
  const target = event.target; 
  switch(target.id){
    case 'div1':
      target.style.backgroundColor ='blue';
      break;
    case 'div2':
      target.style.backgroundColor ='green';
      break;
    case 'div3':
      target.style.backgroundColor ='red';
      break;
  }  
  setTimeout(()=> target.style.backgroundColor ='', 1000);
});
```

注意到这里使用的是 target，而非上面的 currentTarget。target 指向实际触发事件的元素，而 currentTarget 指向当前事件处理程序所属的元素。这里使用 target 就可以分别为触发事件的不同元素作出不同的响应。因为 div1、div2、div3 均是 container 的子元素，它们的事件都会通过冒泡机制传到 container 的事件处理程序。

鼠标事件中类似的组合还有 mouseenter 和 mouseover，去试试看吧。
