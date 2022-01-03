import { configData, getStorageActionConfig } from '../config'
import { use as crypto } from '../crypto'
import { SetStorage, GetStorage } from '../../typings/storage'

const _crypto = new crypto({
  iv: configData.iv
})

/**
 * @name 设置storage的函数
 * @description 会根据当前的配置项来进行自动加密
 * @param {string} data
 */
export const setStorage: SetStorage = (key, data) => {
  const storageAction = getStorageActionConfig()
  let _data = data
  if (!configData.isDev) {
    _data = _crypto.encrypt(data) || data
  }
  storageAction && storageAction.setItem(key, _data)
}

/**
 * @name 获取storage的函数
 * @param {string} key
 * @return {any}
 */
export const getStorage: GetStorage = (key) => {
  const storageAction = getStorageActionConfig()
  let _data = storageAction && storageAction.getItem(key)
  if (!configData.isDev) {
    _data = _data ? _crypto.decrypt(_data) : null
  }
  return _data
}

/**
 * @name 根据预定义驱动迭代存储key
 * @param {((name: string | null) => void)} cb
 */
export const iterationStorageDriverAllKeys = (cb: (name: string | null) => void): void => {
  const storageAction = getStorageActionConfig()
  const len = storageAction?.length
  // 获取所有缓存
  if (len) {
    for (let i = 0; i < len; i++) {
      const name = storageAction?.key(i)
      cb(name)
    }
  }
}
