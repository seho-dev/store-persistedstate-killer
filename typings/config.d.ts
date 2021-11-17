import { PiniaPluginContext, Pinia } from 'pinia'

export interface Config<K extends string = string> {
  readonly exclude?: string[]
  readonly include?: K[]
  readonly storageKeys?: string
  readonly title?: string
  readonly isDev?: boolean
  readonly store?: Partial<
    Record<
      K,
      {
        // 重命名
        readonly rename?: string
        // 持久化时间
        readonly expire?: number
        // 给state进行细分配置
        readonly state?: Record<
          string,
          {
            // 重命名
            readonly rename?: string
            // 是否关闭持久化
            readonly noPersisted?: boolean
            // 持久化时间
            readonly expire?: number
          }
        >
      }
    >
  >
}

export interface DefineConfig {
  <K extends string = string>(config: Config<K>): void
}

export interface HitStore {
  (storeName: string): boolean
}

export const defineConfig: DefineConfig
export const hitStore: HitStore
