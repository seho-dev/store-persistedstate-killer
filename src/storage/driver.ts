import { DefineStorageDriver } from '../../typings/storage'

/**
 * @name 定义存储驱动
 * @param {*} name
 * @return {*}
 */
export const defineStorageDriver: DefineStorageDriver = (name) => {
  const storage = name === 'localStorage' ? localStorage : sessionStorage
  return {
    setItem: (key: string, value: string) => storage.setItem(key, JSON.stringify({ value })),
    getItem: (key: string) => {
      const json = JSON.parse(storage.getItem(key) as string)
      return json ? json.value : null
    },
    removeItem: (key: string) => storage.removeItem(key),
    key: (index: number) => storage.key(index),
    length: storage.length
  }
}
