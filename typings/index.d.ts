export interface CryptoOptions {
  mode: 'debug' | 'prod'
  type: 'aes-256-cbc' | 'aes-128-ecb' | 'aes-128-cbc'
}

export interface CryptoCtx {
  app: {
    head: {
      title: string
    }
  }
}

export * as plugins from './plugins'
