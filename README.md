# store-persistedstate-killer

EN / [中文](https://github.com/1018715564/store-persistedstate-killer/blob/master/README-CN.md)

🥷 A killer-level persistent state management library

- 😄 Can provide persistence services for multiple libraries (vuex, pinia)
- 🔧 Support TypeScript
- 📦 Support predefined storage drivers (localstorage, sessionstorage) and custom drivers
- 🔒 Support relatively secure storage environment (non-clear text)
- 🙅‍♂️ Flexible configuration without side effects
- 📄 Dev friendly status change log
- 💪 Persistence enhancements (renamed...)

## install

```
npm i store-persistedstate-killer
```
## Quick use

```ts
// main.ts
// pinia platform
import { plugins as killer, config } from 'store-persistedstate-killer'

createApp(App)
   .use(
     createPinia().use((context) => {
       killer.pinia.init(context)
       killer.pinia.use(context)
     })
   )
   .mount('#app')


// in ts,vue,etc... (pinia)
const userStore = useUserStore()
userStore.$patch({
  ...
})

// in action
{
   actions: {
    async loadUserInfo(params) {
      this.$patch({
        ...
      })
    },
  }
}

// tip: you must use `$patch` to update state, otherwise the state will not be persisted
```

```

## Demo

[![Edit objective-sun-1wmt7](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/objective-sun-1wmt7?fontsize=14&hidenavigation=1&theme=dark)


## Target

1. Take over your storage with state management, no need to worry about the type from now on, just operate the storage like you operate the store
2. The front-end storage is no longer in plaintext

## What killer does


<img src='https://static.yinzhuoei.com/typecho/2022/01/07/486183517624630/3d3edf75-8e6d-4262-ae67-7ffb90da1141.png' />

## Design

You can import plugins for each platform individually. For example, if you are a pinia platform, you can just import them like this.

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

Every plugin in killer contains `2 parts`, one is init and the other is use

## init

When the application is initialized, synchronize our storage content to the store; if it is found that the store has a state that is not available in the storage, a synchronization will also be performed. The process goes both ways. There is a killer outline at the top of the document. If we stand in the perspective of state management, we can understand that storage is the remote end, and the communication between the two parties can be regarded as `push` and `pull`

## use

use is the core function of killer, it can monitor state changes and patch operations, and it can synchronize state to storage in real time

---

As you can see, if your business only needs to monitor state and synchronize to storage, you can also just use the use plugin 😄

If you want to see more documentation about platform plugins, you can go to the specific documentation (just below)

## Supported platforms/libraries

| Platform | Lib | Doc |
| -------- | ------ | --- |
| pinia2   | ✅     | ✅  |
| vuex4/5  | 🚧     | 🚧  |

## core

killer provides multiple cores for plug-ins of various platforms, so that they can operate normally. Each core is mainly responsible for a business, such as configuration, encryption, storage

### config

Killer itself comes with an out-of-the-box configuration, if you have special needs, you can customize them. Before that, you need to understand how each plugin works, we take pinia as an example. pinia consists of a store, store consists of state, getters, action, so the killer is only a plugin that runs after `useStore()`, the killer takes over the state of the store, so that it can be persisted to the local storage; then In the process of persistence, we may need to do some `rename`, `encrypted data`, etc...

| Configuration Name | Meaning | Type | Default | Recommended
| -------- | ------ | ----- | --- | -- |
| exclude | Exclude the specified repository name | string[ ] | [ ] | |
| include | Include the specified repository name | string[ ] | [ ] | |
| prefix | Cached key prefix | string | persistedstate-killer- | It is recommended to pass a valid string |
| iv | iv variable required for encryption | string | '' | can be empty |
| isDev | Is it a development environment | boolean | process.env.NODE_ENV === 'development' | If false, it will be encrypted automatically |
| storageDriver | Plug-in predefined storage drivers | defineStorageDriver | defineStorageDriver('localStorage') | Support incoming localStorage and sessionStorage |
| store | Detailed configuration of the warehouse | Partial<Record<K, StoreConfig>> | No default configuration | |
| defineStorage | Custom storage driver | setItem, getItem, removeItem, iteration | No default configuration | If the predefined storage driver defineStorageDriver does not meet your needs, you can use this method to define a new driver |

A custom configuration in your project might look like this:

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

You can see that killer advocates the use of typescript to build plugins. We can pass a union type to defineConfig to declare which stores need to be operated on. At this time, if you are writing include and store configuration, it will be very good. type hints.

| Api          | Desc     | Type                                                                                             |
| ------------ | -------- | ------------------------------------------------------------------------------------------------ |
| defineConfig | inject configuration | [doc](https://github.com/1018715564/store-persistedstate-killer/blob/master/typings/config.d.ts) |

### encryption

Is front-end encryption unnecessary? It's true that some people say that, but it's really not good when we expose state management data in plaintext to localstorage, although we all do it now 🐶. We need an easy-to-use encryption that can not only be used internally by killers, but also exposed to users, allowing users to encrypt apis and exchange special information? Killer uses `crypto-js` internally, and uses `browser ua -> base64` by default, and you can also root
Specify key and iv according to business needs.

```ts
import { crypto } from 'store-persistedstate-killer'

const _crypto = new crypto()
const message = 'hello, messagehello, messagehello, messagehello, messagehello, messagehello, messagehello, message'
const encryptData = _crypto.encrypt(message)
if (encryptData) {
  const decrypt = _crypto.decrypt(encryptData)
  console.log('result', decrypt)
} else {
  throw Error('error')
}
```

We can pass a context to the constructor


```ts
const _crypto = new crypto({
  iv: 'asdasdasdasdasdasdasdasd',
  key: 'sssaasdasdasdas234234s'
})
```

[View the type declaration for the cryptographic module](https://github.com/1018715564/store-persistedstate-killer/blob/master/typings/crypto.d.ts)

| Api | Desc | Type |
| ------- | ---- | ----------------------------------- |
| encrypt | encrypt | ` (data: string) => string \| null` |
| decrypt | decrypt | ` (data: string) => string \| null` |
