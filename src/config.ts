import { DefineConfig, Config, HitStore, StoreConfig, StateConfig } from '../typings/config'

// 配置对象, 这里配置一个默认的配置
const baseConfig = {
  include: undefined,
  exclude: undefined,
  storageKey: 'persistedstate-killer',
  title: '',
  isDev: process.env.NODE_ENV === 'development'
}

export let configData: Config = baseConfig

export const defineConfig: DefineConfig = (config, reset = true) => {
  if (reset) configData = baseConfig
  // 注册
  configData = {
    ...configData,
    ...config
  }
}

export const hitStore: HitStore = (storeName: string): boolean => {
  // 如果exclude和include都没选择, 就是默认命中
  if (!configData.exclude && !configData.include) return true
  // 根据config中的include，exclude条件
  const excludeResult = configData.exclude?.includes(storeName)
  const includeResult = configData.include?.includes(storeName)
  if (configData.include && includeResult) return true
  // 如果include为空，但是excludeResult为false 则就命中
  if (!configData.include && !excludeResult) return true
  return false
}

export const getStoreConfig = (storeName: string): StoreConfig | null => {
  if (configData.store && configData.store[storeName]) {
    return configData.store[storeName] as StoreConfig
  }
  return null
}

export const getStateConfig = (storeName: string, stateName: string): StateConfig | null => {
  const storeConfig = getStoreConfig(storeName)
  if (storeConfig && storeConfig.state && storeConfig.state[stateName]) {
    return storeConfig.state[stateName]
  }
  return null
}
