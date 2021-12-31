export interface DefineConfig {
  <K extends string = string>(config: Config<K>): void
}

export interface HitStore {
  (storeName: string): boolean
}

export type Config = Readonly<{
  exclude?: string[]
  include?: K[]
  storageKey?: string
  title?: string
  isDev?: boolean
  store?: Partial<Record<K, StoreConfig>>
  setStorage?: (key: string, value: string) => void
  getStorage?: (key: string) => string | null
}>

export type StoreConfig = Readonly<{
  // 重命名
  rename?: string
  // 持久化时间
  expire?: number
  // 给state进行细分配置
  state?: Record<string, StateConfig>
}>

export type StateConfig = Readonly<{
  // 重命名
  rename?: string
  // 是否关闭持久化
  noPersisted?: boolean
  // 持久化时间
  expire?: number
}>

export const defineConfig: DefineConfig
