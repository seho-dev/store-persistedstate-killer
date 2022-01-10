# store-persistedstate-killer

[EN](https://github.com/1018715564/store-persistedstate-killer/blob/master/README.md) / 中文

🥷 杀手级别的持久化状态管理库

---

- 😄 可以为多个库提供持久化服务 (vuex, pinia)
- 🔧 支持 TypeScript
- 📦 支持 预定义存储驱动 (localstorage, sessionstorage) 以及自定义驱动
- 🔒 支持相对安全的存储环境（非明文）
- 🙅‍♂️ 灵活的配置且没有副作用
- 📄 对开发友好的状态变更 Log
- 💪 持久化加强功能 (重命名...)

## 安装

```
npm i store-persistedstate-killer
```

## 快速使用

```ts
// main.ts
// pinia平台
import { plugins as killer, config } from 'store-persistedstate-killer'

createApp(App)
  .use(
    createPinia().use((context) => {
      killer.pinia.init(context)
      killer.pinia.use(context)
    })
  )
  .mount('#app')

```

## Demo

[![Edit objective-sun-1wmt7](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/objective-sun-1wmt7?fontsize=14&hidenavigation=1&theme=dark)

## 目标

1. 用状态管理接管你的 storage，从此无需担心类型，像操作 store 一样操作 storage 即可
2. 前端存储不再明文

## killer 做的事情

<img src='https://static.yinzhuoei.com/typecho/2022/01/07/486183517624630/3d3edf75-8e6d-4262-ae67-7ffb90da1141.png' />

## 设计

每一个平台的插件你可以单独引入它们，比如你是 pinia 平台，那你仅仅这样引入就可以了

```ts
createApp(App)
  .use(
    createPinia().use((context) => {
      killer.pinia.init(context)
      killer.pinia.use(context)
    })
  )
  .mount('#app')
```

killer 中每一个插件都包含`2个部分`, 一个就是 init，一个是 use

## init

在应用初始化时，把我们 storage 内容同步到 store 中; 如若发现 store 有，但是 storage 没有的 state，也会执行一次同步。这个过程是双向的。在文档上方就有一个 killer的概要图，我们如果站在状态管理的视角下，可以理解 storage 为远端，双方的交流就可以当作`push` 和 `pull`

## use

use 是 killer 的核心功能，它可以监听 state 的变更以及 patch 操作，它可以实时地把 state 同步给 storage

---

如你所见，如果你的业务中，仅仅需要监听 state 然后同步到 storage 这个需求，你也可以仅使用 use 这个插件 😄

如果想看到更多有关平台插件的文档，你可以移步具体的文档中（就在下方）

## 支持的平台/库

| Platform | Lib | Doc |
| -------- | ------ | --- |
| pinia2   | ✅     | ✅  |
| vuex4/5  | 🚧     | 🚧  |

## 核心

killer 为各个平台的插件提供了多个核心，使它们能够正常运转，每一个核心主要负责一个业务，比如说配置，加密，存储

### 配置

killer 本身自带一个开箱即用的配置，你如果有特殊的需要，可以去自定义它们。在此之前你需要了解各个插件的工作原理，我们以 pinia 举例子。pinia 由一个一个 store 组成，store 由 state,getters,action 组成，所以 killer 仅仅是在`useStore()`之后才运行的插件，killer 接管了 store 的 state，使之能够持久化到本地存储中；那么在持久化的过程中，我们可能需要做一些`重命名`, `加密数据`等工作...

| 配置名 | 含义 | 类型 | 默认 | 建议 
| -------- | ------ | ----- | --- | -- |
| exclude   | 排除指定的仓库名    | string[ ] | [ ] | |
| include  | 包含指定的仓库名     | string[ ] | [ ] | |
| prefix | 缓存的key前缀 | string | persistedstate-killer- | 建议传入有效的字符串 |
| iv  | 加密需要用的iv变量     | string | '' | 可以为空 |
| isDev  | 是否是开发环境     | boolean | process.env.NODE_ENV === 'development'  | 如果为false将自动加密 |
| storageDriver  | 插件预定义的存储驱动     | defineStorageDriver | defineStorageDriver('localStorage') | 支持传入localStorage和sessionStorage |
| store  | 对仓库进行详细配置     | Partial<Record<K, StoreConfig>> | 没有默认配置 |  |
| defineStorage  | 自定义存储驱动     | setItem, getItem, removeItem, iteration | 没有默认配置 | 如果预定义存储驱动defineStorageDriver没有满足你的需求，可以使用这个方法定义新的驱动 |

你的工程中的自定义配置可能就像这样:

```ts
import { plugins as killer, config } from 'store-persistedstate-killer'

createApp(App)
  .use(Router)
  .use(
    createPinia().use((context) => {
      config.defineConfig<'main'>({
        exclude: ['zhangsan'],
        include: ['main', 'test'],
        isDev: true,
        storageKey: 'seho',
        store: {
          main: {
            state: {
              hello: {
                rename: 'wuyu',
              }
            }
          }
        }
      })
      killer.pinia.init(context)
      killer.pinia.use(context)
    })
  )
  .mount('#app')
```

你可以看到, killer 提倡使用 ts 来构建插件，我们可以给 defineConfig 传入一个联合类型，声明需要对哪几个 store 进行操作，此时如果你在编写 include 和 store 配置时，将会有非常棒的类型提示。

| Api          | Desc     | Type                                                                                             |
| ------------ | -------- | ------------------------------------------------------------------------------------------------ |
| defineConfig | 注入配置 | [doc](https://github.com/1018715564/store-persistedstate-killer/blob/master/typings/config.d.ts) |

### 加密

前端的加密难道没有必要么？确实有人这么说，但是当我们把状态管理的数据明文暴露到 localstorage 中确实不是很好，尽管我们现在都这么做 🐶。我们需要一款易用的加密，不仅可以给 killer 中内部使用，而且还可以暴露给用户，让用户可以加密 api，交换特殊信息？killer 内部使用了`crypto-js`,默认使用了`浏览器ua -> base64`, 同时你也可以根
据业务需要指定 key 和 iv。

```ts
import { crypto } from 'store-persistedstate-killer'

const _crypto = new crypto()
const message = 'hello, messagehello, messagehello, messagehello, messagehello, messagehello, messagehello, message'
const encryptData = _crypto.encrypt(message)
if (encryptData) {
  const decrypt = _crypto.decrypt(encryptData)
  console.log('解密结果', decrypt)
} else {
  throw Error('加密错误')
}
```

我们可以给构造函数传递一个 ctx

```ts
const _crypto = new crypto({
  iv: 'asdasdasdasdasdasdasdasd',
  key: 'sssaasdasdasdas234234s'
})
```

[查看加密模块的类型声明](https://github.com/1018715564/store-persistedstate-killer/blob/master/typings/crypto.d.ts)

| Api     | Desc | Type                                |
| ------- | ---- | ----------------------------------- |
| encrypt | 加密 | ` (data: string) => string \| null` |
| decrypt | 解密 | ` (data: string) => string \| null` |
