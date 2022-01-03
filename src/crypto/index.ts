import _crypto from 'crypto-js'
import { CryptoCtx } from '../../typings/crypto'

export class use {
  private ctx: CryptoCtx | null
  private iv: _crypto.lib.WordArray
  private key: _crypto.lib.WordArray
  constructor(ctx?: CryptoCtx) {
    this.ctx = ctx || null
    this.iv = _crypto.enc.Utf8.parse(this.ctx?.iv || '')
    this.key = _crypto.enc.Utf8.parse(this.ctx?.key || navigator.userAgent.toLowerCase() || '')
  }
  setKey(key: string): void {
    this.key = _crypto.enc.Utf8.parse(key)
  }
  encrypt(data: string): string | null {
    try {
      const encJson = _crypto.AES.encrypt(JSON.stringify(data), this.key, { iv: this.iv, mode: _crypto.mode.CBC, padding: _crypto.pad.Pkcs7 }).toString()
      const encData = _crypto.enc.Base64.stringify(_crypto.enc.Utf8.parse(encJson))
      return encData
    } catch (error) {
      console.log(error)
      return null
    }
  }
  decrypt(data: string): string | null {
    try {
      const decData = _crypto.enc.Base64.parse(data).toString(_crypto.enc.Utf8)
      const bytes = _crypto.AES.decrypt(decData, this.key, { iv: this.iv, mode: _crypto.mode.CBC, padding: _crypto.pad.Pkcs7 }).toString(_crypto.enc.Utf8)
      return JSON.parse(bytes)
    } catch (error) {
      console.log(error)
      return null
    }
  }
}
