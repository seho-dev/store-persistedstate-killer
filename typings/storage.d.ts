export interface SetStorage {
  (key: string, data: string, needCrypto?: boolean = true): void
}

export interface GetStorage {
  (key: string, needCrypto?: boolean = true): any
}
export interface RemoveStorage {
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
