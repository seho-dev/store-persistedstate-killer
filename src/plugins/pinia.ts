import lscache from 'lscache'
import { SubscriptionCallbackMutationDirect } from 'pinia'
import { setStorage, getStorage } from './index'
import { configData, hitStore } from '../config'
import { Pinia } from '../../typings/plugins/index'

const { isDev, storageKeys: key } = configData

export const init: Pinia['init'] = (context) => {
  // 查看当前store是否被命中，如果没有命中，则不执行init
  if (!hitStore(context.store.$id)) return
  // 查看目前已有的存储
  const len = localStorage.length
  // 获取之前被持久化的存储
  const storaged: string[] = []
  // 获取缓存的name中的store名
  const flag = `${key}-${context.store.$id}-`
  for (let i = 0; i < len; i++) {
    // 并且需要剔除不是此store的缓存
    const name = localStorage.key(i)
    if (name?.includes(flag) && localStorage.key(i)?.includes(key as string)) {
      storaged.push(localStorage.key(i)?.replace('lscache-', '') as string)
    }
  }
  const patchData: Record<string, unknown> = {}
  storaged.map((s) => {
    patchData[s.split(flag)[1]] = getStorage(s)
  })
  context.store.$patch(patchData)
  // 将状态管理中的已知数据同步到local中
  const state = context.store.$state
  // 查看state是否存在于local中，如果没有，则同步
  for (const i in state) {
    if (lscache.get(`${flag}${i}`) === null) {
      setStorage(`${flag}${i}`, state[i])
    }
  }
}

export const use: Pinia['use'] = (context) => {
  if (!hitStore(context.store.$id)) return
  isDev && console.log(`🥷 store-persistedstate-killer running...`)
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
    isDev && console.log('🥷 react to store changes:')
    if (isDev) {
      for (const i in e.events) {
        console.log(`🥷 ${e.events[i].key} (${e.storeId}): ${e.events[i].oldValue} -> ${e.events[i].newValue}`)
      }
    }
    for (const i in e.events) {
      setStorage(`${key}-${e.storeId}-${e.events[i].key}`, e.events[i].newValue)
    }
  })
}
