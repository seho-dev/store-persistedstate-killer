export interface SetStorage {
  (key: string, data: string): void
}

export interface GetStorage {
  (key: string): any
}

export const setStorage: SetStorage
export const getStorage: GetStorage
