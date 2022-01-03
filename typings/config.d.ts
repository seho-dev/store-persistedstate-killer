import { StorageDriver } from './storage'
export interface DefineConfig {
  <K extends string = string>(config: Config<K>): void
}

export interface HitStore {
  (storeName: string): boolean
}

export type Config<K extends string = string> = Readonly<{
  exclude?: string[]
  include?: K[]
  storageKey?: string
  title?: string
  isDev?: boolean
  store?: Partial<Record<K, StoreConfig>>
  // 预定义存储驱动
  storageDriver?: StorageDriver
  // 自定义一个存储驱动
  defineStorage?: {
    setItem: (key: string, value: string) => void
    getItem: (key: string) => string | null
    // 迭代storage的方法
    iteration: (cb: () => void) => void
  }
}>

export type StoreConfig = Readonly<{
  // 重命名
  rename?: string
  // 给state进行细分配置
  state?: Record<string, StateConfig>
}>

export type StateConfig = Readonly<{
  // 重命名
  rename?: string
  // 是否关闭持久化
  noPersisted?: boolean
}>

export const defineConfig: DefineConfig
