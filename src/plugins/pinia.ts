import { Pinia } from '../../typings/plugins/index'
import { SubscriptionCallbackMutationDirect } from 'pinia'
import lscache from 'lscache'

// 判断是否是开发环境
const isDev = process.env.NODE_ENV === 'development'
const key = 'persistedstate-killer'

export const init: Pinia['init'] = (context) => {
  // 查看目前已有的存储
  const len = localStorage.length
  // 获取之前被持久化的存储
  const storaged: string[] = []
  // 获取缓存的name中的store名
  const flag = `${key}-${context.store.$id}-`
  for (let i = 0; i < len; i++) {
    // 并且需要剔除不是此store的缓存
    const name = localStorage.key(i)
    if (name?.includes(flag) && localStorage.key(i)?.includes(key)) {
      storaged.push(localStorage.key(i)?.replace('lscache-', '') as string)
    }
  }
  const patchData: Record<string, unknown> = {}
  storaged.map((s) => {
    patchData[s.split(flag)[1]] = lscache.get(s)
  })
  context.store.$patch(patchData)
}

export const use: Pinia['use'] = (context) => {
  isDev && console.log('🥷 store-persistedstate-killer running...')
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
      lscache.set(`${key}-${e.storeId}-${e.events[i].key}`, e.events[i].newValue)
    }
  })
}
