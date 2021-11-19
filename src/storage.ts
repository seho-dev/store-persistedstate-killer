import lscache from 'lscache'
import { Crypto } from '../src/crypto'

import { configData } from '../src/config'

const crypto = new Crypto({
  iv: configData.title
})

/**
 * @name 设置storage的函数
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
 * @name 获取storage的函数
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
 * @name 刷新/删除所有已过期的存储
 */
export const flushExpired = (): void => {
  lscache.flushExpired()
}
