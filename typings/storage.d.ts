export interface SetStorage {
  (key: string, data: string): void
}

export interface GetStorage {
  (key: string): any
}

export interface StorageDriver {
  setItem: Storage['setItem']
  getItem: Storage['getItem']
  removeItem: Storage['removeItem']
  key: Storage['key']
  length: Storage['length']
}

export interface DefineStorageDriver {
  (name: 'localStorage' | 'sessionStorage'): StorageDriver
}

export const setStorage: SetStorage
export const getStorage: GetStorage
