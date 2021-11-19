export * as pinia from './pinia'
import { getStoreConfig } from '../config'

/**
 * @name 获取state和renameState引用
 * @param {string} storeName
 */
export const getRenameStateByStore = (storeName: string) => {
  const storeConfig = getStoreConfig(storeName)
  const result: Record<string, string> = {}
  for (const key in storeConfig?.state) {
    if (storeConfig?.state[key].rename) {
      result[key] = storeConfig?.state[key].rename as string
    }
  }
  return result
}
