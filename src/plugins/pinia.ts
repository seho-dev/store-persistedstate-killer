import { configData, hitStore, getStoreConfig, getStateConfig, getStorageActionConfig } from '../config'
import { setStorage, getStorage, iterationStorageDriverAllKeys } from '../storage'
import { getRenameStateByStore } from './index'
import { SubscriptionCallbackMutationDirect, PiniaPluginContext } from 'pinia'
import { Pinia } from '../../typings/plugins/index'

// 将payload转换为key, newvalue的格式
const transformPayload = (payload: Record<string, unknown>): { key: string; newValue: any }[] => {
  const result: { key: string; newValue: string }[] = []
  for (const key in payload) {
    result.push({
      key,
      newValue: payload[key] as any
    })
  }
  return result
}

/**
 * @name 推送store数据
 * @description 以store为中心推送数据到storage中
 * @param {PiniaPluginContext} context
 * @param {({ flag: string; })} options
 */
const initPushStore = (context: PiniaPluginContext, options: { flag: string }) => {
  const { flag } = options
  // 将状态管理中的已知数据同步到local中
  const state = context.store.$state
  // 查看state是否存在于local中，如果没有，则同步
  for (const i in state) {
    let stateName = `${flag}${i}`
    if (getStorage(stateName) === null) {
      const stateConfig = getStateConfig(context.store.$id, i)
      if (stateConfig) {
        const { noPersisted = false, rename = i } = stateConfig
        stateName = `${flag}${rename}`
        // 判断此state是否需要序列化
        if (noPersisted) {
          // 不需要持久化
          continue
        }
      }
      setStorage(stateName, state[i])
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
  const storageAction = getStorageActionConfig()
  const { flag } = options
  // 如果用户是自定义存储，就拿出自定义的迭代方法
  // 查看目前已有的存储
  // 获取之前被持久化的存储
  const storaged: string[] = []
  // 定义在迭代缓存key的时候，做出的回调
  const handleIterationCallback = (name: string | null) => {
    // 判断存储的名称是否包含标识，如果包含说明是此store的存储
    if (name?.includes(flag)) {
      storaged.push(name as string)
    }
  }
  // 判断用户是否有自定义的缓存迭代方法
  if (storageAction?.isDefineStorage) {
    // 执行自定义回调
    storageAction.iteration(handleIterationCallback)
  } else {
    // 迭代预定义驱动的存储的每个key
    iterationStorageDriverAllKeys(handleIterationCallback)
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
  // 仓库名称，会优先取rename名称，如果没有指定rename则就是原名称
  const storeName = storeConfig?.rename || context.store.$id
  // 获取缓存的name中的store名
  const flag = `${configData.prefix}${storeName}-`
  initPullStorage(context, {
    flag
  })
  initPushStore(context, {
    flag
  })
}

export const use: Pinia['use'] = (context) => {
  if (!hitStore(context.store.$id)) return
  const storeConfig = getStoreConfig(context.store.$id)
  // 仓库名称，会优先取rename名称，如果没有指定rename则就是原名称
  const storeName = storeConfig?.rename || context.store.$id
  configData.isDev && console.log(`🥷 store-persistedstate-killer running...`)
  // react to store changes
  context.store.$subscribe(
    (e: SubscriptionCallbackMutationDirect) => {
      const isEventArray = Array.isArray(e.events)
      // 如果event是空数组，说明是无用的patch（patch的数据和旧数据一样）
      if (isEventArray && e.events.length === 0) return
      // 更新 storage
      if (!isEventArray) {
        e.events = [e.events]
      }
      configData.isDev && console.log('🥷 react to store changes:')
      // 如果events是undefined, 就要做一个数据兜底, 用payload数据替换
      // payload是一个对象, 需要转换为key, newValue的格式
      e.events = typeof e.events[0] === 'undefined' ? transformPayload((e as any).payload) : []
      if (configData.isDev) {
        for (const i in e.events) {
          console.log(`🥷 ${e.events[i].key} (${e.storeId}): ${e.events[i].oldValue} -> ${e.events[i].newValue}`)
        }
      }
      for (const i in e.events) {
        console.log(e.events[i])
        let stateName = e.events[i].key
        const stateConfig = getStateConfig(context.store.$id, e.events[i].key)
        if (stateConfig) {
          const { noPersisted = false, rename = stateName } = stateConfig
          stateName = rename
          if (noPersisted) {
            continue
          }
        }
        setStorage(`${configData.prefix}${storeName}-${stateName}`, e.events[i].newValue)
      }
    },
    {
      flush: 'sync'
    }
  )
}
