import { DefineStorageDriver } from '../../typings/storage'

/**
 * @name 定义存储驱动
 * @param {*} name
 * @return {*}
 */
export const defineStorageDriver: DefineStorageDriver = (name) => {
  const storage = name === 'localStorage' ? localStorage : sessionStorage
  return {
    setItem: (key: string, value: string) => storage.setItem(key, value),
    getItem: (key: string) => storage.getItem(key),
    key: (index: number) => storage.key(index),
    length: storage.length
  }
}
