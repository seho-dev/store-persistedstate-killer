import lscache from 'lscache'
import { use as crypto } from '../src/crypto'
import { configData } from '../src/config'
import { SetStorage, GetStorage, FlushExpired } from './../typings/storage'

const _crypto = new crypto({
  iv: configData.title
})

/**
 * @name 设置storage的函数
 * @description 会根据当前的配置项来进行自动加密
 * @param {string} data
 */
export const setStorage: SetStorage = (key, data, expire) => {
  let _data = data
  if (!configData.isDev) {
    _data = _crypto.encrypt(data) || data
  }
  lscache.set(key, _data, typeof expire === 'number' ? expire : undefined)
}

/**
 * @name 获取storage的函数
 * @param {string} key
 * @return {any}
 */
export const getStorage: GetStorage = (key) => {
  let _data = lscache.get(key)
  if (!configData.isDev) {
    _data = _crypto.decrypt(_data) || null
  }
  return _data
}

/**
 * @name 刷新/删除所有已过期的存储
 */
export const flushExpired: FlushExpired = () => {
  lscache.flushExpired()
}
