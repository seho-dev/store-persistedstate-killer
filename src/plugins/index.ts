import lscache from 'lscache'
export * as pinia from './pinia'
import { Crypto } from './../crypto'
import { configData } from '../config'

const crypto = new Crypto({
  iv: configData.title
})

/**
 * @name 提供给插件设置storage的函数
 * @description 会根据当前的配置项来进行自动加密
 * @param {string} data
 */
export const setStorage = (key: string, data: string): void => {
  let _data = data
  if (!configData.isDev) {
    _data = crypto.encrypt(data) || data
  }
  lscache.set(key, _data)
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
