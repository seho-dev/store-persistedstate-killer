import lscache from 'lscache'
export * as pinia from './pinia'
import { Crypto } from './../crypto'
import { configData, getStoreConfig } from '../config'

const crypto = new Crypto({
  iv: configData.title
})

/**
 * @name 提供给插件设置storage的函数
 * @description 会根据当前的配置项来进行自动加密
 * @param {string} data
 */
export const setStorage = (key: string, data: string, expire?: number | null): void => {
  let _data = data
  if (!configData.isDev) {
    _data = crypto.encrypt(data) || data
  }
  lscache.set(key, _data, typeof expire === 'number' ? expire : undefined)
}

/**
 * @name 提供给插件获取storage的函数
 * @param {string} key
 * @return {any}
 */
export const getStorage = (key: string): any => {
  let _data = lscache.get(key)
  if (!configData.isDev) {
    _data =
      crypto.decrypt(_data, {
        parse: true
      }) || null
  }
  return _data
}

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
