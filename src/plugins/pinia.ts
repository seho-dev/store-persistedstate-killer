import lscache from 'lscache'
import { setStorage, getStorage } from './../storage'
import { configData, hitStore, getStoreConfig, getStateConfig } from '../config'
import { getRenameStateByStore } from './index'
import { SubscriptionCallbackMutationDirect, PiniaPluginContext } from 'pinia'
import { Pinia } from '../../typings/plugins/index'

/**
 * @name 推送store数据
 * @description 以store为中心推送数据到storage中
 * @param {PiniaPluginContext} context
 * @param {({ flag: string; expire: number | null })} options
 */
const initPushStore = (context: PiniaPluginContext, options: { flag: string; expire: number | null }) => {
  const { flag, expire } = options
  // 将状态管理中的已知数据同步到local中
  const state = context.store.$state
  // 查看state是否存在于local中，如果没有，则同步
  for (const i in state) {
    let stateName = `${flag}${i}`
    let _expire = expire
    if (lscache.get(stateName) === null) {
      const stateConfig = getStateConfig(context.store.$id, i)
      if (stateConfig) {
        const { noPersisted = false, rename = i, expire = _expire } = stateConfig
        stateName = `${flag}${rename}`
        _expire = expire
        // 判断此state是否需要序列化
        if (noPersisted) {
          // 不需要持久化
          continue
        }
      }
      setStorage(stateName, state[i], _expire)
    }
  }
}

/**
 * @name 拉取storage数据
 * @description 以store为中心从storage中拉取数据
 * @param {PiniaPluginContext} context
 * @param {({ flag: string; expire: number | null })} options
 */
const initPullStorage = (context: PiniaPluginContext, options: { flag: string }) => {
  const { flag } = options
  // 查看目前已有的存储
  const len = localStorage.length
  // 获取之前被持久化的存储
  const storaged: string[] = []
  // 获取所有缓存
  for (let i = 0; i < len; i++) {
    // 获取存储的key值（lscache-**-**-**）
    const name = localStorage.key(i)
    // 判断存储的名称是否包含标识且不包含过期时间标识，如果包含说明是此store的存储
    // 过期时间的key值代表了某个key被lscache处理了，所以在这里我们不需要处理这个存储，以免把这个无用的存储同步到状态管理中
    if (name?.includes(flag) && !name?.includes(`cacheexpiration`)) {
      storaged.push(name?.replace('lscache-', '') as string)
    }
  }
  const patchData: Record<string, unknown> = {}
  storaged.map((s) => {
    // 获取store下的state和state rename的引用
    const state = getRenameStateByStore(context.store.$id)
    let key = s.split(flag)[1]
    // 查询key在引用中是否存在
    for (const i in state) {
      if (state[i] === key) {
        // 把原值返回给key
        key = i
      }
    }
    patchData[key] = getStorage(s)
  })
  context.store.$patch(patchData)
}

export const init: Pinia['init'] = (context) => {
  // 查看当前store是否被命中，如果没有命中，则不执行init
  if (!hitStore(context.store.$id)) return
  const storeConfig = getStoreConfig(context.store.$id)
  // 获取store的过期时间，默认为永久
  const expire = storeConfig?.expire || null
  // 仓库名称，会优先取rename名称，如果没有指定rename则就是原名称
  const storeName = storeConfig?.rename || context.store.$id
  // 获取缓存的name中的store名
  const flag = `${configData.storageKey}-${storeName}-`
  initPullStorage(context, {
    flag
  })
  initPushStore(context, {
    flag,
    expire
  })
}

export const use: Pinia['use'] = (context) => {
  if (!hitStore(context.store.$id)) return
  const storeConfig = getStoreConfig(context.store.$id)
  // 获取store的过期时间，默认为永久
  const expire = storeConfig?.expire || null
  // 仓库名称，会优先取rename名称，如果没有指定rename则就是原名称
  const storeName = storeConfig?.rename || context.store.$id
  configData.isDev && console.log(`🥷 store-persistedstate-killer running...`)
  // react to store changes
  context.store.$subscribe((e: SubscriptionCallbackMutationDirect) => {
    // 判断event是否是数组，如果是数组，说明是patch批量更新
    const isEventArray = Array.isArray(e.events)
    // 如果event是空数组，说明是无用的patch（patch的数据和旧数据一样）
    if (isEventArray && e.events.length === 0) return
    // 更新 storage
    if (!isEventArray) {
      e.events = [e.events]
    }
    configData.isDev && console.log('🥷 react to store changes:')
    if (configData.isDev) {
      for (const i in e.events) {
        console.log(`🥷 ${e.events[i].key} (${e.storeId}): ${e.events[i].oldValue} -> ${e.events[i].newValue}`)
      }
    }
    for (const i in e.events) {
      let stateName = e.events[i].key
      let _expire = expire
      const stateConfig = getStateConfig(context.store.$id, e.events[i].key)
      if (stateConfig) {
        const { noPersisted = false, rename = stateName, expire = _expire } = stateConfig
        _expire = expire
        stateName = rename
        if (noPersisted) {
          continue
        }
      }
      setStorage(`${configData.storageKey}-${storeName}-${stateName}`, e.events[i].newValue, _expire)
    }
  })
}
