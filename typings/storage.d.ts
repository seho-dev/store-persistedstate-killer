export interface SetStorage {
  (key: string, data: string, expire?: number | null): void
}

export interface GetStorage {
  (key: string): any
}

export interface FlushExpired {
  (): void
}

export const setStorage: SetStorage
export const getStorage: GetStorage
export const flushExpired: FlushExpired
