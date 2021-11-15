import { pbkdf2Sync, createCipheriv, createDecipheriv, randomBytes, Cipher, Decipher } from 'crypto'
import { CryptoCtx, CryptoOptions } from '../typings/index'

export default class Crypto {
  private options: CryptoOptions | null
  private ctx: CryptoCtx | null
  private cipher: Cipher | null
  private decipher: Decipher | null
  private iv: Buffer
  private key: string
  constructor(options?: CryptoOptions, ctx?: CryptoCtx) {
    this.options = options || null
    this.ctx = ctx || null
    this.cipher = null
    this.decipher = null
    this.iv = randomBytes(16)
    const title = this.ctx?.app.head.title || ''
    const key = navigator.userAgent.toLowerCase() || ''
    const salt = title || ''
    this.key = pbkdf2Sync(key, salt, 64, 64, 'sha512').toString('base64').slice(0, 32)
  }
  setKey(key: string, salt: string, keyMixTimes: number, keyLength: number): void {
    this.key = pbkdf2Sync(key, salt, keyMixTimes || 64, keyLength || 64, 'sha512')
      .toString('base64')
      .slice(0, 32)
  }
  /**
   * @name 加密
   * @template T
   * @param {T} data
   * @return {*}  {(string | null)}
   * @memberof Crypto
   */
  encrypt<T extends string>(data: T): string | null {
    // 如果当前是debug模式，就不加密，直接返回原密钥
    if (this.options?.mode === 'debug') return data
    try {
      this.cipher = createCipheriv(this.options?.type || 'aes-256-cbc', this.key, this.iv)
      let res = this.cipher.update(data, 'utf-8', 'base64')
      res += this.cipher.final('base64')
      return res
    } catch (error) {
      console.log(error)
      return null
    }
  }
  /**
   * @name 解密
   * @template T
   * @param {T} data
   * @return {*}  {(string | null)}
   * @memberof Crypto
   */
  decrypt<T extends string>(data: T): string | null {
    this.decipher = createDecipheriv(this.options?.type || 'aes-256-cbc', this.key, this.iv)
    try {
      let res = this.decipher.update(data, 'base64', 'utf-8')
      res += this.decipher.final('utf-8')
      return res
    } catch (error) {
      return null
    }
  }
}
