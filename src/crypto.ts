import crypto from 'crypto-js'
import { CryptoCtx, CryptoOptions } from '../typings/index'

export default class Crypto {
  private options: CryptoOptions | null
  private ctx: CryptoCtx | null
  private iv: crypto.lib.WordArray
  private key: crypto.lib.WordArray
  constructor(options?: CryptoOptions, ctx?: CryptoCtx) {
    this.options = options || null
    this.ctx = ctx || null
    this.iv = crypto.lib.WordArray.random(16)
    const title = this.ctx?.app.head.title || ''
    const key = navigator.userAgent.toLowerCase() || ''
    const salt = title || ''
    this.key = crypto.PBKDF2(key, salt, {
      keySize: 64,
      iterations: 64
    })
  }
  setKey(key: string, salt: string, keyMixTimes: number, keyLength: number): void {
    this.key = crypto.PBKDF2(key, salt, {
      keySize: keyLength | 64,
      iterations: keyMixTimes | 64
    })
  }
  /**
   * @name 加密
   * @template T
   * @param {T} data
   * @return {*}  {(string | null)}
   * @example
   *
   *     const res = encrypt('message')
   * @memberof Crypto
   */
  encrypt(data: string): string | null {
    // 如果当前是debug模式，就不加密，直接返回原密钥
    if (this.options?.mode === 'debug') return data
    try {
      const encrypted = crypto.AES.encrypt(data, this.key, { iv: this.iv, mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7 })
      return encrypted.toString()
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
   * @example
   *
   *     const res = decrypt('message', {parse: true})
   * @memberof Crypto
   */
  decrypt(data: string, options?: { parse: boolean }): string | null {
    try {
      const decrypt = crypto.AES.decrypt(data, this.key, { iv: this.iv, mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7 })
      const res = decrypt.toString(crypto.enc.Utf8)
      return options?.parse ? JSON.parse(res) : res
    } catch (error) {
      return null
    }
  }
}
