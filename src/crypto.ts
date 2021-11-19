import crypto from 'crypto-js'
import { CryptoCtx } from '../typings/crypto'

export class Crypto {
  private ctx: CryptoCtx | null
  private iv: crypto.lib.WordArray
  private key: crypto.lib.WordArray
  constructor(ctx?: CryptoCtx) {
    this.ctx = ctx || null
    this.iv = crypto.enc.Utf8.parse(this.ctx?.iv || '')
    this.key = crypto.enc.Utf8.parse(this.ctx?.key || navigator.userAgent.toLowerCase() || '')
  }
  setKey(key: string): void {
    this.key = crypto.enc.Utf8.parse(key)
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
    try {
      const encJson = crypto.AES.encrypt(JSON.stringify(data), this.key, { iv: this.iv, mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7 }).toString()
      const encData = crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(encJson))
      return encData
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
      const decData = crypto.enc.Base64.parse(data).toString(crypto.enc.Utf8)
      const bytes = crypto.AES.decrypt(decData, this.key, { iv: this.iv, mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7 }).toString(crypto.enc.Utf8)
      return JSON.parse(bytes)
    } catch (error) {
      console.log(error)
      return null
    }
  }
}
