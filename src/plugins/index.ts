import { getStoreConfig } from '../config'
import { configData, getStorageActionConfig } from '../config/index'
import { iterationStorageDriverAllKeys } from '../storage'

/**
 * @name 获取state和renameState引用
 * @param {string} storeName
 */
export const getRenameStateByStore = (storeName: string): Record<string, string> => {
  const storeConfig = getStoreConfig(storeName)
  const result: Record<string, string> = {}
  for (const key in storeConfig?.state) {
    if (storeConfig?.state[key].rename) {
      result[key] = storeConfig?.state[key].rename as string
    }
  }
  return result
}

/**
 * @name 清空关于killer所有的缓存
 */
export const clearKillerStorage = (): void => {
  const clearKeys: string[] = []
  const storageAction = getStorageActionConfig()
  // 定义一个函数用于匹配killer名称
  const matchKillerStorageKey = (name: string | null) => {
    if (configData.prefix) {
      console.log(name)
      if (name?.indexOf(configData.prefix) === 0) {
        clearKeys.push(name)
      }
    }
  }
  if (storageAction?.isDefineStorage) {
    storageAction.iteration(matchKillerStorageKey)
  } else {
    // 使用预定义驱动进行迭代（localstorage, sessionstorage）
    iterationStorageDriverAllKeys(matchKillerStorageKey)
  }
  clearKeys.map((name) => storageAction?.removeItem(name))
}

export * as pinia from './pinia'
