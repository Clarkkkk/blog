---
title: Vue CLI+Vue 2迁移到Rsbuild
author: Aaron Zhou
description: Vue CLI+Vue 2迁移到rsbuild
pubDatetime: 2024-02-07T15:16:17.827Z
postSlug: vue-clivue-2-migrate-to-rsbuild
featured: false
draft: false
tags:
    - Vue
    - Vue CLI
    - Rsbuild
    - Rspack
    - 笔记
---
# Vue CLI+Vue 2迁移到Rsbuild

Rsbuild是在Rspack的基础上封装的构建工具，配置更简单。我这周已经将3个Vue CLI+Vue 2的项目迁移到Rsbuild上了，目前运作良好。

经过这几天的使用，可以说Rsbuild目前用在生产环境问题不大，配置简便，性能收益肉眼可见，已经成为Vue CLI和Webpack的上位替代。

我对字节的Web Infra团队非常有信心。一方面，他们确实在这个项目中投入了巨大的精力，现在已经临近春节了，他们还在疯狂提交commit，昨天才刚发了一个版本。另一方面，他们对issue的反馈也非常及时。我在迁移过程中遇到过两个导致Rsbuild崩溃的bug，给他们提issue之后，没过两天就给修复了。

按照他们的计划，今年上半年就可以把按需编译、持久缓存、模块联邦等Webpack核心功能肝出来，而且他们的插件生态也在逐步完善。按照这个进度，年内完全取代Webpack都不夸张。

这篇文章会分享一下整个迁移的过程、遇到的问题、以及迁移的收益等，希望能吸引到更多人尝试Rspack/Rsbuild。

## 调研

之前把Vue CLI从4升级到5，目的是利用Webpack 5的一系列新功能改善开发体验。但实践下来发现，由于Vue CLI目前已经进入维护状态，Webpack 5很多的新功能它都只有部分支持或者不支持。而且Vue CLI所依赖的webpack-chain现在也已经停止维护了，这导致Vue CLI内置的配置也难以修改。webpack-chain本来是为了简化配置，现在却成为了掣肘，令人感叹。

经过调查，目前想替代有3个方案，各有优缺点：

|           | 优点                                            | 缺点                                                                                   |
| --------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Webpack 5 | 可复用Vue CLI的大部分配置，配置比Vue CLI更自由  | 与Vue CLI 5相比，几乎没有性能收益；需要重新实现Vue CLI的内置功能，如环境变量自动读取等 |
| Vite      | 开发性能最优                                    | 配置和插件不能直接复用；大项目的构建没有优势                                           |
| Rsbuild   | 综合性能是Webpack的5倍，可复用Vue CLI的部分配置 | Rsbuild是一个较新的工具，可能存在兼容性问题                                            |

综合考虑下来，Rsbuild最值得尝试。

## 安装

我们需要支持Vue 2和Vue 2的JSX语法，所以还要安装相关插件

```sh
npm i -D @rsbuild/core @rsbuild/plugin-vue2 @rsbuild/plugin-babel @rsbuild/plugin-vue2-jsx
```

## 配置

在项目根目录新建`rsbuild.config.ts`，然后参照[官方文档](https://rsbuild.dev/zh/guide/migration/vue-cli)把Vue CLI的配置搬过来。很多配置都可以直接用或者改个名字就能用。

一些项目可能使用了`vue-cli-service build --no-clean`这样的命令，Rsbuild中可以通过配置`output.cleanDistPath: false`来做到。

许多webpack插件在rspack都有相应的替代，比如`webpack.ProvidePlugin`可以用`rspack.ProvidePlugin`代替，rspack的插件需要在`tools.rspack`中单独配置，如：

```js
import { rspack } from '@rspack/core'

tools: {
  rspack: {
    plugins: [new rspack.ProvidePlugin({
      introJs: ['intro.js']
    })]
  }
}
```

### Vue 2 JSX

支持JSX时，将Babel的生效范围限制在jsx文件内，减少Babel对性能的影响：

```js
plugins: [
  pluginVue2(),
  pluginBabel({
    include: /\.(?:jsx|tsx)$/,
    exclude: /[\\/]node_modules[\\/]/
  }),
  pluginVue2Jsx()
]
```

这时，`.vue`文件内在`render()`函数中使用的JSX语法可能不被识别，需要在`<script>`中声明`<script lang="jsx">`。由于Vue 2可以直接在SFC中写JSX，因此每一个文件都需要检查，手动检查工作量就上天了。我们可以写一个简单的脚本来给使用了JSX语法的vue文件加上`lang`声明：
```js
import { readFile, writeFile } from 'fs/promises'
import { globby } from 'globby'
import ts from 'typescript'

async function run() {
    const paths = await globby('src', {
        expandDirectories: {
            extensions: ['vue']
        }
    })

    for (const path of paths) {
        const file = await readFile(path, { encoding: 'utf8' })
        const contentArr = file.split('\n')
        const start = contentArr.findIndex((item) => item.includes('<script>'))
        const end = contentArr.findIndex((item) => item.includes('</script>'))
        if (start === -1) continue
        const scriptContent = contentArr.slice(start + 1, end).join('\n')
        const result = ts.transpileModule(scriptContent, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: 'react' } })
        if (result.outputText.includes('React.createElement')) {
            await writeFile(path, file.replace('<script>', '<script lang="jsx">'), { encoding: 'utf8' })
        }
    }
}

run()
```

### HTML模板

对于html模板的变量，将`<%= BASE_URL %>`替换为`<%= assetPrefix %>/`，注意要在末尾加上斜杠。其余变量可以使用`html.templateParameters`来设置，如：

```js
html: {
  template: './public/index.html',
  templateParameters: {
    cdn: assetsCDN
  }
},
```
在`index.html`中，就可以将

```
<% for (var i in htmlWebpackPlugin.options.cdn && htmlWebpackPlugin.options.cdn.css) { %>
      <link rel="stylesheet" href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" />
<% } %>
```

替换为

```
<% for (var i in cdn && cdn.css) { %>
  <link rel="stylesheet" href="<%= cdn.css[i] %>" />
<% } %>
```

### 环境变量

Rsbuild默认只会注入`PUBLIC_`开头的环境变量，为了兼容Vue CLI的行为，以及读取其他自定义的环境变量，需要使用`loadEnv`载入`VUE_APP_`开头的环境变量并通过`source.define`配置。

```js
import { defineConfig, loadEnv } from '@rsbuild/core'

const { publicVars: vueEnvs } = loadEnv({ prefixes: ['VUE_APP_'] })

export default defineConfig({
  // ...
  source: {
    define: {
      ...vueEnvs,
      'process.env': {
        ...process.env,
        SSO_ENV: JSON.stringify(argv.sso_env)
      }
    }
  }
})
```

Rsbuild也支持读取env模式，不同于Vue CLI使用的`--mode`，Rsbuild需要使用`--env-mode`，如：

```sh
rsbuild build --env-mode preview
```

在Rsbuild中，在`.env`文件里声明`NODE_ENV`不会生效，如果需要根据不同的`.env`文件使用不同的`NODE_ENV`，可以在配置中读取`envMode`，然后设置相应的`mode`，如：

```js
export default defineConfig(({ envMode, env }) => ({
  tools: {
    rspack: {
      mode: (env === 'development' || envMode === 'test') ? 'development' : 'production'
    }
  }
}))
```

### CLI参数

Rsbuild的CLI会拦截不认识的参数，因此像`vue-cli-service serve --sso_env=v1`这样的命令在Rsbuild下会报错，我们需要这样传入自定义的命令行参数`rsbuild dev -- --sso_env=v1`。

### LESS

LESS方面，Rsbuild内置的是LESS 4，less-loader的语法也是与webpack的less-loader最新版本保持一致，因此可能不兼容旧的语法。如`@import "~ant-design-vue/lib/style/index";`需要替换为`@import "ant-design-vue/lib/style/index";`；`globalVars`中的`@import`使用`additionalData`代替；`lessOptions`中需要加入`math: always`。具体配置如下：

```js
less: {
  additionalData: `@import "${resolve(__dirname, 'src')}/style/var.less";`,
  lessOptions: {
    math: 'always',
    modifyVars: {
      '@primary-color': '#077BFC',
      '@btn-primary-bg': '#077BFC'
    },
    javascriptEnabled: true
  }
}
```

### 按需加载

Rsbuild提供`source.transformImport`配置用于实现与`babel-plugin-import`类似的按需加载功能。如`ant-design-vue`和`lodash`的按需加载可以这样配置：

```js
transformImport: [
  {
    libraryName: 'lodash',
    customName: 'lodash/{{ member }}'
  },
  {
    libraryName: 'ant-design-vue',
    libraryDirectory: 'es',
    style: true
  }
]
```

实践发现，`libraryDirectory`默认不为空，但lodash不需要`libraryDirectory`，好在我们可以使用`customName`自定义模板路径。完整的配置选项参见：[transformImport](https://rsbuild.dev/zh/config/source/transform-import)

### 其他问题

在迁移过程中难免会踩到一些坑。比如发现Rsbuild会崩溃，仔细排查之后发现它不能正确解析形如`import('@/view' + path)`这样在动态import中使用变量的语法，会直接挂掉，暂时先规避这样的语法。又比如`require.context`在某些情况下也会导致Rsbuild崩溃。好在字节的团队非常负责，提issue之后过了一两天这些问题就修复了。

## 性能

经过实验，迁移到Webpack 5的收益并不大。以我迁移的一个项目为例，之前使用Vue CLI 4的时候，项目启动需要一分钟以上，热更新都要4、5秒。我尝试将Vue CLI升级到5，并开启Webpack 5持久缓存、按需编译等特性，发现提升不如想象中大。开启按需编译后，启动项目依然需要20秒。有缓存以后倒是10秒以内就能完成，但是Webpack的按需编译是有bug的，启动项目之后常常不能直接加载出页面，要么报错，要么样式丢失，需要多次手动刷新才恢复正常。

而迁移到Vite有比较高的配置成本，构建速度也会退化，所以这次迁移我没考虑Vite，直接开始实验性地迁移到Rsbuild。结果令人欣喜，迁移过程非常顺畅，很多配置都可以复用，该有的插件和功能都有，遇到的少数问题也很快就解决了。而且性能收益立竿见影，启动项目只需要15秒，热更新更是毫秒级别的。当然，由于使用了babel转译jsx语法，而且Rsbuild不支持按需编译和持久缓存，15秒仍然是不够令人满意的，但显然未来可期！

## 配置参考

最后我这里提供一份全量的配置文件作参考：

```ts
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginVue2 } from '@rsbuild/plugin-vue2'
import { pluginBabel } from '@rsbuild/plugin-babel'
import { pluginVue2Jsx } from '@rsbuild/plugin-vue2-jsx'
import { resolve } from 'path'

const argv = process.argv.reduce((acc, cur) => {
  const arr = cur.split('=')
  if (arr.length > 1) {
    acc[arr[0].replace(/^--/g, '')] = arr[1]
  }
  return { ...acc }
}, {} as Record<string, string>)

const IS_PROD = ['production'].includes(process.env.NODE_ENV!)
const { publicVars: vueEnvs } = loadEnv({ prefixes: ['VUE_APP_'] })

const assetsCDN = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex'
  },
  css: [],
  js: [
    'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js',
    'https://cdn.jsdelivr.net/npm/vue-router@3.6.5/dist/vue-router.min.js',
    'https://cdn.jsdelivr.net/npm/vuex@4.1.0/dist/vuex.global.min.js'
  ]
}

const sourceMapFlag = (!IS_PROD || argv.sso_env) ? 'source-map' : false

export default defineConfig(({ envMode, env }) => {
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log({ envMode })
  const proxy: Record<string, string> | undefined = {
    production: {
      '/apisso': 'https://www.example.com',
      '/apitrade': 'https://www.example.com',
      '/apifileApi': 'https://www.example.com',
      '/apiopenApi': 'https://www.example.com'
    },
    development: {
      '/apisso': 'http://test.example.com',
      '/apitrade': 'http://test.example.com',
      '/apifileApi': 'http://test.example.com',
      '/apiopenApi': 'http://test.example.com'
    }
  }[argv.api_mode || envMode || process.env.NODE_ENV || 'development']

  return {
    plugins: [
      pluginVue2(),
      pluginBabel({
        include: /\.(?:jsx|tsx)$/,
        exclude: /[\\/]node_modules[\\/]/
      }),
      pluginVue2Jsx()
    ],
    dev: {
      assetPrefix: '/' + (argv.sso_env ? `${argv.sso_env}/` : ''),
      progressBar: true
    },
    output: {
      assetPrefix: '/' + (argv.sso_env ? `${argv.sso_env}/` : ''),
      sourceMap: {
        js: sourceMapFlag,
        css: !!sourceMapFlag
      }
    },
    server: {
      port: 9100,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      proxy: (() => {
        if (!proxy) return
        const entries = Object.keys(proxy).map(key => {
          const value = {
            changeOrigin: true,
            pathRewrite: { [`^${key}`]: '' },
            target: proxy[key]
          }
          return [key, value]
        })
        return Object.fromEntries(entries)
      })()
    },
    source: {
      define: {
        ...vueEnvs,
        'process.env': {
          ...process.env,
          SSO_ENV: JSON.stringify(argv.sso_env)
        }
      },
      entry: {
        index: './src/main.js'
      },
      transformImport: [
        {
          libraryName: 'lodash',
          customName: 'lodash/{{ member }}'
        },
        {
          libraryName: 'ant-design-vue',
          libraryDirectory: 'es',
          style: true
        }
      ]
    },
    html: {
      template: './public/index.html',
      templateParameters: {
        cdn: assetsCDN
      }
    },
    tools: {
      rspack: {
        mode: (env === 'development' || envMode === 'alpha2') ? 'development' : 'production',
        devtool: 'eval-cheap-module-source-map',
        externals: assetsCDN.externals,
        resolve: {
          extensions: ['.vue', '.js', '.jsx', '.tsx', '.ts', '.json']
        }
      },
      less: {
        additionalData: `@import "${resolve(__dirname, 'src')}/style/var.less";`,
        lessOptions: {
          math: 'always',
          modifyVars: {
            '@primary-color': '#077BFC',
            '@btn-primary-bg': '#077BFC'
          },
          javascriptEnabled: true
        }
      }
    },
    performance: {
      removeMomentLocale: true,
      removeConsole: IS_PROD ? ['log'] : undefined
    }
  }
})
```
