---
title: 将Vue项目迁移到Nuxt
author: Aaron Zhou
description: 将Vue项目迁移到Nuxt
pubDatetime: 2023-11-02T16:52:32.790Z
postSlug: migrate-the-vue-project-to-nuxt
featured: false
draft: false
tags:
    - Vue
    - Nuxt
    - 笔记
---
距离Nuxt 3发布已经过去了一段时间，正好我想尝试一下服务端渲染，于是决定把现有的一个Vue 3小项目迁移到Nuxt 3。

## 初始化

由于Nuxt 3使用文件式路由，项目的文件结构和传统的Vue SPA项目大不相同，加上我想保留原有的项目，所以直接新建一个Nuxt 3空项目，再把文件慢慢迁移过去。

```
npx nuxi@latest init <project-name>
```

根目录下像格式化配置等配置文件基本上可以直接复制粘贴过去，基本不需要改动。

此外，可以看到初始项目的`tsconfig.json`里只有短短的一行，`"extends": "./.nuxt/tsconfig.json"`。后来发现Nuxt为了自动引入等功能会自动生成TypeScript定义。在`package.json`里也有一句`"postinstall": "nuxt prepare"`，就是每次依赖安装完成后都会执行一次`nuxt prepare`，生成相应的TypeScript定义。因此，整个`.nuxt`文件夹都是自动生成的，而且变更频繁，我们把它写进`.gitignore`里。

## 配置路由

Nuxt使用文件式路由，`pages`文件夹下的所有文件都会自动生成一个路由，文件的嵌套结构就是URL的嵌套结构。在Nuxt中，整个项目的入口文件是根目录下的`app.vue`，如下：

```html
<template>
    <NuxtPage />
</template>
```

先把首页的文件粘贴过来，修改一下文件名：

```
/pages
  /index
    index.vue
    /components
      Banner.vue
      NewSongs.vue
      NewAlbums.vue
```

`index`文件夹和`index.vue`不会增加嵌套层级，所以`/`下渲染的就是`index/index.vue`的内容。我个人习惯把页面相关的组件都放在这个页面的目录内，比如上面的`components`文件夹。但这样一来，Nuxt也会为`components`文件夹内的每一个文件都生成一个页面，如`/components/Banner`等。这显然不是我的本意。根据Nuxt开发者的说法（[#12333](https://github.com/nuxt/nuxt/issues/12333)），他们认为这是一个小众需求……但也提供了解决方案，可以使用一个Nuxt hook `pages:extend`来实现。比如不想为`components`文件夹内的文件生成页面，可以在`nuxt.config.ts`中加上：

```js
hooks: {
    'pages:extend': function (pages) {
        function removePagesMatching(pattern: RegExp, pages: NuxtPage[] = []) {
            const pagesToRemove = []
            for (const page of pages) {
                if (page.file && pattern.test(page.file)) {
                    pagesToRemove.push(page)
                } else {
                    removePagesMatching(pattern, page.children)
                }
            }
            for (const page of pagesToRemove) {
                pages.splice(pages.indexOf(page), 1)
            }
        }
        removePagesMatching(/\/components\//, pages)
    }
},
```

这种事情在Nextjs就不会出现，因为Nextjs中只有`page`文件会生成页面。后面我们会发现，令人不舒服的地方还有很多——Nuxt其实是一个非常opinionated的框架。

## 关于自动引入

Nuxt默认开启自动引入（auto import）功能，所有Vue、Nuxt相关的API都无需引入，直接使用。不仅如此，Nuxt对根目录下的`components`、`composables`、`utils`等文件夹也做了自动引入的处理。看起来很方便，但有一个小缺点。由于自动引入会自动生成相应的类型，以保证TypeScript不会报错，自动引入的变量在跳转定义的时候就会跳转到这些自动生成的TypeScript定义中，而不是真正的代码中。所以，Anthony Fu写了一个[VS Code插件](https://marketplace.visualstudio.com/items?itemName=antfu.goto-alias)来解决这个问题。给人的感觉就是使用另一个黑魔法来解决前一个黑魔法导致的问题。我并不是特别喜欢这种太hacky的做法，运作良好还好说，一旦出现问题，调试难度一定是增加的。

另外，`components`的自动引入也有问题。Nuxt会把`components`文件夹及嵌套文件夹里的所有组件都导出，无论你是否想导出这个组件。比如：

```
/components
  /MusicControl
    Cover.vue
    Controls.vue
    index.ts
  Cover.vue
```

`/MusicControl/Cover.vue`只在`/MusicControl/Controls.vue`中用到，不需要export到外面。但Nuxt不管这么多，全都引入进来，导致出现了两个同名的`Cover.vue`，使用的时候就会出现问题。除此之外，文件夹和文件同名，比如`components/Cover/Cover.vue`这样的命名也会导致解析错误，令人费解。

所以我决定把自动引入和`components`文件夹的自动引入关掉。

```javascript
components: false,
imports: {
    autoImport: false
}
```

但关掉也有关掉的问题。正如前文所说，Nuxt是一个非常opinionated的框架。关掉自动引入以后，有些API甚至不知道要从引入，只能`import ... from '#imports'`，这看着还不如开启自动引入。总之这个特性喜欢的人会很喜欢，不想用的人就要花很大力气去绕开这个东西，只能说见仁见智了。

## 服务端渲染中的请求

### 开发配置

在实际开发中，将请求通过proxy转发到后端是很常见的做法，这样可以规避掉浏览器直接请求的诸多限制。Vite和Webpack都提供了这样的配置。

但在服务端渲染中，情况稍微变得复杂一些。服务端渲染的请求有两种，一种是从客户端发出的请求，一种是直接从Nuxt服务器种发出的请求。是的，在服务端渲染的开发中，要时刻注意，代码是在客户端运行还是在服务端运行。我们统一将请求API写成`localhost:3000/api/**`的形式，再转发到`api.example.com/**`。翻了半天Nuxt的文档都没找到这应该怎么配置，最后在Nitro的文档里看到了——Nitro是Nuxt使用的服务器框架。

```javascript
// 转发客户端的请求
devProxy: {
    '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
    }
},
// 转发服务端的请求
routeRules: {
    '/api/**': {
        proxy: 'https://api.example.com/**',
    }
}
```

### 请求函数

Nuxt提供了3个请求函数：`useFetch`、`$fetch`、`useAsyncData`。

为什么需要这么多函数呢？在Nuxt中，组件的`setup`方法会在服务端执行一遍，在客户端再执行一遍。如果直接在setup中使用普通的`fetch`，那么`fetch`就会很没必要地执行两次。诚然，可以把`fetch`放到`onMounted`里执行，但服务端渲染的一大优势就是先获取数据，再直接返回渲染好的页面，节省往返时间，从而提高加载速度。

而`useFetch`和`useAsyncData`可以避免重复请求，在客户端直接复用服务端下发的payload中的数据。如果自定义了请求函数，如使用Axios等库，可以使用`useAsyncData`，否则直接使用`useFetch`。

### 改写`setup`

理解了服务端渲染的请求过程后就可以开始改写组件了。

将

```javascript
const banner = ref()
onMounted(async () => {
    const data = await fetch('https://example.com/api/banner')
    banner.value = data
})
```

改为

```javascript
const banner = ref()
const { data, pending, error, refresh } = await useFetch('https://example.com/api/banner')
banner.value = data
```

直接在`setup`函数中使用`await`，这个组件会变成异步组件，Nuxt会等待数据返回后再渲染页面。

为什么上面的代码要用`ref`来保存数据，不直接使用`data`？事实上，如果这个数据只需要请求一次，确实直接使用`data`就行。但如果数据是按需加载的，比如说初次渲染只加载前10条，用户滚动页面的时候再继续加载。但无论是`useFetch`还是`useAsyncData`都做不到增量更新数据，所以需要一个中间变量来保存数据。初次请求使用`useFetch`或`useAsyncData`，后续的请求就使用`$fetch`。

### Cookie的处理

这个项目使用cookie来维护登录态。

在客户端，只要配置好跨源模式，浏览器在发送请求时就会自动带上cookie，客户端不需要和cookie做交互。这个项目的cookie甚至是`httpOnly`的，连JavaScript都不能读取。

但是服务端的请求不一样，不会根据跨源模式自动带上cookie，需要手动处理。Nuxt提供`useCookie`用于获取客户端带过来的cookie。Vue提供了唯一会在服务端调用的生命周期钩子`onServerPrefetch`，该钩子在组件实例在服务器上被渲染之前调用，我们使用这个钩子处理登录态相关的逻辑。

```javascript
// pinia store
const store = useAuthStore()

onServerPrefetch(async () => {
    const cookie = useCookie('music_usr')
    if (cookie.value) {
        const { data } = await $fetch('/login/status', {
            headers: { cookie }
        })
        store.updateUserId(data.userId)
    }
})
```

这样写有一个坏处，用户每次刷新页面都需要重新请求接口获取`userId`。由于服务端会等待`onServerPrefetch`中回调返回的promise完成后才开始渲染组件，这个请求会阻塞渲染，导致加载时间变长。所以我们干脆再写一个cookie来保存`userId`。

```javascript
// pinia store
const store = useAuthStore()

onServerPrefetch(async () => {
  	const cookie = useCookie('music_usr')
  	const userCookie = useCookie('user_id', {
        expires: new Date(Date.now() + 6 * 30 * ONE_DAY),
        httpOnly: true,
        sameSite: 'strict'
  	})
    if (cookie.value) {
        if (userCookie.value.userId) {
            // userCookie有userId时直接更新store
            store.updateUserId(userCookie.value.userId)
        } else {
            // 没有userId时请求接口获取
            const { data } = $fetch('/login/status', {
                headers: { cookie }
            })
            store.updateUserId(data.userId)
            userCookie.value = data.userId
        }
    } else {
        // cookie不存在时重置userCookie
        userCookie.value = undefined
        store.updateUserId(undefined)
    }
})
```

对`userCookie.value`赋值会使响应里多一个`set-cookie`响应头，以更新浏览器中的cookie。还有一点需要注意的是，`useCookie`只能在服务端渲染的同步阶段使用，如果先await了一个异步函数，再调用`useCookie`，会拿不到cookie。

## 服务端渲染和客户端渲染的一致性

在迁移过程中常常遇到服务端渲染和客户端渲染不一致的问题。除了缺乏浏览器的API以外，很多时候这都是因为服务端渲染没有浏览器的上下文，比如服务端没有`window`、`document`等对象。注意这不仅仅是报错问题，即使`window`不是`undefined`，也有可能导致问题。比如一个变量根据`window.devicePixelRatio`的不同来返回不同的值，就很可能导致渲染不一致，因为服务端不可能提前知道客户端的`devicePixelRatio`是多少。

这时我们需要保证相关的代码仅在客户端渲染。Nuxt提供了内置组件`<ClientOnly>`来实现这样的功能。

```html
<ClientOnly>
	<ResponsiveImage />
</ClientOnly>
```

只需要在组件外面包裹一层`<ClientOnly>`，组件代码就只会在客户端执行。

另外，也可以通过将组件的文件名后缀改为`.client.vue`将组件定义为仅在客户端运行。这种方式和`<ClientOnly>`有所不同。首先，这种方式只对自动引入和通过`#components`引入的组件生效，如果通过真实路径引入它们，它们就不会被转化为仅在客户端运行的组件。而且这种组件会在挂载之后才开始渲染，如果需要在`onMounted()`中访问模板中的DOM，需要加一行`await nextTick()`。

有客户端组件当然也有服务端组件。`components`文件夹中的`.server.vue`会注册为仅在服务端渲染的组件。也就是说，这个组件只在服务端执行`setup`，在客户端就只是一个单纯的HTML片段。如果这个组件接收了`prop`，且`prop`变更了，会触发一个请求，在服务端重新渲染后再更新客户端相应的HTML片段。

服务端组件是借鉴自最近大火的SSG框架Astro的孤岛（island）架构。孤岛组件拥有自己的独立上下文，也就是说，在孤岛组件内，除了`prop`以外，其他的数据，如Pinia或通过`provide`提供的数据，它都读取不到。所以仅适用于不依赖网页其他数据的比较孤立的部分。关于孤岛组件的好处和用法可以参考[这篇文章](https://roe.dev/blog/nuxt-server-components)。

## 部署

服务端渲染的项目可以直接部署到服务器上，也可以部署到Serverless服务上，这部分参见[官方文档](https://nuxt.com/docs/getting-started/deployment)即可。

另外，如果部署到子路径，需要一些额外的配置。因为服务端渲染使用了一个Node服务来接管所有的路由和静态资源的分发，情况和SPA略有不同。

比如我的项目需要部署在服务器的`/music/`子路径下。

首先在`nuxt.config.ts`中，添加以下配置：

```javascript
app: {
    baseURL: '/music/',
    buildAssetsDir: '/music/_nuxt/'
}
```

然后在Nginx中将`/music/`的请求转发到Node服务的同名子路径下：

```
location /music/ {
    proxy_pass http://127.0.0.1:3000/music/;
    proxy_set_header Host $host;
}
```

这样页面和静态资源就可以正常在子路径下加载了。

除了一些用法上的不适，整个迁移过程还是比较顺利的，没遇到什么难以解决的问题。Nuxt 3用于生产环境目前来看已经问题不大了。
