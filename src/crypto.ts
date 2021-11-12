import { pbkdf2Sync, createCipher, createDecipher } from 'crypto'
import { CryptoCtx, CryptoOptions } from '../typings/index'

export default class Crypto {
  private options: CryptoOptions | null
  private ctx: CryptoCtx | null
  private key: string
  constructor(options?: CryptoOptions, ctx?: CryptoCtx) {
    this.options = options || null
    this.ctx = ctx || null
    const title = this.ctx?.app.head.title || ''
    const key = navigator.userAgent.toLowerCase() || ''
    const salt = title || ''
    this.key = pbkdf2Sync(key, salt, 64, 64, 'sha512').toString('base64')
  }
}
