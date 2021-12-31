import { use as crypto } from '../src/crypto'
import { configData } from '../src/config'
import { SetStorage, GetStorage } from './../typings/storage'

const _crypto = new crypto({
  iv: configData.title
})

// 获取自定义存储驱动
// 从配置对象中拿
const { setStorage: _setStorage, getStorage: _getStorage } = configData

/**
 * @name 设置storage的函数
 * @description 会根据当前的配置项来进行自动加密
 * @param {string} data
 */
export const setStorage: SetStorage = (key, data) => {
  let _data = data
  if (!configData.isDev) {
    _data = _crypto.encrypt(data) || data
  }
  _setStorage && _setStorage(key, _data)
}

/**
 * @name 获取storage的函数
 * @param {string} key
 * @return {any}
 */
export const getStorage: GetStorage = (key) => {
  let _data = _getStorage && _getStorage(key)
  if (!configData.isDev) {
    _data = _data ? _crypto.decrypt(_data) : null
  }
  return _data
}
