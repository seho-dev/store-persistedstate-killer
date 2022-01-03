import { DefineConfig, Config, HitStore, StoreConfig, StateConfig } from '../../typings/config'
import { defineStorageDriver } from '../storage/driver'
import { observable } from '@nx-js/observer-util'

// 配置对象, 这里配置一个默认的配置
const baseConfig: Config = {
  include: undefined,
  exclude: undefined,
  iv: '',
  isDev: process.env.NODE_ENV === 'development',
  prefix: 'persistedstate-killer-',
  storageDriver: defineStorageDriver('localStorage')
}

export let configData: Config = observable(baseConfig)

/**
 * @name 用户传入配置项
 * @param {*} config
 * @param {boolean} [reset=true]
 */
export const defineConfig: DefineConfig = (config, reset = true) => {
  if (reset) configData = baseConfig
  // 注册
  configData = observable({
    ...configData,
    ...config
  })

  // TODO 将config对象持久化（持久化方式取决于存储驱动）
  // TODO 将旧配置对象进行md5
  // TODO 每次调用这个方法都会将此config对象md5和缓存中的config进行比对，如果比对失败，说明有配置修改，就重新重置killer缓存，并且重新运行init和use方法
}

/**
 * @name 🎯根据仓库名称判断是否命中指定仓库了
 * @param {string} storeName
 * @return {*}  {boolean}
 */
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

/**
 * @name 获取指定仓库配置信息根据仓库名
 * @param {string} storeName
 * @return {*}  {(StoreConfig | null)}
 */
export const getStoreConfig = (storeName: string): StoreConfig | null => {
  if (configData.store && configData.store[storeName]) {
    return configData.store[storeName] as StoreConfig
  }
  return null
}

/**
 * @name 获取指定state配置信息根据仓库名和state名
 * @param {string} storeName
 * @param {string} stateName
 * @return {*}  {(StateConfig | null)}
 */
export const getStateConfig = (storeName: string, stateName: string): StateConfig | null => {
  const storeConfig = getStoreConfig(storeName)
  if (storeConfig && storeConfig.state && storeConfig.state[stateName]) {
    return storeConfig.state[stateName]
  }
  return null
}

/**
 * @name 从配置对象中获取storage的突变和查询操作
 * @return {*}  {((typeof configData.storageDriver & typeof configData.defineStorage & { isDefineStorage: boolean }) | null)}
 */
export type GetStorageActionConfigReturn = (typeof configData.storageDriver & typeof configData.defineStorage & { isDefineStorage: boolean }) | null
export const getStorageActionConfig = (): GetStorageActionConfigReturn => {
  // 判断配置对象中是否有自定义存储
  if (configData.defineStorage) {
    // 如果有就返回相应的get，set方法
    return {
      ...configData.defineStorage,
      isDefineStorage: true
    } as any
  } else if (configData.storageDriver) {
    return {
      ...configData.storageDriver,
      isDefineStorage: false
    } as any
  }
  return null
}
